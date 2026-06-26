CREATE TABLE users (
    id_user INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
    id_user INT UNIQUE REFERENCES users(id_user)
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
    id_user INT UNIQUE REFERENCES users(id_user)
);

CREATE TABLE users_verification (
    id_users_verification INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    uuid UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 minutes',
    id_user INT UNIQUE REFERENCES users(id_user)
);

CREATE TABLE verification_codes (
    id_verification_code INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code VARCHAR(6) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 minutes',
    id_user INT UNIQUE REFERENCES users(id_user)
);

CREATE TABLE reset_passwords (
    id_reset_password INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    uuid UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 minutes',
    id_user INT UNIQUE REFERENCES users(id_user)
);

CREATE TABLE languages (
    id_lang INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lang_name VARCHAR(50),
    country_code VARCHAR(2)
);

CREATE TABLE frescoes (
    id_fresco INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    book VARCHAR(20) NOT NULL,
    fresco_cdn_link VARCHAR(100) NOT NULL,
    description_cdn_link VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE bible_text_versions (
    id_bible_text_version INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    abb_bible_name VARCHAR(10),
    full_bible_name VARCHAR(200),
    is_audio_available BOOLEAN,
    download_link VARCHAR(100),
    id_lang INT REFERENCES languages(id_lang)
);

CREATE TABLE bookmarks (
    id_bookmark INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    book VARCHAR(20) NOT NULL,
    chapter INT NOT NULL,
    verses_combination JSONB,
    date DATE,
    entity_uuid UUID UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    id_user INT UNIQUE REFERENCES users(id_user),
    id_bible_text_version INT REFERENCES bible_text_versions(id_bible_text_version)
);

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
    id_user INT UNIQUE REFERENCES users(id_user),
    id_bible_text_version INT REFERENCES bible_text_versions(id_bible_text_version)
);

CREATE TABLE highlights (
    id_highlight INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    book VARCHAR(20) NOT NULL,
    chapter INT NOT NULL,
    highlights_JSON JSONB,
    entity_uuid UUID UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    id_user INT UNIQUE REFERENCES users(id_user),
    id_bible_text_version INT REFERENCES bible_text_versions(id_bible_text_version)
);

CREATE TABLE users_reading_history (
    id_user_reading_history INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_reading_history_JSON JSONB,
    entity_uuid UUID UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    id_user INT UNIQUE REFERENCES users(id_user)
);

CREATE TABLE pray_list (
    id_pray INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    pray_title VARCHAR(20),
    pray_content VARCHAR(1000),
    entity_uuid UUID UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    id_user INT UNIQUE REFERENCES users(id_user)
);

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

CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON customers
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();

-- User Verification always set time

CREATE OR REPLACE TRIGGER trg_manage_users_verification_times
BEFORE UPDATE ON users_verification
FOR EACH ROW
EXECUTE FUNCTION refresh_timestamps();

-- Verification codes always set time

CREATE TRIGGER trg_manage_verification_codes_times
BEFORE INSERT OR UPDATE ON verification_codes
FOR EACH ROW
EXECUTE FUNCTION refresh_timestamps();

-- User Reset Password always set time

CREATE OR REPLACE TRIGGER trg_manage_reset_password_times
BEFORE UPDATE ON reset_passwords
FOR EACH ROW
EXECUTE FUNCTION refresh_timestamps();



INSERT INTO users (
    email,
    password,
    is_admin
) VALUES (
    'nioctib.max@gmail.com',
    '$2a$12$h5Rxtv3m42.8n/VjX1Wdgua6iL25Bq5N/SfaV4jx28aKu3Ae.CiyS',
    'true'
);

INSERT INTO users (
    email,
    password,
    is_admin
) VALUES (
    'swimmersuper16@gmail.com',
    '$2a$12$HWPu6XdrB/qCPq1f0fKsLeImcUGBcERZXbpvVBmhzwnpXIe1o.8Cm',
    'true'
);

INSERT INTO languages (
    lang_name,
    country_code
) VALUES 
    (
        'Albanian',
        'AL'
    ),
    (
        'Armenian',
        'AM'
    ),
    (
        'Bosnian',
        'BA'
    ),
    (
        'Bulgarian',
        'BG'
    ),
    (
        'Chinese',
        'CN'
    ),
    (
        'Croatian',
        'HR'
    ),
    (
        'Estonian',
        'EE'
    ),
    (
        'Finnish',
        'FI'
    ),
    (
        'French',
        'FR'
    ),
    (
        'Georgian',
        'GE'
    ),
    (
        'German',
        'DE'
    ),
    (
        'Greek',
        'GR'
    ),
    (
        'Hindi',
        'IN'
    ),
    (
        'Hungarian',
        'HU'
    ),
    (
        'Indonesian',
        'ID'
    ),
    (
        'Italian',
        'IT'
    ),
    (
        'Korean',
        'KR'
    ),
    (
        'Latvian',
        'LV'
    ),
    (
        'Lithuanian',
        'LT'
    ),
    (
        'Malagasy',
        'MG'
    ),
    (
        'Montenegrin',
        'ME'
    ),
    (
        'Macedonian',
        'MK'
    ),
    (
        'Norwegian',
        'NO'
    ),
    (
        'Polish',
        'PL'
    ),
    (
        'Portuguese',
        'PT'
    ),
    (
        'Romanian',
        'RO'
    ),
    (
        'Russian',
        'RU'
    ),
    (
        'English',
        'EN'
    ),
    (
        'Serbian',
        'RS'
    ),
    (
        'Slovak',
        'SK'
    ),
    (
        'Slovenian',
        'SI'
    ),
    (
        'Spanish',
        'ES'
    ),
    (
        'Swedish',
        'SE'
    ),
    (
        'Tok Pisin',
        'PG'
    ),
    (
        'Vietnamese',
        'VN'
    );

INSERT INTO bible_text_versions (
    abb_bible_name,
    full_bible_name,
    is_audio_available,
    download_link,
    id_lang
) VALUES (
    'KJV',
    'King James Version',
    'true',
    'https://some.donwnload.link.com',
    '1'
);

