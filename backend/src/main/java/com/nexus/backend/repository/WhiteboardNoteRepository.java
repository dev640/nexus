package com.nexus.backend.repository;

import com.nexus.backend.domain.whiteboard.WhiteboardNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WhiteboardNoteRepository extends JpaRepository<WhiteboardNote, Long> {
    List<WhiteboardNote> findByBoardOrderByCreatedAtAsc(String board);
}
