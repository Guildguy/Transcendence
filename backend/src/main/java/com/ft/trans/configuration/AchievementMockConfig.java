package com.ft.trans.configuration;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.dao.DataIntegrityViolationException;

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
            ensure(repo, "Identidade Transcendental", "Perfil completo",              "PROFILE",        1,  50,  "/achievements/identidade_transcendental.png");
            ensure(repo, "Chama Acesa",               "7 dias de streak",             "STREAK",         7,  100, "/achievements/chama_acessa.png");
            ensure(repo, "Imparável",                 "30 dias de streak",            "STREAK",         30, 200, "/achievements/comeco_da_jornada.png");
            ensure(repo, "Primeiro Match",            "Primeira mentoria aceita",     "MATCH",          1,  0,   "/achievements/primeiro_aperto_de_mao.png");
            ensure(repo, "Hub de Conexões",           "10 matches",                   "MATCH",          10, 0,   "/achievements/hub_de_conexoes.png");
            ensure(repo, "Quebrando o Gelo",          "Primeira sessão",              "SESSION",        1,  0,   "/achievements/quebrando_o-gelo.png");
            ensure(repo, "Mente Brilhante",           "50 sessões",                   "SESSION",        50, 0,   "/achievements/mente_brilhante.png");
            ensure(repo, "Ciclo Fechado",             "Ciclo completo",               "CYCLE",          1,  200, "/achievements/ciclo_fechado.png");
            ensure(repo, "Voz Ativa",                 "5 avaliações enviadas",        "REVIEW_SEND",    5,  0,   "/achievements/voz_ativa.png");
            ensure(repo, "Padrão Ouro",               "Primeira 5 estrelas",          "REVIEW_RECEIVE", 1,  50,  "/achievements/padrao_ouro.png");
            ensure(repo, "Lenda do Ensino",           "10 avaliações 5 estrelas",     "REVIEW_RECEIVE", 10, 0,   "/achievements/lenda_do_ensino.png");

            // Badges de nivel destravadas pelo XP total.
            ensure(repo, "Iniciante",                 "Atingiu o Nível 1",            "LEVEL",          1,  0,   "/levels/level1.png");
            ensure(repo, "Explorador",                "Atingiu o Nível 2",            "LEVEL",          2,  0,   "/levels/level2.png");
            ensure(repo, "Conector",                  "Atingiu o Nível 3",            "LEVEL",          3,  0,   "/levels/level3.png");
            ensure(repo, "Especialista",              "Atingiu o Nível 4",            "LEVEL",          4,  0,   "/levels/level4.png");
            ensure(repo, "Mestre Transcendental",     "Atingiu o Nível 5",            "LEVEL",          5,  0,   "/levels/level5.png");

            System.out.println("Achievements ensured");
        };
    }

    private void ensure(AchievementRepository repo, String name, String description, String type, int target, int xp, String iconUrl) {
        if (repo.findByName(name) != null) {
            return;
        }

        try {
            repo.saveAndFlush(create(name, description, type, target, xp, iconUrl));
        } catch (DataIntegrityViolationException ex) {
            if (repo.findByName(name) != null) {
                return;
            }
            throw ex;
        }
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