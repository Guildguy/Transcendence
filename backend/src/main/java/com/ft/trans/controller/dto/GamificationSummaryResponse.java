package com.ft.trans.controller.dto;

import java.util.List;

public record GamificationSummaryResponse(
    Long userId,
    Long totalXp,
    Integer currentLevel,
    String  currentLevelIconUrl,
    Integer nextLevelXp,
    Integer currentStreak,
    Integer bestStreak,
    List<AchievementItem> unlockedAchievements,
    List<HistoryItem> recentHistory
)
{
    public record HistoryItem(String reason, Integer xp) {}
    public record AchievementItem(String name, String iconUrl) {}
}