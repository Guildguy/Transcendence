package com.ft.trans.dto;

import com.ft.trans.entity.Profile;

public class UpdateProfileDTO {
    public Long			profile_id;
	public Long			user_id;
	public String		avatarUrl;
	public String		position;
	public String		bio;
	public String   	role;
	public Long			xp;
	public Integer		level;
	public String		linkedin;
	public String		github;
	public String		instagram;
	public Integer		anosExperiencia;

    public Profile		toProfile()
	{
		Profile	profile = new Profile();

		profile.id = this.profile_id;
		profile.avatarUrl = this.avatarUrl;
		profile.position = this.position;
		profile.bio = this.bio;
	  	profile.setRole(this.role);
		profile.xp = this.xp;
		profile.level = this.level;
		profile.linkedin = this.linkedin;
		profile.github = this.github;
		profile.instagram = this.instagram;
		profile.anosExperiencia = this.anosExperiencia;

		return profile;
	}
}
