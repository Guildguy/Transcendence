package com.ft.trans.entity;

import java.sql.Date;

import com.ft.trans.contract.IEntity;
import com.ft.trans.entity.Profile.ProfileType;
import com.ft.trans.validation.ValidationResult;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "mentor_ratings", uniqueConstraints = {
	@UniqueConstraint(columnNames = {"mentor_id", "mentee_id"})
})
public class MentorRating implements IEntity
{
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	public Long			id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "mentor_id", nullable = false)
	public Profile		mentor;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "mentee_id", nullable = false)
	public Profile		mentee;

	@Column(name = "rating_value", nullable = false)
	public Integer		ratingValue;

	public Date			createdAt;
	public Long			createdBy;
	public Date			lastUpdateAt;
	public Long			lastUpdateBy;

	@PrePersist
	private void onCreate()
	{
		Date now = new Date(System.currentTimeMillis());
		if (this.createdAt == null)
			this.createdAt = now;
		if (this.lastUpdateAt == null)
			this.lastUpdateAt = now;
		if (this.createdBy == null && this.mentee != null && this.mentee.user != null)
			this.createdBy = this.mentee.user.id;
		if (this.lastUpdateBy == null)
			this.lastUpdateBy = this.createdBy;
	}

	@PreUpdate
	private void onUpdate()
	{
		this.lastUpdateAt = new Date(System.currentTimeMillis());
		if (this.lastUpdateBy == null)
			this.lastUpdateBy = this.createdBy;
	}

	@Override
	public ValidationResult validate()
	{
		ValidationResult result = new ValidationResult();

		if (this.mentor == null || this.mentor.id == null)
			result.addError("mentorProfileId", "Perfil do mentor deve ser informado.");

		if (this.mentee == null || this.mentee.id == null)
			result.addError("menteeProfileId", "Perfil do mentorado deve ser informado.");

		if (this.mentor != null && this.mentor.role != ProfileType.MENTOR)
			result.addError("mentorProfileId", "Perfil informado nao e do tipo MENTOR.");

		if (this.mentee != null && this.mentee.role != ProfileType.MENTORADO)
			result.addError("menteeProfileId", "Perfil informado nao e do tipo MENTORADO.");

		if (this.ratingValue == null)
			result.addError("rating", "A nota da avaliacao deve ser informada.");
		else if (this.ratingValue < 1 || this.ratingValue > 5)
			result.addError("rating", "A nota deve estar entre 1 e 5 estrelas.");

		if (this.mentor != null && this.mentee != null && this.mentor.id != null && this.mentor.id.equals(this.mentee.id))
			result.addError("profiles", "Nao e permitido avaliar o proprio perfil.");

		return result;
	}
}