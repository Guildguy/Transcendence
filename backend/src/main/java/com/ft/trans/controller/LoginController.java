package com.ft.trans.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;

import com.ft.trans.entity.User;
import com.ft.trans.entity.LoginRequest;
import com.ft.trans.entity.GoogleLoginRequest;
import com.ft.trans.entity.LoginResponse;
import com.ft.trans.service.UserService;
import com.ft.trans.service.GoogleTokenValidationService;
import com.ft.trans.entity.Profile;

@RestController
@RequestMapping
public class LoginController
{
    private UserService userService;
    
    @Autowired
    private GoogleTokenValidationService googleTokenValidationService;

    LoginController(UserService us)
    {
        this.userService = us;
    }

    @PostMapping("/login")
    public ResponseEntity<?>    login(@RequestBody LoginRequest login)
    {
        User    user = userService.findLogin(login);
		String	token = login.getToken(user);
        if (token != null)
			return ResponseEntity.ok(new LoginResponse(token, "Bearer", 86400000L, user.id));
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @PostMapping("/login/google")
    public ResponseEntity<?> loginGoogle(@RequestBody GoogleLoginRequest googleLoginRequest)
    {
        // Validar o token do Google
        GoogleTokenValidationService.GoogleUserInfo userInfo = 
            googleTokenValidationService.validateAndGetUserInfo(googleLoginRequest.token);
        
        if (userInfo == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new java.util.HashMap<String, String>() {{
                        put("message", "Token do Google inválido ou expirado");
                    }});
        }

        try {
            // Buscar ou criar usuário
            User user = userService.findOrCreateByEmail(userInfo.email);
            
            if (user == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new java.util.HashMap<String, String>() {{
                            put("message", "Erro ao criar usuário");
                        }});
            }

            // Gerar JWT
            String token = userService.generateTokenForUser(user);
            
            return ResponseEntity.ok(new LoginResponse(token, "Bearer", 86400000L, user.id));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new java.util.HashMap<String, String>() {{
                        put("message", "Erro ao processar login: " + e.getMessage());
                    }});
        }
    }
}