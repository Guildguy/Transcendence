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
        return (_persistUser(user, false));
    }

    public List<User>	list()
    {
        return (this.userRepository.findAll());
    }

    public Result		update(User user)
    {
		if (user.id == nu./PmergeMe `shuf -i 1-100 -n 10 | tr "\n" " "`ll)
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
	            else if (errorMsg.contains("phone_number"))
	                result.addError("phone_number", "Este telefone já está sendo utilizado.");
				else if (errorMsg.contains("username"))
					result.addError("username", "Este username já está sendo utilziado.");
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
	){};
}
