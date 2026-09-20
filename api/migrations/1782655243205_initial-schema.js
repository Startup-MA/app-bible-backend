/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
    pgm.sql(`
        CREATE TABLE users (
            id_user INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password TEXT,
            auth_provider VARCHAR(14),
            is_admin BOOLEAN NOT NULL DEFAULT FALSE,
            entity_uuid UUID UNIQUE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE users_google_auth_info (
            id_info INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            google_sub VARCHAR(255) NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            id_user INT UNIQUE REFERENCES users(id_user) ON DELETE CASCADE
        );

        CREATE TABLE users_apple_auth_info (
            id_info INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            apple_sub VARCHAR(255) UNIQUE NOT NULL,
            login_platform VARCHAR(3) NOT NULL,
            refresh_token TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            id_user INT UNIQUE REFERENCES users(id_user) ON DELETE CASCADE
        );

        CREATE TABLE personal_infos (
            id_personal_info INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            name VARCHAR(100),
            surname VARCHAR(100),
            sex VARCHAR(1),
            country VARCHAR(20),
            age INT,
            personal_info BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            id_user INT UNIQUE REFERENCES users(id_user) ON DELETE CASCADE
        );

        CREATE TABLE users_topics (
            id_user_topics INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            topics VARCHAR(250),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            id_user INT UNIQUE REFERENCES users(id_user) ON DELETE CASCADE
        );

        CREATE TABLE customers (
            id_customer INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            subscription_id VARCHAR(30) UNIQUE NOT NULL,
            customer_id VARCHAR(30) UNIQUE NOT NULL,
            subscription_tier VARCHAR(100),
            subscription_status VARCHAR(100),
            interval VARCHAR(20),
            is_free_trial_used BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            occurred_at TIMESTAMPTZ,
            id_user INT UNIQUE REFERENCES users(id_user) ON DELETE CASCADE
        );

        CREATE TABLE verification_codes (
            id_verification_code INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            code VARCHAR(6) UNIQUE NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 minutes',
            id_user INT UNIQUE REFERENCES users(id_user) ON DELETE CASCADE
        );

        CREATE TABLE hidden_email_verification_codes (
            id_verification_code INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            code VARCHAR(6) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 minutes'
        );

        CREATE TABLE reset_passwords (
            id_reset_password INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            uuid UUID NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 minutes',
            id_user INT UNIQUE REFERENCES users(id_user) ON DELETE CASCADE
        );

        CREATE TABLE languages (
            id_lang INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            lang_name VARCHAR(50),
            country_code VARCHAR(2) UNIQUE
        );

        CREATE TABLE daily_verses (
            id_daily_verse INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            book VARCHAR(20) NOT NULL,
            chapter INT NOT NULL,
            verse INT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            id_user INT UNIQUE REFERENCES users(id_user) ON DELETE CASCADE
        );

        CREATE TABLE daily_prayers (
            id_daily_prayer INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            prayer_title VARCHAR(100),
            prayer_content VARCHAR(1000),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            id_user INT UNIQUE REFERENCES users(id_user) ON DELETE CASCADE,
            id_lang INT REFERENCES languages(id_lang)
        );

        CREATE INDEX idx_daily_prayers_id_lang ON daily_prayers(id_lang);

        CREATE TABLE bible_text_versions (
            id_bible_text_version INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            abb_bible_name VARCHAR(10),
            full_bible_name VARCHAR(200) UNIQUE,
            is_audio_available BOOLEAN,
            id_lang INT REFERENCES languages(id_lang)
        );

        CREATE INDEX idx_bible_text_versions_id_lang ON bible_text_versions(id_lang);

        CREATE TABLE bookmarks (
            id_bookmark INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            book VARCHAR(20) NOT NULL,
            chapter INT NOT NULL,
            verses_combination JSONB,
            date DATE,
            entity_uuid UUID UNIQUE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            id_user INT REFERENCES users(id_user) ON DELETE CASCADE,
            id_bible_text_version INT REFERENCES bible_text_versions(id_bible_text_version)
        );

        CREATE INDEX idx_bookmarks_id_user ON bookmarks(id_user);
        CREATE INDEX idx_bookmarks_id_bible_text_version ON bookmarks(id_bible_text_version);

        CREATE TABLE notes (
            id_note INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            book VARCHAR(20) NOT NULL,
            chapter INT NOT NULL,
            verses_combination JSONB,
            content VARCHAR(250),
            date DATE,
            entity_uuid UUID UNIQUE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            id_user INT REFERENCES users(id_user) ON DELETE CASCADE,
            id_bible_text_version INT REFERENCES bible_text_versions(id_bible_text_version)
        );

        CREATE INDEX idx_notes_id_user ON notes(id_user);
        CREATE INDEX idx_notes_id_bible_text_version ON notes(id_bible_text_version);

        CREATE TABLE highlights (
            id_highlight INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            book VARCHAR(20) NOT NULL,
            chapter INT NOT NULL,
            highlights_JSON JSONB,
            entity_uuid UUID UNIQUE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            id_user INT REFERENCES users(id_user) ON DELETE CASCADE,
            id_bible_text_version INT REFERENCES bible_text_versions(id_bible_text_version)
        );

        CREATE INDEX idx_highlights_id_user ON highlights(id_user);
        CREATE INDEX idx_highlights_id_bible_text_version ON highlights(id_bible_text_version);

        CREATE TABLE users_reading_history (
            id_user_reading_history INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            user_reading_history_JSON JSONB,
            entity_uuid UUID UNIQUE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            id_user INT REFERENCES users(id_user) ON DELETE CASCADE
        );

        CREATE INDEX idx_users_reading_history_id_user ON users_reading_history(id_user);

        CREATE TABLE prayers (
            id_prayer INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            prayer_title VARCHAR(100),
            prayer_content VARCHAR(1000),
            entity_uuid UUID UNIQUE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            id_user INT REFERENCES users(id_user) ON DELETE CASCADE
        );

        CREATE INDEX idx_prayers_id_user ON prayers(id_user);

        CREATE TABLE users_tickets (
            id_ticket INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            subject VARCHAR(30) NOT NULL,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(255) NOT NULL,
            timestamp TIMESTAMPTZ NOT NULL,
            message VARCHAR(1000) NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE app_version (
            id_version INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            versions JSONB,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- ========================
        --         FUNCTIONS
        -- ========================

        -- Update time

        CREATE OR REPLACE FUNCTION update_timestamp_column()
        RETURNS TRIGGER AS $$
        BEGIN
            -- 'NEW' holds the incoming data for the row
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- User Verification always set time

        CREATE OR REPLACE FUNCTION refresh_timestamps()
        RETURNS TRIGGER AS $$
        BEGIN

            NEW.expires_at := NOW() + INTERVAL '30 minutes';
            
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- User Reset Passwords always set time

        -- ========================
        --         TRIGGERS
        -- ========================

        -- Update time

        CREATE OR REPLACE TRIGGER update_customers_updated_at
        BEFORE UPDATE ON customers
        FOR EACH ROW
        EXECUTE FUNCTION update_timestamp_column();

        -- Verification codes always set time

        CREATE OR REPLACE TRIGGER trg_manage_verification_codes_times
        BEFORE INSERT OR UPDATE ON verification_codes
        FOR EACH ROW
        EXECUTE FUNCTION refresh_timestamps();

        CREATE OR REPLACE TRIGGER trg_manage_hidden_email_verification_codes_times
        BEFORE INSERT OR UPDATE ON hidden_email_verification_codes
        FOR EACH ROW
        EXECUTE FUNCTION refresh_timestamps();

        -- User Reset Password always set time

        CREATE OR REPLACE TRIGGER trg_manage_reset_password_times
        BEFORE UPDATE ON reset_passwords
        FOR EACH ROW
        EXECUTE FUNCTION refresh_timestamps();
    `)
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.sql(`
        DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
        DROP TRIGGER IF EXISTS trg_manage_verification_codes_times ON verification_codes;
        DROP TRIGGER IF EXISTS trg_manage_hidden_email_verification_codes_times ON hidden_email_verification_codes;
        DROP TRIGGER IF EXISTS trg_manage_reset_password_times ON reset_passwords;

        DROP FUNCTION IF EXISTS update_timestamp_column();
        DROP FUNCTION IF EXISTS refresh_timestamps();

        DROP TABLE users_prayers;
        DROP TABLE users_verses;
        DROP TABLE users_topics;
        DROP TABLE personal_infos;
        DROP TABLE customers;
        DROP TABLE verification_codes;
        DROP TABLE hidden_email_verification_codes;
        DROP TABLE reset_passwords;
        DROP TABLE bookmarks;
        DROP TABLE notes;
        DROP TABLE highlights;
        DROP TABLE users_reading_history;
        DROP TABLE prayers;
        DROP TABLE users_tickets;
        DROP TABLE app_version;
        DROP TABLE daily_prayers;
        DROP TABLE daily_verses;
        DROP TABLE users_apple_auth_info;
        DROP TABLE users_google_auth_info;

        DROP TABLE bible_text_versions;
        DROP TABLE languages;
        DROP TABLE users;
    `)
};
