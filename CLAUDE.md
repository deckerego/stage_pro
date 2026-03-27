# ProPresenter Stage Monitor — CLAUDE.md

A web-based confidence monitor for ProPresenter stage screens, built with React + Vite.

## Running the app

```bash
npm install
npm run dev      # dev server at http://localhost:5173
npm run build    # production build to dist/
npm run preview  # preview production build locally
```

ProPresenter must be running on the same machine with its network API enabled (default port 49659).

## Architecture

All API calls go through a Vite dev-server proxy (`/api` → `http://localhost:49659`) configured in `vite.config.js`. This avoids CORS issues during development. In production you would need a reverse proxy (nginx, Caddy, etc.) doing the same.

### File layout

```
src/
  api.js              — fetch wrappers for the ProPresenter REST API
  useProPresenter.js  — React hook; fetches screens + layout map + status in parallel
  ScreenCard.jsx      — card component for a single stage screen
  App.jsx             — root component; header, status, screen grid
  App.css             — component styles (dark theme, CSS custom properties)
  index.css           — global resets and CSS variable definitions
```

### Data flow

1. `useProPresenter` fires three requests in parallel on mount:
   - `GET /v1/stage/screens` — list of configured stage screens (`[{ uuid, name, index }]`)
   - `GET /v1/stage/layout_map` — which layout is assigned to each screen (`[{ screen, layout }]`)
   - `GET /v1/status/stage_screens` — boolean; whether stage output is enabled
2. The hook joins `screens` + `layoutMap` into a `screenLayouts` map keyed by screen UUID.
3. `App.jsx` renders one `ScreenCard` per screen, passing the matched layout (or `undefined`).
4. `ScreenCard` displays the layout name and fetches the layout thumbnail directly from `GET /v1/stage/layout/{uuid}/thumbnail`.

### Key ProPresenter API endpoints in use

| Endpoint | Purpose |
|---|---|
| `GET /v1/stage/screens` | List configured stage screens |
| `GET /v1/stage/layout_map` | Screen → layout assignments |
| `GET /v1/stage/layouts` | List all available layouts |
| `GET /v1/stage/layout/{id}/thumbnail` | PNG thumbnail of a layout |
| `GET /v1/status/stage_screens` | Stage output enabled boolean |

The full API spec is available at `http://localhost:49659/v1/doc/index.html` (Swagger UI). The raw OpenAPI spec is embedded in `http://localhost:49659/v1/doc/swagger.json` as `var openapi_spec = {...}`.

## Styling conventions

- Dark theme only; all colors are CSS custom properties defined in `index.css`.
- Component-scoped styles live in `App.css` using plain class names (no CSS modules).
- No UI library dependency — keep it that way unless complexity warrants it.

## Future work to consider

- **Live updates**: ProPresenter exposes chunked/streaming endpoints (e.g. `GET /v1/presentation/chord_chart/updates`) for push-style updates rather than polling. These would replace the manual refresh button.
- **Slide content**: `GET /v1/presentation/active` returns the current slide; useful for showing lyrics or notes on the confidence monitor.
- **Multiple screens**: The grid already handles multiple screens; test with more than one stage screen configured.
- **Production deployment**: The app is a static bundle — serve `dist/` from any web server. Add a reverse proxy rule to forward `/api` to `http://localhost:49659`.
