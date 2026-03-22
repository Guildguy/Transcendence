package com.ft.trans.entity;

import java.sql.Date;

import jakarta.persistence.*;

@Entity
@Table(name = "levels")
public class Level
{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(nullable = false, unique = true)
    public Integer level;

    @Column(name = "xp_required", nullable = false)
    public Integer xpRequired;

    @Column(name = "created_at")
    public Date createdAt;
    public String created_by;
    @Column(name = "last_update_at")
    public Date lastUpdateAt;
    public String last_update_by;
}