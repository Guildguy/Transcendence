package com.ft.trans.repository;

import com.ft.trans.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;


public interface ProfileRepository extends JpaRepository<Profile, Long>{
    
}
