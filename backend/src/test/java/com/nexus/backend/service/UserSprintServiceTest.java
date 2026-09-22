package com.nexus.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.nexus.backend.domain.project.Project;
import com.nexus.backend.domain.project.ProjectHealth;
import com.nexus.backend.domain.project.ProjectStatus;
import com.nexus.backend.domain.sprint.Sprint;
import com.nexus.backend.domain.sprint.SprintStatus;
import com.nexus.backend.domain.user.User;
import com.nexus.backend.domain.user.UserRole;
import com.nexus.backend.dto.LoginRequest;
import com.nexus.backend.dto.RegisterRequest;
import com.nexus.backend.dto.SprintRequest;
import com.nexus.backend.exception.ResourceNotFoundException;
import com.nexus.backend.exception.ValidationException;
import com.nexus.backend.repository.ProjectRepository;
import com.nexus.backend.repository.SprintRepository;
import com.nexus.backend.repository.UserRepository;
import com.nexus.backend.security.JwtUtil;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class UserSprintServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private SprintRepository sprintRepository;

    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks
    private UserService userService;

    @InjectMocks
    private SprintService sprintService;

    private Project project;

    @BeforeEach
    void setUp() {
        project = new Project("Demo", "demo", ProjectStatus.PLANNING, ProjectHealth.ON_TRACK);
        project.setId(1L);
    }

    // ---------- UserService ----------

    private RegisterRequest registerRequest() {
        return new RegisterRequest("Test User", "test@nexus.dev", "password123");
    }

    @Test
    void registerEncodesPasswordAndReturnsTokens() {
        when(userRepository.findByEmail("test@nexus.dev")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password123")).thenReturn("$2a$10$hashed");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(10L);
            return u;
        });
        when(jwtUtil.generateToken("test@nexus.dev")).thenReturn("access-token");
        when(jwtUtil.generateRefreshToken("test@nexus.dev")).thenReturn("refresh-token");

        var response = userService.register(registerRequest());

        assertThat(response.token()).isEqualTo("access-token");
        assertThat(response.refreshToken()).isEqualTo("refresh-token");
        assertThat(response.user().email()).isEqualTo("test@nexus.dev");
        verify(passwordEncoder).encode("password123");
    }

    @Test
    void registerRejectsDuplicateEmail() {
        when(userRepository.findByEmail("test@nexus.dev")).thenReturn(Optional.of(new User()));

        assertThatThrownBy(() -> userService.register(registerRequest()))
            .isInstanceOf(ValidationException.class)
            .hasMessageContaining("already exists");
    }

    @Test
    void loginSucceedsWithCorrectPassword() {
        User user = new User();
        user.setId(1L);
        user.setName("Dev");
        user.setEmail("devendra@nexus.com");
        user.setRole(UserRole.ADMIN);
        user.setPassword("$2a$10$hashed");
        when(userRepository.findByEmail("devendra@nexus.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "$2a$10$hashed")).thenReturn(true);
        when(jwtUtil.generateToken("devendra@nexus.com")).thenReturn("access-token");
        when(jwtUtil.generateRefreshToken("devendra@nexus.com")).thenReturn("refresh-token");

        var response = userService.login(new LoginRequest("devendra@nexus.com", "password123"));

        assertThat(response.token()).isEqualTo("access-token");
        assertThat(response.user().role()).isEqualTo(UserRole.ADMIN);
    }

    @Test
    void loginRejectsWrongPassword() {
        User user = new User();
        user.setEmail("devendra@nexus.com");
        user.setPassword("$2a$10$hashed");
        when(userRepository.findByEmail("devendra@nexus.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("nope", "$2a$10$hashed")).thenReturn(false);

        assertThatThrownBy(() -> userService.login(new LoginRequest("devendra@nexus.com", "nope")))
            .isInstanceOf(ValidationException.class)
            .hasMessageContaining("Invalid email or password");
    }

    // ---------- SprintService ----------

    private SprintRequest sprintRequest() {
        return new SprintRequest(1L, "Ship billing", LocalDate.of(2026, 9, 1),
            LocalDate.of(2026, 9, 14), 40, null);
    }

    @Test
    void createSprintNumbersSequentiallyAndUpdatesProject() {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(sprintRepository.countByProject(project)).thenReturn(7L);
        when(sprintRepository.save(any(Sprint.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = sprintService.create(sprintRequest());

        assertThat(response.number()).isEqualTo(8);
        assertThat(response.status()).isEqualTo(SprintStatus.PLANNED);
        verify(projectRepository).save(project);
        assertThat(project.getSprintNumber()).isEqualTo(8);
    }

    @Test
    void createSprintRejectsEndDateBeforeStartDate() {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));

        assertThatThrownBy(() -> sprintService.create(new SprintRequest(1L, "Backwards",
            LocalDate.of(2026, 9, 14), LocalDate.of(2026, 9, 1), 40, null)))
            .isInstanceOf(ValidationException.class)
            .hasMessageContaining("End date must be after start date");
    }

    @Test
    void updateSprintStatusPersistsChange() {
        Sprint sprint = new Sprint();
        sprint.setId(3L);
        sprint.setProject(project);
        sprint.setNumber(1);
        sprint.setGoal("g");
        sprint.setStartDate(LocalDate.now());
        sprint.setEndDate(LocalDate.now().plusDays(7));
        sprint.setStatus(SprintStatus.PLANNED);
        when(sprintRepository.findById(3L)).thenReturn(Optional.of(sprint));
        when(sprintRepository.save(any(Sprint.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = sprintService.updateStatus(3L, SprintStatus.ACTIVE);

        assertThat(response.status()).isEqualTo(SprintStatus.ACTIVE);
        verify(sprintRepository).save(sprint);
    }

    @Test
    void findSprintByIdThrowsWhenMissing() {
        when(sprintRepository.findById(404L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sprintService.findById(404L))
            .isInstanceOf(ResourceNotFoundException.class);
    }
}
