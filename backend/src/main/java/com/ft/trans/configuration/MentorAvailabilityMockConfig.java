package com.ft.trans.configuration;

import java.sql.Date;
import java.time.LocalTime;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import com.ft.trans.entity.DayOfWeekEnum;
import com.ft.trans.entity.MentorAvailability;
import com.ft.trans.entity.User;
import com.ft.trans.repository.MentorAvailabilityRepository;
import com.ft.trans.repository.UserRepository;

@Configuration
public class MentorAvailabilityMockConfig {

    @Bean
    @Order(6)
    CommandLineRunner loadMentorAvailabilityMocks(UserRepository userRepository, MentorAvailabilityRepository availabilityRepository)
    {
        return args -> {

            if (availabilityRepository.count() > 0)
            {
                System.out.println("MentorAvailability already loaded");
                return;
            }

            Long mentorId = userRepository.findFirstUserId();
            if (mentorId == null)
            {
                System.out.println("No users yet - skipping MentorAvailability mock");
                return;
            }

            User mentor = userRepository.getReferenceById(mentorId);
            Date now = new Date(System.currentTimeMillis());

            availabilityRepository.save(create(mentor, mentorId, DayOfWeekEnum.MONDAY, "08:00", "12:00", now));
            availabilityRepository.save(create(mentor, mentorId, DayOfWeekEnum.MONDAY, "19:00", "22:00", now));
            availabilityRepository.save(create(mentor, mentorId, DayOfWeekEnum.WEDNESDAY, "14:00", "18:00", now));

            System.out.println("MentorAvailability mock loaded for userId=" + mentorId);
        };
    }

    private MentorAvailability create(User mentor, Long mentorId, DayOfWeekEnum dayOfWeek, String startTime, String endTime, Date now)
    {
        MentorAvailability availability = new MentorAvailability();
        availability.mentor = mentor;
        availability.dayOfWeek = dayOfWeek;
        availability.startTime = LocalTime.parse(startTime);
        availability.endTime = LocalTime.parse(endTime);
        availability.createdAt = now;
        availability.createdBy = mentorId;
        availability.lastUpdateAt = now;
        availability.lastUpdateBy = mentorId;
        return availability;
    }
}
