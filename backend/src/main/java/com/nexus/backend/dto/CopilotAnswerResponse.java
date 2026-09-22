package com.nexus.backend.dto;

/**
 * @param mode "llm" when answered by the configured model, "grounded" when
 *             answered from live project data only
 */
public record CopilotAnswerResponse(
    String answer,
    String mode
) {}
