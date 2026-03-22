package com.ft.trans.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ft.trans.entity.Level;

public interface LevelRepository extends JpaRepository<Level, Long>
{
    Level findByLevel(Integer level);
    Level findTopByXpRequiredLessThanEqualOrderByXpRequiredDesc(Integer xp);
    Level findTopByXpRequiredGreaterThanOrderByXpRequiredAsc(Integer xp);
}