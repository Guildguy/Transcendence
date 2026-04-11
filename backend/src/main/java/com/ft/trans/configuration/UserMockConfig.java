package com.ft.trans.configuration;

import java.sql.Date;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import com.ft.trans.entity.User;
import com.ft.trans.repository.UserRepository;

@Configuration
public class UserMockConfig
{

    @Bean
    @Order(1)
    CommandLineRunner loadUsers(UserRepository repo)
    {
        return args ->
        {

            if (repo.count() > 0)
            {
                System.out.println("Users already loaded");
                return;
            }

            String[] mentorNames = {"Prison Mike", "Carminha", "Jirafales"};
            String[] mentorEmail = {"mike@gmail.com", "carminha@gmail.com", "jirafales@gmail.com"};

            for (int i = 0; i < mentorNames.length; i++)
            {
                User u = new User();

                u.name = mentorNames[i];

                u.email = mentorEmail[i];

                u.phoneNumber = "1199999999" + (i + 1);

                u.password = "Mentor123!";
                u.encodePassword();

                u.status = true;

                u.createdAt = new Date(System.currentTimeMillis());

                u.createdBy = 1L;

                repo.save(u);
            }

            System.out.println("Users mock loaded");
        };
    }
}
