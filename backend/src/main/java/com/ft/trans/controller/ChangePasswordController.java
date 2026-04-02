package com.ft.trans.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ft.trans.dto.ChangePasswordDTO;
import com.ft.trans.service.UserService;
import com.ft.trans.validation.Result;

import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;


@RestController
@RequestMapping("/change-password")
public class ChangePasswordController {
    private UserService userService;

    ChangePasswordController(UserService us) {
        this.userService = us;
    }

    @PutMapping
    public ResponseEntity<?> putMethodName(@RequestBody ChangePasswordDTO changePasswordDTO) {
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
}
