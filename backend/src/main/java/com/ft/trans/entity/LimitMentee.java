package com.ft.trans.entity;

import java.sql.Date;

import com.ft.trans.contract.IEntity;
import com.ft.trans.validation.ValidationResult;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "limit_mentee")
public class LimitMentee implements IEntity
{
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "limit_mentee_id")
	public Long		id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "mentor_id", nullable = false, unique = true)
	public Profile	mentor;

	@Column(name = "limit_of_mentee", nullable = false)
	public Integer	limitOfMentee = 10;

	@Column(name = "created_at")
	public Date		createdAt;

	@Column(name = "created_by")
	public Long		createdBy;

	@Column(name = "last_update_at")
	public Date		lastUpdateAt;

	@Column(name = "last_update_by")
	public Long		lastUpdateBy;

	@Override
	public ValidationResult validate()
	{
		ValidationResult result = new ValidationResult();

		if (mentor == null || mentor.id == null)
			result.addError("mentorId", "Mentor deve ser informado.");
		if (limitOfMentee == null)
			result.addError("limitOfMentee", "Limite de mentorados é obrigatório.");
		else if (limitOfMentee < 1 || limitOfMentee > 50)
			result.addError("limitOfMentee", "Limite deve ser entre 1 e 50.");

		return result;
	}
}
