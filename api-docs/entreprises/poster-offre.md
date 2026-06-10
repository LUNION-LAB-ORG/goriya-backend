# API Doc - /poster-offre

## Endpoints
- POST /job-offers
  - Usage: publication d'une nouvelle offre.

## Payloads
- POST /job-offers
  - Content-Type: application/json
  - Body envoye:
    - title: string
    - location: string
    - type: string
    - salary: string
    - experience: string
    - description: string
    - benefits: string
    - publishDate: string
    - endDate: string
    - companyId: string
    - requirements: string[]
  - Headers:
    - Authorization: Bearer <token>

## Responses
- Succes attendu: IOffer
- Erreur attendue:
  - erreur backend propagee au catch (log console).
