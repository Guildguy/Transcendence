package com.ft.trans.dto;

public class MentorRatingSummaryDTO
{
	public Long		mentorProfileId;
	public Integer	averageRating;
	public Long		totalRatings;

	public static MentorRatingSummaryDTO create(Long mentorProfileId, Integer averageRating, Long totalRatings)
	{
		MentorRatingSummaryDTO dto = new MentorRatingSummaryDTO();
		dto.mentorProfileId = mentorProfileId;
		dto.averageRating = averageRating;
		dto.totalRatings = totalRatings;
		return dto;
	}
}
