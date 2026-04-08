package com.ft.trans.entity;

import java.sql.Date;
import java.time.LocalTime;

import com.ft.trans.contract.IEntity;
import com.ft.trans.validation.ValidationResult;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "mentor_availability")
public class MentorAvailability implements IEntity
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mentor_availability_id")
    public Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_id", nullable = false)
    public Profile mentor;

    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", nullable = false)
    public DayOfWeekEnum dayOfWeek;

    @Column(name = "start_time", nullable = false)
    public LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    public LocalTime endTime;

    @Column(name = "slot_duration")
    public Integer slotDuration;

    @Column(name = "created_at")
    public Date createdAt;

    @Column(name = "created_by")
    public Long createdBy;

    @Column(name = "last_update_at")
    public Date lastUpdateAt;

    @Column(name = "last_update_by")
    public Long lastUpdateBy;

    @Override
    public ValidationResult validate()
    {
        ValidationResult result = new ValidationResult();

        if (mentor == null || mentor.id == null)
            result.addError("mentorId", "Mentor deve ser informado.");
        if (dayOfWeek == null)
            result.addError("dayOfWeek", "Dia da semana deve ser informado.");
        if (startTime == null)
            result.addError("startTime", "Horario inicial deve ser informado.");
        if (endTime == null)
            result.addError("endTime", "Horario final deve ser informado.");
        if (slotDuration == null)
            result.addError("slotDuration", "Duracao do slot deve ser informada.");
        if (startTime != null && endTime != null && !startTime.isBefore(endTime))
            result.addError("timeRange", "Horario inicial deve ser menor que horario final.");

        return result;
    }
}
