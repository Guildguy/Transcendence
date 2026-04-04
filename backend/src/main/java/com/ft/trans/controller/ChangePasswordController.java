package com.ft.trans.controller;

import com.ft.trans.service.PasswordRecoveryService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ft.trans.dto.ChangePasswordDTO;
import com.ft.trans.dto.PasswordRecoveryDTO;
import com.ft.trans.dto.ResetPasswordDTO;
import com.ft.trans.service.UserService;
import com.ft.trans.validation.Result;

import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;


@RestController
@RequestMapping("/change-password")
public class ChangePasswordController {
    private PasswordRecoveryService passwordRecoveryService;
    private UserService userService;

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

    @PostMapping
    public ResponseEntity<?> recoverPassword(@RequestBody PasswordRecoveryDTO passwordRecoveryDTO) {
        
        Result result = this.passwordRecoveryService.recoverPassword(passwordRecoveryDTO);

		return ResponseEntity
            .status(HttpStatus.OK)
            .body(result.entity());
    }

    @PutMapping("/reset-password")
    public ResponseEntity<?> putMethodName(@RequestBody ResetPasswordDTO resetPasswordDTO) {


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
    
}
