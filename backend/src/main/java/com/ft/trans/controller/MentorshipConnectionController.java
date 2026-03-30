package com.ft.trans.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ft.trans.dto.ConnectionResponseDTO;
import com.ft.trans.dto.LimitMenteeDTO;
import com.ft.trans.dto.MentorCapacityDTO;
import com.ft.trans.dto.RequestConnectionDTO;
import com.ft.trans.service.MentorshipConnectionService;
import com.ft.trans.validation.Result;

@RestController
@RequestMapping("/mentorship-connections")
public class MentorshipConnectionController
{
	private final MentorshipConnectionService connectionService;

	public MentorshipConnectionController(MentorshipConnectionService connectionService)
	{
		this.connectionService = connectionService;
	}

	@PostMapping
	public ResponseEntity<?> requestConnection(@RequestBody RequestConnectionDTO dto)
	{
		Result result = connectionService.requestConnection(dto);

		if (result.validationResult().hasErrors())
		{
			return ResponseEntity
				.status(HttpStatus.UNPROCESSABLE_CONTENT)
				.body(result.validationResult().getErrors());
		}
		return ResponseEntity.status(HttpStatus.CREATED).body(result.entity());
	}

	@PatchMapping("/{id}/accept")
	public ResponseEntity<?> acceptConnection(
		@PathVariable Long id,
		@RequestParam Long mentorUserId
	)
	{
		Result result = connectionService.acceptConnection(id, mentorUserId);

		if (result.validationResult().hasErrors())
		{
			return ResponseEntity
				.status(HttpStatus.UNPROCESSABLE_CONTENT)
				.body(result.validationResult().getErrors());
		}
		return ResponseEntity.status(HttpStatus.OK).body(result.entity());
	}

	@PatchMapping("/{id}/reject")
	public ResponseEntity<?> rejectConnection(
		@PathVariable Long id,
		@RequestParam Long mentorUserId
	)
	{
		Result result = connectionService.rejectConnection(id, mentorUserId);

		if (result.validationResult().hasErrors())
		{
			return ResponseEntity
				.status(HttpStatus.UNPROCESSABLE_CONTENT)
				.body(result.validationResult().getErrors());
		}
		return ResponseEntity.status(HttpStatus.OK).body(result.entity());
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<?> endConnection(
		@PathVariable Long id,
		@RequestParam Long userId
	)
	{
		Result result = connectionService.endConnection(id, userId);

		if (result.validationResult().hasErrors())
		{
			return ResponseEntity
				.status(HttpStatus.UNPROCESSABLE_CONTENT)
				.body(result.validationResult().getErrors());
		}
		return ResponseEntity.status(HttpStatus.OK).body(result.entity());
	}

	@GetMapping("/mentee/{menteeId}")
	public ResponseEntity<?> listMentorsByMentee(@PathVariable Long menteeId)
	{
		List<ConnectionResponseDTO> connections = connectionService.listMentorsByMentee(menteeId);
		return ResponseEntity.status(HttpStatus.OK).body(connections);
	}

	@GetMapping("/mentor/{mentorId}")
	public ResponseEntity<?> listMenteesByMentor(@PathVariable Long mentorId)
	{
		List<ConnectionResponseDTO> connections = connectionService.listMenteesByMentor(mentorId);
		return ResponseEntity.status(HttpStatus.OK).body(connections);
	}

	@GetMapping("/mentor/{mentorId}/pending")
	public ResponseEntity<?> listPendingByMentor(@PathVariable Long mentorId)
	{
		List<ConnectionResponseDTO> connections = connectionService.listPendingByMentor(mentorId);
		return ResponseEntity.status(HttpStatus.OK).body(connections);
	}

	@GetMapping("/mentor/{mentorId}/capacity")
	public ResponseEntity<?> getMentorCapacity(@PathVariable Long mentorId)
	{
		MentorCapacityDTO capacity = connectionService.getMentorCapacity(mentorId);
		return ResponseEntity.status(HttpStatus.OK).body(capacity);
	}

	@PostMapping("/limit")
	public ResponseEntity<?> saveLimitMentee(@RequestBody LimitMenteeDTO dto)
	{
		Result result = connectionService.saveLimitMentee(dto);

		if (result.validationResult().hasErrors())
		{
			return ResponseEntity
				.status(HttpStatus.UNPROCESSABLE_CONTENT)
				.body(result.validationResult().getErrors());
		}
		return ResponseEntity.status(HttpStatus.CREATED).body(result.entity());
	}
}
