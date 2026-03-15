package com.ft.trans.entity;

import java.sql.Date;

import jakarta.persistence.*;

@Entity
@Table(name = "user_achievements")
public class UserAchievement
{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(nullable = false)
    public Long user_id;

    @Column(nullable = false)
    public Long achievement_id;

    public Date unlocked_at;

    public Date created_at;
    public String created_by;
    public Date last_update_at;
    public String last_update_by;
}