# API Doc - /dashboard

## Endpoints
- GET /dashboard/stats
  - Usage: chargement des KPIs, courbes et listes recentes.

## Payloads
- GET /dashboard/stats
  - Query params optionnels (DashboardStatsParams):
    - start: string/date (optionnel)
    - end: string/date (optionnel)
  - Headers:
    - Authorization: Bearer <token>

## Responses
- Succes attendu (DashboardContentProps):
  - statsData: any[]
  - chartData: any[]
  - lineChartData: any[]
  - recentCandidates: any[]
  - topOffers: any[]
  - recentOffers: any[]
- Erreur attendue:
  - erreur backend propagee (catch + fallback tableaux vides dans page.tsx).
