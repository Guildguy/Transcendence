package com.ft.trans.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.ft.trans.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User>  findByEmail(String email);
    Optional<User>  findByPhoneNumber(String phone_number);

    @Query(value = "SELECT id FROM users ORDER BY id ASC LIMIT 1", nativeQuery = true)
    Long findFirstUserId();
}
