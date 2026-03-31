package com.ft.trans.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import com.ft.trans.dto.UserDTO;
import com.ft.trans.dto.UserProfilesDTO;
import com.ft.trans.entity.LoginRequest;
import com.ft.trans.entity.Profile;
import com.ft.trans.entity.User;
import com.ft.trans.repository.UserRepository;
import com.ft.trans.repository.ProfileRepository;
import com.ft.trans.validation.Result;
import com.ft.trans.validation.ValidationResult;

@Service
public class UserService {
    private UserRepository		userRepository;
	private ProfileService		profileService;
	private ProfileRepository	profileRepository;
	
	@Autowired
	private JWTService			jwtService;

    public				UserService(UserRepository ur, ProfileRepository pr, ProfileService ps)
    {
        this.userRepository = ur;
		this.profileRepository = pr;
		this.profileService = ps;
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

		result.consume(profileService._persistProfile(profile));
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

    public Result		update(User userToUpdate)
    {
		User existingUser = userRepository.findById(userToUpdate.id).orElse(null);

		if (existingUser == null)
		{
			ValidationResult result = new ValidationResult();
			result.addError("id", "Usuário não encontrado para o id fornecido");
			return new Result(userToUpdate, result);
		}

		existingUser.name = userToUpdate.name;
		existingUser.email = userToUpdate.email;
		existingUser.phoneNumber = userToUpdate.phoneNumber;

        return (_persistUser(existingUser, true));
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
	    ValidationResult result = new ValidationResult();
		
		if (!isUpdate)
			result = user.validate();

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
	                result.addError("global", "Erro de integridade: um registro duplicado foi detectado." + errorMsg);
	        } catch (Exception e) {
	            result.addError("global", "Ocorreu um erro interno ao salvar o usuário.");
	        }
    	}
    	return new Result(savedUser, result);
	}

	public UserProfilesDTO	getUserProfiles(long user_id)
	{
		UserProfilesDTO dto = new UserProfilesDTO();

		dto.user = userRepository.findById(user_id)
			.orElse(null);
		dto.profiles = profileRepository.findByUserId(user_id);

		return dto;
	}

	/**
	 * Busca um usuário por email ou cria um novo se não existir
	 * Usado para autenticação com Google
	 */
	public User findOrCreateByEmail(String email)
	{
		Optional<User> existingUser = userRepository.findByEmail(email);
		
		if (existingUser.isPresent()) {
			return existingUser.get();
		}

		// Criar novo usuário
		User newUser = new User();
		newUser.email = email;
		newUser.name = email.split("@")[0]; // Usar parte do email como nome inicial
		newUser.phoneNumber = ""; // Será preenchido depois
		newUser.status = true;
		newUser.password = generateRandomPassword(); // Senha aleatória
		newUser.encodePassword();

		User savedUser = userRepository.save(newUser);

		// Criar um perfil padrão para o novo usuário
		if (savedUser != null) {
			Profile profile = new Profile();
			profile.user = savedUser;
			profile.setRole("MENTORADO"); // Role padrão
			profileService._persistProfile(profile);
		}

		return savedUser;
	}

	/**
	 * Gera um token JWT para um usuário
	 */
	public String generateTokenForUser(User user)
	{
		if (jwtService != null && user != null) {
			return jwtService.generateToken(user.email);
		}
		return null;
	}

	/**
	 * Gera uma senha aleatória para usuários criados via OAuth
	 */
	private String generateRandomPassword()
	{
		String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$";
		StringBuilder password = new StringBuilder();
		for (int i = 0; i < 16; i++) {
			password.append(chars.charAt((int) (Math.random() * chars.length())));
		}
		return password.toString();
	}
}
