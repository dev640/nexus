package com.nexus.backend.web;

import com.nexus.backend.domain.task.TaskStatus;
import com.nexus.backend.dto.TaskRequest;
import com.nexus.backend.dto.TaskResponse;
import com.nexus.backend.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<List<TaskResponse>> listTasks(
        @RequestParam(required = false) Long projectId,
        @RequestParam(required = false) Long sprintId
    ) {
        List<TaskResponse> tasks;
        if (projectId != null) {
            tasks = taskService.findByProjectId(projectId);
        } else if (sprintId != null) {
            tasks = taskService.findBySprintId(sprintId);
        } else {
            tasks = taskService.findAll();
        }
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTask(@PathVariable Long id) {
        TaskResponse task = taskService.findById(id);
        return ResponseEntity.ok(task);
    }

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(@Valid @RequestBody TaskRequest request) {
        TaskResponse task = taskService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(task);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(
        @PathVariable Long id,
        @Valid @RequestBody TaskRequest request
    ) {
        TaskResponse task = taskService.update(id, request);
        return ResponseEntity.ok(task);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskResponse> updateTaskStatus(
        @PathVariable Long id,
        @RequestBody Map<String, String> payload
    ) {
        TaskStatus newStatus = TaskStatus.valueOf(payload.get("status"));
        TaskResponse task = taskService.updateStatus(id, newStatus);
        return ResponseEntity.ok(task);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
