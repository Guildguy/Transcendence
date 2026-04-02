package com.ft.trans.configuration;

import java.sql.Date;
import java.util.Comparator;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import com.ft.trans.entity.Profile;
import com.ft.trans.entity.Profile.ProfileType;
import com.ft.trans.entity.User;
import com.ft.trans.repository.ProfileRepository;
import com.ft.trans.repository.UserRepository;

@Configuration
public class ProfileMockConfig
{
    @Bean
    @Order(2)
    CommandLineRunner loadMentorProfiles(UserRepository userRepository, ProfileRepository profileRepository)
    {
        return args -> {
            List<User> users = userRepository.findAll()
                .stream()
                .filter(user -> user.id != null)
                .sorted(Comparator.comparing(user -> user.id))
                .limit(3)
                .toList();

            if (users.isEmpty())
            {
                System.out.println("No users yet - skipping Profile mock");
                return;
            }

            Date now = new Date(System.currentTimeMillis());

            for (int index = 0; index < users.size(); index++)
            {
                User user = users.get(index);

                boolean hasMentorProfile = profileRepository
                    .findByUserIdAndRole(user.id, ProfileType.MENTOR)
                    .isPresent();

                if (hasMentorProfile)
                {
                    System.out.println("Mentor profile already loaded for userId=" + user.id);
                    continue;
                }

                profileRepository.save(buildMentorProfile(user, index, now));
                System.out.println("Mentor profile mock loaded for userId=" + user.id);
            }
        };
    }

    private Profile buildMentorProfile(User user, int index, Date now)
    {
        Profile profile = new Profile();
        profile.user = user;
        profile.role = ProfileType.MENTOR;
        profile.level = 1;
        profile.xp = 0L;
        profile.createdAt = now;
        profile.createdBy = user.id;
        profile.lastUpdateAt = now;
        profile.lastUpdateBy = user.id;

        switch (index)
        {
            case 0 -> {
                profile.position = "Staff Engineer";
                profile.anosExperiencia = 12;
                profile.bio = "Especialista em arquitetura de microsserviços e liderança técnica.";
            }
            case 1 -> {
                profile.position = "Tech Lead";
                profile.anosExperiencia = 8;
                profile.bio = "Focado em frontend e experiência do usuário.";
            }
            default -> {
                profile.position = "Backend Developer";
                profile.anosExperiencia = 5;
                profile.bio = "Desenvolvedora backend com foco em APIs RESTful e bancos de dados.";
            }
        }

        return profile;
    }
}
