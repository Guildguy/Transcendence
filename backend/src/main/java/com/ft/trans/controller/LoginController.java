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
import org.springframework.web.bind.annotation.RequestParam;
import com.ft.trans.controller.dto.GamificationEventRequest;
import com.ft.trans.service.GamificationService;
import com.ft.trans.service.UserService;
import com.ft.trans.service.GoogleTokenValidationService;
import com.ft.trans.service.PasswordRecoveryService;
import com.ft.trans.dto.PasswordRecoveryDTO;

@RestController
@RequestMapping
public class LoginController
{
    private UserService userService;
    private PasswordRecoveryService passwordRecoveryService;
    private GamificationService gamificationService;
    
    @Autowired
    private GoogleTokenValidationService googleTokenValidationService;

    LoginController(UserService us, PasswordRecoveryService prs, GamificationService gs)
    {
        this.userService = us;
        this.passwordRecoveryService = prs;
        this.gamificationService = gs;
    }

    @PostMapping("/login")
    public ResponseEntity<?>    login(@RequestBody LoginRequest login)
    {
        User    user = userService.findLogin(login);
		String	token = login.getToken(user);
        if (token != null)
        {
            triggerDailyStreakCheckin(user);
			return ResponseEntity.ok(new LoginResponse(token, "Bearer", 86400000L, user.id));
        }
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @PostMapping("/login/google")
    public ResponseEntity<?> loginGoogle(@RequestBody GoogleLoginRequest googleLoginRequest, @RequestParam(name = "profileType", required = false) String profileType)
    {
        GoogleTokenValidationService.GoogleUserInfo userInfo = 
            googleTokenValidationService.validateAndGetUserInfo(googleLoginRequest.token);
        
        if (userInfo == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new java.util.HashMap<String, String>() {{
                        put("message", "Token do Google inválido ou expirado");
                    }});
        }

        try {
            User user = userService.findOrCreateByEmail(userInfo.email, profileType);
            
            if (user == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new java.util.HashMap<String, String>() {{
                            put("message", "Erro ao criar usuário");
                        }});
            }
            String token = userService.generateTokenForUser(user);

            triggerDailyStreakCheckin(user);
            
            return ResponseEntity.ok(new LoginResponse(token, "Bearer", 86400000L, user.id));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new java.util.HashMap<String, String>() {{
                        put("message", "Erro ao processar login: " + e.getMessage());
                    }});
        }
    }

    @PostMapping("/auth/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody PasswordRecoveryDTO passwordRecoveryDTO) {
        try {
            com.ft.trans.validation.Result result = this.passwordRecoveryService.recoverPassword(passwordRecoveryDTO);
            return ResponseEntity.status(HttpStatus.OK).body(result.entity());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new java.util.HashMap<String, String>() {{
                        put("message", "Erro ao processar recuperação de senha: " + e.getMessage());
                    }});
        }
    }

    private void triggerDailyStreakCheckin(User user)
    {
        try
        {
            if (user != null && user.id != null)
                gamificationService.processEvent(new GamificationEventRequest(user.id, "STREAK_CHECKIN"));
        }
        catch (Exception ignored)
        {
        }
    }
}