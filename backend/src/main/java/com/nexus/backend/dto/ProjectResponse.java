package com.nexus.backend.dto;

import com.nexus.backend.domain.project.ProjectHealth;
import com.nexus.backend.domain.project.ProjectStatus;

import java.time.LocalDateTime;

public record ProjectResponse(
    Long id,
    String name,
    String description,
    ProjectStatus status,
    ProjectHealth health,
    Integer progress,
    Integer sprintNumber,
    Integer memberCount,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
