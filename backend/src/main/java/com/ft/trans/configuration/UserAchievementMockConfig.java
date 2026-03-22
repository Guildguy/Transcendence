package com.ft.trans.configuration;

import java.sql.Date;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

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
    @Order(4)
    CommandLineRunner loadUserAchievements(UserRepository userRepo, AchievementRepository achievementRepo, UserAchievementRepository repo)
    {
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

            List<User> users = userRepo.findAll();
            List<Achievement> achievements = achievementRepo.findAll();

            // Relaciona cada usuario com as 3 primeiras achievements como seed de teste.
            for (User user : users)
            {
                int limit = Math.min(3, achievements.size());
                for (int i = 0; i < limit; i++)
                {
                    Achievement achievement = achievements.get(i);
                    if (repo.existsByUserIdAndAchievementId(user.id, achievement.id))
                        continue;

                    UserAchievement mockUa = new UserAchievement();
                    mockUa.userId = user.id;
                    mockUa.achievementId = achievement.id;
                    mockUa.unlockedAt = new Date(System.currentTimeMillis());
                    repo.save(mockUa);
                }
            }
            System.out.println("UserAchievement mock loaded");
        };
    }
}