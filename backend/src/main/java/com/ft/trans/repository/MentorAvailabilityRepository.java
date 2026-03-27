package com.ft.trans.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ft.trans.entity.MentorAvailability;

public interface MentorAvailabilityRepository extends JpaRepository<MentorAvailability, Long> {
    void deleteByMentor_Id(Long mentorId);
    List<MentorAvailability> findByMentor_IdOrderByDayOfWeekAscStartTimeAsc(Long mentorId);
}
