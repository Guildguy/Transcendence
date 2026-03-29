package com.ft.trans.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ft.trans.entity.MentorshipConnection;
import com.ft.trans.entity.MentorshipConnection.ConnectionStatus;

public interface MentorshipConnectionRepository extends JpaRepository<MentorshipConnection, Long>
{
	List<MentorshipConnection> findByMentor_IdAndStatus(Long mentorId, ConnectionStatus status);

	List<MentorshipConnection> findByMentee_IdAndStatus(Long menteeId, ConnectionStatus status);

	List<MentorshipConnection> findByMentor_Id(Long mentorId);

	List<MentorshipConnection> findByMentee_Id(Long menteeId);

	Optional<MentorshipConnection> findByMentor_IdAndMentee_IdAndStatusIn(
		Long mentorId, Long menteeId, List<ConnectionStatus> statuses
	);

	boolean existsByMentor_IdAndMentee_IdAndStatusIn(
		Long mentorId, Long menteeId, List<ConnectionStatus> statuses
	);

	long countByMentor_IdAndStatus(Long mentorId, ConnectionStatus status);
}
