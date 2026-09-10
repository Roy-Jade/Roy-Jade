-- ============================================================
-- MIGRATION — création des tables
-- ============================================================
BEGIN;

SET CLIENT_ENCODING TO 'UTF-8';

CREATE TABLE admin (
    pseudonyme      VARCHAR(20),
    hashed_password VARCHAR (255),
    email           VARCHAR(255)
);

CREATE TABLE identity (
    id              SERIAL PRIMARY KEY,
    firstname       VARCHAR(20),
    lastname        VARCHAR(20),
    email           VARCHAR(255),
    telephone       VARCHAR(20),
    town            VARCHAR(100),
    github_link     VARCHAR(100),
    gitlab_link     VARCHAR(100),
    linkedin_link   VARCHAR(100),
    rqth            BOOLEAN,
    CONSTRAINT unique_id CHECK(id=1)
);

CREATE TABLE language (
    id      SERIAL PRIMARY KEY,
    slug    VARCHAR(100) UNIQUE NOT NULL, 
    label   VARCHAR(100) NOT NULL,
    level   VARCHAR(50)
);

CREATE TABLE hobby (
    id      SERIAL PRIMARY KEY,
    slug    VARCHAR(100) UNIQUE NOT NULL,
    label   VARCHAR(100) NOT NULL,
    supplement   VARCHAR(200)
);

CREATE TABLE profile (
    id          SERIAL PRIMARY KEY,
    context     VARCHAR(50)  UNIQUE NOT NULL,
    tagline     TEXT         NOT NULL,
    description TEXT         NOT NULL
);

CREATE TABLE domain (
    id    SERIAL PRIMARY KEY,
    slug  VARCHAR(100) UNIQUE NOT NULL,
    label VARCHAR(100) NOT NULL
);

CREATE TABLE softskill (
    id    SERIAL PRIMARY KEY,
    slug  VARCHAR(100) UNIQUE NOT NULL,
    label VARCHAR(150) NOT NULL
);

CREATE TABLE hardskill (
    id           SERIAL PRIMARY KEY,
    slug         VARCHAR(100) UNIQUE NOT NULL,
    label        VARCHAR(200) NOT NULL,
    level        VARCHAR(50),
    category     VARCHAR(50),
    sub_category VARCHAR(50)
);

CREATE TABLE experience (
    id          SERIAL PRIMARY KEY,
    slug        VARCHAR(100) UNIQUE NOT NULL,
    type        VARCHAR(20)  NOT NULL CHECK (type IN ('detail', 'summary')),
    title       VARCHAR(200) NOT NULL,
    company     VARCHAR(200),
    location    VARCHAR(150),
    start_date  VARCHAR(20) CHECK (start_date ~ '^\d{2}/\d{2}/\d{4}$|^\d{2}/\d{4}$|^\d{4}$'),
    end_date    VARCHAR(20) CHECK (end_date ~ '^\d{2}/\d{2}/\d{4}$|^\d{2}/\d{4}$|^\d{4}$'),
    description TEXT
);

CREATE TABLE experience_task (
    id            SERIAL PRIMARY KEY,
    experience_id INTEGER NOT NULL REFERENCES experience(id) ON DELETE CASCADE,
    content       TEXT    NOT NULL,
    position      SMALLINT NOT NULL
);

CREATE TABLE formation (
    id             SERIAL PRIMARY KEY,
    slug           VARCHAR(100) UNIQUE NOT NULL,
    title          VARCHAR(200) NOT NULL,
    institution    VARCHAR(200),
    location       VARCHAR(150),
    obtention_date VARCHAR(20) CHECK (obtention_date ~ '^\d{2}/\d{2}/\d{4}$|^\d{2}/\d{4}$|^\d{4}$'),
    description    TEXT,
    level          VARCHAR(100)
);

CREATE TABLE formation_task (
    id           SERIAL PRIMARY KEY,
    formation_id INTEGER NOT NULL REFERENCES formation(id) ON DELETE CASCADE,
    content      TEXT    NOT NULL,
    position     SMALLINT NOT NULL
);

CREATE TABLE experience_domain (
    id            SERIAL PRIMARY KEY,
    experience_id INTEGER NOT NULL REFERENCES experience(id) ON DELETE CASCADE,
    domain_id     INTEGER NOT NULL REFERENCES domain(id)     ON DELETE CASCADE,
    UNIQUE (experience_id, domain_id)
);

CREATE TABLE formation_domain (
    id           SERIAL PRIMARY KEY,
    formation_id INTEGER NOT NULL REFERENCES formation(id) ON DELETE CASCADE,
    domain_id    INTEGER NOT NULL REFERENCES domain(id)    ON DELETE CASCADE,
    UNIQUE (formation_id, domain_id)
);

CREATE TABLE experience_hardskill (
    id            SERIAL PRIMARY KEY,
    experience_id INTEGER NOT NULL REFERENCES experience(id) ON DELETE CASCADE,
    hardskill_id  INTEGER NOT NULL REFERENCES hardskill(id)  ON DELETE CASCADE,
    UNIQUE (experience_id, hardskill_id)
);

CREATE TABLE experience_softskill (
    id            SERIAL PRIMARY KEY,
    experience_id INTEGER NOT NULL REFERENCES experience(id) ON DELETE CASCADE,
    softskill_id  INTEGER NOT NULL REFERENCES softskill(id)  ON DELETE CASCADE,
    UNIQUE (experience_id, softskill_id)
);

CREATE TABLE formation_hardskill (
    id           SERIAL PRIMARY KEY,
    formation_id INTEGER NOT NULL REFERENCES formation(id) ON DELETE CASCADE,
    hardskill_id INTEGER NOT NULL REFERENCES hardskill(id) ON DELETE CASCADE,
    UNIQUE (formation_id, hardskill_id)
);

COMMIT;