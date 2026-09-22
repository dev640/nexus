package com.nexus.backend.dto;

import com.nexus.backend.domain.user.UserRole;

public record AuthResponse(
    String token,
    String refreshToken,
    UserResponse user
) {}
