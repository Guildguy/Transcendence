package com.ft.trans.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ft.trans.entity.PasswordRecoveryToken;

public interface PasswordRecoveryTokenRepository extends JpaRepository<PasswordRecoveryToken, Long>{
    Optional<PasswordRecoveryToken> findByToken(String token);
    Optional<PasswordRecoveryToken> findByUserId(Long userId);
}
