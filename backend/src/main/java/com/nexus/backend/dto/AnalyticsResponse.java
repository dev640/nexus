package com.nexus.backend.dto;

import java.util.List;

public record AnalyticsResponse(
    VelocityData velocity,
    List<StatusCount> statusBreakdown,
    List<PriorityCount> priorityBreakdown,
    List<MemberLoad> teamLoad,
    List<RiskItem> risks,
    Summary summary
) {
    public record VelocityData(List<SprintVelocity> perSprint) {}

    public record SprintVelocity(
        Long sprintId,
        Integer number,
        String goal,
        Integer committedPoints,
        Integer donePoints
    ) {}

    public record StatusCount(String status, Long count) {}

    public record PriorityCount(String priority, Long count) {}

    public record MemberLoad(
        Long userId,
        String name,
        Long openTasks,
        Integer openPoints
    ) {}

    public record RiskItem(
        Long taskId,
        String title,
        String reason,
        String priority,
        String status
    ) {}

    public record Summary(
        Long totalTasks,
        Long doneTasks,
        Double completionRate,
        Integer committedPointsActiveSprint,
        Integer donePointsActiveSprint
    ) {}
}
