package com.nexus.backend.web;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST proxy over the free public APIs surfaced in the NEXUS API Vault
 * (catalog curated from Apivault.dev). The frontend calls these endpoints
 * instead of the upstreams directly, so browser CORS never blocks a call
 * and upstream rate limits are managed in one place.
 */
@RestController
@RequestMapping("/api/external")
public class ExternalApiController {

    private final ExternalApiService externalApiService;

    public ExternalApiController(ExternalApiService externalApiService) {
        this.externalApiService = externalApiService;
    }

    /** GET /api/external — lists the proxied APIs for discovery/UI. */
    @GetMapping
    public Map<String, Object> index() {
        return Map.of(
                "source", "Apivault.dev curated free APIs",
                "apis", List.of(
                        Map.of("slug", "quotes", "upstream", "https://zenquotes.io", "example", "/api/external/quotes/random"),
                        Map.of("slug", "weather", "upstream", "https://wttr.in", "example", "/api/external/weather/London?format=j1"),
                        Map.of("slug", "bored", "upstream", "https://www.boredapi.com/api", "example", "/api/external/bored/activity"),
                        Map.of("slug", "exchange", "upstream", "https://api.exchangerate-api.com/v4", "example", "/api/external/exchange/latest/USD"),
                        Map.of("slug", "jsonplaceholder", "upstream", "https://jsonplaceholder.typicode.com", "example", "/api/external/jsonplaceholder/todos/1"),
                        Map.of("slug", "reddit", "upstream", "https://www.reddit.com/r", "example", "/api/external/reddit/productivity/hot.json")));
    }

    /** GET /api/external/quotes/random — ZenQuotes daily inspiration. */
    @GetMapping("/quotes/random")
    public ResponseEntity<Object> randomQuote() {
        return ResponseEntity.ok(externalApiService.proxy("quotes", "/random", Map.of()));
    }

    /** GET /api/external/weather/{city}?format=j1 — wttr.in JSON weather. */
    @GetMapping("/weather/{city}")
    public ResponseEntity<Object> weather(
            @PathVariable String city,
            @RequestParam(defaultValue = "j1") String format) {
        return ResponseEntity.ok(externalApiService.proxy("weather", "/" + city, Map.of("format", format)));
    }

    /** GET /api/external/bored/activity — Bored API activity suggestion. */
    @GetMapping("/bored/activity")
    public ResponseEntity<Object> boredActivity(
            @RequestParam(required = false) Integer participants,
            @RequestParam(required = false) Double price) {
        Map<String, String> query = new LinkedHashMap<>();
        if (participants != null) query.put("participants", String.valueOf(participants));
        if (price != null) query.put("price", String.valueOf(price));
        return ResponseEntity.ok(externalApiService.proxy("bored", "/activity", query));
    }

    /** GET /api/external/exchange/latest/{base} — exchange rates. */
    @GetMapping("/exchange/latest/{base}")
    public ResponseEntity<Object> exchange(@PathVariable String base) {
        return ResponseEntity.ok(externalApiService.proxy("exchange", "/latest/" + base, Map.of()));
    }

    /** GET /api/external/jsonplaceholder/{resource}?query — mock REST data. */
    @GetMapping("/jsonplaceholder/{resource}")
    public ResponseEntity<Object> jsonPlaceholder(
            @PathVariable String resource,
            @RequestParam Map<String, String> query) {
        return ResponseEntity.ok(externalApiService.proxy("jsonplaceholder", "/" + resource, query));
    }

    /** GET /api/external/jsonplaceholder/{resource}/{id} — single mock item. */
    @GetMapping("/jsonplaceholder/{resource}/{id}")
    public ResponseEntity<Object> jsonPlaceholderItem(
            @PathVariable String resource,
            @PathVariable String id) {
        return ResponseEntity.ok(externalApiService.proxy("jsonplaceholder", "/" + resource + "/" + id, Map.of()));
    }

    /** GET /api/external/reddit/{subreddit}/hot.json — subreddit hot feed. */
    @GetMapping("/reddit/{subreddit}/hot.json")
    public ResponseEntity<Object> reddit(
            @PathVariable String subreddit,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(externalApiService.proxy(
                "reddit", "/" + subreddit + "/hot.json", Map.of("limit", String.valueOf(limit))));
    }
}
