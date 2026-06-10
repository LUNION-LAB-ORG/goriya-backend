# API Doc - /profil

## Endpoints
- GET /companies/{id}
  - Usage: chargement des infos entreprise dans page.tsx (server side).
- PATCH /companies/{id}
  - Usage: mise a jour du profil entreprise depuis content.tsx.

## Payloads
- GET /companies/{id}
  - Path param:
    - id: string (companyId depuis cookie auth)
  - Headers:
    - Authorization: Bearer <token>

- PATCH /companies/{id}
  - Content-Type: multipart/form-data
  - Path param:
    - id: string (companyId)
  - Body utilises:
    - companyName: string
    - about: string
    - sector: string
    - companySize: string
    - location: string
    - website: string
    - email: string
    - phone: string
    - creationDate: string (ISO, optionnel)
    - logo: File (optionnel)
  - Headers:
    - Authorization: Bearer <token>

## Responses
- GET /companies/{id} succes: ICompany
- PATCH /companies/{id} succes: objet entreprise mis a jour (selon backend)
- Erreurs attendues:
  - Entreprise introuvable
  - Non authentifie
  - erreurs validation backend
