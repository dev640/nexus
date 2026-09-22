package com.nexus.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Optional language-model client.
 *
 * Disabled unless NEXUS_LLM_API_KEY is configured. Any failure returns an empty
 * result so callers fall back to the grounded (data-only) answer.
 */
@Component
public class LlmClient {

    private static final Logger log = LoggerFactory.getLogger(LlmClient.class);

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String apiKey;
    private final String baseUrl;
    private final String model;

    public LlmClient(
        @Value("${nexus.llm.api-key:}") String apiKey,
        @Value("${nexus.llm.base-url:https://api.openai.com/v1}") String baseUrl,
        @Value("${nexus.llm.model:gpt-4o-mini}") String model
    ) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.model = model;
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    /** Ask the model. Empty when not configured or on any error. */
    public Optional<String> complete(String systemPrompt, String question) {
        if (!isConfigured()) return Optional.empty();
        try {
            String body = objectMapper.writeValueAsString(Map.of(
                "model", model,
                "messages", List.of(
                    Map.of("role", "system", "content", systemPrompt),
                    Map.of("role", "user", "content", question)
                ),
                "temperature", 0.2
            ));

            String response = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build()
                .post()
                .uri("/chat/completions")
                .body(body)
                .retrieve()
                .body(String.class);

            if (response == null) return Optional.empty();
            JsonNode root = objectMapper.readTree(response);
            JsonNode content = root.path("choices").path(0).path("message").path("content");
            return content.isMissingNode() || content.asText().isBlank()
                ? Optional.empty()
                : Optional.of(content.asText().trim());
        } catch (Exception e) {
            log.warn("LLM request failed, falling back to grounded answer: {}", e.getMessage());
            return Optional.empty();
        }
    }
}
