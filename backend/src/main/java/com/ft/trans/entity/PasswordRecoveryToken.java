package com.ft.trans.entity;

import java.time.LocalDateTime;
import jakarta.persistence.Entity;
import jakarta.persistence.GenerationType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;

@Entity
public class PasswordRecoveryToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    public String token;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private LocalDateTime expiryDate;

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryDate);
    }

    public User getUser() {
        return this.user;
    }

    public PasswordRecoveryToken() {}

    public PasswordRecoveryToken(User user) {
        this.user = user;
        this.token = java.util.UUID.randomUUID().toString();
        this.expiryDate = LocalDateTime.now().plusHours(1); // Token válido por 1 hora
    }
}
