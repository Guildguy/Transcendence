package com.ft.trans.service;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ft.trans.controller.dto.GamificationEventRequest;
import com.ft.trans.entity.Level;
import com.ft.trans.entity.User;
import com.ft.trans.entity.UserStreak;
import com.ft.trans.entity.XpHistory;
import com.ft.trans.repository.AchievementRepository;
import com.ft.trans.repository.LevelRepository;
import com.ft.trans.repository.UserAchievementRepository;
import com.ft.trans.repository.UserRepository;
import com.ft.trans.repository.UserStreakRepository;
import com.ft.trans.repository.XpHistoryRepository;

@ExtendWith(MockitoExtension.class)
public class GamificationServiceTest
{
    @Mock
    private UserRepository userRepository;

    @Mock
    private AchievementRepository achievementRepository;

    @Mock
    private UserAchievementRepository userAchievementRepository;

    @Mock
    private XpHistoryRepository xpHistoryRepository;

    @Mock
    private LevelRepository levelRepository;

    @Mock
    private UserStreakRepository userStreakRepository;

    @InjectMocks
    private GamificationService gamificationService;

    @BeforeEach
    void setup()
    {
        Level level = new Level();
        level.level = 1;
        level.xpRequired = 0;

        lenient().when(levelRepository.findTopByXpRequiredLessThanEqualOrderByXpRequiredDesc(anyLong())).thenReturn(level);
        lenient().when(levelRepository.findTopByXpRequiredGreaterThanOrderByXpRequiredAsc(anyLong())).thenReturn(null);
        lenient().when(achievementRepository.findByType("LEVEL")).thenReturn(List.of());
    }

    @Test
    void shouldAwardProfileCompletedXpOnlyOnce()
    {
        User user = new User();
        user.id = 1L;

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(xpHistoryRepository.countByUserIdAndReason(1L, "PROFILE_COMPLETED")).thenReturn(0L, 1L);
        when(xpHistoryRepository.sumXpByUserId(1L)).thenReturn(50L);

        GamificationService.EventResult first = gamificationService.processEvent(new GamificationEventRequest(1L, "PROFILE_COMPLETED"));
        GamificationService.EventResult second = gamificationService.processEvent(new GamificationEventRequest(1L, "PROFILE_COMPLETED"));

        assertTrue(first.success());
        assertTrue(second.success());
        assertTrue(first.response().awardedXp() == 50);
        assertTrue(second.response().awardedXp() == 0);

        verify(xpHistoryRepository, times(1)).save(any(XpHistory.class));
    }

    @Test
    void shouldRegisterNoShowAbsentAsZeroXpAuditEvent()
    {
        User user = new User();
        user.id = 2L;

        UserStreak streak = new UserStreak();
        streak.userId = 2L;
        streak.currentStreak = 9;
        streak.bestStreak = 12;
        streak.lastCheckinDate = LocalDate.now().minusDays(1);

        when(userRepository.findById(2L)).thenReturn(Optional.of(user));
        when(xpHistoryRepository.sumXpByUserId(2L)).thenReturn(0L);
        when(userStreakRepository.findByUserId(2L)).thenReturn(Optional.of(streak));

        GamificationService.EventResult result = gamificationService.processEvent(new GamificationEventRequest(2L, "NO_SHOW_ABSENT"));

        assertTrue(result.success());
        assertTrue(result.response().awardedXp() == 0);

        ArgumentCaptor<XpHistory> historyCaptor = ArgumentCaptor.forClass(XpHistory.class);
        verify(xpHistoryRepository).save(historyCaptor.capture());

        XpHistory saved = historyCaptor.getValue();
        assertTrue(saved != null && saved.xp == 0);
        assertTrue("NO_SHOW_ABSENT".equals(saved.reason));
        assertTrue(streak.currentStreak == 0);
    }

    @Test
    void shouldAwardStreakSevenOnDailyCheckinAndIgnoreSecondCheckinSameDay()
    {
        User user = new User();
        user.id = 3L;

        UserStreak streak = new UserStreak();
        streak.userId = 3L;
        streak.currentStreak = 6;
        streak.bestStreak = 6;
        streak.lastCheckinDate = LocalDate.now().minusDays(1);

        when(userRepository.findById(3L)).thenReturn(Optional.of(user));
        when(userStreakRepository.findByUserId(3L)).thenReturn(Optional.of(streak), Optional.of(streak));
        when(xpHistoryRepository.countByUserIdAndReason(3L, "STREAK_7")).thenReturn(0L);
        when(xpHistoryRepository.sumXpByUserId(3L)).thenReturn(100L, 100L);

        GamificationService.EventResult first = gamificationService.processEvent(new GamificationEventRequest(3L, "STREAK_CHECKIN"));
        GamificationService.EventResult second = gamificationService.processEvent(new GamificationEventRequest(3L, "STREAK_CHECKIN"));

        assertTrue(first.success());
        assertTrue(second.success());
        assertTrue(first.response().awardedXp() == 100);
        assertTrue(second.response().awardedXp() == 0);
        assertTrue(streak.currentStreak == 7);

        verify(xpHistoryRepository, times(1)).save(any(XpHistory.class));
    }

    @Test
    void shouldUnlockThirtyDayBadgeWhenStreakReachesThirty()
    {
        User user = new User();
        user.id = 4L;

        UserStreak streak = new UserStreak();
        streak.userId = 4L;
        streak.currentStreak = 29;
        streak.bestStreak = 29;
        streak.lastCheckinDate = LocalDate.now().minusDays(1);

        com.ft.trans.entity.Achievement streakThirtyAchievement = new com.ft.trans.entity.Achievement();
        streakThirtyAchievement.id = 99L;
        streakThirtyAchievement.name = "Imparável";
        streakThirtyAchievement.type = "STREAK";
        streakThirtyAchievement.target = 30;

        when(userRepository.findById(4L)).thenReturn(Optional.of(user));
        when(userStreakRepository.findByUserId(4L)).thenReturn(Optional.of(streak));
        when(achievementRepository.findByType("STREAK")).thenReturn(List.of(streakThirtyAchievement));
        when(userAchievementRepository.existsByUserIdAndAchievementId(4L, 99L)).thenReturn(false);
        when(xpHistoryRepository.countByUserIdAndReason(4L, "STREAK_7")).thenReturn(1L);
        when(xpHistoryRepository.sumXpByUserId(4L)).thenReturn(0L);

        GamificationService.EventResult result = gamificationService.processEvent(new GamificationEventRequest(4L, "STREAK_CHECKIN"));

        assertTrue(result.success());
        assertTrue(result.response().unlockedAchievements().contains("Imparável"));
        assertTrue(streak.currentStreak == 30);
    }

    @Test
    void shouldExposeCurrentAndBestStreakInSummary()
    {
        User user = new User();
        user.id = 5L;

        UserStreak streak = new UserStreak();
        streak.userId = 5L;
        streak.currentStreak = 4;
        streak.bestStreak = 11;

        when(userRepository.findById(5L)).thenReturn(Optional.of(user));
        when(xpHistoryRepository.sumXpByUserId(5L)).thenReturn(220L);
        when(userAchievementRepository.findByUserId(5L)).thenReturn(List.of());
        when(achievementRepository.findAll()).thenReturn(List.of());
        when(xpHistoryRepository.findTop10ByUserIdOrderByIdDesc(5L)).thenReturn(List.of());
        when(userStreakRepository.findByUserId(5L)).thenReturn(Optional.of(streak));

        GamificationService.SummaryResult result = gamificationService.getSummary(5L);

        assertTrue(result.success());
        assertTrue(result.response().currentStreak() == 4);
        assertTrue(result.response().bestStreak() == 11);
    }
}
