package com.nexus.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

/**
 * Adapts the connection strings hosting platforms inject to the Spring properties
 * this application reads.
 *
 * Railway, Render and Heroku each expose a single {@code DATABASE_URL} /
 * {@code REDIS_URL} rather than Spring's granular properties. This runs before the
 * Spring context starts so the DataSource and Redis client are configured from
 * whatever the platform provided. Explicit Spring configuration always wins, so
 * local development and docker-compose are unaffected.
 */
public final class PlatformEnvironment {

    private static final Logger log = LoggerFactory.getLogger(PlatformEnvironment.class);

    private static final int DEFAULT_POSTGRES_PORT = 5432;
    private static final int DEFAULT_REDIS_PORT = 6379;

    private PlatformEnvironment() {
    }

    /** Populate Spring properties from platform environment variables, if present. */
    public static void apply() {
        mapDatabaseUrl();
        mapRedisUrl();
    }

    /**
     * {@code DATABASE_URL=postgresql://user:pass@host:port/db?sslmode=require}
     * becomes {@code spring.datasource.url=jdbc:postgresql://host:port/db?sslmode=require}
     * plus username/password.
     */
    private static void mapDatabaseUrl() {
        if (isConfigured("SPRING_DATASOURCE_URL", "spring.datasource.url")) {
            return;
        }
        String raw = firstNonBlank(env("DATABASE_URL"), env("POSTGRES_URL"));
        if (raw == null) {
            // Railway also exposes discrete PG* variables alongside DATABASE_URL.
            mapDiscretePostgresVariables();
            return;
        }
        try {
            URI uri = URI.create(normaliseScheme(raw, "postgres"));
            String host = uri.getHost();
            String database = stripLeadingSlash(uri.getPath());
            if (host == null || database.isEmpty()) {
                throw new IllegalArgumentException("missing host or database name");
            }
            int port = uri.getPort() == -1 ? DEFAULT_POSTGRES_PORT : uri.getPort();

            StringBuilder jdbc = new StringBuilder("jdbc:postgresql://")
                .append(host).append(':').append(port).append('/').append(database);
            String query = uri.getQuery();
            if (query != null && !query.isBlank()) {
                jdbc.append('?').append(query);
            }
            System.setProperty("spring.datasource.url", jdbc.toString());

            String userInfo = uri.getUserInfo();
            if (userInfo != null) {
                String[] parts = userInfo.split(":", 2);
                if (!isConfigured("SPRING_DATASOURCE_USERNAME", "spring.datasource.username")) {
                    set("spring.datasource.username", decode(parts[0]));
                }
                if (parts.length > 1 && !isConfigured("SPRING_DATASOURCE_PASSWORD", "spring.datasource.password")) {
                    set("spring.datasource.password", decode(parts[1]));
                }
            }
            // Safe to log: the password lives in the user-info section, not here.
            log.info("Configured the datasource from DATABASE_URL: {}", jdbc);
        } catch (Exception e) {
            log.warn("Ignoring unparseable DATABASE_URL ({}); using configured datasource properties", e.getMessage());
        }
    }

    /**
     * {@code REDIS_URL=redis://default:pass@host:port} becomes
     * {@code spring.data.redis.host/port/password}, with TLS enabled for {@code rediss://}.
     */
    private static void mapRedisUrl() {
        if (isConfigured("SPRING_DATA_REDIS_HOST", "spring.data.redis.host")) {
            return;
        }
        String raw = firstNonBlank(env("REDIS_URL"), env("REDIS_TLS_URL"), env("REDIS_PRIVATE_URL"));
        if (raw == null) {
            mapDiscreteRedisVariables();
            return;
        }
        try {
            URI uri = URI.create(raw);
            String host = uri.getHost();
            if (host == null) {
                throw new IllegalArgumentException("missing host");
            }
            int port = uri.getPort() == -1 ? DEFAULT_REDIS_PORT : uri.getPort();
            boolean tls = uri.getScheme() != null && uri.getScheme().toLowerCase(Locale.ROOT).startsWith("rediss");

            System.setProperty("spring.data.redis.host", host);
            System.setProperty("spring.data.redis.port", String.valueOf(port));
            if (tls) {
                System.setProperty("spring.data.redis.ssl.enabled", "true");
            }

            String userInfo = uri.getUserInfo();
            if (userInfo != null) {
                int separator = userInfo.indexOf(':');
                if (separator >= 0) {
                    String password = userInfo.substring(separator + 1);
                    if (!password.isBlank() && !isConfigured("SPRING_DATA_REDIS_PASSWORD", "spring.data.redis.password")) {
                        set("spring.data.redis.password", decode(password));
                    }
                }
            }
            log.info("Configured Redis from {}: host={} port={} tls={}", "REDIS_URL", host, port, tls);
        } catch (Exception e) {
            log.warn("Ignoring unparseable REDIS_URL ({}); using configured Redis properties", e.getMessage());
        }
    }

    /** Fallback for platforms that expose PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE. */
    private static void mapDiscretePostgresVariables() {
        String host = env("PGHOST");
        if (host == null) {
            return;
        }
        try {
            int port = parsePort(env("PGPORT"), DEFAULT_POSTGRES_PORT);
            String database = firstNonBlank(env("PGDATABASE"), "postgres");
            System.setProperty(
                "spring.datasource.url",
                "jdbc:postgresql://" + host + ':' + port + '/' + database
            );
            if (!isConfigured("SPRING_DATASOURCE_USERNAME", "spring.datasource.username")) {
                set("spring.datasource.username", firstNonBlank(env("PGUSER"), "postgres"));
            }
            if (!isConfigured("SPRING_DATASOURCE_PASSWORD", "spring.datasource.password")) {
                set("spring.datasource.password", env("PGPASSWORD"));
            }
            log.info("Configured the datasource from PG* variables: {}:{}/{}", host, port, database);
        } catch (Exception e) {
            log.warn("Ignoring unusable PG* variables ({}); using configured datasource properties", e.getMessage());
        }
    }

    /** Fallback for platforms that expose REDISHOST/REDISPORT/REDISPASSWORD. */
    private static void mapDiscreteRedisVariables() {
        String host = firstNonBlank(env("REDISHOST"), env("REDIS_HOST"));
        if (host == null) {
            return;
        }
        try {
            int port = parsePort(firstNonBlank(env("REDISPORT"), env("REDIS_PORT")), DEFAULT_REDIS_PORT);
            System.setProperty("spring.data.redis.host", host);
            System.setProperty("spring.data.redis.port", String.valueOf(port));
            if (!isConfigured("SPRING_DATA_REDIS_PASSWORD", "spring.data.redis.password")) {
                set("spring.data.redis.password", firstNonBlank(env("REDISPASSWORD"), env("REDIS_PASSWORD")));
            }
            log.info("Configured Redis from REDIS* variables: host={} port={}", host, port);
        } catch (Exception e) {
            log.warn("Ignoring unusable REDIS* variables ({}); using configured Redis properties", e.getMessage());
        }
    }

    private static int parsePort(String value, int fallback) {
        if (value == null) {
            return fallback;
        }
        try {
            int port = Integer.parseInt(value.trim());
            return port > 0 && port <= 65535 ? port : fallback;
        } catch (NumberFormatException e) {
            return fallback;
        }
    }

    private static String normaliseScheme(String url, String legacyScheme) {
        String trimmed = url.trim();
        return trimmed.startsWith(legacyScheme + "://")
            ? "postgresql://" + trimmed.substring((legacyScheme + "://").length())
            : trimmed;
    }

    private static String stripLeadingSlash(String path) {
        if (path == null) {
            return "";
        }
        return path.startsWith("/") ? path.substring(1) : path;
    }

    private static String env(String name) {
        String value = System.getenv(name);
        return value == null || value.isBlank() ? null : value;
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null) {
                return value;
            }
        }
        return null;
    }

    /** True when an environment variable or system property already sets this value. */
    private static boolean isConfigured(String envName, String propertyName) {
        return env(envName) != null || System.getProperty(propertyName) != null;
    }

    private static void set(String propertyName, String value) {
        if (value != null && !value.isBlank()) {
            System.setProperty(propertyName, value);
        }
    }

    private static String decode(String value) {
        try {
            return URLDecoder.decode(value, StandardCharsets.UTF_8);
        } catch (Exception e) {
            return value;
        }
    }
}
