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

            repo.save(create("Identidade Transcendental", "Perfil completo",          "PROFILE",        1,  50,  "/achievements/identidade_transcendental.png"));
            repo.save(create("Chama Acesa",               "7 dias de streak",         "STREAK",         7,  100, "/achievements/chama_acessa.png"));
            repo.save(create("Imparável",                 "30 dias de streak",        "STREAK",         30, 200, "/achievements/comeco_da_jornada.png"));
            repo.save(create("Primeiro Match",            "Primeira mentoria aceita", "MATCH",          1,  0,   "/achievements/primeiro_aperto_de_mao.png"));
            repo.save(create("Hub de Conexões",           "10 matches",               "MATCH",          10, 0,   "/achievements/hub_de_conexoes.png"));
            repo.save(create("Quebrando o Gelo",          "Primeira sessão",          "SESSION",        1,  0,   "/achievements/quebrando_o-gelo.png"));
            repo.save(create("Mente Brilhante",           "50 sessões",               "SESSION",        50, 0,   "/achievements/mente_brilhante.png"));
            repo.save(create("Ciclo Fechado",             "Ciclo completo",           "CYCLE",          1,  200, "/achievements/ciclo_fechado.png"));
            repo.save(create("Voz Ativa",                 "5 avaliações enviadas",    "REVIEW_SEND",    5,  0,   "/achievements/voz_ativa.png"));
            repo.save(create("Padrão Ouro",               "Primeira 5 estrelas",      "REVIEW_RECEIVE", 1,  50,  "/achievements/padrao_ouro.png"));
            repo.save(create("Lenda do Ensino",           "10 avaliações 5 estrelas", "REVIEW_RECEIVE", 10, 0,   "/achievements/lenda_do_ensino.png"));

            System.out.println("Achievements mock loaded");
        };
    }

    private Achievement create(String name, String description, String type, int target, int xp, String iconUrl) {
        Achievement a = new Achievement();
        a.name        = name;
        a.description = description;
        a.type        = type;
        a.target      = target;
        a.xp_reward   = xp;
        a.iconUrl     = iconUrl;
        return a;
    }
}