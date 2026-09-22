package com.nexus.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Event broadcast to every connected client over the whiteboard socket.
 *
 * @param origin id of the instance that produced the event, so the producing
 *               instance can ignore its own Redis echo (it already delivered locally)
 */
public record WhiteboardEvent(
    @NotBlank String type,
    @NotNull WhiteboardNoteResponse note,
    String origin
) {}
