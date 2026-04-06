package com.ft.trans.dto;

import java.sql.Timestamp;

public class MessageDTO {
    public Long    senderId;
    public Long    receiverId;
    public String  content;
    public Boolean isRead;
    public Timestamp createdAt;
    public Long    createdBy;
    public Timestamp lastUpdateAt;
    public Long    lastUpdateBy;
}