package com.nexus.backend.repository;

import com.nexus.backend.domain.sprint.Sprint;
import com.nexus.backend.domain.project.Project;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SprintRepository extends JpaRepository<Sprint, Long> {
    List<Sprint> findByProjectId(Long projectId);
    List<Sprint> findByProject(Project project);
    Long countByProject(Project project);
}
