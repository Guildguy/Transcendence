package com.ft.trans.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import com.ft.trans.contract.IEntity;
import com.ft.trans.validation.ValidationResult;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "mentorship_session", uniqueConstraints = {
	@UniqueConstraint(columnNames = {"connection_id", "scheduled_date"})
})
public class MentorshipSession implements IEntity
{
	public enum SessionStatus
	{
		SCHEDULED,
		COMPLETED,
		NO_SHOW,
		CANCELLED
	}

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	public Long			id;

	@Column(name = "connection_id", nullable = false)
	public Long			connectionId;

	@Column(name = "scheduled_date", nullable = false)
	public LocalDateTime scheduledDate;

	@Column(name = "duration_minutes", nullable = false)
	public Integer		durationMinutes;

	@Column(name = "meet_url")
	public String		meetUrl;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	public SessionStatus status;

	@Column(name = "is_recurrent", nullable = false)
	public Boolean		isRecurrent = false;

	@Column(name = "recurrence_group_id")
	public UUID			recurrenceGroupId;

	@Column(name = "recurrence_index")
	public Integer		recurrenceIndex;

	@Column(name = "mentee_missed")
	public Boolean		menteeMissed = false;

	@Column(name = "mentor_notes", length = 2048)
	public String		mentorNotes;

	public LocalDateTime createdAt;
	public Long			createdBy;
	public LocalDateTime lastUpdateAt;
	public Long			lastUpdateBy;

	private ValidationResult isConnectionValid(ValidationResult result)
	{
		if (this.connectionId == null)
			result.addError("connectionId", "A sessão precisa estar vinculada a uma conexão de mentoria.");
		return result;
	}

	private ValidationResult isScheduledDateValid(ValidationResult result)
	{
		if (this.scheduledDate == null)
			result.addError("scheduledDate", "A data e hora da sessão são obrigatórias.");
		else if (this.scheduledDate.isBefore(LocalDateTime.now()))
			result.addError("scheduledDate", "A data da sessão não pode ser no passado.");
		return result;
	}

	private ValidationResult isDurationValid(ValidationResult result)
	{
		if (this.durationMinutes == null)
		{
			result.addError("durationMinutes", "A duração da sessão é obrigatória.");
			return result;
		}
		if (this.durationMinutes < 60 || this.durationMinutes > 240)
			result.addError("durationMinutes", "A duração deve ser entre 60 (1h) e 240 (4h) minutos.");
		if (this.durationMinutes % 30 != 0)
			result.addError("durationMinutes", "A duração deve ser múltiplo de 30 minutos (ex: 60, 90, 120...).");
		return result;
	}

	@Override
	public ValidationResult validate()
	{
		ValidationResult result = new ValidationResult();
		isConnectionValid(result);
		isScheduledDateValid(result);
		isDurationValid(result);
		return result;
	}
}
