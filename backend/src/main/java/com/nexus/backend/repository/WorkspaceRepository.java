package com.nexus.backend.repository;

import com.nexus.backend.domain.workspace.Workspace;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkspaceRepository extends JpaRepository<Workspace, Long> {
    List<Workspace> findByOrganizationId(Long organizationId);
}
