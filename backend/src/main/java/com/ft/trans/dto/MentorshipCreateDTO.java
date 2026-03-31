package com.ft.trans.dto;

import java.sql.Timestamp;

public class MentorshipCreateDTO
{
    public Long mentorProfileId;
    public Long menteeProfileId;
    public Long requesterProfileId;
    public Timestamp startAt;
    public Timestamp endAt;
    public String topic;
    public String notes;
}
