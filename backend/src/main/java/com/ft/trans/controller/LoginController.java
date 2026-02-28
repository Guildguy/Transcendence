package com.ft.trans.controller;


import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import com.ft.trans.service.PasswordService;
import com.ft.trans.service.JWTService;
import com.ft.trans.repository.UserRepository;
import com.ft.trans.entity.User;
import com.ft.trans.entity.LoginRequest;

@RestController
@RequestMapping
public class LoginController
{
    private PasswordService passwordService;
    private UserRepository  userRepository;
	private JWTService		jwtService;

    LoginController(PasswordService ps, UserRepository ur, JWTService jwts)
    {
        this.passwordService = ps;
        this.userRepository = ur;
		this.jwtService = jwts;
    }

    @PostMapping("/login")
    public ResponseEntity<?>    login(@RequestBody LoginRequest login)
    {
        User    user = userRepository.findByEmail(login.email())
			.orElseThrow(() -> new RuntimeExecption("User not found")); /// alterar isso para devolver um ResponseEntity

		if (passwordService.matches(login.password(), user.password))
		{
			String	token = jwtService.generateToken(user.email);
			return ResponseEntity.ok(new LoginResponse(token));
		}
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }


}