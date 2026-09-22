package com.nexus.backend.dto;

public record WhiteboardNoteResponse(
    Long id,
    String board,
    String text,
    String color,
    Double x,
    Double y,
    String author
) {}
