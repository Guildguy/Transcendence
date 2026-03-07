package com.ft.trans.entity;

import java.sql.Date;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "profiles")
public class Profile
{
	public Long		id;
	public User		user;
	public String	avatarUrl;
	public String	position;
	public String	bio;
	public String	role;
	public Long		xp;
	public Integer	level;
	public String	linkedin;
	public String	github;
	public String	instagram;
	public Date		createdAt;
	public Long		createdBy;
	public Date		lastUpdateAt;
	public Long		lastUpdateBy;
}
