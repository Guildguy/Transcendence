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

                Profile existingMentorProfile = profileRepository
                    .findByUserIdAndRole(user.id, ProfileType.MENTOR)
                    .orElse(null);

                if (existingMentorProfile != null)
                {
                    if (isPrisonMike(user))
                    {
                        existingMentorProfile.level = 5;
                        existingMentorProfile.xp = 5000L;
                        System.out.println("Prison Mike profile updated to level 5 for userId=" + user.id);
                    }
                    else
                    {
                        existingMentorProfile.level = 1;
                        existingMentorProfile.xp = 0L;
                        System.out.println("Basic profile enforced for userId=" + user.id);
                    }

                    existingMentorProfile.lastUpdateAt = now;
                    existingMentorProfile.lastUpdateBy = user.id;
                    profileRepository.save(existingMentorProfile);

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
        profile.level = isPrisonMike(user) ? 5 : 1;
        profile.xp = isPrisonMike(user) ? 5000L : 0L;
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

    private boolean isPrisonMike(User user)
    {
        if (user == null)
            return false;

        if (user.email != null && user.email.equalsIgnoreCase("mike@gmail.com"))
            return true;

        return user.name != null && user.name.equalsIgnoreCase("Prison Mike");
    }
}
