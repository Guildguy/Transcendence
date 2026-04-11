package com.ft.trans.configuration;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Base64;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestTemplate;

import com.ft.trans.entity.Profile;
import com.ft.trans.entity.Profile.ProfileType;
import com.ft.trans.repository.ProfileRepository;

@Configuration
public class ProfileImageMockConfig
{
    private static final String PYTHON_SERVICE_URL = "http://python-profile-service:8000";
    private static final String[] MOCK_PROFILE_IMAGE_FILES = {
        "PrisonMike.png",
        "carminha.png",
        "jirafales.png"
    };
    private static final String[] PROFILE_IMAGE_DIRECTORIES = {
        "/app/profiles",
        "profiles"
    };

    @Bean
    @Order(7)
    CommandLineRunner loadMockProfileImages(ProfileRepository profileRepository)
    {
        return args -> {
            List<Profile> mentorProfiles = profileRepository.findAll()
                .stream()
                .filter(profile -> profile.id != null && profile.role == ProfileType.MENTOR)
                .sorted(Comparator.comparing(profile -> profile.id))
                .limit(3)
                .toList();

            if (mentorProfiles.isEmpty())
            {
                System.out.println("No mentor profiles yet - skipping ProfileImage mock");
                return;
            }

            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            for (int index = 0; index < mentorProfiles.size(); index++)
            {
                Profile profile = mentorProfiles.get(index);
                String imageFileName = MOCK_PROFILE_IMAGE_FILES[index % MOCK_PROFILE_IMAGE_FILES.length];
                String imagePayload = buildImageDataUrl(imageFileName);

                if (imagePayload == null)
                {
                    System.out.println("Profile image file not found for mock: " + imageFileName);
                    continue;
                }

                Map<String, String> body = Map.of(
                    "profile_id", profile.id.toString(),
                    "image_base64", imagePayload,
                    "image_file_name", imageFileName
                );

                try
                {
                    restTemplate.postForObject(
                        PYTHON_SERVICE_URL + "/profile/image",
                        new HttpEntity<>(body, headers),
                        String.class
                    );
                    System.out.println("Profile image mock loaded for profileId=" + profile.id);
                }
                catch (Exception exception)
                {
                    System.out.println("Failed to load image mock for profileId=" + profile.id + ": " + exception.getMessage());
                }
            }
        };
    }

    private String buildImageDataUrl(String imageFileName)
    {
        for (String directory : PROFILE_IMAGE_DIRECTORIES)
        {
            try
            {
                Path imagePath = Path.of(directory, imageFileName);
                if (!Files.exists(imagePath))
                    continue;

                String base64 = Base64.getEncoder().encodeToString(Files.readAllBytes(imagePath));
                return "data:image/png;base64," + base64;
            }
            catch (Exception ignored)
            {
                // tenta o proximo diretorio
            }
        }

        return null;
    }
}