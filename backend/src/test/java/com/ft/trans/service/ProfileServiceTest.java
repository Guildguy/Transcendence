package com.ft.trans.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import com.ft.trans.dto.ProfileStacksDTO;
import com.ft.trans.dto.ProfileStacksResponseDTO;
import com.ft.trans.entity.Profile;
import com.ft.trans.repository.ProfileRepository;
import com.ft.trans.repository.UserRepository;
import com.ft.trans.validation.Result;

@ExtendWith(MockitoExtension.class)
class ProfileServiceTest {

    private static final String PYTHON_BASE_URL = "http://python-profile-service:8000";

    @Mock
    private ProfileRepository profileRepository;

    @Mock
    private UserRepository userRepository;

    private ProfileService profileService;
    private MockRestServiceServer server;

    @BeforeEach
    void setUp() {
        profileService = new ProfileService(profileRepository, userRepository);

        RestTemplate restTemplate = (RestTemplate) ReflectionTestUtils.getField(profileService, "restTemplate");
        server = MockRestServiceServer.bindTo(restTemplate).build();
    }

    @Test
    void getProfileStacks_shouldReturnValidationErrorWhenProfileIdIsNull() {
        Result result = profileService.getProfileStacks(null);

        assertTrue(result.validationResult().hasErrors());
        assertNull(result.entity());
        assertEquals("profileId", result.validationResult().getErrors().get(0).field());
    }

    @Test
    void getProfileStacks_shouldReturnEmptyListWhenPythonReturns404() {
        long profileId = 10L;
        when(profileRepository.findById(profileId)).thenReturn(Optional.of(buildProfile(profileId)));

        server.expect(requestTo(PYTHON_BASE_URL + "/profile/" + profileId))
            .andExpect(method(HttpMethod.GET))
            .andRespond(withStatus(HttpStatus.NOT_FOUND));

        Result result = profileService.getProfileStacks(profileId);

        assertFalse(result.validationResult().hasErrors());
        ProfileStacksResponseDTO entity = assertInstanceOf(ProfileStacksResponseDTO.class, result.entity());
        assertEquals("10", entity.profile_id);
        assertTrue(entity.stacks.isEmpty());
        server.verify();
    }

    @Test
    void getProfileStacks_shouldMapAndFilterStackValuesFromPython() {
        long profileId = 15L;
        when(profileRepository.findById(profileId)).thenReturn(Optional.of(buildProfile(profileId)));

        server.expect(requestTo(PYTHON_BASE_URL + "/profile/" + profileId))
            .andExpect(method(HttpMethod.GET))
            .andRespond(withSuccess("{\"stacks\":[\"  C#  \",\"\",null,\"Go\",\"   \"]}", MediaType.APPLICATION_JSON));

        Result result = profileService.getProfileStacks(profileId);

        assertFalse(result.validationResult().hasErrors());
        ProfileStacksResponseDTO entity = assertInstanceOf(ProfileStacksResponseDTO.class, result.entity());
        assertEquals(List.of("C#", "Go"), entity.stacks);
        server.verify();
    }

    @Test
    void saveProfileStacks_shouldReturnValidationErrorWhenStacksAreMissing() {
        ProfileStacksDTO dto = new ProfileStacksDTO();
        dto.stacks = null;

        Result result = profileService.saveProfileStacks(20L, dto);

        assertTrue(result.validationResult().hasErrors());
        assertEquals("stacks", result.validationResult().getErrors().get(0).field());
    }

    @Test
    void saveProfileStacks_shouldPropagatePythonFailureAsValidationError() {
        long profileId = 25L;
        when(profileRepository.findById(profileId)).thenReturn(Optional.of(buildProfile(profileId)));

        ProfileStacksDTO dto = new ProfileStacksDTO();
        dto.stacks = List.of("Java");

        server.expect(requestTo(PYTHON_BASE_URL + "/profile"))
            .andExpect(method(HttpMethod.POST))
            .andRespond(withServerError());

        Result result = profileService.saveProfileStacks(profileId, dto);

        assertTrue(result.validationResult().hasErrors());
        assertNull(result.entity());
        assertEquals("global", result.validationResult().getErrors().get(0).field());
        server.verify();
    }

    @Test
    void saveProfileStacks_shouldReturnNormalizedStacksAfterSuccessfulSave() {
        long profileId = 30L;
        when(profileRepository.findById(profileId)).thenReturn(Optional.of(buildProfile(profileId)));

        ProfileStacksDTO dto = new ProfileStacksDTO();
        dto.stacks = List.of("Java", "Spring");

        server.expect(requestTo(PYTHON_BASE_URL + "/profile"))
            .andExpect(method(HttpMethod.POST))
            .andRespond(withSuccess("{\"message\":\"ok\"}", MediaType.APPLICATION_JSON));

        server.expect(requestTo(PYTHON_BASE_URL + "/profile/" + profileId))
            .andExpect(method(HttpMethod.GET))
            .andRespond(withSuccess("{\"stacks\":[\"Java\",\"Spring\"]}", MediaType.APPLICATION_JSON));

        Result result = profileService.saveProfileStacks(profileId, dto);

        assertFalse(result.validationResult().hasErrors());
        ProfileStacksResponseDTO entity = assertInstanceOf(ProfileStacksResponseDTO.class, result.entity());
        assertEquals(List.of("Java", "Spring"), entity.stacks);
        assertEquals("30", entity.profile_id);
        server.verify();
    }

    private Profile buildProfile(Long id) {
        Profile profile = new Profile();
        profile.id = id;
        return profile;
    }
}
