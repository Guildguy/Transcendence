package com.ft.trans.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ft.trans.controller.dto.GamificationEventRequest;
import com.ft.trans.dto.MentorRatingRequestDTO;
import com.ft.trans.dto.MentorRatingSummaryDTO;
import com.ft.trans.entity.MentorRating;
import com.ft.trans.entity.MentorshipConnection.ConnectionStatus;
import com.ft.trans.entity.Profile;
import com.ft.trans.entity.Profile.ProfileType;
import com.ft.trans.repository.MentorRatingRepository;
import com.ft.trans.repository.MentorshipConnectionRepository;
import com.ft.trans.repository.ProfileRepository;
import com.ft.trans.validation.Result;
import com.ft.trans.validation.ValidationResult;

@Service
public class MentorRatingService
{
	private static final int DEFAULT_RATING = 5;

	private final MentorRatingRepository mentorRatingRepository;
	private final ProfileRepository profileRepository;
	private final MentorshipConnectionRepository mentorshipConnectionRepository;
	private final GamificationService gamificationService;

	public MentorRatingService(
		MentorRatingRepository mentorRatingRepository,
		ProfileRepository profileRepository,
		MentorshipConnectionRepository mentorshipConnectionRepository,
		GamificationService gamificationService
	)
	{
		this.mentorRatingRepository = mentorRatingRepository;
		this.profileRepository = profileRepository;
		this.mentorshipConnectionRepository = mentorshipConnectionRepository;
		this.gamificationService = gamificationService;
	}

	@Transactional
	public Result submitRating(Long mentorProfileId, MentorRatingRequestDTO request, Long actorUserId)
	{
		ValidationResult validation = new ValidationResult();

		if (mentorProfileId == null)
			validation.addError("mentorProfileId", "Id do perfil mentor deve ser informado.");

		if (request == null)
		{
			validation.addError("request", "Payload de avaliacao deve ser informado.");
			return new Result(null, validation);
		}

		if (actorUserId == null)
			validation.addError("actorUserId", "Usuario autenticado nao identificado para enviar avaliacao.");

		if (request.menteeProfileId == null)
			validation.addError("menteeProfileId", "Id do perfil mentorado deve ser informado.");

		if (request.rating == null)
			validation.addError("rating", "A nota deve ser informada.");
		else if (request.rating < 1 || request.rating > 5)
			validation.addError("rating", "A nota deve estar entre 1 e 5 estrelas.");

		if (validation.hasErrors())
			return new Result(null, validation);

		Profile mentor = profileRepository.findByIdWithUser(mentorProfileId).orElse(null);
		Profile mentee = profileRepository.findByIdWithUser(request.menteeProfileId).orElse(null);

		if (mentor == null)
			validation.addError("mentorProfileId", "Perfil mentor nao encontrado.");
		else if (mentor.role != ProfileType.MENTOR)
			validation.addError("mentorProfileId", "Perfil informado nao e do tipo MENTOR.");

		if (mentee == null)
			validation.addError("menteeProfileId", "Perfil mentorado nao encontrado.");
		else if (mentee.role != ProfileType.MENTORADO)
			validation.addError("menteeProfileId", "Perfil informado nao e do tipo MENTORADO.");
		else if (mentee.user == null || mentee.user.id == null)
			validation.addError("menteeProfileId", "Perfil mentorado sem usuario associado.");
		else if (!mentee.user.id.equals(actorUserId))
			validation.addError("actorUserId", "A avaliacao deve ser enviada pelo proprio mentorado autenticado.");

		if (mentor != null && mentee != null && mentor.id.equals(mentee.id))
			validation.addError("profiles", "Nao e permitido avaliar o proprio perfil.");

		if (mentor != null && mentee != null)
		{
			boolean hasApprovedConnection = mentorshipConnectionRepository.existsByMentorProfileIdAndMenteeProfileIdAndStatusIn(
				mentor.id,
				mentee.id,
				List.of(ConnectionStatus.APPROVED)
			);

			if (!hasApprovedConnection)
				validation.addError("connection", "Somente mentorados com conexao aprovada podem avaliar este mentor.");
		}

		if (validation.hasErrors())
			return new Result(null, validation);

		MentorRating existingRating = mentorRatingRepository
			.findByMentor_IdAndMentee_Id(mentor.id, mentee.id)
			.orElse(null);

		boolean isFirstRatingByMenteeForMentor = existingRating == null;
		MentorRating rating = existingRating != null ? existingRating : new MentorRating();

		rating.mentor = mentor;
		rating.mentee = mentee;
		rating.ratingValue = request.rating;
		rating.lastUpdateBy = actorUserId;

		ValidationResult entityValidation = rating.validate();
		if (entityValidation.hasErrors())
			return new Result(null, entityValidation);

		MentorRating saved = mentorRatingRepository.save(rating);
		triggerGamification(saved, isFirstRatingByMenteeForMentor);
		return new Result(saved, validation);
	}

	public MentorRatingSummaryDTO getRatingSummary(Long mentorProfileId)
	{
		if (mentorProfileId == null)
			return null;

		Profile mentor = profileRepository.findById(mentorProfileId).orElse(null);
		if (mentor == null || mentor.role != ProfileType.MENTOR)
			return null;

		long totalRatings = mentorRatingRepository.countByMentor_Id(mentorProfileId);
		if (totalRatings == 0)
			return MentorRatingSummaryDTO.create(mentorProfileId, DEFAULT_RATING, 0L);

		Double average = mentorRatingRepository.findAverageByMentorId(mentorProfileId);
		int roundedAverage = normalizeRating((int) Math.ceil(average != null ? average : DEFAULT_RATING));

		return MentorRatingSummaryDTO.create(mentorProfileId, roundedAverage, totalRatings);
	}

	private int normalizeRating(int value)
	{
		if (value < 1)
			return 1;
		if (value > 5)
			return 5;
		return value;
	}

	private void triggerGamification(MentorRating saved, boolean isFirstRatingByMenteeForMentor)
	{
		try
		{
			if (!isFirstRatingByMenteeForMentor)
				return;

			if (saved.mentee != null && saved.mentee.user != null && saved.mentee.user.id != null)
				gamificationService.processEvent(new GamificationEventRequest(saved.mentee.user.id, "REVIEW_SENT"));

			if (saved.mentor != null && saved.mentor.user != null && saved.mentor.user.id != null)
			{
				if (saved.ratingValue != null && saved.ratingValue >= 5)
					gamificationService.processEvent(new GamificationEventRequest(saved.mentor.user.id, "REVIEW_RECEIVED_5"));
				else if (saved.ratingValue != null && saved.ratingValue >= 4)
					gamificationService.processEvent(new GamificationEventRequest(saved.mentor.user.id, "REVIEW_RECEIVED_4"));
			}
		}
		catch (Exception ignored)
		{
		}
	}
}
