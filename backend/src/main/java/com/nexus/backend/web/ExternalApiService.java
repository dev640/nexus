package com.nexus.backend.web;

import java.net.URI;
import java.time.Duration;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

/**
 * Server-side proxy for the free public APIs curated via Apivault.dev.
 * Fetching through the backend avoids browser CORS restrictions and
 * keeps third-party rate limits in one place.
 */
@Service
public class ExternalApiService {

    private final RestClient restClient;

    public ExternalApiService() {
        org.springframework.http.client.SimpleClientHttpRequestFactory factory =
                new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(5));
        factory.setReadTimeout(Duration.ofSeconds(10));
        this.restClient = org.springframework.web.client.RestClient.builder()
                .requestFactory(factory)
                .build();
    }

    /** Test seam: build the service around an externally configured RestClient. */
    ExternalApiService(RestClient restClient) {
        this.restClient = restClient;
    }

    /**
     * Generic proxy: performs the request against the upstream API and
     * returns its JSON body, or throws 502 when the upstream is unreachable.
     */
    public Object proxy(String api, String path, Map<String, String> query) {
        URI uri = buildUpstreamUri(api, path, query);
        if (uri == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Unknown external API: " + api);
        }
        try {
            Object body = restClient.get()
                    .uri(uri)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(Object.class);
            if (body == null) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "Upstream " + api + " returned an empty body");
            }
            return body;
        } catch (RestClientException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Upstream " + api + " unreachable: " + e.getMessage(), e);
        }
    }

    /** Maps the /api/external/{api} slug to the real upstream base URL. */
    private URI buildUpstreamUri(String api, String path, Map<String, String> query) {
        String base;
        switch (api) {
            case "quotes" -> base = "https://zenquotes.io/api";
            case "weather" -> base = "https://wttr.in";
            case "bored" -> base = "https://www.boredapi.com/api";
            case "exchange" -> base = "https://api.exchangerate-api.com/v4";
            case "jsonplaceholder" -> base = "https://jsonplaceholder.typicode.com";
            case "reddit" -> base = "https://www.reddit.com/r";
            default -> { return null; }
        }
        String cleanPath = (path == null || path.isBlank()) ? "" : ("/" + path.replaceAll("^/+", ""));
        // Encode each path segment (e.g. "New York" -> "New%20York") while
        // preserving separators and dots like "hot.json".
        String encodedPath = java.util.Arrays.stream(cleanPath.split("/"))
                .map(segment -> segment.isEmpty() ? segment
                        : java.net.URLEncoder.encode(segment, java.nio.charset.StandardCharsets.UTF_8)
                                .replace("+", "%20"))
                .reduce((a, b) -> a + "/" + b)
                .orElse("");
        StringBuilder url = new StringBuilder(base + encodedPath);
        if (query != null && !query.isEmpty()) {
            url.append('?');
            boolean first = true;
            for (Map.Entry<String, String> e : query.entrySet()) {
                if (!first) url.append('&');
                url.append(java.net.URLEncoder.encode(e.getKey(), java.nio.charset.StandardCharsets.UTF_8))
                        .append('=')
                        .append(java.net.URLEncoder.encode(e.getValue(), java.nio.charset.StandardCharsets.UTF_8));
                first = false;
            }
        }
        return URI.create(url.toString());
    }
}
