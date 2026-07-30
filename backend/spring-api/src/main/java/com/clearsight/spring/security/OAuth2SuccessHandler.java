package com.clearsight.spring.security;

import com.clearsight.spring.entity.User;
import com.clearsight.spring.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Optional;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final String redirectUrl;

    public OAuth2SuccessHandler(JwtTokenProvider tokenProvider,
                                UserRepository userRepository,
                                @Value("${app.oauth2.redirect-uri:http://localhost:5173/auth/callback}") String redirectUrl) {
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
        this.redirectUrl = redirectUrl;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException, ServletException {
        if (authentication.getPrincipal() instanceof OAuth2User oAuth2User) {
            String email = oAuth2User.getAttribute("email");
            String name = oAuth2User.getAttribute("name");
            String picture = oAuth2User.getAttribute("picture");
            String googleId = oAuth2User.getAttribute("sub");

            if (email != null) {
                Optional<User> userOptional = userRepository.findByEmail(email);
                User user;
                if (userOptional.isPresent()) {
                    user = userOptional.get();
                    if (name != null) user.setName(name);
                    if (picture != null) user.setPictureUrl(picture);
                    if (googleId != null) user.setGoogleId(googleId);
                } else {
                    user = User.builder()
                            .email(email)
                            .name(name != null ? name : email)
                            .pictureUrl(picture)
                            .googleId(googleId)
                            .role("PATIENT")
                            .build();
                }
                userRepository.save(user);

                String token = tokenProvider.generateToken(email);
                String targetUrl = redirectUrl + "?token=" + token;
                getRedirectStrategy().sendRedirect(request, response, targetUrl);
                return;
            }
        }
        super.onAuthenticationSuccess(request, response, authentication);
    }
}
