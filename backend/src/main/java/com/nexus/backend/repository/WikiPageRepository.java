package com.nexus.backend.repository;

import com.nexus.backend.domain.wiki.WikiPage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WikiPageRepository extends JpaRepository<WikiPage, Long> {
    List<WikiPage> findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(
        String titleFragment, String contentFragment);

    List<WikiPage> findByProjectId(Long projectId);
}
