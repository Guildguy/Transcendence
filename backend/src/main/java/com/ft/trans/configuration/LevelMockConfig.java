package com.ft.trans.configuration;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import com.ft.trans.entity.Level;
import com.ft.trans.repository.LevelRepository;

@Configuration
public class LevelMockConfig
{

    @Bean
    @Order(3)
    CommandLineRunner loadLevels(LevelRepository levelRepository)
    {
        return args ->
        {

            if (levelRepository.count() > 0)
                return;

            Level l1 = new Level(); l1.level = 1; l1.xpRequired = 0;    l1.iconUrl = "/levels/level1.png";
            Level l2 = new Level(); l2.level = 2; l2.xpRequired = 500;  l2.iconUrl = "/levels/level2.png";
            Level l3 = new Level(); l3.level = 3; l3.xpRequired = 1500; l3.iconUrl = "/levels/level3.png";
            Level l4 = new Level(); l4.level = 4; l4.xpRequired = 3000; l4.iconUrl = "/levels/level4.png";
            Level l5 = new Level(); l5.level = 5; l5.xpRequired = 5000; l5.iconUrl = "/levels/level5.png";

            levelRepository.save(l1);
            levelRepository.save(l2);
            levelRepository.save(l3);
            levelRepository.save(l4);
            levelRepository.save(l5);

            System.out.println("Levels mock loaded");
        };
    }
}