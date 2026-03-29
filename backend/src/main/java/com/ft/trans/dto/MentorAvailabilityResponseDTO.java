package com.ft.trans.dto;

import java.util.ArrayList;
import java.util.List;

public class MentorAvailabilityResponseDTO
{
    public Long mentorId;
    public Integer slotDuration;
    public List<MentorAvailabilitySlotDTO> availability = new ArrayList<>();
}
