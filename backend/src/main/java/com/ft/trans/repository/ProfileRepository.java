package com.ft.trans.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ft.trans.entity.Profile;
import com.ft.trans.entity.Profile.ProfileType;

public interface ProfileRepository extends JpaRepository<Profile, Long>{
    List<Profile>       findByUserId(Long user_id);
    Optional<Profile>   findByUserIdAndRole(Long userId, ProfileType role);
}
