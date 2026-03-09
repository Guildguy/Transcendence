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

    @Column(nullable = false)
    public Integer xp_required;

    public Date created_at;
    public String created_by;
    public Date last_update_at;
    public String last_update_by;
}