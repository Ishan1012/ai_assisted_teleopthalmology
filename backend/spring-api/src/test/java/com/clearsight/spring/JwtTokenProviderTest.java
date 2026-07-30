package com.clearsight.spring;

import com.clearsight.spring.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private static final String SECRET = "9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b";
    private static final long EXPIRATION_MS = 3600000; // 1 hour

    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(SECRET, EXPIRATION_MS);
    }

    @Test
    @DisplayName("Should generate a valid token and retrieve email from payload")
    void testGenerateAndValidateToken() {
        String email = "doctor@clearsight.com";

        String token = jwtTokenProvider.generateToken(email);

        assertNotNull(token);
        assertFalse(token.isBlank());
        assertTrue(jwtTokenProvider.validateToken(token));
        assertEquals(email, jwtTokenProvider.getEmailFromToken(token));
    }

    @Test
    @DisplayName("Should return false for malformed or invalid JWT token")
    void testValidateInvalidToken() {
        String invalidToken = "invalid.jwt.token";

        assertFalse(jwtTokenProvider.validateToken(invalidToken));
    }

    @Test
    @DisplayName("Should return false for null or empty JWT token")
    void testValidateNullOrEmptyToken() {
        assertFalse(jwtTokenProvider.validateToken(null));
        assertFalse(jwtTokenProvider.validateToken(""));
        assertFalse(jwtTokenProvider.validateToken("   "));
    }

    @Test
    @DisplayName("Should return false when JWT token is expired")
    void testExpiredToken() throws InterruptedException {
        JwtTokenProvider shortLivedProvider = new JwtTokenProvider(SECRET, 1L); // 1 ms expiration
        String token = shortLivedProvider.generateToken("user@expired.com");

        Thread.sleep(10); // Wait for token to expire

        assertFalse(shortLivedProvider.validateToken(token));
    }

    @Test
    @DisplayName("Should generate token from Authentication object")
    void testGenerateTokenFromAuthentication() {
        Authentication authentication = new UsernamePasswordAuthenticationToken("authuser@clearsight.com", "password");

        String token = jwtTokenProvider.generateToken(authentication);

        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));
        assertEquals("authuser@clearsight.com", jwtTokenProvider.getEmailFromToken(token));
    }
}
