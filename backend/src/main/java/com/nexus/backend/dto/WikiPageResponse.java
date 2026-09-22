package com.nexus.backend.dto;

import java.time.LocalDateTime;

public record WikiPageResponse(
    Long id,
    String title,
    String content,
    String author,
    Long projectId,
    String projectName,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
