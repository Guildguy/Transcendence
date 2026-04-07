package com.ft.trans.configuration;

import java.sql.Date;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.transaction.annotation.Transactional;

import com.ft.trans.entity.DayOfWeekEnum;
import com.ft.trans.entity.MentorAvailability;
import com.ft.trans.entity.Profile;
import com.ft.trans.repository.MentorAvailabilityRepository;
import com.ft.trans.repository.ProfileRepository;

@Configuration
public class MentorAvailabilityMockConfig {

    @Bean
    @Order(6)
    CommandLineRunner loadMentorAvailabilityMocks(ProfileRepository profileRepository, MentorAvailabilityRepository availabilityRepository)
    {
        return args -> {
            // Find profile with role MENTOR (mapped from previous seeds)
            List<Profile> mentors = profileRepository.findAll()
                .stream()
                .filter(p -> p.role != null && p.role.name().equals("MENTOR"))
                .sorted(Comparator.comparing(p -> p.id))
                .limit(3)
                .toList();
 
            if (mentors.isEmpty())
            {
                System.out.println("No mentor profiles found - skipping MentorAvailability mock");
                return;
            }
 
            Date now = new Date(System.currentTimeMillis());
 
            for (int index = 0; index < mentors.size(); index++)
            {
                Profile mentor = mentors.get(index);
                Long profileId = mentor.id;
 
                // Always delete and re-seed to ensure the latest mock slots (like the TUESDAY hack) are present
                availabilityRepository.deleteByMentor_Id(profileId);
                
                // Base mock data
                seedAvailabilityByIndex(availabilityRepository, mentor, profileId, index, now);
                
                // GLOBAL HACK: Adding TUESDAY for ALL mentors for testing purposes today
                // This ensures that any mentor selected (like ID 5) has availability on Tuesday
                availabilityRepository.save(create(mentor, profileId, DayOfWeekEnum.TUESDAY, "08:00", "22:00", 60, now));
                
                System.out.println("MentorAvailability mock (re)loaded for profileId=" + profileId + " (included Tuesday hack)");
            }
        };
    }

    private void seedAvailabilityByIndex(
        MentorAvailabilityRepository availabilityRepository,
        Profile mentor,
        Long mentorId,
        int index,
        Date now
    )
    {
        switch (index)
        {
            case 0 -> {
                availabilityRepository.save(create(mentor, mentorId, DayOfWeekEnum.MONDAY, "08:00", "18:00", 60, now));
                availabilityRepository.save(create(mentor, mentorId, DayOfWeekEnum.WEDNESDAY, "14:00", "22:00", 60, now));
            }
            case 1 -> {
                availabilityRepository.save(create(mentor, mentorId, DayOfWeekEnum.TUESDAY, "00:00", "23:59", 60, now));
                availabilityRepository.save(create(mentor, mentorId, DayOfWeekEnum.THURSDAY, "10:00", "14:00", 60, now));
            }
            default -> {
                availabilityRepository.save(create(mentor, mentorId, DayOfWeekEnum.MONDAY, "18:00", "21:00", 60, now));
                availabilityRepository.save(create(mentor, mentorId, DayOfWeekEnum.WEDNESDAY, "18:00", "21:00", 60, now));
            }
        }
    }
 
    private MentorAvailability create(
        Profile mentor,
        Long profileId,
        DayOfWeekEnum dayOfWeek,
        String startTime,
        String endTime,
        int slotDuration,
        Date now
    )
    {
        MentorAvailability availability = new MentorAvailability();
        availability.mentor = mentor;
        availability.dayOfWeek = dayOfWeek;
        availability.startTime = LocalTime.parse(startTime);
        availability.endTime = LocalTime.parse(endTime);
        availability.slotDuration = slotDuration;
        availability.createdAt = now;
        availability.createdBy = profileId;
        availability.lastUpdateAt = now;
        availability.lastUpdateBy = profileId;
        return availability;
    }
}
