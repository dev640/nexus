package com.nexus.backend.dto;

import com.nexus.backend.domain.sprint.SprintStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record SprintRequest(
    @NotNull(message = "Project ID is required")
    Long projectId,

    @NotBlank(message = "Goal is required")
    String goal,

    @NotNull(message = "Start date is required")
    LocalDate startDate,

    @NotNull(message = "End date is required")
    LocalDate endDate,

    Integer committedPoints,

    SprintStatus status
) {}
