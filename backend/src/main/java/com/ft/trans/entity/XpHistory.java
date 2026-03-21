package com.ft.trans.entity;

import java.sql.Date;

import jakarta.persistence.*;

@Entity
@Table(name = "xp_history")
public class XpHistory
{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "user_id", nullable = false)
    public Long userId;

    @Column(nullable = false)
    public Integer xp;

    @Column(nullable = false)
    public String reason;

    @Column(name = "created_at")
    public Date createdAt;

    public String created_by;

    @Column(name = "last_update_at")
    public Date lastUpdateAt;

    public String last_update_by;
}