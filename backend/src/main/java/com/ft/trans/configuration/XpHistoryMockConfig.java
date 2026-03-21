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

            if (repo.count() > 0)
            {
                System.out.println("XP history already loaded");
                return;
            }

            if (userRepo.count() == 0)
            {
                System.out.println("No users for xp history");
                return;
            }

            for (User u : userRepo.findAll())
            {

                XpHistory x1 = new XpHistory();
                x1.user_id = u.id;
                x1.xp = 50;
                x1.reason = "PROFILE_COMPLETE";
                x1.created_at = new Date(System.currentTimeMillis());

                repo.save(x1);


                XpHistory x2 = new XpHistory();
                x2.user_id = u.id;
                x2.xp = 150;
                x2.reason = "MATCH_ACCEPT";
                x2.created_at = new Date(System.currentTimeMillis());

                repo.save(x2);


                XpHistory x3 = new XpHistory();
                x3.user_id = u.id;
                x3.xp = 50;
                x3.reason = "SESSION_DONE";
                x3.created_at = new Date(System.currentTimeMillis());

                repo.save(x3);

            }

            System.out.println("XP history mock loaded");
        };
    }
}