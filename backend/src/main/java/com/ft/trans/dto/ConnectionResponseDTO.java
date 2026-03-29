package com.ft.trans.dto;

import java.time.LocalDateTime;

import com.ft.trans.entity.MentorshipConnection;

public class ConnectionResponseDTO
{
	public Long			id;
	public Long			mentorId;
	public String		mentorName;
	public Long			menteeId;
	public String		menteeName;
	public String		status;
	public LocalDateTime	acceptedAt;
	public LocalDateTime	createdAt;

	public static ConnectionResponseDTO fromEntity(MentorshipConnection conn)
	{
		ConnectionResponseDTO dto = new ConnectionResponseDTO();
		dto.id         = conn.id;
		dto.mentorId   = conn.mentor != null ? conn.mentor.id : null;
		dto.mentorName = conn.mentor != null ? conn.mentor.name : null;
		dto.menteeId   = conn.mentee != null ? conn.mentee.id : null;
		dto.menteeName = conn.mentee != null ? conn.mentee.name : null;
		dto.status     = conn.status != null ? conn.status.name() : null;
		dto.acceptedAt = conn.acceptedAt;
		dto.createdAt  = conn.createdAt;
		return dto;
	}
}
