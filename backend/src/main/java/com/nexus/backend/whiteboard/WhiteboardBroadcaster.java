package com.nexus.backend.whiteboard;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexus.backend.dto.WhiteboardEvent;
import com.nexus.backend.dto.WhiteboardNoteResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

/**
 * Fans note events out to every connected client.
 *
 * Local WebSocket sessions are always notified. When Redis is reachable the event
 * is also published on a channel so other backend instances (each of which
 * subscribes to {@link #CHANNEL}) relay it to their own clients.
 */
@Component
public class WhiteboardBroadcaster {

    public static final String CHANNEL = "nexus:whiteboard";

    private static final Logger log = LoggerFactory.getLogger(WhiteboardBroadcaster.class);

    private final WhiteboardSocketHandler socketHandler;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String instanceId = java.util.UUID.randomUUID().toString();

    public WhiteboardBroadcaster(
        WhiteboardSocketHandler socketHandler,
        ObjectProvider<StringRedisTemplate> redisTemplateProvider
    ) {
        this.socketHandler = socketHandler;
        this.redisTemplate = redisTemplateProvider.getIfAvailable();
    }

    public String getInstanceId() {
        return instanceId;
    }

    /** Publish an event: locally always, plus Redis so other instances relay it. */
    public void publish(String type, WhiteboardNoteResponse note) {
        WhiteboardEvent event = new WhiteboardEvent(type, note, instanceId);
        deliver(event);
        if (redisTemplate == null) return;
        try {
            redisTemplate.convertAndSend(CHANNEL, objectMapper.writeValueAsString(event));
        } catch (Exception e) {
            // Redis is optional: real-time still works within this instance.
            log.debug("Redis fan-out unavailable, continuing locally: {}", e.getMessage());
        }
    }

    /** True when this event was produced by this instance (already delivered locally). */
    public boolean isOwnEvent(WhiteboardEvent event) {
        return instanceId.equals(event.origin());
    }

    /** Deliver an event to this instance's connected sessions. */
    public void deliver(WhiteboardEvent event) {
        try {
            socketHandler.broadcast(objectMapper.writeValueAsString(event));
        } catch (Exception e) {
            log.warn("Failed to broadcast whiteboard event: {}", e.getMessage());
        }
    }
}
