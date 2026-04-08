package com.ft.trans.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ft.trans.dto.CreateSessionDTO;
import com.ft.trans.dto.MentorNotesDTO;
import com.ft.trans.dto.UpdateSessionDTO;
import com.ft.trans.entity.MentorshipSession;
import com.ft.trans.service.MentorshipSessionService;
import com.ft.trans.service.MentorshipSessionService.RecurrenceResult;
import com.ft.trans.validation.Result;

@RestController
@RequestMapping("/mentorship-sessions")
public class MentorshipSessionController
{
	private final MentorshipSessionService sessionService;

	MentorshipSessionController(MentorshipSessionService sessionService)
	{
		this.sessionService = sessionService;
	}

	@PostMapping
	public ResponseEntity<?> createSession(@RequestBody CreateSessionDTO dto)
	{
		if (Boolean.TRUE.equals(dto.isRecurrent))
		{
			RecurrenceResult rr = this.sessionService.createRecurring(dto);
			if (rr.validationResult().hasErrors())
			{
				return ResponseEntity
					.status(HttpStatus.UNPROCESSABLE_CONTENT)
					.body(rr.validationResult().getErrors());
			}
			return ResponseEntity.status(HttpStatus.CREATED).body(rr.sessions());
		}

		Result result = this.sessionService.createSession(dto);
		if (result.validationResult().hasErrors())
		{
			return ResponseEntity
				.status(HttpStatus.UNPROCESSABLE_CONTENT)
				.body(result.validationResult().getErrors());
		}
		return ResponseEntity.status(HttpStatus.CREATED).body(result.entity());
	}

	@GetMapping("/connection/{connectionId}")
	public ResponseEntity<?> listByConnection(@PathVariable Long connectionId)
	{
		List<MentorshipSession> sessions = this.sessionService.listByConnection(connectionId);
		return ResponseEntity.status(HttpStatus.OK).body(sessions);
	}

	@GetMapping("/connection/{connectionId}/upcoming")
	public ResponseEntity<?> listUpcomingByConnection(@PathVariable Long connectionId)
	{
		List<MentorshipSession> sessions = this.sessionService.listUpcomingByConnection(connectionId);
		return ResponseEntity.status(HttpStatus.OK).body(sessions);
	}

	@GetMapping("/mentor/{mentorId}")
	public ResponseEntity<?> listByMentor(@PathVariable Long mentorId)
	{
		List<MentorshipSession> sessions = this.sessionService.listByMentorProfile(mentorId);
		return ResponseEntity.status(HttpStatus.OK).body(sessions);
	}

	@GetMapping("/mentee/{menteeId}")
	public ResponseEntity<?> listByMentee(@PathVariable Long menteeId)
	{
		List<MentorshipSession> sessions = this.sessionService.listByMenteeProfile(menteeId);
		return ResponseEntity.status(HttpStatus.OK).body(sessions);
	}

	@PutMapping
	public ResponseEntity<?> updateSession(@RequestBody UpdateSessionDTO dto)
	{
		Result result = this.sessionService.update(dto);

		if (result.validationResult().hasErrors())
		{
			return ResponseEntity
				.status(HttpStatus.UNPROCESSABLE_CONTENT)
				.body(result.validationResult().getErrors());
		}
		return ResponseEntity
			.status(HttpStatus.OK)
			.body(result.entity());
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<?> cancelSession(@PathVariable Long id)
	{
		Result result = this.sessionService.cancel(id);

		if (result.validationResult().hasErrors())
		{
			return ResponseEntity
				.status(HttpStatus.UNPROCESSABLE_CONTENT)
				.body(result.validationResult().getErrors());
		}
		return ResponseEntity
			.status(HttpStatus.OK)
			.body(result.entity());
	}

	@GetMapping("/{id}/notes")
	public ResponseEntity<?> getNotes(@PathVariable Long id)
	{
		Optional<String> notes = this.sessionService.getNotes(id);

		if (notes.isEmpty())
		{
			return ResponseEntity
				.status(HttpStatus.NOT_FOUND)
				.body("Sessão não encontrada.");
		}
		return ResponseEntity
			.status(HttpStatus.OK)
			.body(notes.get());
	}

	@PatchMapping("/{id}/notes")
	public ResponseEntity<?> saveNotes(@PathVariable Long id, @RequestBody MentorNotesDTO dto)
	{
		Result result = this.sessionService.saveNotes(id, dto);

		if (result.validationResult().hasErrors())
		{
			return ResponseEntity
				.status(HttpStatus.UNPROCESSABLE_CONTENT)
				.body(result.validationResult().getErrors());
		}
		return ResponseEntity
			.status(HttpStatus.OK)
			.body(result.entity());
	}
}
