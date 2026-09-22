package com.nexus.backend.dto;

import com.nexus.backend.domain.user.UserRole;

public record UserResponse(
    Long id,
    String name,
    String email,
    UserRole role
) {}
