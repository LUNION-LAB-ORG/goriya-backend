// ANALYSIS CV
export enum CVStatus {
    ANALYZING = "ANALYZING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
}

// CALENDAR-EVENT
export enum EventType {
    ENTRETIEN = "ENTRETIEN",
    FORMATION = "FORMATION",
    REUNION = "REUNION",
}

export enum EventStatus {
    CONFIRMED = "CONFIRMED",
    PENDING = "PENDING",
    CANCELLED = "CANCELLED",
}

// CANDIDATURES
export enum CandidatureStatus {
    EN_ATTENTE = "EN_ATTENTE",
    EN_COURS = "EN_COURS",
    APPROUVEE = "APPROUVEE",
    REJETEE = "REJETEE",
}

// COMPANY
export enum CompanyStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    SUSPENDED = "SUSPENDED",
}

// INTERVIEW-SESSION
export enum InterviewStatus {
    ACTIVE = "ACTIVE",
    COMPLETED = "COMPLETED",
    SCHEDULED = "SCHEDULED",
}

// JOB-OFFER
export enum JobType {
    CDI = "CDI",
    CDD = "CDD",
    STAGE = "STAGE",
    ALTERNANCE = "ALTERNANCE",
    FREELANCE = "FREELANCE",
    TEMPS_PARTIEL = "TEMPS_PARTIEL",
}

export enum JobExperienceType {
    JUNIOR = "JUNIOR",
    INTERMEDIAIRE = "INTERMEDIAIRE",
    SENIOR = "SENIOR",
    EXPERT = "EXPERT",
}

export enum JobStatus {
    ACTIVE = "ACTIVE",
    CLOSED = "CLOSED",
    DRAFT = "DRAFT",
}

// MATCHING-RESULT
export enum MatchingStatus {
    NOUVEAU = "NOUVEAU",
    EN_COURS = "EN_COURS",
    FINALISE = "FINALISE",
}

// SCORING-RESULT
export enum ScoringStatus {
    COMPLETED = "COMPLETED",
    IN_PROGRESS = "IN_PROGRESS",
}

// USERS
export enum UserRole {
    ADMIN = "ADMIN",
    USER = "USER",
    ENTERPRISE = "ENTREPRISE",
}

export enum UserStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
}