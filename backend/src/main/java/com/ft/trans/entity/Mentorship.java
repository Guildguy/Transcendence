package com.ft.trans.entity;

import java.sql.Date;
import java.sql.Timestamp;

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
@Table(name = "mentorships")
public class Mentorship implements IEntity
{
    public enum MentorshipStatus
    {
        REQUESTED,
        ACCEPTED,
        REJECTED,
        CANCELLED,
        COMPLETED,
        NO_SHOW
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_id", nullable = false)
    public Profile mentorProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentee_id", nullable = false)
    public Profile menteeProfile;

    @Column(nullable = false)
    public Timestamp startAt;

    @Column(nullable = false)
    public Timestamp endAt;

    public String topic;

    @Column(length = 2048)
    public String notes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public MentorshipStatus status;

    public Date createdAt;
    public Long createdBy;
    public Date lastUpdateAt;
    public Long lastUpdateBy;

    private ValidationResult isProfilesValid(ValidationResult result)
    {
        if (this.mentorProfile == null)
            result.addError("mentorProfileId", "Perfil mentor e obrigatorio.");
        if (this.menteeProfile == null)
            result.addError("menteeProfileId", "Perfil mentorado e obrigatorio.");

        if (this.mentorProfile != null && this.menteeProfile != null && this.mentorProfile.id.equals(this.menteeProfile.id))
            result.addError("profiles", "Mentor e mentorado devem ser perfis diferentes.");

        return result;
    }

    private ValidationResult isScheduleValid(ValidationResult result)
    {
        if (this.startAt == null)
            result.addError("startAt", "Data/hora inicial e obrigatoria.");

        if (this.endAt == null)
            result.addError("endAt", "Data/hora final e obrigatoria.");

        if (this.startAt != null && this.endAt != null && !this.startAt.before(this.endAt))
            result.addError("schedule", "Horario invalido: startAt deve ser menor que endAt.");

        return result;
    }

    private ValidationResult isStatusValid(ValidationResult result)
    {
        if (this.status == null)
            result.addError("status", "Status da mentoria e obrigatorio.");

        return result;
    }

    public ValidationResult validate()
    {
        ValidationResult result = new ValidationResult();

        isProfilesValid(result);
        isScheduleValid(result);
        isStatusValid(result);

        return result;
    }
}
