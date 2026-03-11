package com.ft.trans.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ft.trans.entity.Achievement;

public interface AchievementRepository extends JpaRepository<Achievement, Long>
{}