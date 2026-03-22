package com.ft.trans.configuration;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import com.ft.trans.entity.Achievement;
import com.ft.trans.repository.AchievementRepository;

@Configuration
public class AchievementMockConfig
{

    @Bean
    @Order(2)
    CommandLineRunner loadAchievements(AchievementRepository repo) 
	{
        return args ->
		{

            if (repo.count() > 0)
			{
                System.out.println("Achievements already loaded");
                return;
            }

            repo.save(create(
                    "Identidade Transcendental",
                    "Perfil completo",
                    "PROFILE",
                    1,
                    50
            ));

            repo.save(create(
                    "Chama Acesa",
                    "7 dias de streak",
                    "STREAK",
                    7,
                    100
            ));

            repo.save(create(
                    "Imparável",
                    "30 dias de streak",
                    "STREAK",
                    30,
                    200
            ));

            repo.save(create(
                    "Primeiro Match",
                    "Primeira mentoria aceita",
                    "MATCH",
                    1,
                    0
            ));

            repo.save(create(
                    "Hub de Conexões",
                    "10 matches",
                    "MATCH",
                    10,
                    0
            ));

            repo.save(create(
                    "Quebrando o Gelo",
                    "Primeira sessão",
                    "SESSION",
                    1,
                    0
            ));

            repo.save(create(
                    "Mente Brilhante",
                    "50 sessões",
                    "SESSION",
                    50,
                    0
            ));

            repo.save(create(
                    "Ciclo Fechado",
                    "Ciclo completo",
                    "CYCLE",
                    1,
                    200
            ));

            repo.save(create(
                    "Voz Ativa",
                    "5 avaliações enviadas",
                    "REVIEW_SEND",
                    5,
                    0
            ));

            repo.save(create(
                    "Padrão Ouro",
                    "Primeira 5 estrelas",
                    "REVIEW_RECEIVE",
                    1,
                    50
            ));

            repo.save(create(
                    "Lenda do Ensino",
                    "10 avaliações 5 estrelas",
                    "REVIEW_RECEIVE",
                    10,
                    0
            ));

            System.out.println("Achievements mock loaded");
        };
    }

    private Achievement create(String name, String description, String type, int target, int xp)
	{
        Achievement a = new Achievement();

        a.name = name;
        a.description = description;
        a.type = type;
        a.target = target;
        a.xp_reward = xp;

        return (a);
    }
}