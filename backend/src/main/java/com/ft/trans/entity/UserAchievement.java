package com.ft.trans.entity;

import java.sql.Date;

import jakarta.persistence.*;

@Entity
@Table(
    name = "user_achievements",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_user_achievement", columnNames = {"user_id", "achievement_id"})
    }
)
public class UserAchievement
{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "user_id", nullable = false)
    public Long userId;
    
    @Column(name = "achievement_id", nullable = false)
    public Long achievementId;

    @Column(name = "unlocked_at")
    public Date unlockedAt;

    @Column(name = "created_at")
    public Date createdAt;
    public String created_by;
    @Column(name = "last_update_at")
    public Date lastUpdateAt;
    public String last_update_by;

    @PrePersist
    private void onCreate() {
        Date now = new Date(System.currentTimeMillis());
        if (this.createdAt == null) {
            this.createdAt = now;
        }
        if (this.lastUpdateAt == null) {
            this.lastUpdateAt = now;
        }
        if (this.created_by == null || this.created_by.isBlank()) {
            this.created_by = "system";
        }
        if (this.last_update_by == null || this.last_update_by.isBlank()) {
            this.last_update_by = this.created_by;
        }
    }

    @PreUpdate
    private void onUpdate() {
        if (this.createdAt == null) {
            this.createdAt = new Date(System.currentTimeMillis());
        }
        if (this.created_by == null || this.created_by.isBlank()) {
            this.created_by = "system";
        }
        this.lastUpdateAt = new Date(System.currentTimeMillis());
        if (this.last_update_by == null || this.last_update_by.isBlank()) {
            this.last_update_by = this.created_by;
        }
    }
}