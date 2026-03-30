package com.ft.trans.service;

import java.sql.Date;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.ft.trans.controller.dto.GamificationEventRequest;
import com.ft.trans.dto.MentorshipCreateDTO;
import com.ft.trans.entity.Mentorship;
import com.ft.trans.entity.Profile;
import com.ft.trans.entity.Mentorship.MentorshipStatus;
import com.ft.trans.entity.Profile.ProfileType;
import com.ft.trans.repository.MentorshipRepository;
import com.ft.trans.repository.ProfileRepository;
import com.ft.trans.validation.Result;
import com.ft.trans.validation.ValidationResult;

@Service
public class MentorshipService
{
    private final MentorshipRepository mentorshipRepository;
    private final ProfileRepository profileRepository;
    private final GamificationService gamificationService;

    public MentorshipService(
        MentorshipRepository mentorshipRepository,
        ProfileRepository profileRepository,
        GamificationService gamificationService
    ) {
        this.mentorshipRepository = mentorshipRepository;
        this.profileRepository = profileRepository;
        this.gamificationService = gamificationService;
    }

    public Result createRequest(MentorshipCreateDTO dto)
    {
        ValidationResult validation = new ValidationResult();

        if (dto == null)
        {
            validation.addError("payload", "Payload invalido.");
            return new Result(null, validation);
        }

        Profile mentorProfile = profileRepository.findById(dto.mentorProfileId).orElse(null);
        Profile menteeProfile = profileRepository.findById(dto.menteeProfileId).orElse(null);

        validateCreateInput(dto, mentorProfile, menteeProfile, validation);
        if (validation.hasErrors())
            return new Result(null, validation);

        if (mentorshipRepository.existsMentorTimeConflict(
            mentorProfile.id,
            dto.startAt,
            dto.endAt,
            Set.of(MentorshipStatus.REQUESTED, MentorshipStatus.ACCEPTED),
            null
        )) {
            validation.addError("schedule", "Mentor ja possui mentoria no horario solicitado.");
            return new Result(null, validation);
        }

        Date now = new Date(System.currentTimeMillis());
        Mentorship mentorship = new Mentorship();
        mentorship.mentorProfile = mentorProfile;
        mentorship.menteeProfile = menteeProfile;
        mentorship.startAt = dto.startAt;
        mentorship.endAt = dto.endAt;
        mentorship.topic = dto.topic;
        mentorship.notes = dto.notes;
        mentorship.status = MentorshipStatus.REQUESTED;
        mentorship.createdAt = now;
        mentorship.createdBy = menteeProfile.user.id;
        mentorship.lastUpdateAt = now;
        mentorship.lastUpdateBy = menteeProfile.user.id;

        ValidationResult entityValidation = mentorship.validate();
        if (entityValidation.hasErrors())
            return new Result(null, entityValidation);

        Mentorship saved = mentorshipRepository.save(mentorship);
        return new Result(saved, new ValidationResult());
    }

    public Result accept(Long mentorshipId, Long actorProfileId)
    {
        return transition(mentorshipId, actorProfileId, MentorshipStatus.ACCEPTED);
    }

    public Result reject(Long mentorshipId, Long actorProfileId)
    {
        return transition(mentorshipId, actorProfileId, MentorshipStatus.REJECTED);
    }

    public Result cancel(Long mentorshipId, Long actorProfileId)
    {
        return transition(mentorshipId, actorProfileId, MentorshipStatus.CANCELLED);
    }

    public Result complete(Long mentorshipId, Long actorProfileId)
    {
        return transition(mentorshipId, actorProfileId, MentorshipStatus.COMPLETED);
    }

    public List<Mentorship> listIncoming(Long mentorProfileId)
    {
        return mentorshipRepository.findByMentorProfileIdAndStatusOrderByCreatedAtDesc(mentorProfileId, MentorshipStatus.REQUESTED);
    }

    public List<Mentorship> listByProfile(Long profileId)
    {
        List<Mentorship> asMentor = mentorshipRepository.findByMentorProfileIdOrderByStartAtDesc(profileId);
        List<Mentorship> asMentee = mentorshipRepository.findByMenteeProfileIdOrderByStartAtDesc(profileId);

        return java.util.stream.Stream.concat(asMentor.stream(), asMentee.stream())
            .sorted((a, b) -> b.startAt.compareTo(a.startAt))
            .toList();
    }

    private Result transition(Long mentorshipId, Long actorProfileId, MentorshipStatus targetStatus)
    {
        ValidationResult validation = new ValidationResult();

        if (mentorshipId == null)
            validation.addError("mentorshipId", "Id da mentoria e obrigatorio.");

        if (actorProfileId == null)
            validation.addError("actorProfileId", "Perfil ator e obrigatorio.");

        if (validation.hasErrors())
            return new Result(null, validation);

        Mentorship mentorship = mentorshipRepository.findById(mentorshipId).orElse(null);
        if (mentorship == null)
        {
            validation.addError("mentorship", "Mentoria nao encontrada.");
            return new Result(null, validation);
        }

        Profile actor = profileRepository.findById(actorProfileId).orElse(null);
        if (actor == null)
        {
            validation.addError("actorProfileId", "Perfil ator nao encontrado.");
            return new Result(null, validation);
        }

        if (!canTransition(mentorship, actor, targetStatus, validation))
            return new Result(null, validation);

        if (targetStatus == MentorshipStatus.ACCEPTED && mentorshipRepository.existsMentorTimeConflict(
            mentorship.mentorProfile.id,
            mentorship.startAt,
            mentorship.endAt,
            Set.of(MentorshipStatus.ACCEPTED),
            mentorship.id
        )) {
            validation.addError("schedule", "Conflito de horario para o mentor.");
            return new Result(null, validation);
        }

        mentorship.status = targetStatus;
        mentorship.lastUpdateAt = new Date(System.currentTimeMillis());
        mentorship.lastUpdateBy = actor.user.id;
        Mentorship updated = mentorshipRepository.save(mentorship);

        triggerGamification(updated, targetStatus);

        return new Result(updated, new ValidationResult());
    }

    private void triggerGamification(Mentorship mentorship, MentorshipStatus targetStatus)
    {
        if (targetStatus == MentorshipStatus.ACCEPTED)
        {
            gamificationService.processEvent(new GamificationEventRequest(mentorship.mentorProfile.user.id, "MATCH_ACCEPTED"));
            gamificationService.processEvent(new GamificationEventRequest(mentorship.menteeProfile.user.id, "MATCH_ACCEPTED"));
        }

        if (targetStatus == MentorshipStatus.COMPLETED)
        {
            gamificationService.processEvent(new GamificationEventRequest(mentorship.mentorProfile.user.id, "SESSION_COMPLETED"));
            gamificationService.processEvent(new GamificationEventRequest(mentorship.menteeProfile.user.id, "SESSION_COMPLETED"));
        }
    }

    private boolean canTransition(Mentorship mentorship, Profile actor, MentorshipStatus targetStatus, ValidationResult validation)
    {
        boolean isMentor = mentorship.mentorProfile.id.equals(actor.id);
        boolean isMentee = mentorship.menteeProfile.id.equals(actor.id);

        if (!isMentor && !isMentee)
        {
            validation.addError("actorProfileId", "Perfil nao participa desta mentoria.");
            return false;
        }

        MentorshipStatus current = mentorship.status;

        if (targetStatus == MentorshipStatus.ACCEPTED || targetStatus == MentorshipStatus.REJECTED)
        {
            if (!isMentor)
                validation.addError("actorProfileId", "Apenas mentor pode aceitar ou rejeitar.");
            if (current != MentorshipStatus.REQUESTED)
                validation.addError("status", "Somente mentorias REQUESTED podem ser aceitas/rejeitadas.");
        }

        if (targetStatus == MentorshipStatus.CANCELLED)
        {
            if (current != MentorshipStatus.REQUESTED && current != MentorshipStatus.ACCEPTED)
                validation.addError("status", "Somente mentorias REQUESTED/ACCEPTED podem ser canceladas.");
        }

        if (targetStatus == MentorshipStatus.COMPLETED)
        {
            if (!isMentor)
                validation.addError("actorProfileId", "Apenas mentor pode concluir mentoria.");
            if (current != MentorshipStatus.ACCEPTED)
                validation.addError("status", "Somente mentorias ACCEPTED podem ser concluidas.");
        }

        return !validation.hasErrors();
    }

    private void validateCreateInput(MentorshipCreateDTO dto, Profile mentorProfile, Profile menteeProfile, ValidationResult validation)
    {
        if (dto.mentorProfileId == null)
            validation.addError("mentorProfileId", "Perfil mentor e obrigatorio.");

        if (dto.menteeProfileId == null)
            validation.addError("menteeProfileId", "Perfil mentorado e obrigatorio.");

        if (dto.requesterProfileId == null)
            validation.addError("requesterProfileId", "Perfil solicitante e obrigatorio.");

        if (dto.startAt == null)
            validation.addError("startAt", "Data/hora inicial e obrigatoria.");

        if (dto.endAt == null)
            validation.addError("endAt", "Data/hora final e obrigatoria.");

        if (dto.startAt != null && dto.endAt != null && !dto.startAt.before(dto.endAt))
            validation.addError("schedule", "Horario invalido: startAt deve ser menor que endAt.");

        if (mentorProfile == null)
            validation.addError("mentorProfileId", "Perfil mentor nao encontrado.");

        if (menteeProfile == null)
            validation.addError("menteeProfileId", "Perfil mentorado nao encontrado.");

        if (mentorProfile != null && mentorProfile.role != ProfileType.MENTOR)
            validation.addError("mentorProfileId", "Perfil informado nao possui role MENTOR.");

        if (menteeProfile != null && menteeProfile.role != ProfileType.MENTORADO)
            validation.addError("menteeProfileId", "Perfil informado nao possui role MENTORADO.");

        if (mentorProfile != null && menteeProfile != null && mentorProfile.user.id.equals(menteeProfile.user.id))
            validation.addError("profiles", "Nao e permitido marcar mentoria com o proprio usuario.");

        if (dto.requesterProfileId != null && menteeProfile != null && !dto.requesterProfileId.equals(menteeProfile.id))
            validation.addError("requesterProfileId", "A solicitacao deve ser feita pelo perfil mentorado.");
    }
}
