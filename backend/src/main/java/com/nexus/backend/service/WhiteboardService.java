package com.nexus.backend.service;

import com.nexus.backend.domain.whiteboard.WhiteboardNote;
import com.nexus.backend.dto.WhiteboardNoteRequest;
import com.nexus.backend.dto.WhiteboardNoteResponse;
import com.nexus.backend.dto.WhiteboardNoteUpdateRequest;
import com.nexus.backend.exception.ResourceNotFoundException;
import com.nexus.backend.repository.WhiteboardNoteRepository;
import com.nexus.backend.whiteboard.WhiteboardBroadcaster;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class WhiteboardService {

    public static final String DEFAULT_BOARD = "default";

    private final WhiteboardNoteRepository noteRepository;
    private final WhiteboardBroadcaster broadcaster;

    public WhiteboardService(WhiteboardNoteRepository noteRepository, WhiteboardBroadcaster broadcaster) {
        this.noteRepository = noteRepository;
        this.broadcaster = broadcaster;
    }

    @Transactional(readOnly = true)
    public List<WhiteboardNoteResponse> list(String board) {
        String key = board == null || board.isBlank() ? DEFAULT_BOARD : board;
        return noteRepository.findByBoardOrderByCreatedAtAsc(key).stream()
            .map(WhiteboardService::mapToResponse)
            .toList();
    }

    @Transactional
    public WhiteboardNoteResponse create(WhiteboardNoteRequest request, String board) {
        WhiteboardNote note = new WhiteboardNote();
        note.setBoard(board == null || board.isBlank() ? DEFAULT_BOARD : board);
        note.setColor(request.color());
        note.setX(request.x() != null ? request.x() : 40.0);
        note.setY(request.y() != null ? request.y() : 40.0);
        note.setAuthor(currentUserEmail());
        WhiteboardNote saved = noteRepository.save(note);

        WhiteboardNoteResponse response = mapToResponse(saved);
        broadcaster.publish("created", response);
        return response;
    }

    @Transactional
    public WhiteboardNoteResponse update(Long id, WhiteboardNoteUpdateRequest request) {
        WhiteboardNote note = noteRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Whiteboard note", "id", id));
        if (request.text() != null) note.setText(request.text());
        if (request.color() != null) note.setColor(request.color());
        if (request.x() != null) note.setX(request.x());
        if (request.y() != null) note.setY(request.y());
        WhiteboardNote saved = noteRepository.save(note);

        WhiteboardNoteResponse response = mapToResponse(saved);
        broadcaster.publish("updated", response);
        return response;
    }

    @Transactional
    public void delete(Long id) {
        WhiteboardNote note = noteRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Whiteboard note", "id", id));
        WhiteboardNoteResponse response = mapToResponse(note);
        noteRepository.delete(note);
        broadcaster.publish("deleted", response);
    }

    private String currentUserEmail() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : null;
    }

    private static WhiteboardNoteResponse mapToResponse(WhiteboardNote n) {
        return new WhiteboardNoteResponse(
            n.getId(), n.getBoard(), n.getText(), n.getColor(), n.getX(), n.getY(), n.getAuthor()
        );
    }
}
