package com.ft.trans.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ft.trans.dto.ConnectionResponseDTO;
import com.ft.trans.dto.LimitMenteeDTO;
import com.ft.trans.dto.MentorCapacityDTO;
import com.ft.trans.dto.RequestConnectionDTO;
import com.ft.trans.entity.LimitMentee;
import com.ft.trans.entity.MentorshipConnection;
import com.ft.trans.entity.MentorshipConnection.ConnectionStatus;
import com.ft.trans.entity.MentorshipCount;
import com.ft.trans.entity.Profile;
import com.ft.trans.entity.Profile.ProfileType;
import com.ft.trans.entity.User;
import com.ft.trans.repository.LimitMenteeRepository;
import com.ft.trans.repository.MentorshipConnectionRepository;
import com.ft.trans.repository.MentorshipCountRepository;
import com.ft.trans.repository.ProfileRepository;
import com.ft.trans.repository.UserRepository;
import com.ft.trans.validation.Result;
import com.ft.trans.validation.ValidationResult;

@Service
public class MentorshipConnectionService
{
	private static final int DEFAULT_MENTEE_LIMIT = 10;

	private final MentorshipConnectionRepository connectionRepository;
	private final MentorshipCountRepository       countRepository;
	private final LimitMenteeRepository           limitMenteeRepository;
	private final UserRepository                  userRepository;
	private final ProfileRepository               profileRepository;

	public MentorshipConnectionService(
		MentorshipConnectionRepository connectionRepository,
		MentorshipCountRepository countRepository,
		LimitMenteeRepository limitMenteeRepository,
		UserRepository userRepository,
		ProfileRepository profileRepository
	)
	{
		this.connectionRepository  = connectionRepository;
		this.countRepository       = countRepository;
		this.limitMenteeRepository = limitMenteeRepository;
		this.userRepository        = userRepository;
		this.profileRepository     = profileRepository;
	}

	// ── RN01: Mentorado solicita mentoria ────────────────────────
	@Transactional
	public Result requestConnection(RequestConnectionDTO dto)
	{
		ValidationResult result = new ValidationResult();

		if (dto.mentorId == null)
			result.addError("mentorId", "Mentor deve ser informado.");
		if (dto.menteeId == null)
			result.addError("menteeId", "Mentorado deve ser informado.");
		if (result.hasErrors())
			return new Result(null, result);

		if (dto.mentorId.equals(dto.menteeId))
		{
			result.addError("connection", "O mentor e o mentorado não podem ser a mesma pessoa.");
			return new Result(null, result);
		}

		User mentor = userRepository.findById(dto.mentorId).orElse(null);
		if (mentor == null)
		{
			result.addError("mentorId", "Mentor não encontrado.");
			return new Result(null, result);
		}

		User mentee = userRepository.findById(dto.menteeId).orElse(null);
		if (mentee == null)
		{
			result.addError("menteeId", "Mentorado não encontrado.");
			return new Result(null, result);
		}

		// Validar perfis
		Optional<Profile> mentorProfile = profileRepository.findByUserIdAndRole(dto.mentorId, ProfileType.MENTOR);
		if (mentorProfile.isEmpty())
		{
			result.addError("mentorId", "Este usuário não possui perfil de Mentor.");
			return new Result(null, result);
		}

		Optional<Profile> menteeProfile = profileRepository.findByUserIdAndRole(dto.menteeId, ProfileType.MENTORADO);
		if (menteeProfile.isEmpty())
		{
			result.addError("menteeId", "Este usuário não possui perfil de Mentorado.");
			return new Result(null, result);
		}

		// Verificar se já existe conexão ativa (PENDING ou APPROVED)
		List<ConnectionStatus> activeStatuses = List.of(ConnectionStatus.PENDING, ConnectionStatus.APPROVED);
		boolean alreadyExists = connectionRepository
			.existsByMentor_IdAndMentee_IdAndStatusIn(dto.mentorId, dto.menteeId, activeStatuses);
		if (alreadyExists)
		{
			result.addError("connection", "Já existe uma solicitação pendente ou conexão ativa com este mentor.");
			return new Result(null, result);
		}

		// RN02: Verificar capacidade do mentor
		MentorCapacityDTO capacity = _getMentorCapacity(dto.mentorId, mentorProfile.get().id);
		if (!capacity.isAvailable)
		{
			result.addError("capacity",
				"O mentor atingiu o limite de mentorados (" + capacity.maxMentees
				+ "). Entre na lista de espera.");
			return new Result(null, result);
		}

		MentorshipConnection connection = new MentorshipConnection();
		connection.mentor      = mentor;
		connection.mentee      = mentee;
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

		MentorshipConnection connection = connectionRepository.findById(connectionId).orElse(null);
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

		if (!connection.mentor.id.equals(mentorUserId))
		{
			result.addError("mentor", "Apenas o mentor desta conexão pode aceitá-la.");
			return new Result(null, result);
		}

		// RN02: Revalidar capacidade
		Optional<Profile> mentorProfile = profileRepository.findByUserIdAndRole(mentorUserId, ProfileType.MENTOR);
		if (mentorProfile.isEmpty())
		{
			result.addError("mentor", "Perfil de Mentor não encontrado.");
			return new Result(null, result);
		}

		MentorCapacityDTO capacity = _getMentorCapacity(mentorUserId, mentorProfile.get().id);
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
		count.mentorProfileId = mentorProfile.get().id;
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

		return saveResult;
	}

	// ── RN01: Mentor rejeita conexão ─────────────────────────────
	@Transactional
	public Result rejectConnection(Long connectionId, Long mentorUserId)
	{
		ValidationResult result = new ValidationResult();

		MentorshipConnection connection = connectionRepository.findById(connectionId).orElse(null);
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

		if (!connection.mentor.id.equals(mentorUserId))
		{
			result.addError("mentor", "Apenas o mentor desta conexão pode rejeitá-la.");
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

		MentorshipConnection connection = connectionRepository.findById(connectionId).orElse(null);
		if (connection == null)
		{
			result.addError("connectionId", "Conexão não encontrada.");
			return new Result(null, result);
		}

		if (connection.status != ConnectionStatus.APPROVED)
		{
			result.addError("status", "Só é possível encerrar mentorias ativas (APPROVED).");
			return new Result(null, result);
		}

		boolean isMentor = connection.mentor.id.equals(userId);
		boolean isMentee = connection.mentee.id.equals(userId);
		if (!isMentor && !isMentee)
		{
			result.addError("userId", "Apenas o mentor ou o mentorado podem encerrar esta mentoria.");
			return new Result(null, result);
		}

		connection.status       = ConnectionStatus.REJECTED;
		connection.lastUpdateAt = LocalDateTime.now();
		connection.lastUpdateBy = userId;

		Result saveResult = _persistConnection(connection);

		// Remover/inativar registro do mentorship_count
		Optional<MentorshipCount> countOpt = countRepository.findByConnection_Id(connectionId);
		countOpt.ifPresent(count -> {
			count.status       = "ENCERRADO";
			count.lastUpdateAt = LocalDateTime.now();
			count.lastUpdateBy = userId;
			countRepository.save(count);
		});

		return saveResult;
	}

	// ── Listagens ────────────────────────────────────────────────

	public List<ConnectionResponseDTO> listMentorsByMentee(Long menteeId)
	{
		List<MentorshipConnection> connections = connectionRepository
			.findByMentee_IdAndStatus(menteeId, ConnectionStatus.APPROVED);
		return connections.stream().map(ConnectionResponseDTO::fromEntity).toList();
	}

	public List<ConnectionResponseDTO> listMenteesByMentor(Long mentorId)
	{
		List<MentorshipConnection> connections = connectionRepository
			.findByMentor_IdAndStatus(mentorId, ConnectionStatus.APPROVED);
		return connections.stream().map(ConnectionResponseDTO::fromEntity).toList();
	}

	public List<ConnectionResponseDTO> listPendingByMentor(Long mentorId)
	{
		List<MentorshipConnection> connections = connectionRepository
			.findByMentor_IdAndStatus(mentorId, ConnectionStatus.PENDING);
		return connections.stream().map(ConnectionResponseDTO::fromEntity).toList();
	}

	public List<ConnectionResponseDTO> listAllByMentor(Long mentorId)
	{
		List<MentorshipConnection> connections = connectionRepository.findByMentor_Id(mentorId);
		return connections.stream().map(ConnectionResponseDTO::fromEntity).toList();
	}

	public List<ConnectionResponseDTO> listAllByMentee(Long menteeId)
	{
		List<MentorshipConnection> connections = connectionRepository.findByMentee_Id(menteeId);
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
}
