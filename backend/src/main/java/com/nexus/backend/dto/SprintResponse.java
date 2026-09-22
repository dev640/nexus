package com.nexus.backend.dto;

import com.nexus.backend.domain.sprint.SprintStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record SprintResponse(
    Long id,
    Long projectId,
    String projectName,
    Integer number,
    String goal,
    LocalDate startDate,
    LocalDate endDate,
    Integer committedPoints,
    SprintStatus status,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
