package com.nexus.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record WhiteboardNoteRequest(
    @NotBlank(message = "Color is required")
    @Size(max = 20, message = "Color must not exceed 20 characters")
    String color,
    Double x,
    Double y
) {}
