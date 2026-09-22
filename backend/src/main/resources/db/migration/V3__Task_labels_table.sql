-- Align task label storage with the Task entity's @ElementCollection mapping.
-- V1 stored labels as a Postgres TEXT[] column; the entity maps labels to a
-- task_labels join table, so migrate any existing values and drop the column.

CREATE TABLE task_labels (
    task_id BIGINT NOT NULL,
    label VARCHAR(255),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE INDEX idx_task_labels_task_id ON task_labels(task_id);

INSERT INTO task_labels (task_id, label)
SELECT id, unnest(labels)
FROM tasks
WHERE labels IS NOT NULL AND array_length(labels, 1) > 0;

ALTER TABLE tasks DROP COLUMN labels;
