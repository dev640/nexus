package com.nexus.backend.web;

import com.nexus.backend.dto.CopilotAnswerResponse;
import com.nexus.backend.dto.CopilotAskRequest;
import com.nexus.backend.service.CopilotService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/copilot")
public class CopilotController {

    private final CopilotService copilotService;

    public CopilotController(CopilotService copilotService) {
        this.copilotService = copilotService;
    }

    @PostMapping("/ask")
    public ResponseEntity<CopilotAnswerResponse> ask(
        @Valid @RequestBody CopilotAskRequest request,
        @RequestParam(required = false) Long projectId
    ) {
        return ResponseEntity.ok(copilotService.ask(request.question(), projectId));
    }
}
