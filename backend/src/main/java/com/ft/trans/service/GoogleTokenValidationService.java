package com.ft.trans.service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;
import com.google.gson.JsonObject;

@Service
public class GoogleTokenValidationService {

    private static final String GOOGLE_TOKEN_INFO_URL = "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=";

    /**
     * Valida o token do Google e retorna as informações do usuário
     */
    public GoogleUserInfo validateAndGetUserInfo(String accessToken) {
        try {
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(GOOGLE_TOKEN_INFO_URL + accessToken))
                    .GET()
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                return null; // Token inválido
            }

            JsonElement element = JsonParser.parseString(response.body());
            JsonObject json = element.getAsJsonObject();

            // Verificar se o token expirou
            if (json.has("expires_in")) {
                int expiresIn = json.get("expires_in").getAsInt();
                if (expiresIn <= 0) {
                    return null; // Token expirado
                }
            }

            // Extrair informações do usuário
            String email = json.has("email") ? json.get("email").getAsString() : null;
            String userIdGoogle = json.has("user_id") ? json.get("user_id").getAsString() : null;

            if (email == null) {
                return null;
            }

            return new GoogleUserInfo(email, userIdGoogle);

        } catch (IOException | InterruptedException e) {
            System.err.println("Erro ao validar token Google: " + e.getMessage());
            return null;
        }
    }

    /**
     * Classe para armazenar as informações do usuário do Google
     */
    public static class GoogleUserInfo {
        public String email;
        public String googleUserId;

        public GoogleUserInfo(String email, String googleUserId) {
            this.email = email;
            this.googleUserId = googleUserId;
        }
    }
}
