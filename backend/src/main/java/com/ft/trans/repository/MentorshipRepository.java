package com.ft.trans.repository;

import java.sql.Timestamp;
import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ft.trans.entity.Mentorship;
import com.ft.trans.entity.Mentorship.MentorshipStatus;

public interface MentorshipRepository extends JpaRepository<Mentorship, Long>
{
    List<Mentorship> findByMentorProfileIdAndStatusOrderByCreatedAtDesc(Long mentorProfileId, MentorshipStatus status);

    List<Mentorship> findByMentorProfileIdOrderByStartAtDesc(Long mentorProfileId);

    List<Mentorship> findByMenteeProfileIdOrderByStartAtDesc(Long menteeProfileId);

    @Query("""
        SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END
        FROM Mentorship m
        WHERE m.mentorProfile.id = :mentorProfileId
          AND m.status IN :blockingStatuses
          AND m.startAt < :endAt
          AND m.endAt > :startAt
          AND (:ignoreMentorshipId IS NULL OR m.id <> :ignoreMentorshipId)
    """)
    boolean existsMentorTimeConflict(
        @Param("mentorProfileId") Long mentorProfileId,
        @Param("startAt") Timestamp startAt,
        @Param("endAt") Timestamp endAt,
        @Param("blockingStatuses") Collection<MentorshipStatus> blockingStatuses,
        @Param("ignoreMentorshipId") Long ignoreMentorshipId
    );
}
