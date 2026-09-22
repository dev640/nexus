package com.nexus.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record CopilotAskRequest(
    @NotBlank(message = "Question is required")
    String question
) {}
