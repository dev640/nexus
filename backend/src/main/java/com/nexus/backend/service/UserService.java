package com.nexus.backend.service;

import com.nexus.backend.domain.user.User;
import com.nexus.backend.domain.user.UserRole;
import com.nexus.backend.dto.LoginRequest;
import com.nexus.backend.dto.RegisterRequest;
import com.nexus.backend.dto.UserResponse;
import com.nexus.backend.dto.AuthResponse;
import com.nexus.backend.exception.ResourceNotFoundException;
import com.nexus.backend.exception.ValidationException;
import com.nexus.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new ValidationException("Email already exists");
        }

        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(UserRole.MEMBER);

        User savedUser = userRepository.save(user);

        // TODO: Generate JWT tokens in Phase 2
        return new AuthResponse(
            "temp-token",
            "temp-refresh-token",
            mapToResponse(savedUser)
        );
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
            .orElseThrow(() -> new ValidationException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new ValidationException("Invalid email or password");
        }

        // TODO: Generate JWT tokens in Phase 2
        return new AuthResponse(
            "temp-token",
            "temp-refresh-token",
            mapToResponse(user)
        );
    }

    public UserResponse findById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return mapToResponse(user);
    }

    public UserResponse findByEmail(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return mapToResponse(user);
    }

    private UserResponse mapToResponse(User user) {
        return new UserResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getRole()
        );
    }
}
