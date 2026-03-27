package com.ft.trans.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ft.trans.dto.SaveMentorAvailabilityDTO;
import com.ft.trans.service.MentorAvailabilityService;
import com.ft.trans.service.MentorAvailabilityServiceResult;

@RestController
@RequestMapping("/mentor-availability")
public class MentorAvailabilityController
{
    private final MentorAvailabilityService mentorAvailabilityService;

    public MentorAvailabilityController(MentorAvailabilityService mentorAvailabilityService)
    {
        this.mentorAvailabilityService = mentorAvailabilityService;
    }

    @PostMapping
    public ResponseEntity<?> save(@RequestBody SaveMentorAvailabilityDTO request)
    {
        MentorAvailabilityServiceResult result = mentorAvailabilityService.saveMentorAvailability(request);

        if (result.validationResult().hasErrors())
        {
            return ResponseEntity
                .status(HttpStatus.UNPROCESSABLE_CONTENT)
                .body(result.validationResult().getErrors());
        }

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(result.payload());
    }

    @GetMapping("/{mentorId}")
    public ResponseEntity<?> getByMentor(@PathVariable Long mentorId)
    {
        MentorAvailabilityServiceResult result = mentorAvailabilityService.getMentorAvailability(mentorId);

        if (result.validationResult().hasErrors())
        {
            return ResponseEntity
                .status(HttpStatus.UNPROCESSABLE_CONTENT)
                .body(result.validationResult().getErrors());
        }

        return ResponseEntity
            .status(HttpStatus.OK)
            .body(result.payload());
    }
}
