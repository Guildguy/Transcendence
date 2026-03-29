package com.ft.trans.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ft.trans.entity.MentorshipCount;

public interface MentorshipCountRepository extends JpaRepository<MentorshipCount, Long>
{
	long countByMentorProfileIdAndStatus(Long mentorProfileId, String status);

	Optional<MentorshipCount> findByConnection_Id(Long connectionId);
}
