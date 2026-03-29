package com.ft.trans.entity;

public enum DayOfWeekEnum {
    MONDAY,
    TUESDAY,
    WEDNESDAY,
    THURSDAY,
    FRIDAY,
    SATURDAY,
    SUNDAY;

    public static DayOfWeekEnum fromString(String value)
    {
        if (value == null || value.isBlank())
            throw new IllegalArgumentException("Dia invalido: valor vazio.");

        try {
            return DayOfWeekEnum.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Dia invalido: " + value);
        }
    }
}
