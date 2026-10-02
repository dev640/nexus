package com.nexus.backend.web;

import com.nexus.backend.domain.user.User;
import com.nexus.backend.domain.user.UserRole;
import com.nexus.backend.dto.CreateUserRequest;
import com.nexus.backend.dto.CreatedUserResponse;
import com.nexus.backend.dto.UserResponse;
import com.nexus.backend.exception.ResourceNotFoundException;
import com.nexus.backend.repository.UserRepository;
import com.nexus.backend.service.AdminAccountService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * User management endpoints. Self-service profile updates are open to any
 * authenticated user; account creation and role changes are ADMIN-only.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final AdminAccountService adminAccountService;

    public UserController(UserRepository userRepository, AdminAccountService adminAccountService) {
        this.userRepository = userRepository;
        this.adminAccountService = adminAccountService;
    }

    /**
     * Creates an account on an admin's behalf. There is no public signup: the
     * only way into the workspace is through an admin.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CreatedUserResponse> createUser(
        @Valid @RequestBody CreateUserRequest payload
    ) {
        return ResponseEntity.ok(adminAccountService.createUser(payload));
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> listUsers() {
        List<UserResponse> users = userRepository.findAll().stream()
            .map(UserController::toResponse)
            .toList();
        return ResponseEntity.ok(users);
    }

    /** The authenticated user's own profile — used to bootstrap a session. */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> me() {
        return ResponseEntity.ok(toResponse(currentUser()));
    }

    @PatchMapping("/me")
    public ResponseEntity<UserResponse> updateMe(@Valid @RequestBody UpdateMeRequest payload) {
        User current = currentUser();
        if (payload.name() != null && !payload.name().isBlank()) {
            current.setName(payload.name().trim());
        }
        User saved = userRepository.save(current);
        return ResponseEntity.ok(toResponse(saved));
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateRole(
        @PathVariable Long id,
        @Valid @RequestBody UpdateRoleRequest payload
    ) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        user.setRole(payload.role());
        User saved = userRepository.save(user);
        return ResponseEntity.ok(toResponse(saved));
    }

    private User currentUser() {
        String email = org.springframework.security.core.context.SecurityContextHolder
            .getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private static UserResponse toResponse(User u) {
        return new UserResponse(
            u.getId(),
            u.getName(),
            u.getEmail(),
            u.getRole(),
            u.getSupabaseId() != null ? u.getSupabaseId().toString() : null
        );
    }

    public record UpdateMeRequest(
        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        String name
    ) {}

    public record UpdateRoleRequest(
        @NotNull(message = "Role is required")
        UserRole role
    ) {}
}
