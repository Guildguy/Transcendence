package com.ft.trans.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.ft.trans.dto.CreateSessionDTO;
import com.ft.trans.dto.MentorNotesDTO;
import com.ft.trans.dto.UpdateSessionDTO;
import com.ft.trans.entity.MentorshipSession;
import com.ft.trans.entity.MentorshipSession.SessionStatus;
import com.ft.trans.repository.MentorshipSessionRepository;
import com.ft.trans.validation.Result;
import com.ft.trans.validation.ValidationResult;

@Service
public class MentorshipSessionService
{
	private static final int MAX_RECURRENCE = 10;

	private final MentorshipSessionRepository sessionRepository;

	public MentorshipSessionService(MentorshipSessionRepository sessionRepository)
	{
		this.sessionRepository = sessionRepository;
	}

	public Result createSession(CreateSessionDTO dto)
	{
		ValidationResult result = new ValidationResult();

		MentorshipSession baseSession = dto.toSession();
		ValidationResult entityValidation = baseSession.validate();
		if (entityValidation.hasErrors())
			return new Result(null, entityValidation);

		if (sessionRepository.existsByConnectionIdAndScheduledDate(dto.connectionId, dto.scheduledDate))
		{
			result.addError("scheduledDate", "Já existe uma sessão agendada neste horário para esta conexão.");
			return new Result(null, result);
		}

		baseSession.meetUrl = _generateMeetUrl();
		return _persistSession(baseSession);
	}

	public RecurrenceResult createRecurring(CreateSessionDTO dto)
	{
		ValidationResult result = new ValidationResult();

		MentorshipSession baseSession = dto.toSession();
		ValidationResult entityValidation = baseSession.validate();
		if (entityValidation.hasErrors())
			return new RecurrenceResult(null, entityValidation);

		UUID groupId = UUID.randomUUID();
		List<MentorshipSession> sessions = new ArrayList<>();

		for (int i = 0; i < MAX_RECURRENCE; i++)
		{
			LocalDateTime sessionDate = dto.scheduledDate.plusWeeks(i);

			if (sessionRepository.existsByConnectionIdAndScheduledDate(dto.connectionId, sessionDate))
			{
				result.addError("scheduledDate",
					"Conflito de horário na semana " + (i + 1) + " (" + sessionDate.toLocalDate() + ").");
				return new RecurrenceResult(null, result);
			}

			MentorshipSession session  = dto.toSession();
			session.scheduledDate      = sessionDate;
			session.meetUrl            = _generateMeetUrl();
			session.recurrenceGroupId  = groupId;
			session.recurrenceIndex    = i + 1;

			sessions.add(session);
		}

		try
		{
			List<MentorshipSession> saved = sessionRepository.saveAll(sessions);
			return new RecurrenceResult(saved, result);
		}
		catch (Exception e)
		{
			result.addError("global", "Erro ao salvar as sessões recorrentes: " + e.getMessage());
			return new RecurrenceResult(null, result);
		}
	}

	public record RecurrenceResult(List<MentorshipSession> sessions, ValidationResult validationResult) {}

	public List<MentorshipSession> listByConnection(Long connectionId)
	{
		return sessionRepository.findByConnectionId(connectionId);
	}

	public Optional<String> getNotes(Long sessionId)
	{
		MentorshipSession session = sessionRepository.findById(sessionId).orElse(null);
		if (session == null)
			return Optional.empty();
		return Optional.ofNullable(session.mentorNotes);
	}

	public Result saveNotes(Long sessionId, MentorNotesDTO dto)
	{
		ValidationResult result = new ValidationResult();

		MentorshipSession session = sessionRepository.findById(sessionId).orElse(null);
		if (session == null)
		{
			result.addError("sessionId", "Sessão não encontrada.");
			return new Result(null, result);
		}

		session.mentorNotes  = dto.mentorNotes;
		session.lastUpdateAt = LocalDateTime.now();
		session.lastUpdateBy = dto.lastUpdateBy;

		return _persistSession(session);
	}

	public List<MentorshipSession> listUpcomingByConnection(Long connectionId)
	{
		return sessionRepository.findByConnectionIdAndScheduledDateAfter(connectionId, LocalDateTime.now());
	}

	public Result update(UpdateSessionDTO dto)
	{
		ValidationResult result = new ValidationResult();

		if (dto.sessionId == null)
		{
			result.addError("sessionId", "O ID da sessão é obrigatório.");
			return new Result(null, result);
		}

		MentorshipSession session = sessionRepository.findById(dto.sessionId).orElse(null);
		if (session == null)
		{
			result.addError("sessionId", "Sessão não encontrada.");
			return new Result(null, result);
		}

		if (dto.scheduledDate != null)
		{
			if (sessionRepository.existsByConnectionIdAndScheduledDate(session.connectionId, dto.scheduledDate)
				&& !dto.scheduledDate.equals(session.scheduledDate))
			{
				result.addError("scheduledDate", "Já existe uma sessão neste horário para esta conexão.");
				return new Result(null, result);
			}
			session.scheduledDate = dto.scheduledDate;
		}

		if (dto.durationMinutes != null)
		{
			if (dto.durationMinutes < 60 || dto.durationMinutes > 240 || dto.durationMinutes % 30 != 0)
			{
				result.addError("durationMinutes", "Duração inválida. Use múltiplos de 30 entre 60 e 240 minutos.");
				return new Result(null, result);
			}
			session.durationMinutes = dto.durationMinutes;
		}

		if (dto.status != null)
		{
			try
			{
				session.status = SessionStatus.valueOf(dto.status.toUpperCase());
			}
			catch (IllegalArgumentException e)
			{
				result.addError("status", "Status inválido. Use: SCHEDULED, COMPLETED, NO_SHOW ou CANCELLED.");
				return new Result(null, result);
			}
		}

		if (dto.menteeMissed != null)
			session.menteeMissed = dto.menteeMissed;

		if (dto.mentorNotes != null)
			session.mentorNotes = dto.mentorNotes;

		session.lastUpdateAt = LocalDateTime.now();
		session.lastUpdateBy = dto.lastUpdateBy;

		return _persistSession(session);
	}

	public Result cancel(Long sessionId)
	{
		ValidationResult result = new ValidationResult();

		MentorshipSession session = sessionRepository.findById(sessionId).orElse(null);
		if (session == null)
		{
			result.addError("sessionId", "Sessão não encontrada.");
			return new Result(null, result);
		}

		if (session.status == SessionStatus.CANCELLED)
		{
			result.addError("status", "Esta sessão já está cancelada.");
			return new Result(null, result);
		}

		session.status       = SessionStatus.CANCELLED;
		session.lastUpdateAt = LocalDateTime.now();

		return _persistSession(session);
	}

	private String _generateMeetUrl()
	{
		String part1 = UUID.randomUUID().toString().substring(0, 3);
		String part2 = UUID.randomUUID().toString().substring(0, 4);
		String part3 = UUID.randomUUID().toString().substring(0, 3);
		return "https://meet.google.com/" + part1 + "-" + part2 + "-" + part3;
	}

	private Result _persistSession(MentorshipSession session)
	{
		ValidationResult result = new ValidationResult();
		MentorshipSession saved = null;

		try
		{
			saved = sessionRepository.save(session);
		}
		catch (org.springframework.dao.DataIntegrityViolationException e)
		{
			result.addError("session", e.getMostSpecificCause().getMessage());
		}
		catch (Exception e)
		{
			result.addError("global", "Ocorreu um erro interno ao salvar a sessão.");
		}

		return new Result(saved, result);
	}
}
