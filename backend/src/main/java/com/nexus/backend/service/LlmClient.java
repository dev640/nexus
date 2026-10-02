package com.nexus.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.net.URI;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

/**
 * Optional language-model client.
 *
 * Disabled unless NEXUS_LLM_API_KEY is configured. Two wire formats are supported:
 * {@code openai} (any OpenAI-compatible /chat/completions endpoint, the default)
 * and {@code gemini} (Google's :generateContent API). Any failure returns an empty
 * result so callers fall back to the grounded (data-only) answer.
 *
 * Per-provider defaults are applied when the base URL or model is left blank, so
 * setting just the key and provider is enough for the common case.
 */
@Component
public class LlmClient {

    private static final Logger log = LoggerFactory.getLogger(LlmClient.class);

    static final String PROVIDER_OPENAI = "openai";
    static final String PROVIDER_GEMINI = "gemini";

    private static final Map<String, String> DEFAULT_BASE_URL = Map.of(
            PROVIDER_OPENAI, "https://api.openai.com/v1",
            PROVIDER_GEMINI, "https://generativelanguage.googleapis.com/v1beta"
    );
    private static final Map<String, String> DEFAULT_MODEL = Map.of(
            PROVIDER_OPENAI, "gpt-4o-mini",
            PROVIDER_GEMINI, "gemini-3.8-flash"
    );

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String provider;
    private final String apiKey;
    private final String baseUrl;
    private final String model;

    public LlmClient(
        @Value("${nexus.llm.provider:}") String provider,
        @Value("${nexus.llm.api-key:}") String apiKey,
        @Value("${nexus.llm.base-url:}") String baseUrl,
        @Value("${nexus.llm.model:}") String model
    ) {
        // An unset provider means "infer it": an explicit provider wins, otherwise
        // the base URL is inspected so pointing only NEXUS_LLM_BASE_URL at Gemini
        // is enough. Anything unrecognised falls back to OpenAI.
        String resolved = isBlank(provider) ? inferProvider(baseUrl) : provider.trim().toLowerCase(Locale.ROOT);
        if (!PROVIDER_GEMINI.equals(resolved)) {
            resolved = PROVIDER_OPENAI;
        }
        this.provider = resolved;
        this.apiKey = apiKey == null ? "" : apiKey.trim();
        this.baseUrl = isBlank(baseUrl) ? DEFAULT_BASE_URL.get(resolved) : baseUrl.trim();
        this.model = isBlank(model) ? DEFAULT_MODEL.get(resolved) : model.trim();
    }

    private static String inferProvider(String baseUrl) {
        return baseUrl != null && baseUrl.contains("generativelanguage.googleapis.com")
                ? PROVIDER_GEMINI
                : PROVIDER_OPENAI;
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    public boolean isConfigured() {
        return !apiKey.isEmpty();
    }

    /** The provider actually in use, normalised. */
    public String provider() {
        return provider;
    }

    /** The endpoint in use, never including the key. Safe to log. */
    public String endpoint() {
        return PROVIDER_GEMINI.equals(provider)
                ? baseUrl + "/models/" + model + ":generateContent"
                : baseUrl + "/chat/completions";
    }

    /** Ask the model. Empty when not configured or on any error. */
    public Optional<String> complete(String systemPrompt, String question) {
        if (!isConfigured()) return Optional.empty();
        boolean gemini = PROVIDER_GEMINI.equals(provider);
        try {
            String body = gemini
                    ? buildGeminiBody(systemPrompt, question)
                    : buildOpenAiBody(systemPrompt, question);
            String response = gemini ? callGemini(body) : callOpenAi(body);
            return response == null ? Optional.empty() : extractText(response);
        } catch (Exception e) {
            log.warn("LLM request failed ({} {}), falling back to grounded answer: {}",
                    provider, endpoint(), e.getMessage());
            return Optional.empty();
        }
    }

    private String callOpenAi(String body) {
        return RestClient.builder()
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build()
                .post()
                .uri("/chat/completions")
                .body(body)
                .retrieve()
                .body(String.class);
    }

    /**
     * Gemini authenticates with the {@code x-goog-api-key} header rather than a
     * bearer token. The URL is passed as a pre-built {@link URI} so the colon in
     * {@code :generateContent} survives instead of being percent-encoded by URI
     * template expansion.
     */
    private String callGemini(String body) {
        return RestClient.builder()
                .defaultHeader("x-goog-api-key", apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build()
                .post()
                .uri(URI.create(endpoint()))
                .body(body)
                .retrieve()
                .body(String.class);
    }

    // ---- Wire formats, separated from the HTTP call so they can be unit-tested ----

    String buildOpenAiBody(String systemPrompt, String question) throws Exception {
        return objectMapper.writeValueAsString(Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", question)
                ),
                "temperature", 0.2
        ));
    }

    String buildGeminiBody(String systemPrompt, String question) throws Exception {
        // Gemini takes the system prompt as a separate systemInstruction object and a
        // single user content entry, not a chat-style messages array.
        return objectMapper.writeValueAsString(Map.of(
                "systemInstruction", Map.of("parts", List.of(Map.of("text", systemPrompt))),
                "contents", List.of(
                        Map.of("role", "user", "parts", List.of(Map.of("text", question)))
                ),
                "generationConfig", Map.of("temperature", 0.2)
        ));
    }

    Optional<String> extractText(String response) throws Exception {
        JsonNode root = objectMapper.readTree(response);
        JsonNode content = PROVIDER_GEMINI.equals(provider)
                ? root.path("candidates").path(0).path("content").path("parts").path(0).path("text")
                : root.path("choices").path(0).path("message").path("content");
        return content.isMissingNode() || content.asText().isBlank()
                ? Optional.empty()
                : Optional.of(content.asText().trim());
    }
}
