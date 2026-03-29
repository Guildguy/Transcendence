package com.ft.trans.service;

import com.ft.trans.dto.MentorAvailabilityResponseDTO;
import com.ft.trans.validation.ValidationResult;

public record MentorAvailabilityServiceResult(
    MentorAvailabilityResponseDTO payload,
    ValidationResult validationResult
) {
}
