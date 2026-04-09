package com.ft.trans.controller;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ft.trans.dto.MentorRatingRequestDTO;
import com.ft.trans.dto.MentorRatingSummaryDTO;
import com.ft.trans.entity.User;
import com.ft.trans.repository.UserRepository;
import com.ft.trans.service.JWTService;
import com.ft.trans.service.MentorRatingService;
import com.ft.trans.validation.Result;

@RestController
@RequestMapping("/mentors")
public class MentorRatingController
{
	private final MentorRatingService mentorRatingService;
	private final JWTService jwtService;
	private final UserRepository userRepository;

	public MentorRatingController(MentorRatingService mentorRatingService, JWTService jwtService, UserRepository userRepository)
	{
		this.mentorRatingService = mentorRatingService;
		this.jwtService = jwtService;
		this.userRepository = userRepository;
	}

	@PostMapping("/{mentorProfileId}/rating")
	public ResponseEntity<?> submitRating(
		@PathVariable Long mentorProfileId,
		@RequestBody MentorRatingRequestDTO request,
		HttpServletRequest httpRequest
	)
	{
		Long actorUserId = resolveAuthenticatedUserId(httpRequest);
		if (actorUserId == null)
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

		Result result = mentorRatingService.submitRating(mentorProfileId, request, actorUserId);
		if (result.validationResult().hasErrors())
			return ResponseEntity
				.status(HttpStatus.UNPROCESSABLE_CONTENT)
				.body(result.validationResult().getErrors());

		MentorRatingSummaryDTO summary = mentorRatingService.getRatingSummary(mentorProfileId);
		return ResponseEntity.status(HttpStatus.CREATED).body(summary);
	}

	@GetMapping("/{mentorProfileId}/rating")
	public ResponseEntity<?> getRatingSummary(@PathVariable Long mentorProfileId)
	{
		MentorRatingSummaryDTO summary = mentorRatingService.getRatingSummary(mentorProfileId);
		if (summary == null)
			return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

		return ResponseEntity.ok(summary);
	}

	private Long resolveAuthenticatedUserId(HttpServletRequest request)
	{
		String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
		if (authHeader == null || !authHeader.startsWith("Bearer "))
			return null;

		String token = authHeader.substring(7);
		String email = jwtService.extractEmail(token);
		if (email == null || email.isBlank())
			return null;

		User user = userRepository.findByEmail(email).orElse(null);
		if (user == null)
			return null;

		return user.id;
	}
}
