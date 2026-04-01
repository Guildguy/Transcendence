package com.ft.trans.configuration;

import java.sql.Date;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;

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

            List<User> mentors = userRepository.findAll()
                .stream()
                .filter(user -> user.id != null)
                .sorted(Comparator.comparing(user -> user.id))
                .limit(3)
                .toList();

            if (mentors.isEmpty())
            {
                System.out.println("No users yet - skipping MentorAvailability mock");
                return;
            }

            Date now = new Date(System.currentTimeMillis());

            for (int index = 0; index < mentors.size(); index++)
            {
                User mentor = mentors.get(index);
                Long mentorId = mentor.id;

                boolean hasAvailability = !availabilityRepository
                    .findByMentor_IdOrderByDayOfWeekAscStartTimeAsc(mentorId)
                    .isEmpty();

                if (hasAvailability)
                {
                    System.out.println("MentorAvailability already loaded for userId=" + mentorId);
                    continue;
                }

                seedAvailabilityByIndex(availabilityRepository, mentor, mentorId, index, now);
                System.out.println("MentorAvailability mock loaded for userId=" + mentorId);
            }
        };
    }

    private void seedAvailabilityByIndex(
        MentorAvailabilityRepository availabilityRepository,
        User mentor,
        Long mentorId,
        int index,
        Date now
    )
    {
        switch (index)
        {
            case 0 -> {
                availabilityRepository.save(create(mentor, mentorId, DayOfWeekEnum.MONDAY, "08:00", "12:00", 60, now));
                availabilityRepository.save(create(mentor, mentorId, DayOfWeekEnum.MONDAY, "19:00", "22:00", 60, now));
                availabilityRepository.save(create(mentor, mentorId, DayOfWeekEnum.WEDNESDAY, "14:00", "18:00", 60, now));
            }
            case 1 -> {
                availabilityRepository.save(create(mentor, mentorId, DayOfWeekEnum.TUESDAY, "15:00", "19:00", 60, now));
                availabilityRepository.save(create(mentor, mentorId, DayOfWeekEnum.THURSDAY, "10:00", "14:00", 60, now));
            }
            default -> {
                availabilityRepository.save(create(mentor, mentorId, DayOfWeekEnum.MONDAY, "18:00", "21:00", 60, now));
                availabilityRepository.save(create(mentor, mentorId, DayOfWeekEnum.WEDNESDAY, "18:00", "21:00", 60, now));
            }
        }
    }

    private MentorAvailability create(
        User mentor,
        Long mentorId,
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
        availability.createdBy = mentorId;
        availability.lastUpdateAt = now;
        availability.lastUpdateBy = mentorId;
        return availability;
    }
}
