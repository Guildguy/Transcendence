package com.ft.trans.entity;

public class LoginResponse
{
    public String  token;
    public String  type;
    public Long    expiresIn;
    public Long    user_id;
    
    public LoginResponse(String tk, String tp, Long expires, Long user_id)
    {
        this.token = tk;
        this.type = tp;
        this.expiresIn = expires;
        this.user_id = user_id;
    }
}
