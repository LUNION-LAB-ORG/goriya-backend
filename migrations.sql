-- Création des types ENUM pour EventType et EventStatus
CREATE TYPE event_type_enum AS ENUM ('MEETING', 'INTERVIEW', 'WORKSHOP', 'OTHER'); -- adapte selon ton enum réel
CREATE TYPE event_status_enum AS ENUM ('SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED'); -- adapte selon ton enum réel

-- Table calendar_events
CREATE TABLE calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title VARCHAR(255) NOT NULL,
    type event_type_enum NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    participants TEXT[] NOT NULL,
    location VARCHAR(255),
    status event_status_enum NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_calendar_events_updated_at
BEFORE UPDATE ON calendar_events
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- Création des types ENUM
CREATE TYPE user_role_enum AS ENUM ('USER', 'ADMIN'); -- adapte selon ton enum réel
CREATE TYPE user_status_enum AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED'); -- adapte aussi

-- Table users avec created_at et updated_at automatiques
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,

    role user_role_enum NOT NULL DEFAULT 'USER',
    status user_status_enum NOT NULL DEFAULT 'ACTIVE',

    avatar VARCHAR(255),

    registration_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- Création du type ENUM pour CompanyStatus
CREATE TYPE company_status_enum AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED'); -- adapte selon ton enum réel

-- Table companies
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(255) NOT NULL,
    sector VARCHAR(255) NOT NULL,
    logo VARCHAR(255),
    status company_status_enum NOT NULL DEFAULT 'ACTIVE',
    partnership_date DATE NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON companies
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- Création des types ENUM pour JobType et JobStatus
CREATE TYPE job_type_enum AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'); -- adapte selon ton enum réel
CREATE TYPE job_status_enum AS ENUM ('ACTIVE', 'INACTIVE', 'CLOSED'); -- adapte selon ton enum réel

-- Table job_offers
CREATE TABLE job_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    type job_type_enum NOT NULL,
    salary VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT[] NOT NULL,
    status job_status_enum NOT NULL DEFAULT 'ACTIVE',
    applicants INT NOT NULL DEFAULT 0,

    company_id UUID NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_job_offers_company
        FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_job_offers_updated_at
BEFORE UPDATE ON job_offers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();



-- Création du type ENUM pour CandidatureStatus
CREATE TYPE candidature_status_enum AS ENUM ('EN_ATTENTE', 'ACCEPTEE', 'REFUSEE'); -- adapte selon ton enum réel

-- Table candidatures
CREATE TABLE candidatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    candidate_name VARCHAR(255) NOT NULL,
    candidate_email VARCHAR(255) NOT NULL,
    status candidature_status_enum NOT NULL DEFAULT 'EN_ATTENTE',
    score INT NOT NULL DEFAULT 0,
    applied_date TIMESTAMP NOT NULL,

    user_id UUID NOT NULL,
    job_offer_id UUID NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_candidatures_user
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_candidatures_job_offer
        FOREIGN KEY(job_offer_id) REFERENCES job_offers(id) ON DELETE CASCADE
);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_candidatures_updated_at
BEFORE UPDATE ON candidatures
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();





-- Création du type ENUM pour CVStatus
CREATE TYPE cv_status_enum AS ENUM ('PENDING', 'REVIEWED', 'APPROVED', 'REJECTED'); -- adapte selon ton enum réel

-- Table cv_analysis
CREATE TABLE cv_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    file_name VARCHAR(255) NOT NULL,
    analysis_score NUMERIC NOT NULL,
    recommendations TEXT[] NOT NULL,
    upload_date TIMESTAMP NOT NULL,
    status cv_status_enum NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_cv_analysis_updated_at
BEFORE UPDATE ON cv_analysis
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- Création du type ENUM pour InterviewStatus
CREATE TYPE interview_status_enum AS ENUM ('SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED'); -- adapte selon ton enum réel

-- Table interview_sessions
CREATE TABLE interview_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    candidate_name VARCHAR(255) NOT NULL,
    candidate_email VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    duration INT NOT NULL,
    score NUMERIC NOT NULL,
    status interview_status_enum NOT NULL,
    start_time TIMESTAMP NOT NULL,
    feedback TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_interview_sessions_updated_at
BEFORE UPDATE ON interview_sessions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();



-- Création du type ENUM pour MatchingStatus
CREATE TYPE matching_status_enum AS ENUM ('NOUVEAU', 'EN_COURS', 'TERMINE'); -- adapte selon ton enum réel

-- Table matching_results
CREATE TABLE matching_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    candidate_name VARCHAR(255) NOT NULL,
    candidate_email VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    matching_score NUMERIC NOT NULL,
    status matching_status_enum NOT NULL DEFAULT 'NOUVEAU',
    match_date TIMESTAMP NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_matching_results_updated_at
BEFORE UPDATE ON matching_results
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- Table portfolios
CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    skills TEXT[] NOT NULL,

    views INT NOT NULL DEFAULT 0,
    downloads INT NOT NULL DEFAULT 0,
    likes INT NOT NULL DEFAULT 0,

    created_date TIMESTAMP NOT NULL,
    
    user_id UUID NOT NULL,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_portfolios_user
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_portfolios_updated_at
BEFORE UPDATE ON portfolios
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();



-- Création du type ENUM pour ScoringStatus
CREATE TYPE scoring_status_enum AS ENUM ('PENDING', 'COMPLETED', 'REVIEW'); -- adapte selon ton enum réel

-- Table scoring_results
CREATE TABLE scoring_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    candidate_name VARCHAR(255) NOT NULL,
    candidate_email VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    overall_score NUMERIC NOT NULL,
    criteria JSONB NOT NULL,
    analysis_date TIMESTAMP NOT NULL,
    status scoring_status_enum NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_scoring_results_updated_at
BEFORE UPDATE ON scoring_results
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();