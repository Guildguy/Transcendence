package com.ft.trans.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ft.trans.controller.dto.GamificationEventRequest;
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
        connection.mentor = mentorProfile;
        connection.mentee = menteeProfile;

        return connection;
    }
}
