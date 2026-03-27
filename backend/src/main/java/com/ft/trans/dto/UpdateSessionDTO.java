package com.ft.trans.dto;

import java.time.LocalDateTime;

public class UpdateSessionDTO
{
	public Long			sessionId;
	public LocalDateTime scheduledDate;
	public Integer		durationMinutes;
	public String		status;
	public Boolean		menteeMissed;
	public String		mentorNotes;
	public Long			lastUpdateBy;
}
