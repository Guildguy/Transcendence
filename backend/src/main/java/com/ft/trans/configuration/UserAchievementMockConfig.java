package com.ft.trans.configuration;

import java.sql.Date;
import java.util.List;
import java.util.Comparator;
import java.util.stream.Collectors;
import java.util.Set;

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
            List<Achievement> achievements = achievementRepo.findAll()
                .stream()
                .sorted(Comparator.comparing(achievement -> achievement.id))
                .toList();

            // Relaciona cada usuario com as 3 primeiras achievements como seed de teste.
            for (User user : users)
            {
                List<Achievement> targetAchievements;

                if (isPrisonMike(user))
                {
                    targetAchievements = achievements.stream()
                        .filter(achievement -> achievement.name != null)
                        .filter(achievement -> !achievement.name.equalsIgnoreCase("Padrão Ouro"))
                        .collect(Collectors.toList());
                }
                else if (isBasicMentor(user))
                {
                    targetAchievements = achievements.stream()
                        .filter(achievement -> achievement.name != null)
                        .filter(achievement -> achievement.name.equalsIgnoreCase("Identidade Transcendental")
                            || achievement.name.equalsIgnoreCase("Iniciante"))
                        .collect(Collectors.toList());
                }
                else
                {
                    targetAchievements = achievements.subList(0, Math.min(3, achievements.size()));
                }

                Set<Long> targetAchievementIds = targetAchievements.stream()
                    .map(achievement -> achievement.id)
                    .collect(Collectors.toSet());

                List<UserAchievement> currentAchievements = repo.findByUserId(user.id);
                for (UserAchievement current : currentAchievements)
                {
                    if (!targetAchievementIds.contains(current.achievementId))
                        repo.delete(current);
                }

                for (Achievement achievement : targetAchievements)
                {
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

    private boolean isPrisonMike(User user)
    {
        if (user == null)
            return false;

        if (user.email != null && user.email.equalsIgnoreCase("mike@gmail.com"))
            return true;

        return user.name != null && user.name.equalsIgnoreCase("Prison Mike");
    }

    private boolean isBasicMentor(User user)
    {
        if (user == null)
            return false;

        if (user.email != null)
        {
            if (user.email.equalsIgnoreCase("carminha@gmail.com"))
                return true;
            if (user.email.equalsIgnoreCase("jirafales@gmail.com"))
                return true;
        }

        if (user.name != null)
        {
            if (user.name.equalsIgnoreCase("Carminha"))
                return true;
            if (user.name.equalsIgnoreCase("Jirafales"))
                return true;
        }

        return false;
    }
}