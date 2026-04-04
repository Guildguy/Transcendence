package com.ft.trans.filter;

import com.ft.trans.service.JWTService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

/**
 * Filtro que valida o JWT em todas as requisições
 * 
 * Endpoints exclusos de validação:
 * - POST /login
 * - POST /login/google
 * - POST /users (registro)
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Set<String> ALLOWED_ORIGINS = Set.of(
        "http://localhost:5173",
        "http://0.0.0.0:5173",
        "http://127.0.0.1:5173"
    );

    @Autowired
    private JWTService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String requestPath = request.getRequestURI();
        String method = request.getMethod();

        applyCorsHeaders(request, response);

        // Permite requisições OPTIONS (CORS preflight)
        if ("OPTIONS".equals(method)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Endpoints que não precisam de autenticação
        if ((requestPath.equals("/login") && "POST".equals(method)) ||
            (requestPath.equals("/login/google") && "POST".equals(method)) ||
            (requestPath.equals("/users") && "POST".equals(method))) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // Extrai o token do header Authorization
            String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
            
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                writeUnauthorized(response, "Missing or invalid Authorization header");
                return;
            }

            // Remove "Bearer " do header
            String token = authHeader.substring(7);

            // Valida o token
            if (!jwtService.validateToken(token)) {
                writeUnauthorized(response, "Invalid or expired token");
                return;
            }

            // Token válido, requisição pode prosseguir
            filterChain.doFilter(request, response);

        } catch (Exception e) {
            writeUnauthorized(response, "Authentication failed");
        }
    }

    private void applyCorsHeaders(HttpServletRequest request, HttpServletResponse response)
    {
        String origin = request.getHeader(HttpHeaders.ORIGIN);

        if (origin != null && ALLOWED_ORIGINS.contains(origin)) {
            response.setHeader("Access-Control-Allow-Origin", origin);
            response.setHeader("Vary", "Origin");
            response.setHeader("Access-Control-Allow-Credentials", "true");
        }

        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
        String requestedHeaders = request.getHeader("Access-Control-Request-Headers");
        if (requestedHeaders != null && !requestedHeaders.isBlank())
            response.setHeader("Access-Control-Allow-Headers", requestedHeaders);
        else
            response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
        response.setHeader("Access-Control-Expose-Headers", "Authorization, Content-Type");
    }

    private void writeUnauthorized(HttpServletResponse response, String message) throws IOException
    {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType("application/json");
        response.getWriter().write("{\"error\": \"" + message + "\"}");
    }
}
