package com.ft.trans.controller.dto;

import java.util.List;

public record GamificationSummaryResponse(
    Long userId,
    Integer totalXp,
    Integer currentLevel,
    Integer nextLevelXp,
    List<String> unlockedAchievements,
    List<HistoryItem> recentHistory
) {
    public record HistoryItem(String reason, Integer xp) {}
}
