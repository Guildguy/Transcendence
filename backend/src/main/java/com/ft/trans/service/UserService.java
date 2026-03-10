package com.ft.trans.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.ft.trans.dto.UserDTO;
import com.ft.trans.entity.LoginRequest;
import com.ft.trans.entity.Profile;
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

    public Result		create(UserDTO userDTO)
    {
		User	user = userDTO.toUser();
		Result	result = _persistUser(user, false);
		if (result.validationResult().hasErrors())
			return result;
		Profile	profile = new Profile();
		profile.user = user;
		profile.setRole(userDTO.profileType);

		result.consume(_persistProfile(profile));
        return (result);
    }

	public List<User>	list()
    {
        return (this.userRepository.findAll());
    }

	public User			findLogin(LoginRequest login)
	{
		User	userFound = null;
		if (login.email.isEmpty())
			userFound = userRepository.findByPhoneNumber(login.phoneNumber).orElse(null);
		else
			userFound = userRepository.findByEmail(login.email).orElse(null);
		return userFound;
	}

    public Result		update(User user)
    {
		if (user.id == null)
		{
			ValidationResult result = new ValidationResult();
			result.addError("id", "Não foi possível alterar o usuário. Campo id está faltando");
			return new Result(user, result);
		}
        return (_persistUser(user, true));
    }

    public Boolean		delete(Long id)
    {
        this.userRepository.deleteById(id);
		Optional<User>	result = this.userRepository.findById(id);
		return (result.isEmpty());
    }

    private Result _persistUser(User user, Boolean isUpdate)
	{
	    User savedUser = null;
	    ValidationResult result = user.validate();

	    if (!result.hasErrors()) {
	        try {
	            user.status = true;
				if (!isUpdate)
	            	user.encodePassword();
	            savedUser = this.userRepository.save(user);
	        } catch (org.springframework.dao.DataIntegrityViolationException e) {
	            String errorMsg = e.getMostSpecificCause().getMessage();
			
	            if (errorMsg.contains("email"))
	                result.addError("email", "Este e-mail já está sendo utilizado.");
	            else if (errorMsg.contains("phoneNumber"))
	                result.addError("phoneNumber", "Este telefone já está sendo utilizado.");
	        	else
	                result.addError("global", "Erro de integridade: um registro duplicado foi detectado.");
	        } catch (Exception e) {
	            result.addError("global", "Ocorreu um erro interno ao salvar o usuário.");
	        }
    	}
    	return new Result(savedUser, result);
	}

    public record		Result(
		User 				user,
		ValidationResult	validationResult
	){

		public void	consume(Result other)
		{
			if (other.validationResult().hasErrors())
			{
				for (ValidationResult.DomainError error : other.validationResult().getErrors())
				{
					this.validationResult.addError(error.field(), error.message());
				}
			}
		}
	};
}
