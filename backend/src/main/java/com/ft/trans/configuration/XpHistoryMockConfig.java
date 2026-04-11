package com.ft.trans.configuration;

import java.sql.Date;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import com.ft.trans.entity.User;
import com.ft.trans.entity.XpHistory;
import com.ft.trans.repository.UserRepository;
import com.ft.trans.repository.XpHistoryRepository;

@Configuration
public class XpHistoryMockConfig
{

    @Bean
    @Order(5)
    CommandLineRunner loadXpHistory(UserRepository userRepo, XpHistoryRepository repo)
    {
        return args ->
        {
            if (userRepo.count() == 0)
            {
                System.out.println("No users for xp history");
                return;
            }

            for (User u : userRepo.findAll())
            {
                addXpIfMissing(repo, u.id, "PROFILE_COMPLETED", 50);
                addXpIfMissing(repo, u.id, "MATCH_ACCEPTED", 150);
                addXpIfMissing(repo, u.id, "SESSION_COMPLETED", 50);

                if (isPrisonMike(u))
                    addXpIfMissing(repo, u.id, "MOCK_MAX_LEVEL", 5000);

            }

            System.out.println("XP history mock loaded");
        };
    }

    private void addXpIfMissing(XpHistoryRepository repo, Long userId, String reason, int xp)
    {
        if (repo.countByUserIdAndReason(userId, reason) > 0)
            return;

        XpHistory xpHistory = new XpHistory();
        xpHistory.userId = userId;
        xpHistory.xp = xp;
        xpHistory.reason = reason;
        xpHistory.createdAt = new Date(System.currentTimeMillis());

        repo.save(xpHistory);
    }

    private boolean isPrisonMike(User user)
    {
        if (user == null)
            return false;

        if (user.email != null && user.email.equalsIgnoreCase("mike@gmail.com"))
            return true;

        return user.name != null && user.name.equalsIgnoreCase("Prison Mike");
    }
}