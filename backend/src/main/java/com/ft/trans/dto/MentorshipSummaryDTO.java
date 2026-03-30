package com.ft.trans.dto;

import java.sql.Timestamp;

import com.ft.trans.entity.Mentorship;

public class MentorshipSummaryDTO
{
    public Long id;
    public Long mentorProfileId;
    public Long menteeProfileId;
    public Timestamp startAt;
    public Timestamp endAt;
    public String topic;
    public String notes;
    public Mentorship.MentorshipStatus status;

    public static MentorshipSummaryDTO fromEntity(Mentorship mentorship)
    {
        MentorshipSummaryDTO dto = new MentorshipSummaryDTO();

        dto.id = mentorship.id;
        dto.mentorProfileId = mentorship.mentorProfile.id;
        dto.menteeProfileId = mentorship.menteeProfile.id;
        dto.startAt = mentorship.startAt;
        dto.endAt = mentorship.endAt;
        dto.topic = mentorship.topic;
        dto.notes = mentorship.notes;
        dto.status = mentorship.status;

        return dto;
    }
}
