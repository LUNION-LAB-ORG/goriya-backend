# API Doc - /auth/signup

## Endpoints
- POST /companies
  - Usage: creation entreprise + utilisateur dans le flow d'inscription.

## Payloads
- POST /companies
  - Content-Type: multipart/form-data
  - Champs utilises:
    - logo: File
    - coverImage: File
    - companyName: string
    - about: string
    - sector: string
    - creationDate: string (date)
    - companySize: string
    - website: string
    - socialLinks: string (JSON stringify de string[])
    - country: string
    - headquarters: string
    - location: string
    - phone: string
    - email: string
    - password: string
    - partnershipDate: string (YYYY-MM-DD)
    - status: string (ACTIVE)

## Responses
- Succes attendu:
  - user: object
  - accessToken: string
  - company: object
- Erreur attendue:
  - message backend (validation ou erreur metier).

## Notes
- Au succes, le token est stocke en cookie token et l'utilisateur en localStorage.
