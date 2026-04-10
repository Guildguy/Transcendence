package com.ft.trans.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ft.trans.controller.dto.GamificationEventRequest;
import com.ft.trans.dto.ConnectionResponseDTO;
import com.ft.trans.dto.LimitMenteeDTO;
import com.ft.trans.dto.MentorCapacityDTO;
import com.ft.trans.dto.RequestConnectionDTO;
import com.ft.trans.entity.LimitMentee;
import com.ft.trans.entity.MentorshipConnection;
import com.ft.trans.entity.MentorshipConnection.ConnectionStatus;
import com.ft.trans.entity.MentorshipCount;
import com.ft.trans.entity.MentorshipSession.SessionStatus;
import com.ft.trans.entity.Profile;
import com.ft.trans.entity.Profile.ProfileType;
import com.ft.trans.entity.User;
import com.ft.trans.repository.LimitMenteeRepository;
import com.ft.trans.repository.MentorshipConnectionRepository;
import com.ft.trans.repository.MentorshipCountRepository;
import com.ft.trans.repository.MentorshipSessionRepository;
import com.ft.trans.repository.ProfileRepository;
import com.ft.trans.repository.UserRepository;
import com.ft.trans.validation.Result;
import com.ft.trans.validation.ValidationResult;

@Service
public class MentorshipConnectionService
{
	private static final int DEFAULT_MENTEE_LIMIT = 10;
	private static final int MIN_COMPLETED_SESSIONS_FOR_CYCLE_COMPLETION = 1;

	private final MentorshipConnectionRepository connectionRepository;
	private final MentorshipCountRepository       countRepository;
	private final LimitMenteeRepository           limitMenteeRepository;
	private final UserRepository                  userRepository;
	private final ProfileRepository               profileRepository;
	private final MentorshipSessionRepository     sessionRepository;
	private final GamificationService             gamificationService;

	public MentorshipConnectionService(
		MentorshipConnectionRepository connectionRepository,
		MentorshipCountRepository countRepository,
		LimitMenteeRepository limitMenteeRepository,
		UserRepository userRepository,
		ProfileRepository profileRepository,
		MentorshipSessionRepository sessionRepository,
		GamificationService gamificationService
	)
	{
		this.connectionRepository  = connectionRepository;
		this.countRepository       = countRepository;
		this.limitMenteeRepository = limitMenteeRepository;
		this.userRepository        = userRepository;
		this.profileRepository     = profileRepository;
		this.sessionRepository     = sessionRepository;
		this.gamificationService   = gamificationService;
	}

	// ── RN01: Mentorado solicita mentoria (usando Profile IDs) ────────────────────────
	@Transactional
	public Result requestConnection(RequestConnectionDTO dto)
	{
		ValidationResult result = new ValidationResult();

		if (dto.mentorProfileId == null)
			result.addError("mentorProfileId", "ID do perfil do mentor deve ser informado.");
		if (dto.menteeProfileId == null)
			result.addError("menteeProfileId", "ID do perfil do mentorado deve ser informado.");
		if (result.hasErrors())
			return new Result(null, result);

		if (dto.mentorProfileId.equals(dto.menteeProfileId))
		{
			result.addError("connection", "O perfil de mentor e o perfil de mentorado não podem ser o mesmo.");
			return new Result(null, result);
		}

		Profile mentorProfile = profileRepository.findById(dto.mentorProfileId).orElse(null);
		if (mentorProfile == null || mentorProfile.role != ProfileType.MENTOR)
		{
			result.addError("mentorProfileId", "Perfil de Mentor não encontrado.");
			return new Result(null, result);
		}

		Profile menteeProfile = profileRepository.findById(dto.menteeProfileId).orElse(null);
		if (menteeProfile == null || menteeProfile.role != ProfileType.MENTORADO)
		{
			result.addError("menteeProfileId", "Perfil de Mentorado não encontrado.");
			return new Result(null, result);
		}

		// Verificar se já existe conexão ativa (PENDING ou APPROVED) entre estes PERFIS
		List<ConnectionStatus> activeStatuses = List.of(ConnectionStatus.PENDING, ConnectionStatus.APPROVED);
		boolean alreadyExists = connectionRepository
			.existsByMentorProfileIdAndMenteeProfileIdAndStatusIn(dto.mentorProfileId, dto.menteeProfileId, activeStatuses);
		
		if (alreadyExists)
		{
			result.addError("connection", "Já existe uma solicitação pendente ou conexão ativa com este perfil de mentor.");
			return new Result(null, result);
		}

		// RN02: Verificar capacidade do mentor (passando UserID do mentor e ProfileID do mentor)
		Long mentorUserId = mentorProfile.user != null ? mentorProfile.user.id : null;
		MentorCapacityDTO capacity = _getMentorCapacity(mentorUserId, dto.mentorProfileId);
		if (!capacity.isAvailable)
		{
			result.addError("capacity",
				"O mentor atingiu o limite de mentorados (" + capacity.maxMentees
				+ "). Entre na lista de espera.");
			return new Result(null, result);
		}

		MentorshipConnection connection = new MentorshipConnection();
		connection.mentor      = mentorProfile;
		connection.mentee      = menteeProfile;
		connection.status      = ConnectionStatus.PENDING;
		connection.createdAt   = LocalDateTime.now();
		connection.createdBy   = dto.createdBy;
		connection.lastUpdateAt = LocalDateTime.now();
		connection.lastUpdateBy = dto.createdBy;

		return _persistConnection(connection);
	}

	// ── RN01: Mentor aceita conexão ──────────────────────────────
	@Transactional
	public Result acceptConnection(Long connectionId, Long mentorUserId)
	{
		ValidationResult result = new ValidationResult();

		MentorshipConnection connection = connectionRepository.findByIdFull(connectionId).orElse(null);
		if (connection == null)
		{
			result.addError("connectionId", "Conexão não encontrada.");
			return new Result(null, result);
		}

		if (connection.status != ConnectionStatus.PENDING)
		{
			result.addError("status", "Apenas conexões pendentes podem ser aceitas. Status atual: " + connection.status);
			return new Result(null, result);
		}

		// Verificar se o usuário autenticado que está aceitando é o DONO do perfil de mentor
		// Forçamos o carregamento do perfil com usuário para evitar o erro de NULL
		Profile fullMentorProfile = profileRepository.findByIdWithUser(connection.mentor.id).orElse(null);
		
		if (fullMentorProfile == null || fullMentorProfile.user == null) {
			System.err.println("[acceptConnection] CRITICAL: Mentor Profile or User still NULL for Connection ID: " + connectionId);
			result.addError("mentor", "Não foi possível validar o dono do perfil de mentor.");
			return new Result(null, result);
		}
		
		System.out.println("[acceptConnection] DB Mentor User: " + fullMentorProfile.user.id + " | Incoming User: " + mentorUserId);

		if (!fullMentorProfile.user.id.equals(mentorUserId))
		{
			result.addError("mentor", "Apenas o usuário dono deste perfil de mentor pode aceitar a conexão.");
			return new Result(null, result);
		}

		// RN02: Revalidar capacidade
		MentorCapacityDTO capacity = _getMentorCapacity(mentorUserId, fullMentorProfile.id);
		if (!capacity.isAvailable)
		{
			result.addError("capacity",
				"Não é possível aceitar. Limite de mentorados atingido ("
				+ capacity.maxMentees + ").");
			return new Result(null, result);
		}

		connection.status       = ConnectionStatus.APPROVED;
		connection.acceptedAt   = LocalDateTime.now();
		connection.lastUpdateAt = LocalDateTime.now();
		connection.lastUpdateBy = mentorUserId;

		Result saveResult = _persistConnection(connection);
		if (saveResult.validationResult().hasErrors())
			return saveResult;

		// Criar registro no mentorship_count
		MentorshipCount count = new MentorshipCount();
		count.connection      = connection;
		count.mentorProfileId = fullMentorProfile.id;
		count.status          = "APROVADO";
		count.limitOfMentee   = capacity.maxMentees;
		count.createdAt       = LocalDateTime.now();
		count.createdBy       = mentorUserId;
		count.lastUpdateAt    = LocalDateTime.now();
		count.lastUpdateBy    = mentorUserId;

		try
		{
			countRepository.save(count);
		}
		catch (Exception e)
		{
			result.addError("count", "Erro ao registrar contagem: " + e.getMessage());
			return new Result(null, result);
		}

		_triggerMatchAcceptedGamification(connection);

		return saveResult;
	}

	// ── RN01: Mentor rejeita conexão ─────────────────────────────
	@Transactional
	public Result rejectConnection(Long connectionId, Long mentorUserId)
	{
		ValidationResult result = new ValidationResult();

		MentorshipConnection connection = connectionRepository.findByIdFull(connectionId).orElse(null);
		if (connection == null)
		{
			result.addError("connectionId", "Conexão não encontrada.");
			return new Result(null, result);
		}

		if (connection.status != ConnectionStatus.PENDING)
		{
			result.addError("status", "Apenas conexões pendentes podem ser rejeitadas. Status atual: " + connection.status);
			return new Result(null, result);
		}

		// Verificar se o usuário autenticado que está rejeitando é o DONO do perfil de mentor
		if (connection.mentor.user == null || !connection.mentor.user.id.equals(mentorUserId))
		{
			result.addError("mentor", "Apenas o usuário dono deste perfil de mentor pode rejeitar a conexão.");
			return new Result(null, result);
		}

		connection.status       = ConnectionStatus.REJECTED;
		connection.lastUpdateAt = LocalDateTime.now();
		connection.lastUpdateBy = mentorUserId;

		return _persistConnection(connection);
	}

	// ── Encerrar mentoria (qualquer um dos dois) ─────────────────
	@Transactional
	public Result endConnection(Long connectionId, Long userId)
	{
		ValidationResult result = new ValidationResult();

		MentorshipConnection connection = connectionRepository.findByIdFull(connectionId).orElse(null);
		if (connection == null)
		{
			result.addError("connectionId", "Conexão não encontrada.");
			return new Result(null, result);
		}

		if (connection.status != ConnectionStatus.APPROVED && connection.status != ConnectionStatus.PENDING)
		{
			result.addError("status", "Só é possível encerrar mentorias ativas (APPROVED) ou pendentes (PENDING).");
			return new Result(null, result);
		}

		boolean isMentor = connection.mentor.user != null && connection.mentor.user.id.equals(userId);
		boolean isMentee = connection.mentee.user != null && connection.mentee.user.id.equals(userId);
		if (!isMentor && !isMentee)
		{
			result.addError("userId", "Apenas o dono do perfil de mentor ou do perfil de mentorado pode encerrar esta mentoria.");
			return new Result(null, result);
		}

		// PENDING → CANCELLED, APPROVED → ENDED
		if (connection.status == ConnectionStatus.PENDING)
			connection.status = ConnectionStatus.CANCELLED;
		else
			connection.status = ConnectionStatus.ENDED;

		connection.lastUpdateAt = LocalDateTime.now();
		connection.lastUpdateBy = userId;

		Result saveResult = _persistConnection(connection);
		if (saveResult.validationResult().hasErrors())
			return saveResult;

		// Remover/inativar registro do mentorship_count
		Optional<MentorshipCount> countOpt = countRepository.findByConnection_Id(connectionId);
		countOpt.ifPresent(count -> {
			count.status       = "ENCERRADO";
			count.lastUpdateAt = LocalDateTime.now();
			count.lastUpdateBy = userId;
			countRepository.save(count);
		});

		if (connection.status == ConnectionStatus.ENDED)
			_triggerCycleCompletedGamificationIfEligible(connection);

		return saveResult;
	}

	// ── Listagens ────────────────────────────────────────────────

	/** Retorna TODAS as conexões de um perfil de mentorado */
	public List<ConnectionResponseDTO> listMentorsByMentee(Long menteeProfileId)
	{
		List<MentorshipConnection> connections = connectionRepository.findByMenteeId(menteeProfileId);
		return connections.stream().map(ConnectionResponseDTO::fromEntity).toList();
	}

	public List<ConnectionResponseDTO> listMenteesByMentor(Long mentorProfileId)
	{
		List<MentorshipConnection> connections = connectionRepository
			.findByMentorIdAndStatus(mentorProfileId, ConnectionStatus.APPROVED);
		return connections.stream().map(ConnectionResponseDTO::fromEntity).toList();
	}

	public List<ConnectionResponseDTO> listPendingByMentor(Long mentorProfileId)
	{
		List<MentorshipConnection> connections = connectionRepository
			.findByMentorIdAndStatus(mentorProfileId, ConnectionStatus.PENDING);
		return connections.stream().map(ConnectionResponseDTO::fromEntity).toList();
	}

	public List<ConnectionResponseDTO> listAllByMentor(Long mentorId)
	{
		List<MentorshipConnection> connections = connectionRepository.findByMentorId(mentorId);
		return connections.stream().map(ConnectionResponseDTO::fromEntity).toList();
	}

	public List<ConnectionResponseDTO> listAllByMentee(Long menteeId)
	{
		List<MentorshipConnection> connections = connectionRepository.findByMenteeId(menteeId);
		return connections.stream().map(ConnectionResponseDTO::fromEntity).toList();
	}

	// ── RN02: Capacidade ─────────────────────────────────────────

	public MentorCapacityDTO getMentorCapacity(Long mentorUserId)
	{
		Optional<Profile> mentorProfile = profileRepository.findByUserIdAndRole(mentorUserId, ProfileType.MENTOR);
		if (mentorProfile.isEmpty())
			return new MentorCapacityDTO(mentorUserId, null, 0, DEFAULT_MENTEE_LIMIT);

		return _getMentorCapacity(mentorUserId, mentorProfile.get().id);
	}

	// ── Limite de mentorados ─────────────────────────────────────

	@Transactional
	public Result saveLimitMentee(LimitMenteeDTO dto)
	{
		ValidationResult result = new ValidationResult();

		if (dto.mentorProfileId == null)
		{
			result.addError("mentorProfileId", "Profile ID do mentor é obrigatório.");
			return new Result(null, result);
		}

		Profile mentorProfile = profileRepository.findById(dto.mentorProfileId).orElse(null);
		if (mentorProfile == null)
		{
			result.addError("mentorProfileId", "Perfil de mentor não encontrado.");
			return new Result(null, result);
		}

		if (mentorProfile.role != ProfileType.MENTOR)
		{
			result.addError("mentorProfileId", "O perfil informado não é do tipo MENTOR.");
			return new Result(null, result);
		}

		LimitMentee limit = limitMenteeRepository.findByMentor_Id(dto.mentorProfileId).orElse(null);
		if (limit == null)
		{
			limit = new LimitMentee();
			limit.mentor    = mentorProfile;
			limit.createdAt = new java.sql.Date(System.currentTimeMillis());
			limit.createdBy = mentorProfile.user != null ? mentorProfile.user.id : null;
		}

		limit.limitOfMentee = dto.limitOfMentee != null ? dto.limitOfMentee : DEFAULT_MENTEE_LIMIT;
		limit.lastUpdateAt  = new java.sql.Date(System.currentTimeMillis());
		limit.lastUpdateBy  = mentorProfile.user != null ? mentorProfile.user.id : null;

		ValidationResult entityValidation = limit.validate();
		if (entityValidation.hasErrors())
			return new Result(null, entityValidation);

		try
		{
			LimitMentee saved = limitMenteeRepository.save(limit);
			return new Result(saved, result);
		}
		catch (Exception e)
		{
			result.addError("global", "Erro ao salvar limite: " + e.getMessage());
			return new Result(null, result);
		}
	}

	// ── Privados ─────────────────────────────────────────────────

	private MentorCapacityDTO _getMentorCapacity(Long mentorUserId, Long mentorProfileId)
	{
		long currentMentees = countRepository.countByMentorProfileIdAndStatus(mentorProfileId, "APROVADO");

		int maxMentees = limitMenteeRepository.findByMentor_Id(mentorProfileId)
			.map(limit -> limit.limitOfMentee)
			.orElse(DEFAULT_MENTEE_LIMIT);

		return new MentorCapacityDTO(mentorUserId, mentorProfileId, currentMentees, maxMentees);
	}

	private Result _persistConnection(MentorshipConnection connection)
	{
		ValidationResult result = new ValidationResult();
		MentorshipConnection saved = null;

		ValidationResult entityValidation = connection.validate();
		if (entityValidation.hasErrors())
			return new Result(null, entityValidation);

		try
		{
			saved = connectionRepository.save(connection);
		}
		catch (org.springframework.dao.DataIntegrityViolationException e)
		{
			result.addError("connection", e.getMostSpecificCause().getMessage());
		}
		catch (Exception e)
		{
			result.addError("global", "Ocorreu um erro interno ao salvar a conexão.");
		}

		return new Result(saved, result);
	}

	private void _triggerMatchAcceptedGamification(MentorshipConnection connection)
	{
		try
		{
			if (connection.mentor != null && connection.mentor.user != null && connection.mentor.user.id != null)
				gamificationService.processEvent(new GamificationEventRequest(connection.mentor.user.id, "MATCH_ACCEPTED"));

			if (connection.mentee != null && connection.mentee.user != null && connection.mentee.user.id != null)
				gamificationService.processEvent(new GamificationEventRequest(connection.mentee.user.id, "MATCH_ACCEPTED"));
		}
		catch (Exception ignored)
		{
		}
	}

	private void _triggerCycleCompletedGamificationIfEligible(MentorshipConnection connection)
	{
		try
		{
			if (connection == null || connection.id == null)
				return;

			long completedSessions = sessionRepository.countByConnectionIdAndStatus(connection.id, SessionStatus.COMPLETED);
			if (completedSessions < MIN_COMPLETED_SESSIONS_FOR_CYCLE_COMPLETION)
				return;

			if (connection.mentor != null && connection.mentor.user != null && connection.mentor.user.id != null)
				gamificationService.processEvent(new GamificationEventRequest(connection.mentor.user.id, "CYCLE_COMPLETED"));

			if (connection.mentee != null && connection.mentee.user != null && connection.mentee.user.id != null)
				gamificationService.processEvent(new GamificationEventRequest(connection.mentee.user.id, "CYCLE_COMPLETED"));
		}
		catch (Exception ignored)
		{
		}
	}
}
