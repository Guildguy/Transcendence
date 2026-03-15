package com.ft.trans.configuration;

import java.sql.Date;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.ft.trans.entity.User;
import com.ft.trans.entity.Achievement;
import com.ft.trans.entity.UserAchievement;

import com.ft.trans.repository.UserRepository;
import com.ft.trans.repository.AchievementRepository;
import com.ft.trans.repository.UserAchievementRepository;

@Configuration
public class UserAchievementMockConfig
{

    @Bean
    CommandLineRunner loadUserAchievements(UserRepository userRepo, AchievementRepository achievementRepo, UserAchievementRepository repo
    ) {
        return args ->
        {

            if (repo.count() > 0)
            {
                System.out.println("UserAchievements already loaded");
                return;
            }

            if (userRepo.count() == 0)
            {
                System.out.println("No users yet");
                return;
            }

            if (achievementRepo.count() == 0)
            {
                System.out.println("No achievements yet");
                return;
            }

            User user = userRepo.findAll().get(0);

            Achievement achievement = achievementRepo.findAll().get(0);

            UserAchievement ua = new UserAchievement();
            // Mock para popular user_achievements com user_id fictício e achievementId válidos
            for (long userId = 1; userId <= 3; userId++)
            {
                for (long achievementId = 1; achievementId <= 3; achievementId++)
                {
                    UserAchievement mockUa = new UserAchievement();
                    mockUa.userId = userId;
                    mockUa.achievementId = achievementId;
                    mockUa.unlocked_at = new Date(System.currentTimeMillis());
                    repo.save(mockUa);
                }
            }
            System.out.println("UserAchievement mock loaded");
        };
    }
}