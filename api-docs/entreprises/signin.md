# API Doc - /auth/signin

## Endpoints
- POST /auth/login
  - Usage: authentification via provider NextAuth credentials (authorize dans lib/auth.ts).

## Payloads
- POST /auth/login
  - Content-Type: application/json
  - Body:
    - email: string
    - password: string

## Responses
- Succes attendu:
  - access_token: string
  - user:
    - id: string
    - name: string
    - email: string
    - role: string
    - company.id: string
- Erreur attendue:
  - erreur backend (credentials invalides, etc.) propagee au client.

## Notes
- Le submit utilise signIn("credentials", { redirect: false }).
- La session NextAuth est ensuite lue via getSession et stockee dans le cookie auth/localStorage.
