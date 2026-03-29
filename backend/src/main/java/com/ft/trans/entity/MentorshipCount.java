package com.ft.trans.entity;

import java.time.LocalDateTime;

import com.ft.trans.contract.IEntity;
import com.ft.trans.validation.ValidationResult;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "mentorship_count")
public class MentorshipCount implements IEntity
{
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "mentorship_count_id")
	public Long					id;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "mentorship_connection_id", nullable = false, unique = true)
	public MentorshipConnection	connection;

	@Column(name = "mentor_id", nullable = false)
	public Long					mentorProfileId;

	@Column(nullable = false)
	public String				status = "APROVADO";

	@Column(name = "limit_of_mentee")
	public Integer				limitOfMentee;

	@Column(name = "created_at")
	public LocalDateTime		createdAt;

	@Column(name = "created_by")
	public Long					createdBy;

	@Column(name = "last_update_at")
	public LocalDateTime		lastUpdateAt;

	@Column(name = "last_update_by")
	public Long					lastUpdateBy;

	@Override
	public ValidationResult validate()
	{
		ValidationResult result = new ValidationResult();

		if (connection == null)
			result.addError("connection", "Conexão de mentoria deve ser informada.");
		if (mentorProfileId == null)
			result.addError("mentorProfileId", "Profile ID do mentor deve ser informado.");

		return result;
	}
}
