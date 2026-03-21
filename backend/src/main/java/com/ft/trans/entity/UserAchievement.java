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

    @Column(name = "user_id")
    public Long userId;
    
    @Column(name = "achievement_id")
    public Long achievementId;

    @Column(name = "unlocked_at")
    public Date unlockedAt;

    @Column(name = "created_at")
    public Date createdAt;
    public String created_by;
    @Column(name = "last_update_at")
    public Date lastUpdateAt;
    public String last_update_by;
}