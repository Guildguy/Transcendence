//regra de negócio
package com.ft.trans.service;

import java.sql.Date;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Comparator;
import java.util.stream.Collectors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import com.ft.trans.controller.dto.GamificationEventRequest;
import com.ft.trans.controller.dto.GamificationEventResponse;
import com.ft.trans.controller.dto.GamificationSummaryResponse;
import com.ft.trans.entity.Achievement;
import com.ft.trans.entity.Level;
import com.ft.trans.entity.User;
import com.ft.trans.entity.UserAchievement;
import com.ft.trans.entity.XpHistory;
import com.ft.trans.repository.AchievementRepository;
import com.ft.trans.repository.LevelRepository;
import com.ft.trans.repository.UserAchievementRepository;
import com.ft.trans.repository.UserRepository;
import com.ft.trans.repository.XpHistoryRepository;

@Service
public class GamificationService {
    private final UserRepository userRepository;
    private final AchievementRepository achievementRepository;
    private final UserAchievementRepository userAchievementRepository;
    private final XpHistoryRepository xpHistoryRepository;
    private final LevelRepository levelRepository;

    public GamificationService(
            UserRepository userRepository,
            AchievementRepository achievementRepository,
            UserAchievementRepository userAchievementRepository,
            XpHistoryRepository xpHistoryRepository,
            LevelRepository levelRepository
    ) {
        this.userRepository = userRepository;
        this.achievementRepository = achievementRepository;
        this.userAchievementRepository = userAchievementRepository;
        this.xpHistoryRepository = xpHistoryRepository;
        this.levelRepository = levelRepository;
    }

    public record EventResult(boolean success, String message, GamificationEventResponse response) {}
    public record SummaryResult(boolean success, String message, GamificationSummaryResponse response) {}

    public EventResult processEvent(GamificationEventRequest request) {
        if (request == null || request.userId() == null || request.eventType() == null || request.eventType().isBlank()) {
            return new EventResult(false, "Payload invalido.", null);
        }

        User user = userRepository.findById(request.userId()).orElse(null);

        if (user == null) {
            return new EventResult(false, "Usuario nao encontrado.", null);
        }

        String eventType = request.eventType().trim().toUpperCase(Locale.ROOT);
        int awardedXp = 0;
        List<String> unlocked = new ArrayList<>();
        List<String> notes = new ArrayList<>();

        switch (eventType) {
            case "PROFILE_COMPLETED" -> {
                awardedXp = registerXp(user.id, 50, "PROFILE_COMPLETED");
                unlockByName(user.id, "Identidade Transcendental", unlocked);
            }
            case "STREAK_7" -> {
                awardedXp = registerXp(user.id, 100, "STREAK_7");
                unlockByName(user.id, "Chama Acesa", unlocked);
            }
            case "STREAK_30" -> unlockByTypeAndTarget(user.id, "STREAK", 30, unlocked);
            case "MATCH_ACCEPTED" -> {
                awardedXp = registerXp(user.id, 150, "MATCH_ACCEPTED");
                unlockByTarget(user.id, "MATCH", "MATCH_ACCEPTED", unlocked);
            }
            case "SESSION_COMPLETED" -> {
                awardedXp = registerXp(user.id, 50, "SESSION_COMPLETED");
                unlockByTarget(user.id, "SESSION", "SESSION_COMPLETED", unlocked);
            }
            case "CYCLE_COMPLETED" -> {
                awardedXp = registerXp(user.id, 200, "CYCLE_COMPLETED");
                unlockByName(user.id, "Ciclo Fechado", unlocked);
            }
            case "REVIEW_SENT" -> {
                awardedXp = registerXp(user.id, 10, "REVIEW_SENT");
                unlockByTarget(user.id, "REVIEW_SEND", "REVIEW_SENT", unlocked);
            }
            case "REVIEW_RECEIVED_5" -> {
                awardedXp = registerXp(user.id, 50, "REVIEW_RECEIVED_5");
                unlockByTarget(user.id, "REVIEW_RECEIVE", "REVIEW_RECEIVED_5", unlocked);
            }
            case "REVIEW_RECEIVED_4" -> awardedXp = registerXp(user.id, 20, "REVIEW_RECEIVED_4");
            case "NO_SHOW_WAITING_BONUS" -> {
                awardedXp = registerXp(user.id, 20, "NO_SHOW_WAITING_BONUS");
                notes.add("Bonus de compensacao aplicado para o usuario presente.");
            }
            case "NO_SHOW_ABSENT" -> notes.add("Evento registrado sem XP. Integrar com modulo de streak para zerar ofensiva.");
            default -> {
                return new EventResult(false, "Evento nao suportado: " + eventType, null);
            }
        }

        Long totalXp = safeTotalXp(user.id);
        unlockLevelBadgesByXp(user.id, totalXp, unlocked);
        Level currentLevel = levelRepository.findTopByXpRequiredLessThanEqualOrderByXpRequiredDesc(totalXp);
        Level nextLevel = levelRepository.findTopByXpRequiredGreaterThanOrderByXpRequiredAsc(totalXp);

        GamificationEventResponse response = new GamificationEventResponse(
                user.id,
                eventType,
                awardedXp,
                totalXp,
                currentLevel != null ? currentLevel.level : 1,
                nextLevel != null ? nextLevel.xpRequired : null,
                unlocked,
                notes
        );

        return new EventResult(true, "Evento processado com sucesso.", response);
    }

    public SummaryResult getSummary(Long userId) {
        if (userId == null) {
            return new SummaryResult(false, "userId invalido.", null);
        }

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return new SummaryResult(false, "Usuario nao encontrado.", null);
        }

        Long totalXp = safeTotalXp(userId);
        Level currentLevel = levelRepository.findTopByXpRequiredLessThanEqualOrderByXpRequiredDesc(totalXp);
        Level nextLevel = levelRepository.findTopByXpRequiredGreaterThanOrderByXpRequiredAsc(totalXp);

        Map<Long, Achievement> achievementMap = achievementRepository.findAll()
                .stream()
                .collect(Collectors.toMap(a -> a.id, a -> a));

        List<GamificationSummaryResponse.AchievementItem> unlocked = userAchievementRepository.findByUserId(userId)
            .stream()
            .map(ua -> new UnlockedAchievementView(ua.id, achievementMap.get(ua.achievementId)))
            .filter(view -> Objects.nonNull(view.achievement()))
            .sorted(this::compareAchievementOrder)
            .map(view -> new GamificationSummaryResponse.AchievementItem(view.achievement().name, view.achievement().iconUrl))
            .toList();

        List<GamificationSummaryResponse.HistoryItem> recent = xpHistoryRepository.findTop10ByUserIdOrderByIdDesc(userId)
                .stream()
                .map(h -> new GamificationSummaryResponse.HistoryItem(h.reason, h.xp))
                .toList();

        GamificationSummaryResponse response = new GamificationSummaryResponse(
                userId,
                totalXp,
                currentLevel != null ? currentLevel.level : 1,
                currentLevel != null ? currentLevel.iconUrl : "/levels/level1.png",
                nextLevel != null ? nextLevel.xpRequired : null,
                unlocked,
                recent
        );

        return new SummaryResult(true, "Resumo carregado com sucesso.", response);
    }

    private Long safeTotalXp(Long userId) {
        Long total = xpHistoryRepository.sumXpByUserId(userId);
        return total != null ? total : 0;
    }

    private int registerXp(Long userId, int xp, String reason) {
        if (xp <= 0) {
            return 0;
        }

        XpHistory history = new XpHistory();
        history.userId = userId;
        history.xp = xp;
        history.reason = reason;
        history.createdAt = new Date(System.currentTimeMillis());
        history.created_by = "gamification_event";

        xpHistoryRepository.save(history);
        return xp;
    }

    private void unlockByName(Long userId, String achievementName, List<String> unlocked) {
        Achievement achievement = achievementRepository.findByName(achievementName);
        if (achievement == null) {
            return;
        }
        unlockAchievement(userId, achievement, unlocked);
    }

    private void unlockByTarget(Long userId, String type, String counterReason, List<String> unlocked) {
        long count = xpHistoryRepository.countByUserIdAndReason(userId, counterReason);

        for (Achievement achievement : achievementRepository.findByType(type)) {
            if (achievement.target != null && count >= achievement.target) {
                unlockAchievement(userId, achievement, unlocked);
            }
        }
    }

    private void unlockByTypeAndTarget(Long userId, String type, int target, List<String> unlocked) {
        for (Achievement achievement : achievementRepository.findByType(type)) {
            if (achievement.target != null && achievement.target == target) {
                unlockAchievement(userId, achievement, unlocked);
            }
        }
    }

    private void unlockAchievement(Long userId, Achievement achievement, List<String> unlocked) {
        if (userAchievementRepository.existsByUserIdAndAchievementId(userId, achievement.id)) {
            return;
        }

        UserAchievement ua = new UserAchievement();
        ua.userId = userId;
        ua.achievementId = achievement.id;
        ua.unlockedAt = new Date(System.currentTimeMillis());
        ua.createdAt = new Date(System.currentTimeMillis());
        ua.created_by = "gamification_event";

        try {
            userAchievementRepository.saveAndFlush(ua);
            if (unlocked != null) {
                unlocked.add(achievement.name);
            }
        } catch (DataIntegrityViolationException ex) {
            if (userAchievementRepository.existsByUserIdAndAchievementId(userId, achievement.id)) {
                return;
            }
            throw ex;
        }
    }

    private void unlockLevelBadgesByXp(Long userId, Long totalXp, List<String> unlocked) {
        if (totalXp == null) {
            return;
        }

        Level currentLevel = levelRepository.findTopByXpRequiredLessThanEqualOrderByXpRequiredDesc(totalXp);
        if (currentLevel == null || currentLevel.level == null) {
            return;
        }

        int levelReached = currentLevel.level;

        for (Achievement achievement : achievementRepository.findByType("LEVEL")) {
            if (achievement.target == null) {
                continue;
            }

            if (levelReached >= achievement.target) {
                unlockAchievement(userId, achievement, unlocked);
            }
        }
    }

    private record UnlockedAchievementView(Long unlockId, Achievement achievement) {}

    private int compareAchievementOrder(UnlockedAchievementView a, UnlockedAchievementView b) {
        boolean aIsLevel = isLevelAchievement(a.achievement());
        boolean bIsLevel = isLevelAchievement(b.achievement());

        if (aIsLevel && bIsLevel) {
            return Integer.compare(safeTarget(a.achievement()), safeTarget(b.achievement()));
        }

        if (aIsLevel != bIsLevel) {
            return aIsLevel ? -1 : 1;
        }

        return Comparator.nullsLast(Long::compareTo).compare(a.unlockId(), b.unlockId());
    }

    private boolean isLevelAchievement(Achievement achievement) {
        return achievement != null && achievement.type != null && achievement.type.equalsIgnoreCase("LEVEL");
    }

    private int safeTarget(Achievement achievement) {
        return achievement != null && achievement.target != null ? achievement.target : Integer.MAX_VALUE;
    }
}
