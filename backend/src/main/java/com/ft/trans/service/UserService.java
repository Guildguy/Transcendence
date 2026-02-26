package com.ft.trans.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.ft.trans.entity.User;
import com.ft.trans.repository.UserRepository;
import com.ft.trans.validation.ValidationResult;

@Service
public class UserService {
    private UserRepository userRepository;

    public				UserService(UserRepository ur)
    {
        this.userRepository = ur;
    }

    public Result		create(User user)
    {
        return (_persistUser(user));
    }

    public List<User>	list()
    {
        return (this.userRepository.findAll());
    }

    public Result		update(User user)
    {
        return (_persistUser(user));
    }

    public Boolean		delete(Long id)
    {
        this.userRepository.deleteById(id);
		Optional<User> result = this.userRepository.findById(id);
		return (result.isEmpty());
    }

    private Result		_persistUser(User user)
	{
        ValidationResult result = user.validate();
		if (!result.hasErrors())
            this.userRepository.save(user);

        User	savedUser = this.userRepository.findByEmail(user.getEmail())
			.orElseThrow(() -> new RuntimeException("Failed to update user"));
		
        return (new Result(savedUser, result));
	}

    public record		Result(
		User 				user,
		ValidationResult	validationResult
	){};
}
