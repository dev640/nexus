-- Insert sample organization
INSERT INTO organizations (id, name, description, created_at, updated_at)
VALUES (1, 'Acme Corporation', 'Leading technology company', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert sample workspace
INSERT INTO workspaces (id, name, description, organization_id, created_at, updated_at)
VALUES (1, 'Engineering Workspace', 'Main engineering workspace', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert sample users (passwords are BCrypt hash of "password123")
INSERT INTO users (id, name, email, password, role, created_at, updated_at)
VALUES
    (1, 'Devendra', 'devendra@nexus.com', '$2a$10$xQ8JqVz1ZwJ0Z5lqT6Tz2e8Y.pU5fK4qF3vL9Yn1mF4W5R7xV8Z9u', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, 'Achal', 'achal@nexus.com', '$2a$10$xQ8JqVz1ZwJ0Z5lqT6Tz2e8Y.pU5fK4qF3vL9Yn1mF4W5R7xV8Z9u', 'MEMBER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (3, 'Vidhi', 'vidhi@nexus.com', '$2a$10$xQ8JqVz1ZwJ0Z5lqT6Tz2e8Y.pU5fK4qF3vL9Yn1mF4W5R7xV8Z9u', 'MEMBER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (4, 'Palak', 'palak@nexus.com', '$2a$10$xQ8JqVz1ZwJ0Z5lqT6Tz2e8Y.pU5fK4qF3vL9Yn1mF4W5R7xV8Z9u', 'MEMBER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert sample project
INSERT INTO projects (id, name, description, status, health, progress, sprint_number, member_count, organization_id, workspace_id, created_at, updated_at)
VALUES (1, 'AI Commerce Platform', 'Building an intelligent commerce platform for independent retailers', 'ACTIVE', 'ON_TRACK', 68, 8, 12, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert sample sprint
INSERT INTO sprints (id, project_id, number, goal, start_date, end_date, committed_points, status, created_at, updated_at)
VALUES (1, 1, 8, 'Launch the billing foundation', '2026-08-18', '2026-08-29', 42, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert sample tasks
INSERT INTO tasks (id, title, description, project_id, sprint_id, status, priority, story_points, assignee_id, labels, created_at, updated_at)
VALUES
    (1, 'Design authentication flow', 'Create wireframes and user flow for the authentication process', 1, 1, 'DONE', 'HIGH', 5, 3, ARRAY['design', 'auth'], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, 'Create PostgreSQL schema', 'Design and implement database schema for user data', 1, 1, 'DONE', 'HIGH', 3, 2, ARRAY['backend', 'database'], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (3, 'Implement JWT authentication', 'Build JWT token generation and validation', 1, 1, 'IN_PROGRESS', 'URGENT', 8, 2, ARRAY['backend', 'security'], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (4, 'Build project dashboard', 'Create main dashboard with project overview cards', 1, 1, 'IN_REVIEW', 'MEDIUM', 8, 3, ARRAY['frontend'], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (5, 'Integrate payment API', 'Connect Stripe API for payment processing', 1, 1, 'TODO', 'URGENT', 13, 2, ARRAY['backend', 'payments'], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (6, 'Write API documentation', 'Document all REST endpoints with examples', 1, NULL, 'TODO', 'LOW', 3, 1, ARRAY['docs'], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (7, 'Create QA test suite', 'Build automated test suite for core features', 1, 1, 'TESTING', 'HIGH', 5, 4, ARRAY['qa'], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Reset sequences to continue from the last inserted ID
SELECT setval('organizations_id_seq', (SELECT MAX(id) FROM organizations));
SELECT setval('workspaces_id_seq', (SELECT MAX(id) FROM workspaces));
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('projects_id_seq', (SELECT MAX(id) FROM projects));
SELECT setval('sprints_id_seq', (SELECT MAX(id) FROM sprints));
SELECT setval('tasks_id_seq', (SELECT MAX(id) FROM tasks));
