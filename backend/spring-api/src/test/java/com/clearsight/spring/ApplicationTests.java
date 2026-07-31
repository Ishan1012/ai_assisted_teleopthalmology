package com.clearsight.spring;

import com.clearsight.spring.dto.GoogleAuthRequest;
import com.clearsight.spring.dto.LoginRequest;
import com.clearsight.spring.dto.RegisterRequest;
import com.clearsight.spring.entity.Scan;
import com.clearsight.spring.entity.User;
import com.clearsight.spring.repository.ScanRepository;
import com.clearsight.spring.repository.UserRepository;
import com.clearsight.spring.security.JwtTokenProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ScanRepository scanRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        scanRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Spring Application Context Loads Successfully")
    void contextLoads() {
        assertNotNull(userRepository);
        assertNotNull(scanRepository);
        assertNotNull(jwtTokenProvider);
    }

    @Test
    @DisplayName("Health endpoint /health and /api/health should return 'api is live'")
    void testHealthCheck() throws Exception {
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.content().string("api is live"));

        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.content().string("api is live"));
    }

    @Test
    @DisplayName("Register Endpoint /api/auth/register should create user and return JWT token")
    void testUserRegistration() throws Exception {
        RegisterRequest registerRequest = RegisterRequest.builder()
                .email("newuser@clearsight.com")
                .password("Password123!")
                .name("Dr. Alice Smith")
                .role("CLINICIAN")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.user.email", is("newuser@clearsight.com")))
                .andExpect(jsonPath("$.user.name", is("Dr. Alice Smith")))
                .andExpect(jsonPath("$.user.role", is("CLINICIAN")));

        assertTrue(userRepository.existsByEmail("newuser@clearsight.com"));
    }

    @Test
    @DisplayName("Login Endpoint /api/auth/login should authenticate user and return token")
    void testUserLogin() throws Exception {
        RegisterRequest registerRequest = RegisterRequest.builder()
                .email("loginuser@clearsight.com")
                .password("SecretPass123!")
                .name("Jane Doe")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk());

        LoginRequest loginRequest = LoginRequest.builder()
                .email("loginuser@clearsight.com")
                .password("SecretPass123!")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.user.email", is("loginuser@clearsight.com")));
    }

    @Test
    @DisplayName("Google OAuth Endpoint /api/auth/google should register/login user and return token")
    void testGoogleAuthEndpoint() throws Exception {
        GoogleAuthRequest googleRequest = GoogleAuthRequest.builder()
                .email("googleuser@clearsight.com")
                .name("Google User")
                .picture("https://lh3.googleusercontent.com/photo.jpg")
                .googleId("google-uid-12345")
                .build();

        mockMvc.perform(post("/api/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(googleRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.user.email", is("googleuser@clearsight.com")))
                .andExpect(jsonPath("$.user.pictureUrl", is("https://lh3.googleusercontent.com/photo.jpg")));

        User user = userRepository.findByEmail("googleuser@clearsight.com").orElseThrow();
        assertEquals("google-uid-12345", user.getGoogleId());
    }

    @Test
    @DisplayName("Get Current User Endpoint /api/auth/me should return authenticated user details")
    void testGetCurrentUser() throws Exception {
        User user = User.builder()
                .email("me@clearsight.com")
                .name("Me User")
                .role("PATIENT")
                .build();
        userRepository.save(user);

        String token = jwtTokenProvider.generateToken(user.getEmail());

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is("me@clearsight.com")))
                .andExpect(jsonPath("$.name", is("Me User")));
    }

    @Test
    @DisplayName("Scan Upload Endpoint /api/scans/upload and Persistence Verification")
    void testScanUploadAndRetrieval() throws Exception {
        User user = User.builder()
                .email("patient@clearsight.com")
                .name("Patient One")
                .role("PATIENT")
                .build();
        user = userRepository.save(user);

        String token = jwtTokenProvider.generateToken(user.getEmail());

        MockMultipartFile fundusFile = new MockMultipartFile(
                "file",
                "fundus_scan_left_eye.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                "fake image content".getBytes()
        );

        mockMvc.perform(multipart("/api/scans/upload")
                        .file(fundusFile)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.originalFilename", is("fundus_scan_left_eye.jpg")))
                .andExpect(jsonPath("$.diagnosis", notNullValue()))
                .andExpect(jsonPath("$.s3Url", notNullValue()));

        List<Scan> scans = scanRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        assertEquals(1, scans.size());
        assertEquals("fundus_scan_left_eye.jpg", scans.get(0).getOriginalFilename());

        mockMvc.perform(get("/api/scans")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].originalFilename", is("fundus_scan_left_eye.jpg")));
    }
}
