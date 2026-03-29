package com.ft.trans.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ft.trans.entity.MentorshipSession;
import com.ft.trans.entity.MentorshipSession.SessionStatus;

public interface MentorshipSessionRepository extends JpaRepository<MentorshipSession, Long>
{
	List<MentorshipSession> findByConnectionId(Long connectionId);

	List<MentorshipSession> findByRecurrenceGroupId(UUID recurrenceGroupId);

	long countByRecurrenceGroupIdAndStatusNot(UUID recurrenceGroupId, SessionStatus status);

	boolean existsByConnectionIdAndScheduledDate(Long connectionId, LocalDateTime scheduledDate);

	List<MentorshipSession> findByConnectionIdAndScheduledDateAfter(Long connectionId, LocalDateTime after);
}
