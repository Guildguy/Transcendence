package com.ft.trans.dto;

import java.time.LocalDateTime;

import com.ft.trans.entity.MentorshipSession;

public class CreateSessionDTO
{
	public Long			connectionId;
	public LocalDateTime scheduledDate;
	public Integer		durationMinutes;
	public Boolean		isRecurrent = false;
	public Long			createdBy;

	public MentorshipSession toSession()
	{
		MentorshipSession session = new MentorshipSession();
		session.connectionId    = this.connectionId;
		session.scheduledDate   = this.scheduledDate;
		session.durationMinutes = this.durationMinutes;
		session.isRecurrent     = this.isRecurrent != null && this.isRecurrent;
		session.status          = MentorshipSession.SessionStatus.SCHEDULED;
		session.menteeMissed    = false;
		session.createdBy       = this.createdBy;
		session.createdAt       = LocalDateTime.now();
		return session;
	}
}
