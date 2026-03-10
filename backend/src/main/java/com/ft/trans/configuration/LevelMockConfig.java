package com.ft.trans.configuration;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.ft.trans.entity.Level;
import com.ft.trans.repository.LevelRepository;

@Configuration
public class LevelMockConfig
{

    @Bean
    CommandLineRunner loadLevels(LevelRepository levelRepository)
    {
        return args ->
        {

            if (levelRepository.count() > 0)
                return;

            Level l1 = new Level();
            l1.level = 1;
            l1.xp_required = 0;

            Level l2 = new Level();
            l2.level = 2;
            l2.xp_required = 500;

            Level l3 = new Level();
            l3.level = 3;
            l3.xp_required = 1500;

            Level l4 = new Level();
            l4.level = 4;
            l4.xp_required = 3000;

            Level l5 = new Level();
            l5.level = 5;
            l5.xp_required = 5000;

            levelRepository.save(l1);
            levelRepository.save(l2);
            levelRepository.save(l3);
            levelRepository.save(l4);
            levelRepository.save(l5);

            System.out.println("Levels mock loaded");
        };
    }
}