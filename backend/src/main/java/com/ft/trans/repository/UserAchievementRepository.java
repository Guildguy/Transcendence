package com.ft.trans.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ft.trans.entity.UserAchievement;

public interface UserAchievementRepository extends JpaRepository<UserAchievement, Long>
{
    boolean existsByUserIdAndAchievementId(Long userId, Long achievementId);
    List<UserAchievement> findByUserId(Long userId);
    long countByUserId(Long userId);
}