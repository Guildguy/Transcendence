package com.ft.trans.entity;

import java.sql.Date;

import jakarta.persistence.*;

@Entity
@Table(name = "achievements")
public class Achievement
{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(nullable = false, unique = true)
    public String name;

    public String description;

    // MATCH / SESSION / STREAK / PROFILE / REVIEW / LEVEL
    @Column(nullable = false)
    public String type;

    // qnt. necessária para desbloquear
    public Integer target;

    // XP extra que ganha
    public Integer xp_reward;

    public Date created_at;
    public String created_by;
    public Date last_update_at;
    public String last_update_by;
}