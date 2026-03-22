package com.ft.trans.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ft.trans.entity.Achievement;

public interface AchievementRepository extends JpaRepository<Achievement, Long>
{
	List<Achievement> findByType(String type);
	Achievement findByName(String name);
}