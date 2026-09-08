package com.nexus.backend.web;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestClient;

/**
 * Pure unit tests for the proxy controller: the discovery index payload and
 * the slug/path delegation to the service for each proxied API.
 */
class ExternalApiControllerTest {

    @Test
    void indexListsAllProxiedApisWithExamples() {
        ExternalApiController controller = new ExternalApiController(new StubService());

        Map<String, Object> body = controller.index();

        assertEquals("Apivault.dev curated free APIs", body.get("source"));
        @SuppressWarnings("unchecked")
        List<Map<String, String>> apis = (List<Map<String, String>>) body.get("apis");
        assertEquals(6, apis.size());
        for (Map<String, String> api : apis) {
            assertTrue(api.containsKey("slug"));
            assertTrue(api.containsKey("upstream"));
            assertTrue(api.get("example").startsWith("/api/external/"));
        }
    }

    @Test
    void endpointsDelegateToServiceWithExpectedSlugsAndPaths() {
        StubService svc = new StubService();
        ExternalApiController controller = new ExternalApiController(svc);

        controller.randomQuote();
        controller.weather("London", "j1");
        controller.boredActivity(3, null);
        controller.boredActivity(null, 0.5);
        controller.exchange("EUR");
        controller.jsonPlaceholder("todos", Map.of());
        controller.jsonPlaceholderItem("todos", "1");
        controller.reddit("productivity", 10);

        assertEquals(
                List.of(
                        "quotes | /random | {}",
                        "weather | /London | {format=j1}",
                        "bored | /activity | {participants=3}",
                        "bored | /activity | {price=0.5}",
                        "exchange | /latest/EUR | {}",
                        "jsonplaceholder | /todos | {}",
                        "jsonplaceholder | /todos/1 | {}",
                        "reddit | /productivity/hot.json | {limit=10}"),
                svc.calls);
    }

    @Test
    void responsesAreOkAndCarryServiceBody() {
        ExternalApiController controller = new ExternalApiController(new StubService());

        ResponseEntity<Object> res = controller.randomQuote();
        assertEquals(200, res.getStatusCode().value());
        assertNotNull(res.getBody());
    }

    /** Minimal stub: records proxy() calls instead of performing HTTP. */
    private static final class StubService extends ExternalApiService {
        final List<String> calls = new java.util.ArrayList<>();

        StubService() {
            super((RestClient) null);
        }

        @Override
        public Object proxy(String api, String path, Map<String, String> query) {
            calls.add(api + " | " + path + " | " + query);
            return Map.of("stub", true);
        }
    }
}
