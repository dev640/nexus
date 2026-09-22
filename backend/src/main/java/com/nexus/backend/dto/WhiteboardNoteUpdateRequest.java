package com.nexus.backend.dto;

public record WhiteboardNoteUpdateRequest(
    String text,
    String color,
    Double x,
    Double y
) {}
