package com.ft.trans.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import com.ft.trans.entity.User;
import com.ft.trans.service.UserService;

@RestController
@RequestMapping("/users")
public class UserController
{
    private UserService userService;

    public UserController(UserService us)
    {
        this.userService = us;
    }

	@PostMapping
    public ResponseEntity<?>	create(@RequestBody User user)
	{
		UserService.Result result = this.userService.create(user);

		if (result.validationResult().hasErrors())
		{
			return ResponseEntity
				.status(HttpStatus.UNPROCESSABLE_CONTENT)
				.body(result.validationResult().getErrors());
		}
		return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(result.user());
	}

	@GetMapping
    public List<User>		list()
	{
		return (this.userService.list());
	}

	@PutMapping
    public ResponseEntity<?>		update(@RequestBody User user)
	{
		UserService.Result result = this.userService.update(user);

		if (result.validationResult().hasErrors())
		{
			return ResponseEntity
				.status(HttpStatus.UNPROCESSABLE_CONTENT)
				.body(result.validationResult().getErrors());
		}
		return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(result.user());
	}

	@DeleteMapping("{id}")
    public Boolean	delete(@PathVariable("id") Long id)
	{
		return (this.userService.delete(id));
	}
}
