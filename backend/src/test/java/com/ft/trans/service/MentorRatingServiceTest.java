package com.ft.trans.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ft.trans.dto.MentorRatingRequestDTO;
import com.ft.trans.dto.MentorRatingSummaryDTO;
import com.ft.trans.controller.dto.GamificationEventRequest;
import com.ft.trans.entity.MentorRating;
import com.ft.trans.entity.Profile;
import com.ft.trans.entity.Profile.ProfileType;
import com.ft.trans.entity.User;
import com.ft.trans.repository.MentorRatingRepository;
import com.ft.trans.repository.MentorshipConnectionRepository;
import com.ft.trans.repository.ProfileRepository;
import com.ft.trans.validation.Result;

@ExtendWith(MockitoExtension.class)
public class MentorRatingServiceTest
{
	@Mock
	private MentorRatingRepository mentorRatingRepository;

	@Mock
	private ProfileRepository profileRepository;

	@Mock
	private MentorshipConnectionRepository mentorshipConnectionRepository;

	@Mock
	private GamificationService gamificationService;

	@InjectMocks
	private MentorRatingService mentorRatingService;

	@Test
	void shouldReturnDefaultFiveWhenMentorHasNoRatings()
	{
		Profile mentor = buildProfile(1L, ProfileType.MENTOR);

		when(profileRepository.findById(1L)).thenReturn(Optional.of(mentor));
		when(mentorRatingRepository.countByMentor_Id(1L)).thenReturn(0L);

		MentorRatingSummaryDTO summary = mentorRatingService.getRatingSummary(1L);

		assertEquals(5, summary.averageRating);
		assertEquals(0L, summary.totalRatings);
	}

	@Test
	void shouldRoundAverageUpToCeilInteger()
	{
		Profile mentor = buildProfile(1L, ProfileType.MENTOR);

		when(profileRepository.findById(1L)).thenReturn(Optional.of(mentor));
		when(mentorRatingRepository.countByMentor_Id(1L)).thenReturn(3L);
		when(mentorRatingRepository.findAverageByMentorId(1L)).thenReturn(3.67);

		MentorRatingSummaryDTO summary = mentorRatingService.getRatingSummary(1L);

		assertEquals(4, summary.averageRating);
		assertEquals(3L, summary.totalRatings);
	}

	@Test
	void shouldRoundUpWhenAverageHasFractionalPart()
	{
		Profile mentor = buildProfile(1L, ProfileType.MENTOR);

		when(profileRepository.findById(1L)).thenReturn(Optional.of(mentor));
		when(mentorRatingRepository.countByMentor_Id(1L)).thenReturn(5L);
		when(mentorRatingRepository.findAverageByMentorId(1L)).thenReturn(3.01);

		MentorRatingSummaryDTO summary = mentorRatingService.getRatingSummary(1L);

		assertEquals(4, summary.averageRating);
		assertEquals(5L, summary.totalRatings);
	}

	@Test
	void shouldRejectRatingOutsideAllowedRange()
	{
		MentorRatingRequestDTO request = new MentorRatingRequestDTO();
		request.menteeProfileId = 5L;
		request.rating = 6;

		Result result = mentorRatingService.submitRating(1L, request, 5L);

		assertTrue(result.validationResult().hasErrors());
		verify(mentorRatingRepository, never()).save(any(MentorRating.class));
	}

	@Test
	void shouldPersistRatingWhenConnectionIsApproved()
	{
		Profile mentor = buildProfile(1L, ProfileType.MENTOR);
		Profile mentee = buildProfile(5L, ProfileType.MENTORADO);

		MentorRatingRequestDTO request = new MentorRatingRequestDTO();
		request.menteeProfileId = 5L;
		request.rating = 3;

		when(profileRepository.findByIdWithUser(1L)).thenReturn(Optional.of(mentor));
		when(profileRepository.findByIdWithUser(5L)).thenReturn(Optional.of(mentee));
		when(mentorshipConnectionRepository.existsByMentorProfileIdAndMenteeProfileIdAndStatusIn(any(), any(), any()))
			.thenReturn(true);
		when(mentorRatingRepository.findByMentor_IdAndMentee_Id(1L, 5L)).thenReturn(Optional.empty());
		when(mentorRatingRepository.save(any(MentorRating.class))).thenAnswer(invocation -> invocation.getArgument(0));

		Result result = mentorRatingService.submitRating(1L, request, 5L);

		assertFalse(result.validationResult().hasErrors());
		verify(mentorRatingRepository).save(any(MentorRating.class));
		verify(gamificationService, times(1)).processEvent(eq(new GamificationEventRequest(5L, "REVIEW_SENT")));
		verify(gamificationService, times(0)).processEvent(eq(new GamificationEventRequest(1L, "REVIEW_RECEIVED_5")));
		verify(gamificationService, times(0)).processEvent(eq(new GamificationEventRequest(1L, "REVIEW_RECEIVED_4")));
	}

	@Test
	void shouldRejectWhenActorUserDiffersFromMenteeOwner()
	{
		Profile mentor = buildProfile(1L, ProfileType.MENTOR);
		Profile mentee = buildProfile(5L, ProfileType.MENTORADO);

		MentorRatingRequestDTO request = new MentorRatingRequestDTO();
		request.menteeProfileId = 5L;
		request.rating = 4;

		when(profileRepository.findByIdWithUser(1L)).thenReturn(Optional.of(mentor));
		when(profileRepository.findByIdWithUser(5L)).thenReturn(Optional.of(mentee));

		Result result = mentorRatingService.submitRating(1L, request, 999L);

		assertTrue(result.validationResult().hasErrors());
		verify(mentorRatingRepository, never()).save(any(MentorRating.class));
	}

	@Test
	void shouldNotTriggerGamificationAgainWhenUpdatingExistingRating()
	{
		Profile mentor = buildProfile(1L, ProfileType.MENTOR);
		Profile mentee = buildProfile(5L, ProfileType.MENTORADO);

		MentorRating existingRating = new MentorRating();
		existingRating.id = 99L;
		existingRating.mentor = mentor;
		existingRating.mentee = mentee;
		existingRating.ratingValue = 4;

		MentorRatingRequestDTO request = new MentorRatingRequestDTO();
		request.menteeProfileId = 5L;
		request.rating = 5;

		when(profileRepository.findByIdWithUser(1L)).thenReturn(Optional.of(mentor));
		when(profileRepository.findByIdWithUser(5L)).thenReturn(Optional.of(mentee));
		when(mentorshipConnectionRepository.existsByMentorProfileIdAndMenteeProfileIdAndStatusIn(any(), any(), any()))
			.thenReturn(true);
		when(mentorRatingRepository.findByMentor_IdAndMentee_Id(1L, 5L)).thenReturn(Optional.of(existingRating));
		when(mentorRatingRepository.save(any(MentorRating.class))).thenAnswer(invocation -> invocation.getArgument(0));

		Result result = mentorRatingService.submitRating(1L, request, 5L);

		assertFalse(result.validationResult().hasErrors());
		verify(gamificationService, never()).processEvent(any(GamificationEventRequest.class));
	}

	private Profile buildProfile(Long id, ProfileType profileType)
	{
		Profile profile = new Profile();
		profile.id = id;
		profile.role = profileType;
		User user = new User();
		user.id = id;
		profile.user = user;
		return profile;
	}
}
