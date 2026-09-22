package com.nexus.backend.whiteboard;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexus.backend.dto.WhiteboardEvent;
import com.nexus.backend.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.context.annotation.Bean;

import java.net.URI;
import java.util.Map;

/**
 * Registers the whiteboard socket at /ws/whiteboard and authenticates the
 * handshake with a JWT passed as the `token` query parameter.
 */
@Configuration
@EnableWebSocket
public class WhiteboardSocketConfig implements WebSocketConfigurer {

    private static final Logger log = LoggerFactory.getLogger(WhiteboardSocketConfig.class);

    private final WhiteboardSocketHandler handler;
    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public WhiteboardSocketConfig(WhiteboardSocketHandler handler, JwtUtil jwtUtil) {
        this.handler = handler;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(handler, "/ws/whiteboard")
            .addInterceptors(new JwtHandshakeInterceptor())
            .setAllowedOriginPatterns("*");
    }

    /** Rejects handshakes without a valid token. */
    private class JwtHandshakeInterceptor implements HandshakeInterceptor {
        @Override
        public boolean beforeHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Map<String, Object> attributes
        ) {
            URI uri = request.getURI();
            String query = uri.getQuery();
            String token = null;
            if (query != null) {
                for (String part : query.split("&")) {
                    if (part.startsWith("token=")) {
                        token = part.substring("token=".length());
                    }
                }
            }
            if (token == null || token.isBlank()) {
                log.debug("Whiteboard handshake rejected: missing token");
                return false;
            }
            try {
                String email = jwtUtil.extractUsername(token);
                if (email == null || !jwtUtil.validateToken(token, email)) {
                    return false;
                }
                attributes.put("email", email);
                return true;
            } catch (Exception e) {
                log.debug("Whiteboard handshake rejected: {}", e.getMessage());
                return false;
            }
        }

        @Override
        public void afterHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Exception exception
        ) {
            // no-op
        }
    }

    /**
     * Relays events published by other instances to this instance's clients.
     * Optional: if Redis is not reachable the app still runs, single-instance.
     */
    @Bean
    public RedisMessageListenerContainer whiteboardRedisListener(
        RedisConnectionFactory connectionFactory,
        WhiteboardBroadcaster broadcaster
    ) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.addMessageListener(
            (message, pattern) -> {
                try {
                    WhiteboardEvent event = objectMapper.readValue(message.getBody(), WhiteboardEvent.class);
                    // Skip our own echo: this instance already delivered it locally.
                    if (!broadcaster.isOwnEvent(event)) {
                        broadcaster.deliver(event);
                    }
                } catch (Exception e) {
                    log.warn("Ignoring malformed whiteboard event from Redis: {}", e.getMessage());
                }
            },
            new ChannelTopic(WhiteboardBroadcaster.CHANNEL)
        );
        return container;
    }
}
