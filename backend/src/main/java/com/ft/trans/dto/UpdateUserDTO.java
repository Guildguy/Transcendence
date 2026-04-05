package com.ft.trans.dto;

import com.ft.trans.entity.User;

public class UpdateUserDTO {
	public Long id;
	public String name;
	public String email;
	public String phoneNumber;

	public User toUser() {
		User user = new User();
		user.id = this.id;
		user.name = this.name;
		user.email = this.email;
		user.phoneNumber = this.phoneNumber;
		return user;
	}
}

