package com.ft.trans.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ft.trans.controller.dto.GamificationEventRequest;
import com.ft.trans.dto.CreateSessionDTO;
import com.ft.trans.entity.DayOfWeekEnum;
import com.ft.trans.entity.MentorAvailability;
import com.ft.trans.dto.UpdateSessionDTO;
import com.ft.trans.entity.MentorshipConnection;
import com.ft.trans.entity.MentorshipSession;
import com.ft.trans.entity.Profile;
import com.ft.trans.entity.User;
import com.ft.trans.repository.MentorAvailabilityRepository;
import com.ft.trans.repository.MentorshipConnectionRepository;
import com.ft.trans.repository.MentorshipSessionRepository;
import com.ft.trans.validation.Result;

@ExtendWith(MockitoExtension.class)
public class MentorshipSessionServiceTest
{
    @Mock
    private MentorshipSessionRepository sessionRepository;

    @Mock
    private MentorAvailabilityRepository mentorAvailabilityRepository;

    @Mock
    private MentorshipConnectionRepository connectionRepository;

    @Mock
    private MeetService meetService;

    @Mock
    private GamificationService gamificationService;

    @InjectMocks
    private MentorshipSessionService sessionService;

    @Test
    void shouldAllowCreateSessionWhenOnlyCancelledExistsAtSameTime()
    {
        LocalDateTime scheduled = LocalDateTime.now().plusDays(1).withHour(21).withMinute(0).withSecond(0).withNano(0);

        CreateSessionDTO dto = new CreateSessionDTO();
        dto.connectionId = 77L;
        dto.scheduledDate = scheduled;
        dto.durationMinutes = 60;
        dto.createdBy = 100L;

        MentorshipConnection connection = buildConnection(77L, 100L, 200L);

        MentorAvailability slot = new MentorAvailability();
        slot.dayOfWeek = switch (scheduled.getDayOfWeek()) {
            case MONDAY -> DayOfWeekEnum.MONDAY;
            case TUESDAY -> DayOfWeekEnum.TUESDAY;
            case WEDNESDAY -> DayOfWeekEnum.WEDNESDAY;
            case THURSDAY -> DayOfWeekEnum.THURSDAY;
            case FRIDAY -> DayOfWeekEnum.FRIDAY;
            case SATURDAY -> DayOfWeekEnum.SATURDAY;
            case SUNDAY -> DayOfWeekEnum.SUNDAY;
        };
        slot.startTime = LocalTime.of(20, 0);
        slot.endTime = LocalTime.of(22, 0);

        when(connectionRepository.findByIdFull(77L)).thenReturn(Optional.of(connection));
        when(sessionRepository.findByConnectionIdAndScheduledDate(77L, scheduled)).thenReturn(Optional.empty());
        when(mentorAvailabilityRepository.findByMentor_IdOrderByDayOfWeekAscStartTimeAsc(11L)).thenReturn(List.of(slot));
        when(sessionRepository.save(any(MentorshipSession.class))).thenAnswer(inv -> inv.getArgument(0));

        Result result = sessionService.createSession(dto);

        assertFalse(result.validationResult().hasErrors());
        assertTrue(result.entity() instanceof MentorshipSession);
    }

    @Test
    void shouldReuseCancelledSessionWhenRebookingSameTime()
    {
        LocalDateTime scheduled = LocalDateTime.now().plusDays(1).withHour(8).withMinute(0).withSecond(0).withNano(0);

        CreateSessionDTO dto = new CreateSessionDTO();
        dto.connectionId = 2L;
        dto.scheduledDate = scheduled;
        dto.durationMinutes = 60;
        dto.createdBy = 200L;

        MentorshipConnection connection = buildConnection(2L, 100L, 200L);

        MentorAvailability slot = new MentorAvailability();
        slot.dayOfWeek = switch (scheduled.getDayOfWeek()) {
            case MONDAY -> DayOfWeekEnum.MONDAY;
            case TUESDAY -> DayOfWeekEnum.TUESDAY;
            case WEDNESDAY -> DayOfWeekEnum.WEDNESDAY;
            case THURSDAY -> DayOfWeekEnum.THURSDAY;
            case FRIDAY -> DayOfWeekEnum.FRIDAY;
            case SATURDAY -> DayOfWeekEnum.SATURDAY;
            case SUNDAY -> DayOfWeekEnum.SUNDAY;
        };
        slot.startTime = LocalTime.of(8, 0);
        slot.endTime = LocalTime.of(9, 0);

        MentorshipSession cancelled = new MentorshipSession();
        cancelled.id = 99L;
        cancelled.connectionId = 2L;
        cancelled.scheduledDate = scheduled;
        cancelled.durationMinutes = 60;
        cancelled.status = MentorshipSession.SessionStatus.CANCELLED;

        when(connectionRepository.findByIdFull(2L)).thenReturn(Optional.of(connection));
        when(sessionRepository.findByConnectionIdAndScheduledDate(2L, scheduled)).thenReturn(Optional.of(cancelled));
        when(mentorAvailabilityRepository.findByMentor_IdOrderByDayOfWeekAscStartTimeAsc(11L)).thenReturn(List.of(slot));
        when(sessionRepository.save(any(MentorshipSession.class))).thenAnswer(inv -> inv.getArgument(0));

        Result result = sessionService.createSession(dto);

        assertFalse(result.validationResult().hasErrors());
        assertTrue(result.entity() instanceof MentorshipSession saved && saved.id.equals(99L));
        assertTrue(((MentorshipSession) result.entity()).status == MentorshipSession.SessionStatus.SCHEDULED);
    }

    @Test
    void shouldTriggerSessionCompletedForMentorAndMentee()
    {
        MentorshipSession session = new MentorshipSession();
        session.id = 1L;
        session.connectionId = 99L;
        session.durationMinutes = 60;
        session.scheduledDate = LocalDateTime.now().plusDays(1);
        session.status = MentorshipSession.SessionStatus.SCHEDULED;

        UpdateSessionDTO dto = new UpdateSessionDTO();
        dto.sessionId = 1L;
        dto.status = "COMPLETED";
        dto.lastUpdateBy = 10L;

        MentorshipConnection connection = buildConnection(99L, 100L, 200L);

        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(sessionRepository.save(any(MentorshipSession.class))).thenAnswer(inv -> inv.getArgument(0));
        when(connectionRepository.findByIdFull(99L)).thenReturn(Optional.of(connection));

        Result result = sessionService.update(dto);

        assertFalse(result.validationResult().hasErrors());

        ArgumentCaptor<GamificationEventRequest> eventCaptor = ArgumentCaptor.forClass(GamificationEventRequest.class);
        verify(gamificationService, times(2)).processEvent(eventCaptor.capture());

        List<GamificationEventRequest> events = eventCaptor.getAllValues();
        assertTrue(events.stream().anyMatch(e -> e.userId().equals(100L) && "SESSION_COMPLETED".equals(e.eventType())));
        assertTrue(events.stream().anyMatch(e -> e.userId().equals(200L) && "SESSION_COMPLETED".equals(e.eventType())));
    }

    @Test
    void shouldTriggerNoShowBonusToPresentAndAbsenceEventToAbsent()
    {
        MentorshipSession session = new MentorshipSession();
        session.id = 2L;
        session.connectionId = 88L;
        session.durationMinutes = 60;
        session.scheduledDate = LocalDateTime.now().plusDays(1);
        session.status = MentorshipSession.SessionStatus.SCHEDULED;

        UpdateSessionDTO dto = new UpdateSessionDTO();
        dto.sessionId = 2L;
        dto.status = "NO_SHOW";
        dto.menteeMissed = true;
        dto.lastUpdateBy = 100L;

        MentorshipConnection connection = buildConnection(88L, 100L, 200L);

        when(sessionRepository.findById(2L)).thenReturn(Optional.of(session));
        when(sessionRepository.save(any(MentorshipSession.class))).thenAnswer(inv -> inv.getArgument(0));
        when(connectionRepository.findByIdFull(88L)).thenReturn(Optional.of(connection));

        Result result = sessionService.update(dto);

        assertFalse(result.validationResult().hasErrors());

        ArgumentCaptor<GamificationEventRequest> eventCaptor = ArgumentCaptor.forClass(GamificationEventRequest.class);
        verify(gamificationService, times(2)).processEvent(eventCaptor.capture());

        List<GamificationEventRequest> events = eventCaptor.getAllValues();
        assertTrue(events.stream().anyMatch(e -> e.userId().equals(100L) && "NO_SHOW_WAITING_BONUS".equals(e.eventType())));
        assertTrue(events.stream().anyMatch(e -> e.userId().equals(200L) && "NO_SHOW_ABSENT".equals(e.eventType())));
    }

    private MentorshipConnection buildConnection(Long id, Long mentorUserId, Long menteeUserId)
    {
        User mentorUser = new User();
        mentorUser.id = mentorUserId;

        User menteeUser = new User();
        menteeUser.id = menteeUserId;

        Profile mentorProfile = new Profile();
        mentorProfile.id = 11L;
        mentorProfile.user = mentorUser;

        Profile menteeProfile = new Profile();
        menteeProfile.id = 22L;
        menteeProfile.user = menteeUser;

        MentorshipConnection connection = new MentorshipConnection();
        connection.id = id;
        connection.status = MentorshipConnection.ConnectionStatus.APPROVED;
        connection.mentor = mentorProfile;
        connection.mentee = menteeProfile;

        return connection;
    }
}
