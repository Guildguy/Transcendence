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

    @Column(nullable = false)
    public String type;

    public Integer target;
    public Integer xp_reward;
    public String iconUrl;

    public Date created_at;
    public String created_by;
    public Date last_update_at;
    public String last_update_by;
}