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

            for (int i = 1; i <= 3; i++)
            {
                User u = new User();

                u.name = "Zezin " + i;

                u.email = "ze" + i + "@mail.com";

                u.phone_number = "1199999999" + i;

                u.password = "Aa@12345";
                u.encodePassword();

                u.status = true;

                u.created_at = new Date(System.currentTimeMillis());
                u.created_by = "mock";

                repo.save(u);
            }

            System.out.println("Users mock loaded");
        };
    }
}