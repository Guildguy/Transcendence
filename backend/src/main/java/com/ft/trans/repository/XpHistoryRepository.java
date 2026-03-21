package com.ft.trans.repository;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;

import com.ft.trans.entity.XpHistory;

public interface XpHistoryRepository extends JpaRepository<XpHistory, Long>
{
	long countByUserIdAndReason(Long userId, String reason);

	List<XpHistory> findTop10ByUserIdOrderByIdDesc(Long userId);

	@Query("SELECT COALESCE(SUM(x.xp), 0) FROM XpHistory x WHERE x.userId = :userId")
	Integer sumXpByUserId(Long userId);
}