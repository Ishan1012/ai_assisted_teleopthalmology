package com.clearsight.spring.controller;

import com.clearsight.spring.dto.AuthResponseDto;
import com.clearsight.spring.dto.GoogleAuthRequest;
import com.clearsight.spring.dto.LoginRequest;
import com.clearsight.spring.dto.RegisterRequest;
import com.clearsight.spring.dto.UserDto;
import com.clearsight.spring.entity.User;
import com.clearsight.spring.repository.UserRepository;
import com.clearsight.spring.security.JwtTokenProvider;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email is already in use");
        }

        User user = User.builder()
                .email(request.getEmail())
                .name(request.getName() != null ? request.getName() : request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : "PATIENT")
                .build();

        userRepository.save(user);

        String token = tokenProvider.generateToken(user.getEmail());
        UserDto userDto = mapToUserDto(user);

        return ResponseEntity.ok(AuthResponseDto.builder()
                .token(token)
                .user(userDto)
                .build());
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }

        User user = userOptional.get();
        if (user.getPassword() == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }

        String token = tokenProvider.generateToken(user.getEmail());
        UserDto userDto = mapToUserDto(user);

        return ResponseEntity.ok(AuthResponseDto.builder()
                .token(token)
                .user(userDto)
                .build());
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleAuth(@RequestBody GoogleAuthRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email is required for Google auth");
        }

        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
            if (request.getName() != null) user.setName(request.getName());
            if (request.getPicture() != null) user.setPictureUrl(request.getPicture());
            if (request.getGoogleId() != null) user.setGoogleId(request.getGoogleId());
        } else {
            user = User.builder()
                    .email(request.getEmail())
                    .name(request.getName() != null ? request.getName() : request.getEmail())
                    .pictureUrl(request.getPicture())
                    .googleId(request.getGoogleId())
                    .role("PATIENT")
                    .build();
        }
        userRepository.save(user);

        String token = tokenProvider.generateToken(user.getEmail());
        UserDto userDto = mapToUserDto(user);

        return ResponseEntity.ok(AuthResponseDto.builder()
                .token(token)
                .user(userDto)
                .build());
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof User user) {
            return ResponseEntity.ok(mapToUserDto(user));
        }

        String email = authentication.getName();
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            return ResponseEntity.ok(mapToUserDto(userOptional.get()));
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
    }

    private UserDto mapToUserDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .pictureUrl(user.getPictureUrl())
                .build();
    }
}
