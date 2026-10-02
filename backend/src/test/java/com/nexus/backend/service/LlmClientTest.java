package com.nexus.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * The two provider wire formats differ in both request and response shape, so these
 * tests pin the exact JSON we send and parse.
 */
class LlmClientTest {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private LlmClient client(String provider, String baseUrl, String model) {
        return new LlmClient(provider, "test-key", baseUrl, model);
    }

    @Test
    void disabledWithoutApiKey() {
        assertThat(new LlmClient("", "", "", "").isConfigured()).isFalse();
        assertThat(new LlmClient("gemini", "", "", "").isConfigured()).isFalse();
    }

    @Test
    void enabledWithApiKey() {
        assertThat(new LlmClient("gemini", "abc", "", "").isConfigured()).isTrue();
    }

    @Test
    void appliesGeminiDefaultsWhenOnlyProviderSet() {
        LlmClient c = client("gemini", "", "");
        assertThat(c.provider()).isEqualTo("gemini");
        assertThat(c.endpoint())
                .isEqualTo("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent");
    }

    @Test
    void appliesOpenAiDefaultsWhenNothingSet() {
        LlmClient c = client("", "", "");
        assertThat(c.provider()).isEqualTo("openai");
        assertThat(c.endpoint()).isEqualTo("https://api.openai.com/v1/chat/completions");
    }

    @Test
    void infersGeminiFromBaseUrlWhenProviderOmitted() {
        assertThat(client("", "https://generativelanguage.googleapis.com/v1beta", "").provider())
                .isEqualTo("gemini");
    }

    @Test
    void unknownProviderFallsBackToOpenAi() {
        assertThat(client("anthropic", "", "").provider()).isEqualTo("openai");
    }

    @Test
    void providerIsCaseInsensitiveAndPadded() {
        assertThat(client("  GEMINI ", "", "").provider()).isEqualTo("gemini");
    }

    @Test
    void explicitModelOverridesDefault() {
        assertThat(client("gemini", "", "gemini-3.1-pro-preview").endpoint())
                .contains("gemini-3.1-pro-preview");
    }

    @Test
    void geminiEndpointNeverContainsApiKey() {
        assertThat(client("gemini", "", "").endpoint()).doesNotContain("test-key");
    }

    @Test
    void buildsOpenAiChatCompletionBody() throws Exception {
        JsonNode body = MAPPER.readTree(client("openai", "", "").buildOpenAiBody("FACTS: 7 tasks", "What blocks?"));

        assertThat(body.path("model").asText()).isEqualTo("gpt-4o-mini");
        assertThat(body.path("messages")).hasSize(2);
        assertThat(body.path("messages").path(0).path("role").asText()).isEqualTo("system");
        assertThat(body.path("messages").path(0).path("content").asText()).isEqualTo("FACTS: 7 tasks");
        assertThat(body.path("messages").path(1).path("role").asText()).isEqualTo("user");
        assertThat(body.path("messages").path(1).path("content").asText()).isEqualTo("What blocks?");
        assertThat(body.path("temperature").asDouble()).isEqualTo(0.2);
        // OpenAI has no systemInstruction field.
        assertThat(body.has("systemInstruction")).isFalse();
    }

    @Test
    void buildsGeminiGenerateContentBody() throws Exception {
        JsonNode body = MAPPER.readTree(client("gemini", "", "").buildGeminiBody("FACTS: 7 tasks", "What blocks?"));

        assertThat(body.path("systemInstruction").path("parts").path(0).path("text").asText())
                .isEqualTo("FACTS: 7 tasks");
        assertThat(body.path("contents")).hasSize(1);
        assertThat(body.path("contents").path(0).path("role").asText()).isEqualTo("user");
        assertThat(body.path("contents").path(0).path("parts").path(0).path("text").asText())
                .isEqualTo("What blocks?");
        assertThat(body.path("generationConfig").path("temperature").asDouble()).isEqualTo(0.2);
        // Gemini carries the model in the URL, not the body, and has no messages array.
        assertThat(body.has("model")).isFalse();
        assertThat(body.has("messages")).isFalse();
        assertThat(body.has("temperature")).isFalse();
    }

    @Test
    void extractsTextFromOpenAiResponse() throws Exception {
        String json = """
            {"choices":[{"message":{"role":"assistant","content":"  Achal is overloaded.  "}}]}""";
        assertThat(client("openai", "", "").extractText(json)).contains("Achal is overloaded.");
    }

    @Test
    void extractsTextFromGeminiResponse() throws Exception {
        String json = """
            {"candidates":[{"content":{"role":"model","parts":[{"text":" Sprint 8 is 19% complete."}]},
             "finishReason":"STOP"}]}""";
        assertThat(client("gemini", "", "").extractText(json)).contains("Sprint 8 is 19% complete.");
    }

    @Test
    void returnsEmptyForBlankOrMissingText() throws Exception {
        assertThat(client("gemini", "", "").extractText("""
            {"candidates":[{"content":{"parts":[]},"finishReason":"SAFETY"}]}""")).isEmpty();
        assertThat(client("openai", "", "").extractText("""
            {"choices":[{"message":{"content":"   "}}]}""")).isEmpty();
        assertThat(client("openai", "", "").extractText("{}")).isEmpty();
    }

    @Test
    void unconfiguredClientReturnsEmptyWithoutCallingAnything() {
        assertThat(new LlmClient("gemini", "", "", "").complete("facts", "question"))
                .isEqualTo(Optional.empty());
    }
}