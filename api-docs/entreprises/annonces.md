# API Doc - /annonces

## Endpoints
- GET /job-offers/paginate
  - Usage: chargement initial des offres publiees.

## Payloads
- GET /job-offers/paginate
  - Query params utilises:
    - page: number (ici 1)
    - limit: number (ici 10)
  - Query params supportes (via filters):
    - tout filtre metier fourni a getJobOffers(filters)
  - Headers:
    - Authorization: Bearer <token> (optionnel selon appel)

## Responses
- Succes attendu: IPaginatedResponse<IOffer>
  - data/items: IOffer[] (selon structure backend)
  - meta pagination (page, limit, total, etc.)
- Erreur attendue:
  - erreur backend propagee.
