package com.ft.trans.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ft.trans.entity.UserAchievement;

public interface UserAchievementRepository extends JpaRepository<UserAchievement, Long>
{
    boolean existsByUserIdAndAchievementId(Long userId, Long achievementId);
}