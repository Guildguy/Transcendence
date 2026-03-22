package com.ft.trans.controller.dto;

public record GamificationEventRequest(
    Long userId,
    String eventType
) {}
