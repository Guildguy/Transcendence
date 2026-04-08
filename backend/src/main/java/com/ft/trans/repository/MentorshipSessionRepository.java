package com.ft.trans.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ft.trans.entity.MentorshipSession;
import com.ft.trans.entity.MentorshipSession.SessionStatus;

public interface MentorshipSessionRepository extends JpaRepository<MentorshipSession, Long>
{
	List<MentorshipSession> findByConnectionId(Long connectionId);

	List<MentorshipSession> findByRecurrenceGroupId(UUID recurrenceGroupId);

	long countByRecurrenceGroupIdAndStatusNot(UUID recurrenceGroupId, SessionStatus status);

	boolean existsByConnectionIdAndScheduledDate(Long connectionId, LocalDateTime scheduledDate);

	List<MentorshipSession> findByConnectionIdAndScheduledDateAfter(Long connectionId, LocalDateTime after);

	@Query("SELECT s FROM MentorshipSession s JOIN MentorshipConnection c ON s.connectionId = c.id WHERE c.mentor.id = :mentorId")
	List<MentorshipSession> findByMentorProfileId(@Param("mentorId") Long mentorId);

	@Query("SELECT s FROM MentorshipSession s JOIN MentorshipConnection c ON s.connectionId = c.id WHERE c.mentee.id = :menteeId")
	List<MentorshipSession> findByMenteeProfileId(@Param("menteeId") Long menteeId);
}
