package com.ft.trans.dto;

public class MentorCapacityDTO
{
	public Long		mentorUserId;
	public Long		mentorProfileId;
	public long		currentMentees;
	public int		maxMentees;
	public boolean	isAvailable;

	public MentorCapacityDTO(Long mentorUserId, Long mentorProfileId, long currentMentees, int maxMentees)
	{
		this.mentorUserId    = mentorUserId;
		this.mentorProfileId = mentorProfileId;
		this.currentMentees  = currentMentees;
		this.maxMentees      = maxMentees;
		this.isAvailable     = currentMentees < maxMentees;
	}
}
