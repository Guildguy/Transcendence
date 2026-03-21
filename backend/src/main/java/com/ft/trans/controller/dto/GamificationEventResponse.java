package com.ft.trans.controller.dto;

import java.util.List;

public record GamificationEventResponse(
    Long userId,
    String eventType,
    Integer awardedXp,
    Integer totalXp,
    Integer currentLevel,
    Integer nextLevelXp,
    List<String> unlockedAchievements,
    List<String> notes
) {}
