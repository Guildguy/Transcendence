package com.ft.trans.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;

import com.ft.trans.dto.ChangePasswordDTO;
import com.ft.trans.dto.ResetPasswordDTO;
import com.ft.trans.service.UserService;
import com.ft.trans.service.PasswordRecoveryService;
import com.ft.trans.validation.Result;
import com.ft.trans.entity.PasswordRecoveryToken;

import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;


@RestController
@RequestMapping("/change-password")
public class ChangePasswordController {
    private UserService userService;
    private PasswordRecoveryService passwordRecoveryService;

    ChangePasswordController(UserService us, PasswordRecoveryService prs) {
        this.userService = us;
        this.passwordRecoveryService = prs;
    }

    @PutMapping
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordDTO changePasswordDTO) {
        Result result = this.userService.changePassword(changePasswordDTO);

        if (result.validationResult().hasErrors())  
		{
			return ResponseEntity
				.status(HttpStatus.UNPROCESSABLE_CONTENT)
				.body(result.validationResult().getErrors());
		}
		return ResponseEntity
            .status(HttpStatus.OK)
            .body(result.entity());
    }

    @PutMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordDTO resetPasswordDTO) {
        // Validar token antes de resetar a senha
        PasswordRecoveryToken token = passwordRecoveryService.findByToken(resetPasswordDTO.token);
        
        if (token == null || token.isExpired()) {
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new java.util.HashMap<String, String>() {{
                    put("message", "Token expirado ou inválido");
                }});
        }

        Result result = this.userService.changePassword(resetPasswordDTO);

        if (result.validationResult().hasErrors())  
		{
			return ResponseEntity
				.status(HttpStatus.UNPROCESSABLE_CONTENT)
				.body(result.validationResult().getErrors());
		}
		
		return ResponseEntity
            .status(HttpStatus.OK)
            .body(result.entity());
    }
    
    @PostMapping("/validate-token")
    public ResponseEntity<?> validateToken(@RequestBody java.util.HashMap<String, String> request) {
        String tokenValue = request.get("token");
        
        if (tokenValue == null || tokenValue.isEmpty()) {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new java.util.HashMap<String, String>() {{
                    put("message", "Token não fornecido");
                }});
        }
        
        PasswordRecoveryToken token = passwordRecoveryService.findByToken(tokenValue);
        
        if (token == null) {
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new java.util.HashMap<String, String>() {{
                    put("message", "Token inválido");
                }});
        }
        
        if (token.isExpired()) {
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new java.util.HashMap<String, String>() {{
                    put("message", "Token expirado");
                }});
        }
        
        return ResponseEntity
            .status(HttpStatus.OK)
            .body(new java.util.HashMap<String, String>() {{
                put("message", "Token válido");
            }});
    }
    
}
