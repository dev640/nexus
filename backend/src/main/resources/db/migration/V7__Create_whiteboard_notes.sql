-- Whiteboard sticky notes. A single shared board per workspace is enough for
-- the current product; `board` leaves room for multiple boards later.

CREATE TABLE whiteboard_notes (
    id BIGSERIAL PRIMARY KEY,
    board VARCHAR(100) NOT NULL DEFAULT 'default',
    text TEXT NOT NULL DEFAULT '',
    color VARCHAR(20) NOT NULL DEFAULT '#fff2a8',
    x DOUBLE PRECISION NOT NULL DEFAULT 40,
    y DOUBLE PRECISION NOT NULL DEFAULT 40,
    author VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_whiteboard_notes_board ON whiteboard_notes(board);
