package com.ft.trans.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ft.trans.entity.MentorRating;

public interface MentorRatingRepository extends JpaRepository<MentorRating, Long>
{
	Optional<MentorRating> findByMentor_IdAndMentee_Id(Long mentorId, Long menteeId);

	long countByMentor_Id(Long mentorId);

	@Query("SELECT AVG(r.ratingValue) FROM MentorRating r WHERE r.mentor.id = :mentorId")
	Double findAverageByMentorId(@Param("mentorId") Long mentorId);
}
