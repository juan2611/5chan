DROP TABLE IF EXISTS media;

CREATE TABLE media (
    media_id VARCHAR(64) PRIMARY KEY,
    post_id VARCHAR(64),
    user_id VARCHAR(64),
    filename VARCHAR(255),
    timestamp DATETIME
);
