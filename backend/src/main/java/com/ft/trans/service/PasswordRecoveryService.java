package com.ft.trans.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import com.ft.trans.entity.PasswordRecoveryToken;
import com.ft.trans.entity.User;
import com.ft.trans.repository.PasswordRecoveryTokenRepository;
import com.ft.trans.repository.UserRepository;
import com.ft.trans.dto.PasswordRecoveryDTO;
import com.ft.trans.validation.Result;

@Service
public class PasswordRecoveryService {

	@Autowired(required = false)
	private JavaMailSender mailSender;

    private UserRepository userRepository;
    private PasswordRecoveryTokenRepository passwordRecoveryTokenRepository;

    public PasswordRecoveryService(UserRepository userRepository, PasswordRecoveryTokenRepository passwordRecoveryTokenRepository) {
        this.userRepository = userRepository;
        this.passwordRecoveryTokenRepository = passwordRecoveryTokenRepository;
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }


    public Result recoverPassword(PasswordRecoveryDTO passwordRecoveryDTO) {
		User user = findUserByEmail(passwordRecoveryDTO.email);

		if (user == null) {
			return new Result(null, null); // Retorna sucesso, sem revelar se o email existe ou não
		}

		PasswordRecoveryToken token = passwordRecoveryTokenRepository.findByUserId(user.id).orElse(null);

		if (token != null) {
			passwordRecoveryTokenRepository.delete(token);
		}

		token = new PasswordRecoveryToken(user);
		passwordRecoveryTokenRepository.save(token);

		this.sendRecoveryEmail(user.email, token.token);

		return new Result(null, null); // Retorna sucesso, sem revelar se o email existe ou não
	}

	private void sendRecoveryEmail(String email, String token) {
		if (mailSender == null) {
			System.out.println("⚠️  JavaMailSender não configurado. Email não será enviado.");
			System.out.println("Token de recuperação: " + token);
			System.out.println("Configure as variáveis: SPRING_MAIL_USERNAME e SPRING_MAIL_PASSWORD");
			return;
		}

		SimpleMailMessage message = new SimpleMailMessage();

		message.setTo(email);
		message.setSubject("Recuperação de Senha");
		message.setText("Clique no link para resetar sua senha: " + "http://localhost:5173/reset-password?token=" + token);

		mailSender.send(message);
	}

	public PasswordRecoveryToken findByToken(String token) {
		return passwordRecoveryTokenRepository.findByToken(token).orElse(null);
	}
	
	public void delete(PasswordRecoveryToken token) {
		passwordRecoveryTokenRepository.delete(token);
	}
}
