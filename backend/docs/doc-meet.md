Para a arquitetura em Java, a abordagem mais sólida é isolar essa lógica em um Service dedicado dentro do seu projeto Spring Boot. Isso mantém o seu controller limpo e a responsabilidade de comunicação com o Google isolada.

Como estamos lidando com o Refresh Token (OAuth 2.0), não precisamos baixar bibliotecas obsoletas. Vamos usar a biblioteca de autenticação moderna do Google.

Aqui está o mapa de implementação direto ao ponto.

1. As Dependências (no pom.xml)
Adicione estas três bibliotecas oficiais do Google para lidar com a API, a autenticação e o formato JSON:

XML
<dependency>
    <groupId>com.google.api-client</groupId>
    <artifactId>google-api-client</artifactId>
    <version>2.2.0</version>
</dependency>
<dependency>
    <groupId>com.google.auth</groupId>
    <artifactId>google-auth-library-oauth2-http</artifactId>
    <version>1.19.0</version>
</dependency>
<dependency>
    <groupId>com.google.apis</groupId>
    <artifactId>google-api-services-calendar</artifactId>
    <version>v3-rev20230523-2.0.0</version>
</dependency>
2. A Classe de Serviço (MeetService.java)
Crie este arquivo no seu pacote de service. Note que injetamos as variáveis de ambiente (que devem estar no seu application.yml ou .env) usando o @Value.

Java
package com.ft.trans.service;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.*;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.UserCredentials;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.UUID;

@Service
public class MeetService {

    @Value("${google.client.id}")
    private String clientId;

    @Value("${google.client.secret}")
    private String clientSecret;

    @Value("${google.refresh.token}")
    private String refreshToken;

    public String createMeetSession(String mentorEmail, String menteeEmail, String summary) throws Exception {
        // 1. Constrói as credenciais usando o Refresh Token (nunca expira)
        UserCredentials credentials = UserCredentials.newBuilder()
                .setClientId(clientId)
                .setClientSecret(clientSecret)
                .setRefreshToken(refreshToken)
                .build();

        // 2. Inicializa o serviço do Google Calendar
        Calendar service = new Calendar.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                GsonFactory.getDefaultInstance(),
                new HttpCredentialsAdapter(credentials))
                .setApplicationName("Plataforma ft_bridge")
                .build();

        // 3. Monta o Evento
        Event event = new Event()
                .setSummary(summary)
                .setDescription("Sessão de mentoria gerada automaticamente pela plataforma ft_bridge.");

        // Define horários (Exemplo: Cria um evento para agora com 1 hora de duração)
        DateTime now = new DateTime(System.currentTimeMillis());
        DateTime inOneHour = new DateTime(System.currentTimeMillis() + 3600000);
        event.setStart(new EventDateTime().setDateTime(now).setTimeZone("America/Sao_Paulo"));
        event.setEnd(new EventDateTime().setDateTime(inOneHour).setTimeZone("America/Sao_Paulo"));

        // 4. ESTRATÉGIA CHAVE: Adiciona os convidados para pular a sala de espera
        EventAttendee[] attendees = new EventAttendee[] {
            new EventAttendee().setEmail(mentorEmail),
            new EventAttendee().setEmail(menteeEmail)
        };
        event.setAttendees(Arrays.asList(attendees));

        // 5. ESTRATÉGIA CHAVE: Exige a criação do link do Google Meet
        CreateConferenceRequest conferenceRequest = new CreateConferenceRequest()
                .setRequestId(UUID.randomUUID().toString()) // ID único obrigatório
                .setConferenceSolutionKey(new ConferenceSolutionKey().setType("hangoutsMeet"));
        
        event.setConferenceData(new ConferenceData().setCreateRequest(conferenceRequest));

        // 6. Executa a requisição no Google (conferenceDataVersion=1 é o que gera o link)
        Event createdEvent = service.events().insert("primary", event)
                .setConferenceDataVersion(1)
                .execute();

        // Retorna a URL do Meet pronta para uso
        return createdEvent.getHangoutLink();
    }
}