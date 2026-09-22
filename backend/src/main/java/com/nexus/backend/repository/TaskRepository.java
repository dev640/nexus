package com.nexus.backend.repository;

import com.nexus.backend.domain.project.Project;
import com.nexus.backend.domain.sprint.Sprint;
import com.nexus.backend.domain.task.Task;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectId(Long projectId);

    List<Task> findBySprintId(Long sprintId);

    List<Task> findByProject(Project project);

    List<Task> findBySprint(Sprint sprint);
}
