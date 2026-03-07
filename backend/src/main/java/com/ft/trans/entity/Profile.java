package com.ft.trans.entity;

import java.sql.Date;

import jakarta.persistence.ManyToOne;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "profiles", uniqueConstraints = {
	@UniqueConstraint(columnNames = {"user_id", "position"})
})
public class Profile
{
	public enum ProfileType
	{
		MENTOR,
		MENTORADO
	};

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	public Long			id;
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	public User			user;
	public String		avatarUrl;
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	public ProfileType	position;
	public String		bio;
	public String		role;
	public Long			xp;
	public Integer		level;
	public String		linkedin;
	public String		github;
	public String		instagram;
	public Date			createdAt;
	public Long			createdBy;
	public Date			lastUpdateAt;
	public Long			lastUpdateBy;
}
