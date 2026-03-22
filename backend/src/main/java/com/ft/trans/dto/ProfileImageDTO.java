package com.ft.trans.dto;

public class ProfileImageDTO {
    public Long profileId;
    public String imageBase64;
    public String imageFileName;
    
    public ProfileImageDTO() {}
    
    public ProfileImageDTO(Long profileId, String imageBase64, String imageFileName) {
        this.profileId = profileId;
        this.imageBase64 = imageBase64;
        this.imageFileName = imageFileName;
    }
}
