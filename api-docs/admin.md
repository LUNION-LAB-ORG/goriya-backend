# Documentation API attendue - GORIYA-ADMIN

Ce document formalise les endpoints backend attendus à partir des services frontend (`lib/services/*.ts`).

## 1) Conventions globales

- Base URL backend: `NEXT_PUBLIC_BACKEND_URL` (fallback: `https://goriya-backend-production.up.railway.app`)
- Header auth (routes protégées): `Authorization: Bearer <access_token>`
- Réponse standard:

```json
{
  "success": true,
  "message": "optionnel",
  "data": {}
}
```

- Réponse paginée:

```json
{
  "data": [],
  "meta": {
    "total": 0,
    "page": 1,
    "limit": 10,
    "totalPages": 0
  }
}
```

- Upload fichiers: `multipart/form-data`
- Export fichiers: réponse binaire (`Blob`, PDF/CSV)

## 2) Enums attendus

- `UserRole`: `ADMIN | USER | ENTREPRISE`
- `UserStatus`: `ACTIVE | INACTIVE`
- `CompanyStatus`: `ACTIVE | INACTIVE | SUSPENDED`
- `JobStatus`: `ACTIVE | CLOSED | DRAFT`
- `JobType`: `CDI | CDD | STAGE | ALTERNANCE | FREELANCE | TEMPS_PARTIEL`
- `JobExperienceType`: `JUNIOR | INTERMEDIAIRE | SENIOR | EXPERT`
- `CandidatureStatus`: `EN_ATTENTE | EN_COURS | APPROUVEE | REJETEE`
- `CVStatus`: `ANALYZING | COMPLETED | FAILED`
- `InterviewStatus`: `ACTIVE | COMPLETED | SCHEDULED`
- `MatchingStatus`: `NOUVEAU | EN_COURS | FINALISE`
- `ScoringStatus`: `COMPLETED | IN_PROGRESS`
- `EventType`: `ENTRETIEN | FORMATION | REUNION`
- `EventStatus`: `CONFIRMED | PENDING | CANCELLED`

## 3) Contrats payload/réponse par domaine

## 3.1 Authentification

### POST /auth/login
- Payload:
```json
{ "email": "string", "password": "string" }
```
- Réponse:
```json
{ "data": { "access_token": "string", "user": "IUser" }, "success": true }
```

### POST /users (inscription)
- Payload:
```json
{ "name": "string", "email": "string", "password": "string", "role": "UserRole", "acceptTerms": true }
```
- Réponse: `ApiResponse<{ token: string; user: IUser }>`

### POST /auth/logout
- Réponse: `ApiResponse<null>`

### POST /auth/refresh
- Réponse:
```json
{ "data": { "token": "string" }, "success": true }
```

### POST /auth/verify-otp
- Payload:
```json
{ "email": "string", "code": "string" }
```
- Réponse: `ApiResponse<{ token: string; user: IUser }>`

### POST /auth/google
- Payload:
```json
{
  "googleId": "string",
  "email": "string",
  "name": "string",
  "firstName": "string",
  "lastName": "string",
  "picture": "string"
}
```
- Réponse: `ApiResponse<{ token: string; user: IUser }>`

### GET /auth/profile
- Réponse: `ApiResponse<IUser>`

## 3.2 Dashboard

### GET /dashboard/stats
- Réponse admin attendue:
```json
{ "data": { "activeStudents": 0, "partnerCompanies": 0, "analyzedCVs": 0, "jobOffers": 0 }, "success": true }
```
- Réponse alternative utilisée aussi:
```json
{ "data": { "totalApplications": 0, "interviews": 0, "profileViews": 0, "savedJobs": 0 }, "success": true }
```

### GET /dashboard/performance
- Query: `period?=string`
- Réponse: `ApiResponse<Array<{ month: string; value: number; label?: string }>>`

### GET /dashboard/recent-applications
- Query: `limit?=number`
- Réponse: `ApiResponse<ICandidature[]>`

### GET /dashboard/recommended-jobs
- Query: `limit?=number`
- Réponse: `ApiResponse<IJobOffer[]>`

### GET /dashboard/profile-views
- Query: `days?=number`
- Réponse:
```json
{
  "data": {
    "views": [{ "date": "2026-06-08", "count": 12 }],
    "total": 120
  },
  "success": true
}
```

## 3.3 Analytics

### GET /analytics
- Réponse:
```json
{
  "data": {
    "analyzedCVs": 0,
    "successfulInterviews": 0,
    "matchingRate": 0,
    "averageAnalysisTime": "string",
    "evolutionData": [{ "month": "string", "value": 0 }],
    "activityDistribution": [{ "name": "string", "value": 0, "color": "#000000" }]
  },
  "success": true
}
```

### GET /analytics/evolution
- Query: `period=week|month|year`
- Réponse: `ApiResponse<Array<{ month: string; value: number }>>`

### GET /analytics/activity
- Réponse: `ApiResponse<Array<{ name: string; value: number; color: string }>>`

### GET /analytics/kpis
- Réponse:
```json
{ "data": { "registrations": 0, "matchingRate": 0, "cvAnalyzed": 0, "interviewsDone": 0 }, "success": true }
```

### GET /analytics/export
- Query: `period=string&format=pdf`
- Réponse: fichier PDF (`Blob`)

## 3.4 Étudiants

### GET /students/paginate
- Query: `page?`, `limit?`, `search?`, `status?=UserStatus`
- Réponse: `IPaginatedResponse<IUser>`

### GET /students/{id}
- Réponse: `ApiResponse<IUser>`

### GET /students/stats
- Réponse:
```json
{ "data": { "total": 0, "active": 0, "inactive": 0, "newThisMonth": 0 }, "success": true }
```

### POST /students
- Payload: `Partial<IUser> + { password: string }`
- Réponse: `ApiResponse<IUser>`

### PATCH /students/{id}
- Payload: `Partial<IUser>`
- Réponse: `ApiResponse<IUser>`

### PATCH /students/{id}/status
- Payload:
```json
{ "status": "ACTIVE|INACTIVE" }
```
- Réponse: `ApiResponse<IUser>`

### DELETE /students/{id}
- Réponse: `ApiResponse<null>`

### GET /students/export
- Query: `format=csv`
- Réponse: fichier CSV (`Blob`)

## 3.5 Entreprises

### GET /companies/paginate
- Query: `search?`, `industry?[]`, `size?[]`, `location?[]`, `page?`, `limit?`
- Réponse: `IPaginatedResponse<ICompany>`

### GET /companies/{id}
- Réponse: `ApiResponse<ICompany>`

### GET /companies/stats
- Réponse:
```json
{ "data": { "total": 0, "active": 0, "inactive": 0, "newThisMonth": 0 }, "success": true }
```

### GET /companies/sectors
- Réponse: `ApiResponse<Array<{ name: string; count: number; percentage: number }>>`

### POST /companies
- Payload: `Partial<ICompany>`
- Réponse: `ApiResponse<ICompany>`

### PATCH /companies/{id}
- Payload: `Partial<ICompany>`
- Réponse: `ApiResponse<ICompany>`

### PATCH /companies/{id}/status
- Payload:
```json
{ "status": "ACTIVE|INACTIVE|SUSPENDED" }
```
- Réponse: `ApiResponse<ICompany>`

### DELETE /companies/{id}
- Réponse: `ApiResponse<null>`

### POST /companies/{companyId}/follow
- Réponse: `ApiResponse<null>`

### DELETE /companies/{companyId}/follow
- Réponse: `ApiResponse<null>`

### GET /companies/{companyId}/jobs
- Réponse: `ApiResponse<IJobOffer[]>`

## 3.6 Offres d'emploi

### GET /job-offers/paginate
- Query: `search?`, `location?`, `jobType?[]`, `experience?[]`, `salary?[]`, `status?=JobStatus`, `page?`, `limit?`
- Réponse: `IPaginatedResponse<IJobOffer>`

### GET /job-offers/{id}
- Réponse: `ApiResponse<IJobOffer>`

### GET /job-offers/stats
- Réponse:
```json
{ "data": { "total": 0, "active": 0, "closed": 0, "draft": 0, "totalApplicants": 0 }, "success": true }
```

### GET /job-offers/sectors
- Réponse: `ApiResponse<Array<{ name: string; count: number; percentage: number }>>`

### POST /job-offers
- Payload: `Partial<IJobOffer>`
- Réponse: `ApiResponse<IJobOffer>`

### PATCH /job-offers/{id}
- Payload: `Partial<IJobOffer>`
- Réponse: `ApiResponse<IJobOffer>`

### PATCH /job-offers/{id}/status
- Payload:
```json
{ "status": "ACTIVE|CLOSED|DRAFT" }
```
- Réponse: `ApiResponse<IJobOffer>`

### DELETE /job-offers/{id}
- Réponse: `ApiResponse<null>`

### POST /job-offers/{jobId}/apply
- Payload:
```json
{ "coverLetter": "string", "resumeUrl": "string" }
```
- Réponse: `ApiResponse<ICandidature>`

### POST /job-offers/{jobId}/save
- Réponse: `ApiResponse<null>`

### DELETE /job-offers/{jobId}/save
- Réponse: `ApiResponse<null>`

## 3.7 Candidatures

### GET /candidatures/paginate
- Query: `page?`, `limit?`, `status?=CandidatureStatus`
- Réponse: `IPaginatedResponse<ICandidature>`

### GET /candidatures/{id}
- Réponse: `ApiResponse<ICandidature>`

### GET /candidatures/stats
- Réponse:
```json
{ "data": { "total": 0, "enAttente": 0, "enCours": 0, "approuvees": 0, "rejetees": 0 }, "success": true }
```

### PATCH /candidatures/{id}/status
- Payload:
```json
{ "status": "EN_ATTENTE|EN_COURS|APPROUVEE|REJETEE" }
```
- Réponse: `ApiResponse<ICandidature>`

### DELETE /candidatures/{id}
- Réponse: `ApiResponse<null>`

## 3.8 Analyse CV / IA

### GET /cv-analysis/stats
- Réponse:
```json
{ "data": { "totalAnalyzed": 0, "completed": 0, "analyzing": 0, "failed": 0, "averageScore": 0 }, "success": true }
```

### GET /cv-analysis/recent
- Query: `page?`, `limit?`, `status?=CVStatus`
- Réponse: `IPaginatedResponse<ICVAnalysis>`

### GET /cv-analysis/{id}
- Réponse: `ApiResponse<ICVAnalysis>`

### GET /cv-analysis/recommendations
- Réponse:
```json
{ "data": [{ "category": "string", "suggestion": "string", "impact": "string" }], "success": true }
```

### POST /cv/analyze
- Payload: `FormData`
- Réponse:
```json
{
  "data": {
    "score": 0,
    "suggestions": ["string"],
    "strengths": ["string"],
    "improvements": ["string"]
  },
  "success": true
}
```

### POST /cv/upload
- Payload: `multipart/form-data` avec clé `cv`
- Réponse:
```json
{ "data": { "cvUrl": "string" }, "success": true }
```

### DELETE /cv-analysis/{id}
- Réponse: `ApiResponse<null>`

## 3.9 Simulation d'entretiens

### GET /interview-simulation/stats
- Réponse:
```json
{ "data": { "todaySessions": 0, "averageScore": 0, "averageDuration": "string", "satisfaction": 0 }, "success": true }
```

### GET /interview-simulation/sessions
- Query: `page?`, `limit?`, `status?=InterviewStatus`
- Réponse: `IPaginatedResponse<IInterviewSession>`

### GET /interview-simulation/active
- Réponse: `ApiResponse<IInterviewSession[]>`

### GET /interview-simulation/history
- Query: `page?`, `limit?`
- Réponse: `IPaginatedResponse<IInterviewSession>`

### GET /interview-simulation/sessions/{id}
- Réponse: `ApiResponse<IInterviewSession>`

### POST /interview-simulation/start
- Payload:
```json
{ "candidateId": "string", "position": "string" }
```
- Réponse: `ApiResponse<IInterviewSession>`

### PATCH /interview-simulation/sessions/{sessionId}/end
- Payload:
```json
{ "feedback": "string" }
```
- Réponse: `ApiResponse<IInterviewSession>`

### DELETE /interview-simulation/sessions/{id}
- Réponse: `ApiResponse<null>`

## 3.10 Matching IA

### GET /matching/stats
- Réponse:
```json
{ "data": { "totalMatches": 0, "averageScore": 0, "successRate": 0, "pendingMatches": 0 }, "success": true }
```

### GET /matching/recent
- Query: `page?`, `limit?`, `status?=MatchingStatus`
- Réponse: `IPaginatedResponse<IMatchingResult>`

### GET /matching/algorithms
- Réponse:
```json
{ "data": { "precision": 0, "recall": 0, "f1Score": 0, "algorithms": [{ "name": "string", "accuracy": 0 }] }, "success": true }
```

### GET /matching/activity
- Réponse:
```json
{ "data": [{ "id": "string", "type": "string", "message": "string", "timestamp": "ISO date" }], "success": true }
```

### POST /matching/trigger
- Payload:
```json
{ "candidateId": "string", "jobOfferId": "string" }
```
- Réponse: `ApiResponse<IMatchingResult>`

### PATCH /matching/{id}/status
- Payload:
```json
{ "status": "NOUVEAU|EN_COURS|FINALISE" }
```
- Réponse: `ApiResponse<IMatchingResult>`

## 3.11 Portfolios

### GET /portfolios/stats
- Réponse:
```json
{ "data": { "totalPortfolios": 0, "totalViews": 0, "totalDownloads": 0, "totalLikes": 0 }, "success": true }
```

### GET /portfolios/paginate
- Query: `page?`, `limit?`, `category?`, `search?`
- Réponse: `IPaginatedResponse<IPortfolio>`

### GET /portfolios/featured
- Réponse: `ApiResponse<IPortfolio[]>`

### GET /portfolios/{id}
- Réponse: `ApiResponse<IPortfolio>`

### GET /portfolios/categories
- Réponse: `ApiResponse<Array<{ name: string; count: number }>>`

### PATCH /portfolios/{id}/feature
- Payload:
```json
{ "featured": true }
```
- Réponse: `ApiResponse<IPortfolio>`

### DELETE /portfolios/{id}
- Réponse: `ApiResponse<null>`

## 3.12 Planification

### GET /planning/stats
- Réponse:
```json
{ "data": { "totalEvents": 0, "upcomingEvents": 0, "completedEvents": 0, "cancelledEvents": 0 }, "success": true }
```

### GET /planning/events
- Query: `date=YYYY-MM-DD` (ou ISO)
- Réponse: `ApiResponse<ICalendarEvent[]>`

### GET /planning/upcoming
- Query: `limit?=number`
- Réponse: `ApiResponse<ICalendarEvent[]>`

### GET /planning/events/{id}
- Réponse: `ApiResponse<ICalendarEvent>`

### POST /planning/events
- Payload:
```json
{
  "title": "string",
  "type": "ENTRETIEN|FORMATION|REUNION",
  "startTime": "ISO date",
  "endTime": "ISO date",
  "participants": ["string"],
  "location": "string"
}
```
- Réponse: `ApiResponse<ICalendarEvent>`

### PATCH /planning/events/{id}
- Payload: partiel du modèle événement (incluant `status` si nécessaire)
- Réponse: `ApiResponse<ICalendarEvent>`

### DELETE /planning/events/{id}
- Réponse: `ApiResponse<null>`

## 3.13 Messagerie

### GET /messages/conversations
- Réponse: `ApiResponse<any[]>`

### GET /messages/conversations/{conversationId}/messages
- Réponse: `ApiResponse<any[]>`

### POST /messages/conversations/{conversationId}/messages
- Payload:
```json
{ "content": "string" }
```
- Réponse: `ApiResponse<any>`

### PUT /messages/conversations/{conversationId}/read
- Réponse: `ApiResponse<null>`

### POST /messages/conversations
- Payload:
```json
{ "participantId": "string" }
```
- Réponse: `ApiResponse<any>`

## 3.14 Notifications

### GET /notifications
- Réponse: `ApiResponse<any[]>`

### PUT /notifications/{notificationId}/read
- Réponse: `ApiResponse<null>`

### PUT /notifications/read-all
- Réponse: `ApiResponse<null>`

### PUT /notifications/settings
- Payload:
```json
{ "applications": true, "emplois": true, "recommandations": true }
```
- Réponse: `ApiResponse<null>`

## 3.15 Scoring IA

### GET /scoring/stats
- Réponse:
```json
{ "data": { "generatedScores": 0, "averageScore": 0, "accuracy": 0, "averageTime": "string" }, "success": true }
```

### GET /scoring/criteria
- Réponse:
```json
{ "data": [{ "name": "string", "weight": 0, "score": 0, "maxScore": 0 }], "success": true }
```

### GET /scoring/performance
- Réponse:
```json
{ "data": { "precision": 0, "recall": 0, "f1Score": 0, "trendData": [{ "month": "string", "precision": 0, "recall": 0 }] }, "success": true }
```

### GET /scoring/recent
- Query: `page?`, `limit?`, `status?=ScoringStatus`
- Réponse: `IPaginatedResponse<IScoringResult>`

### GET /scoring/{id}
- Réponse: `ApiResponse<IScoringResult>`

### POST /scoring/analyze
- Payload:
```json
{ "candidateId": "string", "position": "string" }
```
- Réponse: `ApiResponse<IScoringResult>`

### PATCH /scoring/criteria
- Payload:
```json
{ "criteria": [{ "name": "string", "weight": 0, "score": 0, "maxScore": 0 }] }
```
- Réponse: `ApiResponse<IScoringCriteria[]>`

## 3.16 Recherche avancée

### GET /search
- Query: `q` + filtres (`type?`, `location?`, `experience?`, `minScore?`, `sector?`, `page?`, `limit?`)
- Réponse: `IPaginatedResponse<IUser | IJobOffer>`

### GET /search/candidates
- Query: `q` + filtres (sans `type`)
- Réponse: `IPaginatedResponse<IUser>`

### GET /search/offers
- Query: `q` + filtres (sans `type`)
- Réponse: `IPaginatedResponse<IJobOffer>`

### GET /search/filters
- Réponse:
```json
{ "data": { "sectors": ["string"], "locations": ["string"], "experiences": ["string"] }, "success": true }
```

### GET /search/export
- Query: `q` + filtres + `format=csv`
- Réponse: fichier CSV (`Blob`)

## 3.17 Paramètres système

### GET /settings
- Réponse:
```json
{
  "data": {
    "platformName": "string",
    "mainUrl": "string",
    "supportEmail": "string",
    "timezone": "string",
    "description": "string",
    "maintenanceMode": false,
    "maxUploadSize": 0,
    "allowedFileTypes": ["pdf"],
    "smtpHost": "string",
    "smtpPort": 587,
    "smtpUser": "string"
  },
  "success": true
}
```

### PATCH /settings
- Payload: `Partial<ISystemSettings>`
- Réponse: `ApiResponse<ISystemSettings>`

### GET /settings/email
- Réponse:
```json
{ "data": { "smtpHost": "string", "smtpPort": 587, "smtpUser": "string", "senderName": "string", "senderEmail": "string" }, "success": true }
```

### PATCH /settings/email
- Payload:
```json
{
  "smtpHost": "string",
  "smtpPort": 587,
  "smtpUser": "string",
  "smtpPassword": "string",
  "senderName": "string",
  "senderEmail": "string"
}
```
- Réponse: `ApiResponse<null>`

### POST /settings/email/test
- Réponse:
```json
{ "data": { "success": true, "message": "string" }, "success": true }
```

## 3.18 Utilisateurs (profil + administration)

### PUT /user/profile
- Payload: `Partial<IUser>`
- Réponse: `ApiResponse<IUser>`

### POST /user/avatar
- Payload: `multipart/form-data` avec clé `avatar`
- Réponse:
```json
{ "data": { "avatarUrl": "string" }, "success": true }
```

### GET /users/paginate
- Query: `page?`, `limit?`, `role?=UserRole`, `status?=UserStatus`, `search?`
- Réponse: `IPaginatedResponse<IUser>`

### GET /users/{id}
- Réponse: `ApiResponse<IUser>`

### GET /users/stats
- Réponse:
```json
{ "data": { "totalUsers": 0, "enterprises": 0, "activeUsers": 0, "newUsers": 0 }, "success": true }
```

### POST /users
- Payload: `Partial<IUser> + { password: string }`
- Réponse: `ApiResponse<IUser>`

### PATCH /users/{id}
- Payload: `Partial<IUser>`
- Réponse: `ApiResponse<IUser>`

### PATCH /users/{id}/status
- Payload:
```json
{ "status": "ACTIVE|INACTIVE" }
```
- Réponse: `ApiResponse<IUser>`

### DELETE /users/{id}
- Réponse: `ApiResponse<null>`

## 3.19 Route API locale NextAuth (frontend)

### GET /api/auth/[...nextauth]
### POST /api/auth/[...nextauth]
- Route interne NextAuth (session/callback auth côté frontend)

## 4) Erreurs API recommandées

Format conseillé:

```json
{
  "success": false,
  "message": "Description de l'erreur",
  "errors": [
    { "field": "email", "message": "Email invalide" }
  ],
  "code": "VALIDATION_ERROR"
}
```

Codes usuels:
- `400` validation
- `401` non authentifié
- `403` non autorisé
- `404` ressource introuvable
- `409` conflit métier
- `422` incohérence métier
- `500` erreur serveur

## 5) Notes de cohérence

- `/dashboard/stats` est consommé avec deux structures différentes (admin/utilisateur). Prévoir un endpoint distinct par rôle ou une structure unifiée.
- `POST /users` sert à l'inscription et à la création admin; séparer en `/auth/register` et `/admin/users` si les règles divergent.
- `messages` et `notifications` sont encore typés `any` côté frontend; un contrat DTO explicite est recommandé.

