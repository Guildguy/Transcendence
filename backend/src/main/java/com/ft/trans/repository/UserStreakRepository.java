package com.ft.trans.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ft.trans.entity.UserStreak;

public interface UserStreakRepository extends JpaRepository<UserStreak, Long>
{
    Optional<UserStreak> findByUserId(Long userId);
}
