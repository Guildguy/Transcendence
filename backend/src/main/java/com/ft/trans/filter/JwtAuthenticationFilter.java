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

/**
 * Filtro que valida o JWT em todas as requisições
 * 
 * Endpoints exclusos de validação:
 * - POST /login
 * - POST /users (registro)
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JWTService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String requestPath = request.getRequestURI();
        String method = request.getMethod();

        // Endpoints que não precisam de autenticação
        if ((requestPath.equals("/login") && "POST".equals(method)) ||
            (requestPath.equals("/users") && "POST".equals(method))) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // Extrai o token do header Authorization
            String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
            
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                // Token não fornecido
                response.setStatus(HttpStatus.UNAUTHORIZED.value());
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"Missing or invalid Authorization header\"}");
                return;
            }

            // Remove "Bearer " do header
            String token = authHeader.substring(7);

            // Valida o token
            if (!jwtService.validateToken(token)) {
                response.setStatus(HttpStatus.UNAUTHORIZED.value());
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"Invalid or expired token\"}");
                return;
            }

            // Token válido, requisição pode prosseguir
            filterChain.doFilter(request, response);

        } catch (Exception e) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Authentication failed: " + e.getMessage() + "\"}");
        }
    }
}
