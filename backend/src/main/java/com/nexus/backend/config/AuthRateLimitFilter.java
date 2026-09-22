package com.nexus.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Lightweight per-IP rate limit on authentication endpoints, to blunt
 * credential-stuffing and brute-force attempts.
 *
 * In-memory and per-instance by design: a shared store (Redis) can replace the
 * counter map when running many instances.
 */
@Component
@Order(1)
public class AuthRateLimitFilter extends OncePerRequestFilter {

    private record Window(long startMillis, int count) {}

    private final Map<String, Window> windows = new ConcurrentHashMap<>();
    private final int maxRequests;
    private final long windowMillis;

    public AuthRateLimitFilter(
        @Value("${nexus.auth.rate-limit.max-requests:20}") int maxRequests,
        @Value("${nexus.auth.rate-limit.window-seconds:60}") long windowSeconds
    ) {
        this.maxRequests = maxRequests;
        this.windowMillis = windowSeconds * 1000;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/api/auth/");
    }

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        String ip = clientIp(request);
        long now = System.currentTimeMillis();

        Window window = windows.get(ip);
        if (window == null || now - window.startMillis() > windowMillis) {
            windows.put(ip, new Window(now, 1));
        } else if (window.count() >= maxRequests) {
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write(
                "{\"status\":429,\"message\":\"Too many authentication attempts. Try again shortly.\"}"
            );
            return;
        } else {
            windows.put(ip, new Window(window.startMillis(), window.count() + 1));
        }

        // Keep the map from growing without bound.
        if (windows.size() > 10_000) {
            windows.entrySet().removeIf(e -> now - e.getValue().startMillis() > windowMillis);
        }

        filterChain.doFilter(request, response);
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
