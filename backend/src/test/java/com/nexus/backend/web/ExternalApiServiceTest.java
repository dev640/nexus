package com.nexus.backend.web;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import java.net.URI;
import java.util.LinkedHashMap;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

/**
 * Unit tests for the external-API proxy service. Uses MockRestServiceServer
 * to assert the exact upstream URL the service builds for each proxied API
 * (path segment encoding, dots like hot.json, query strings), the response
 * mapping, and the error translation (unknown slug -> 404, upstream error -> 502).
 */
class ExternalApiServiceTest {

    private record Fixture(ExternalApiService service, MockRestServiceServer server) {}

    private Fixture fixture() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        return new Fixture(new ExternalApiService(builder.build()), server);
    }

    @Test
    void quotesProxyHitsUpstreamRandomEndpoint() {
        Fixture f = fixture();
        f.server.expect(requestTo("https://zenquotes.io/api/random"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess("{\"q\":\"Do the work\",\"a\":\"Someone\"}", MediaType.APPLICATION_JSON));

        Object body = f.service.proxy("quotes", "/random", Map.of());

        assertEquals(Map.of("q", "Do the work", "a", "Someone"), body);
        f.server.verify();
    }

    @Test
    void weatherProxyEncodesSpacesAndQuery() {
        Fixture f = fixture();
        f.server.expect(requestTo(URI.create("https://wttr.in/New%20York?format=j1")))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess("{\"current_condition\":[]}", MediaType.APPLICATION_JSON));

        f.service.proxy("weather", "/New York", Map.of("format", "j1"));

        f.server.verify();
    }

    @Test
    void redditProxyPreservesDotsAndLimit() {
        Fixture f = fixture();
        f.server.expect(requestTo(URI.create("https://www.reddit.com/r/productivity/hot.json?limit=10")))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess("{\"data\":{\"children\":[]}}", MediaType.APPLICATION_JSON));

        f.service.proxy("reddit", "/productivity/hot.json", Map.of("limit", "10"));

        f.server.verify();
    }

    @Test
    void boredProxyPassesOptionalFilters() {
        Fixture f = fixture();
        Map<String, String> query = new LinkedHashMap<>();
        query.put("participants", "2");
        query.put("price", "0.0");
        f.server.expect(requestTo(URI.create("https://www.boredapi.com/api/activity?participants=2&price=0.0")))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess("{\"activity\":\"Go for a walk\"}", MediaType.APPLICATION_JSON));

        f.service.proxy("bored", "/activity", query);

        f.server.verify();
    }

    @Test
    void unknownSlugReturns404WithoutCallingUpstream() {
        Fixture f = fixture();

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> f.service.proxy("not-a-real-api", "/whatever", Map.of()));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        f.server.verify(); // no requests were expected or made
    }

    @Test
    void upstreamFailureTranslatesTo502() {
        Fixture f = fixture();
        f.server.expect(requestTo(URI.create("https://api.exchangerate-api.com/v4/latest/USD")))
                .andRespond(withServerError());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> f.service.proxy("exchange", "/latest/USD", Map.of()));

        assertEquals(HttpStatus.BAD_GATEWAY, ex.getStatusCode());
        f.server.verify();
    }
}
