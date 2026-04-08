package com.ft.trans.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;

import com.ft.trans.dto.ProfileImageDTO;
import com.ft.trans.dto.UpdateProfileDTO;
import com.ft.trans.entity.Profile;
import com.ft.trans.service.ProfileService;
import com.ft.trans.validation.Result;

import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/profiles")
public class ProfileController {
    private ProfileService profileService;

    ProfileController (ProfileService ps)
    {
        this.profileService = ps;
    }

    @GetMapping
    public List<Profile>		list()
	{
		return (this.profileService.list());
	}

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        Profile profile = this.profileService.findById(id);
        if (profile == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok(profile);
    }

    @PutMapping
    public ResponseEntity<?> putProfile(@RequestBody UpdateProfileDTO profile) {
        Result result = this.profileService.update(profile);

		if (result.validationResult().hasErrors())
		{
			return ResponseEntity
				.status(HttpStatus.UNPROCESSABLE_CONTENT)
				.body(result.validationResult().getErrors());
		}
		return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(result.entity());
    }

    @PostMapping("/image")
    public ResponseEntity<?> uploadProfileImage(@RequestBody ProfileImageDTO imageDTO) {
        Result result = this.profileService.saveProfileImage(imageDTO);

        if (result.validationResult().hasErrors())
        {
            return ResponseEntity
                .status(HttpStatus.UNPROCESSABLE_CONTENT)
                .body(result.validationResult().getErrors());
        }
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(result.entity());
    }

    @GetMapping("/image/{profileId}")
    public ResponseEntity<?> getProfileImage(@PathVariable Long profileId) {
        Result result = this.profileService.getProfileImage(profileId);

        if (result.validationResult().hasErrors())
        {
            return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(result.validationResult().getErrors());
        }
        return ResponseEntity
            .status(HttpStatus.OK)
            .body(result.entity());
    }
}
