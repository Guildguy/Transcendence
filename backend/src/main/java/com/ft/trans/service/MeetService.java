package com.ft.trans.service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.ConferenceData;
import com.google.api.services.calendar.model.ConferenceSolutionKey;
import com.google.api.services.calendar.model.CreateConferenceRequest;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventAttendee;
import com.google.api.services.calendar.model.EventDateTime;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.UserCredentials;

@Service
public class MeetService
{
	private static final String TIMEZONE = "America/Sao_Paulo";

	@Value("${google.client.id}")
	private String clientId;

	@Value("${google.client.secret}")
	private String clientSecret;

	@Value("${google.refresh.token}")
	private String refreshToken;

	/**
	 * Creates a Google Calendar event with a Meet link.
	 * Returns the Meet URL, or null if creation fails (caller should fall back).
	 */
	public String createMeetSession(
		String mentorEmail,
		String menteeEmail,
		String summary,
		LocalDateTime scheduledDate,
		int durationMinutes
	) {
		try {
			UserCredentials credentials = UserCredentials.newBuilder()
				.setClientId(clientId)
				.setClientSecret(clientSecret)
				.setRefreshToken(refreshToken)
				.build();

			Calendar service = new Calendar.Builder(
				GoogleNetHttpTransport.newTrustedTransport(),
				GsonFactory.getDefaultInstance(),
				new HttpCredentialsAdapter(credentials))
				.setApplicationName("ft_bridge")
				.build();

			ZoneId zone = ZoneId.of(TIMEZONE);
			long startMillis = scheduledDate.atZone(zone).toInstant().toEpochMilli();
			long endMillis   = startMillis + (durationMinutes * 60_000L);

			Event event = new Event()
				.setSummary(summary)
				.setDescription("Sessão de mentoria gerada automaticamente pela plataforma ft_bridge.");

			event.setStart(new EventDateTime()
				.setDateTime(new DateTime(startMillis))
				.setTimeZone(TIMEZONE));
			event.setEnd(new EventDateTime()
				.setDateTime(new DateTime(endMillis))
				.setTimeZone(TIMEZONE));

			// Adding attendees allows them to join without waiting room approval
			event.setAttendees(Arrays.asList(
				new EventAttendee().setEmail(mentorEmail),
				new EventAttendee().setEmail(menteeEmail)
			));

			// Request Meet link generation (conferenceDataVersion=1 is required)
			event.setConferenceData(new ConferenceData()
				.setCreateRequest(new CreateConferenceRequest()
					.setRequestId(UUID.randomUUID().toString())
					.setConferenceSolutionKey(new ConferenceSolutionKey().setType("hangoutsMeet"))));

			Event created = service.events()
				.insert("primary", event)
				.setConferenceDataVersion(1)
				.execute();

			String link = created.getHangoutLink();
			System.out.println("[MeetService] Meet criado com sucesso: " + link);
			return link;

		} catch (Exception e) {
			System.err.println("[MeetService] Falha ao criar Google Meet: " + e.getMessage());
			return null;
		}
	}
}
