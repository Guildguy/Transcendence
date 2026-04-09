package com.ft.trans.entity;

import java.sql.Date;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "user_streak", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id"})
})
public class UserStreak
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    public Long userId;

    @Column(name = "current_streak", nullable = false)
    public Integer currentStreak = 0;

    @Column(name = "best_streak", nullable = false)
    public Integer bestStreak = 0;

    @Column(name = "last_checkin_date")
    public LocalDate lastCheckinDate;

    @Column(name = "created_at")
    public Date createdAt;

    public String created_by;

    @Column(name = "last_update_at")
    public Date lastUpdateAt;

    public String last_update_by;

    @PrePersist
    private void onCreate()
    {
        Date now = new Date(System.currentTimeMillis());
        if (this.createdAt == null)
            this.createdAt = now;
        if (this.lastUpdateAt == null)
            this.lastUpdateAt = now;
        if (this.created_by == null || this.created_by.isBlank())
            this.created_by = "system";
        if (this.last_update_by == null || this.last_update_by.isBlank())
            this.last_update_by = this.created_by;
    }

    @PreUpdate
    private void onUpdate()
    {
        this.lastUpdateAt = new Date(System.currentTimeMillis());
        if (this.last_update_by == null || this.last_update_by.isBlank())
            this.last_update_by = this.created_by != null ? this.created_by : "system";
    }
}
