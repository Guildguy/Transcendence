package com.ft.trans.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ft.trans.entity.MentorshipConnection;
import com.ft.trans.entity.MentorshipConnection.ConnectionStatus;

public interface MentorshipConnectionRepository extends JpaRepository<MentorshipConnection, Long>
{
	@Query("SELECT c FROM MentorshipConnection c JOIN FETCH c.mentor m JOIN FETCH m.user JOIN FETCH c.mentee WHERE c.id = :id")
	Optional<MentorshipConnection> findByIdFull(@Param("id") Long id);

	@Query("SELECT c FROM MentorshipConnection c JOIN FETCH c.mentor JOIN FETCH c.mentee WHERE c.mentee.id = :menteeId")
	List<MentorshipConnection> findByMenteeId(@Param("menteeId") Long menteeId);

	@Query("SELECT c FROM MentorshipConnection c JOIN FETCH c.mentor JOIN FETCH c.mentee WHERE c.mentor.id = :mentorId")
	List<MentorshipConnection> findByMentorId(@Param("mentorId") Long mentorId);

	@Query("SELECT c FROM MentorshipConnection c JOIN FETCH c.mentor JOIN FETCH c.mentee WHERE c.mentor.id = :mentorId AND c.status = :status")
	List<MentorshipConnection> findByMentorIdAndStatus(@Param("mentorId") Long mentorId, @Param("status") ConnectionStatus status);

	@Query("SELECT c FROM MentorshipConnection c JOIN FETCH c.mentor JOIN FETCH c.mentee WHERE c.mentor.id = :mentorId AND c.mentee.id = :menteeId AND c.status IN :statuses")
	List<MentorshipConnection> findByMentorIdAndMenteeIdAndStatusIn(
		@Param("mentorId") Long mentorId,
		@Param("menteeId") Long menteeId,
		@Param("statuses") List<ConnectionStatus> statuses
	);

	@Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM MentorshipConnection c WHERE c.mentor.id = :mentorId AND c.mentee.id = :menteeId AND c.status IN :statuses")
	boolean existsByMentorProfileIdAndMenteeProfileIdAndStatusIn(
		@Param("mentorId") Long mentorId,
		@Param("menteeId") Long menteeId,
		@Param("statuses") List<ConnectionStatus> statuses
	);

	List<MentorshipConnection> findByMentee_IdAndStatus(Long menteeId, ConnectionStatus status);

	List<MentorshipConnection> findByMentor_Id(Long mentorId);

	List<MentorshipConnection> findByMentee_Id(Long menteeId);

	long countByMentor_IdAndStatus(Long mentorId, ConnectionStatus status);
}
