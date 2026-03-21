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

    @Column(nullable = false)
    public Long user_id;

    @Column(nullable = false)
    public Integer xp;

    @Column(nullable = false)
    public String reason;

    public Date created_at;

    public String created_by;

    public Date last_update_at;

    public String last_update_by;
}