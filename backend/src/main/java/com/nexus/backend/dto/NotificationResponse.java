package com.nexus.backend.dto;

import java.time.LocalDateTime;

public record NotificationResponse(
    Long id,
    String category,
    String text,
    boolean read,
    LocalDateTime createdAt
) {}
