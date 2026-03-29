package com.ft.trans.entity;

import java.time.LocalDateTime;

import com.ft.trans.contract.IEntity;
import com.ft.trans.validation.ValidationResult;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "mentorship_connection")
public class MentorshipConnection implements IEntity
{
	public enum ConnectionStatus
	{
		PENDING,
		REJECTED,
		APPROVED
	}

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "mentorship_connection_id")
	public Long				id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "mentor_id", nullable = false)
	public User				mentor;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "mentee_id", nullable = false)
	public User				mentee;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	public ConnectionStatus	status;

	@Column(name = "created_at")
	public LocalDateTime	createdAt;

	@Column(name = "created_by")
	public Long				createdBy;

	@Column(name = "last_update_at")
	public LocalDateTime	lastUpdateAt;

	@Column(name = "last_update_by")
	public Long				lastUpdateBy;

	@Column(name = "accepted_at")
	public LocalDateTime	acceptedAt;

	@Override
	public ValidationResult validate()
	{
		ValidationResult result = new ValidationResult();

		if (mentor == null || mentor.id == null)
			result.addError("mentorId", "Mentor deve ser informado.");
		if (mentee == null || mentee.id == null)
			result.addError("menteeId", "Mentorado deve ser informado.");
		if (mentor != null && mentee != null
			&& mentor.id != null && mentee.id != null
			&& mentor.id.equals(mentee.id))
			result.addError("connection", "O mentor e o mentorado não podem ser a mesma pessoa.");

		return result;
	}
}
