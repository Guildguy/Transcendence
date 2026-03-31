package com.ft.trans.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ft.trans.dto.MentorshipActionDTO;
import com.ft.trans.dto.MentorshipCreateDTO;
import com.ft.trans.dto.MentorshipSummaryDTO;
import com.ft.trans.entity.Mentorship;
import com.ft.trans.service.MentorshipService;
import com.ft.trans.validation.Result;

@RestController
@RequestMapping("/mentorships")
public class MentorshipController
{
    private final MentorshipService mentorshipService;

    public MentorshipController(MentorshipService mentorshipService)
    {
        this.mentorshipService = mentorshipService;
    }

    @PostMapping("/requests")
    public ResponseEntity<?> createRequest(@RequestBody MentorshipCreateDTO dto)
    {
        Result result = mentorshipService.createRequest(dto);

        if (result.validationResult().hasErrors())
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_CONTENT).body(result.validationResult().getErrors());

        return ResponseEntity.status(HttpStatus.CREATED).body(MentorshipSummaryDTO.fromEntity((Mentorship) result.entity()));
    }

    @GetMapping("/incoming/{mentorProfileId}")
    public ResponseEntity<List<MentorshipSummaryDTO>> listIncoming(@PathVariable Long mentorProfileId)
    {
        List<MentorshipSummaryDTO> response = mentorshipService.listIncoming(mentorProfileId)
            .stream()
            .map(MentorshipSummaryDTO::fromEntity)
            .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/my/{profileId}")
    public ResponseEntity<List<MentorshipSummaryDTO>> listMyMentorships(@PathVariable Long profileId)
    {
        List<MentorshipSummaryDTO> response = mentorshipService.listByProfile(profileId)
            .stream()
            .map(MentorshipSummaryDTO::fromEntity)
            .toList();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<?> accept(@PathVariable Long id, @RequestBody MentorshipActionDTO dto)
    {
        return transition(mentorshipService.accept(id, dto.actorProfileId));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable Long id, @RequestBody MentorshipActionDTO dto)
    {
        return transition(mentorshipService.reject(id, dto.actorProfileId));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancel(@PathVariable Long id, @RequestBody MentorshipActionDTO dto)
    {
        return transition(mentorshipService.cancel(id, dto.actorProfileId));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<?> complete(@PathVariable Long id, @RequestBody MentorshipActionDTO dto)
    {
        return transition(mentorshipService.complete(id, dto.actorProfileId));
    }

    private ResponseEntity<?> transition(Result result)
    {
        if (result.validationResult().hasErrors())
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_CONTENT).body(result.validationResult().getErrors());

        return ResponseEntity.ok(MentorshipSummaryDTO.fromEntity((Mentorship) result.entity()));
    }
}
