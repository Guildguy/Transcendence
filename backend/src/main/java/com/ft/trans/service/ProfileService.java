package com.ft.trans.service;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import com.ft.trans.dto.ProfileImageDTO;
import com.ft.trans.dto.UpdateProfileDTO;
import com.ft.trans.entity.Profile;
import com.ft.trans.repository.ProfileRepository;
import com.ft.trans.repository.UserRepository;
import com.ft.trans.validation.Result;
import com.ft.trans.validation.ValidationResult;

@Service
public class ProfileService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final RestTemplate restTemplate;
    private static final String PYTHON_SERVICE_URL = "http://python-profile-service:8000";

    public ProfileService(ProfileRepository pr, UserRepository userRepository)
    {
        this.profileRepository = pr;
        this.userRepository = userRepository;
        this.restTemplate = new RestTemplate();
    }

	public List<Profile>	list()
    {
        return (this.profileRepository.findAll());
    }

    public Profile findById(Long id) {
        return this.profileRepository.findByIdWithUser(id).orElse(null);
    }

	public Result	update(UpdateProfileDTO profileDTO)
	{
		Profile profile = profileDTO.toProfile();
		profile.user = userRepository.findById(profileDTO.user_id).orElse(null);
		return _persistProfile(profile);
	}

    public Result	_persistProfile(Profile profile)
	{
	    Profile				savedProfile = null;
	    ValidationResult	result = profile.validate();

	    if (!result.hasErrors()) {
	        try {
	            savedProfile = this.profileRepository.save(profile);
	        } catch (org.springframework.dao.DataIntegrityViolationException e) {
	            String errorMsg = e.getMostSpecificCause().getMessage();
				result.addError("Profile", errorMsg);
	        } catch (Exception e) {
	            result.addError("global", "Ocorreu um erro interno ao salvar o Perfil.");
	        }
    	}
    	return new Result(savedProfile, result);
	}

	public Result saveProfileImage(ProfileImageDTO imageDTO)
	{
		ValidationResult result = new ValidationResult();

		if (imageDTO.profileId == null) {
			result.addError("profileId", "ID do perfil é obrigatório.");
			return new Result(null, result);
		}

		if (imageDTO.imageBase64 == null || imageDTO.imageBase64.isEmpty()) {
			result.addError("imageBase64", "Imagem não pode estar vazia.");
			return new Result(null, result);
		}

		try {
			Profile profile = this.profileRepository.findById(imageDTO.profileId).orElse(null);
			
			if (profile == null) {
				result.addError("Profile", "Perfil não encontrado.");
				return new Result(null, result);
			}

			// Cria um Map com os dados da imagem
			Map<String, String> imagePayload = new HashMap<>();
			imagePayload.put("profile_id", imageDTO.profileId.toString());
			imagePayload.put("image_base64", imageDTO.imageBase64);
			imagePayload.put("image_file_name", imageDTO.imageFileName != null ? imageDTO.imageFileName : "avatar.png");

			// Envia para o serviço Python usando RestTemplate com Map
			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.APPLICATION_JSON);
			HttpEntity<Map<String, String>> entity = new HttpEntity<>(imagePayload, headers);

			String pythonResponse = restTemplate.postForObject(
				PYTHON_SERVICE_URL + "/profile/image",
				entity,
				String.class
			);

			if (pythonResponse == null || pythonResponse.isEmpty()) {
				result.addError("global", "Erro ao processar imagem no serviço Python.");
				return new Result(null, result);
			}

			// Após salvar no Python, retorna sucesso
			return new Result(profile, result);

		} catch (Exception e) {
			result.addError("global", "Ocorreu um erro ao salvar a imagem do perfil: " + e.getMessage());
			return new Result(null, result);
		}
	}

	public Result getProfileImage(Long profileId)
	{
		ValidationResult result = new ValidationResult();

		if (profileId == null) {
			result.addError("profileId", "ID do perfil é obrigatório.");
			return new Result(null, result);
		}

		try {
			Profile profile = this.profileRepository.findById(profileId).orElse(null);
			
			if (profile == null) {
				result.addError("Profile", "Perfil não encontrado.");
				return new Result(null, result);
			}

			// Busca a imagem no serviço Python
			String pythonImageResponse = restTemplate.getForObject(
				PYTHON_SERVICE_URL + "/profile/image/" + profileId,
				String.class
			);

			if (pythonImageResponse == null || pythonImageResponse.isEmpty()) {
				result.addError("Image", "Imagem não encontrada para este perfil.");
				return new Result(null, result);
			}
			profile.avatarUrl = pythonImageResponse; // Supondo que o serviço Python retorne a URL da imagem
			// Retorna a resposta do Python como resposta
			return new Result(profile, result);

		} catch (Exception e) {
			result.addError("global", "Ocorreu um erro ao buscar a imagem do perfil: " + e.getMessage());
			return new Result(null, result);
		}
	}
}
