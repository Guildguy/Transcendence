package com.ft.trans.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ft.trans.entity.LimitMentee;

public interface LimitMenteeRepository extends JpaRepository<LimitMentee, Long>
{
	Optional<LimitMentee> findByMentor_Id(Long mentorProfileId);
}
