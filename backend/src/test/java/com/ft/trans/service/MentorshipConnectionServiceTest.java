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
import com.ft.trans.entity.MentorshipConnection;
import com.ft.trans.entity.MentorshipCount;
import com.ft.trans.entity.MentorshipSession.SessionStatus;
import com.ft.trans.entity.Profile;
import com.ft.trans.entity.User;
import com.ft.trans.repository.LimitMenteeRepository;
import com.ft.trans.repository.MentorshipConnectionRepository;
import com.ft.trans.repository.MentorshipCountRepository;
import com.ft.trans.repository.MentorshipSessionRepository;
import com.ft.trans.repository.ProfileRepository;
import com.ft.trans.repository.UserRepository;
import com.ft.trans.validation.Result;

@ExtendWith(MockitoExtension.class)
public class MentorshipConnectionServiceTest
{
    @Mock
    private MentorshipConnectionRepository connectionRepository;

    @Mock
    private MentorshipCountRepository countRepository;

    @Mock
    private LimitMenteeRepository limitMenteeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProfileRepository profileRepository;

    @Mock
    private MentorshipSessionRepository sessionRepository;

    @Mock
    private GamificationService gamificationService;

    @InjectMocks
    private MentorshipConnectionService connectionService;

    @Test
    void shouldTriggerMatchAcceptedForBothUsersWhenConnectionIsAccepted()
    {
        MentorshipConnection connection = buildConnection(7L, 100L, 10L, 200L, 20L, MentorshipConnection.ConnectionStatus.PENDING);

        Profile fullMentorProfile = new Profile();
        fullMentorProfile.id = 100L;
        User mentorUser = new User();
        mentorUser.id = 10L;
        fullMentorProfile.user = mentorUser;

        when(connectionRepository.findByIdFull(7L)).thenReturn(Optional.of(connection));
        when(profileRepository.findByIdWithUser(100L)).thenReturn(Optional.of(fullMentorProfile));
        when(countRepository.countByMentorProfileIdAndStatus(100L, "APROVADO")).thenReturn(0L);
        when(limitMenteeRepository.findByMentor_Id(100L)).thenReturn(Optional.empty());
        when(connectionRepository.save(any(MentorshipConnection.class))).thenAnswer(inv -> inv.getArgument(0));
        when(countRepository.save(any(MentorshipCount.class))).thenAnswer(inv -> inv.getArgument(0));

        Result result = connectionService.acceptConnection(7L, 10L);

        assertFalse(result.validationResult().hasErrors());

        ArgumentCaptor<GamificationEventRequest> eventCaptor = ArgumentCaptor.forClass(GamificationEventRequest.class);
        verify(gamificationService, times(2)).processEvent(eventCaptor.capture());

        List<GamificationEventRequest> events = eventCaptor.getAllValues();
        assertTrue(events.stream().anyMatch(e -> e.userId().equals(10L) && "MATCH_ACCEPTED".equals(e.eventType())));
        assertTrue(events.stream().anyMatch(e -> e.userId().equals(20L) && "MATCH_ACCEPTED".equals(e.eventType())));
    }

    @Test
    void shouldTriggerCycleCompletedForBothUsersWhenEndingEligibleConnection()
    {
        MentorshipConnection connection = buildConnection(8L, 100L, 10L, 200L, 20L, MentorshipConnection.ConnectionStatus.APPROVED);

        MentorshipCount count = new MentorshipCount();
        count.connection = connection;

        when(connectionRepository.findByIdFull(8L)).thenReturn(Optional.of(connection));
        when(connectionRepository.save(any(MentorshipConnection.class))).thenAnswer(inv -> inv.getArgument(0));
        when(countRepository.findByConnection_Id(8L)).thenReturn(Optional.of(count));
        when(countRepository.save(any(MentorshipCount.class))).thenAnswer(inv -> inv.getArgument(0));
        when(sessionRepository.countByConnectionIdAndStatus(8L, SessionStatus.COMPLETED)).thenReturn(2L);

        Result result = connectionService.endConnection(8L, 10L);

        assertFalse(result.validationResult().hasErrors());

        ArgumentCaptor<GamificationEventRequest> eventCaptor = ArgumentCaptor.forClass(GamificationEventRequest.class);
        verify(gamificationService, times(2)).processEvent(eventCaptor.capture());

        List<GamificationEventRequest> events = eventCaptor.getAllValues();
        assertTrue(events.stream().anyMatch(e -> e.userId().equals(10L) && "CYCLE_COMPLETED".equals(e.eventType())));
        assertTrue(events.stream().anyMatch(e -> e.userId().equals(20L) && "CYCLE_COMPLETED".equals(e.eventType())));
    }

    private MentorshipConnection buildConnection(
        Long connectionId,
        Long mentorProfileId,
        Long mentorUserId,
        Long menteeProfileId,
        Long menteeUserId,
        MentorshipConnection.ConnectionStatus status
    ) {
        User mentorUser = new User();
        mentorUser.id = mentorUserId;

        User menteeUser = new User();
        menteeUser.id = menteeUserId;

        Profile mentorProfile = new Profile();
        mentorProfile.id = mentorProfileId;
        mentorProfile.user = mentorUser;

        Profile menteeProfile = new Profile();
        menteeProfile.id = menteeProfileId;
        menteeProfile.user = menteeUser;

        MentorshipConnection connection = new MentorshipConnection();
        connection.id = connectionId;
        connection.mentor = mentorProfile;
        connection.mentee = menteeProfile;
        connection.status = status;
        connection.createdAt = LocalDateTime.now();
        connection.lastUpdateAt = LocalDateTime.now();

        return connection;
    }
}
