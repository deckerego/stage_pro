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
  api.js              — fetch wrappers + streaming generator for the ProPresenter REST API
  useProPresenter.js  — hook; fetches screens + layout map + status in parallel on load
  useSlideStream.js   — hook; opens a live stream via POST /v1/status/updates for slide changes
  ScreenCard.jsx      — card for a single stage screen; click opens ScreenDetail modal
  ScreenDetail.jsx    — modal showing live current/next slide text + layout thumbnail
  App.jsx             — root component; header, status indicator, screen grid
  App.css             — all component styles (dark theme, CSS custom properties)
  index.css           — global resets and CSS variable definitions
```

### Data flow

**Initial load (`useProPresenter`)**
1. Fires three requests in parallel on mount:
   - `GET /v1/stage/screens` — list of configured stage screens (`[{ uuid, name, index }]`)
   - `GET /v1/stage/layout_map` — which layout is assigned to each screen (`[{ screen, layout }]`)
   - `GET /v1/status/stage_screens` — boolean; whether stage output is enabled
2. Joins `screens` + `layoutMap` into a `screenLayouts` map keyed by screen UUID.
3. `App.jsx` renders one `ScreenCard` per screen.

**Detail view (`useSlideStream`)**
1. When a card is clicked, `ScreenDetail` mounts and `useSlideStream` opens a streaming connection via `POST /v1/status/updates` with body `["status/slide"]`.
2. The stream returns newline-delimited JSON: `{"url": "status/slide", "data": {"current": {...}, "next": {...}}}`.
3. Each event updates the live `slide` state in the hook; the modal re-renders with the new text.
4. The stream and `AbortController` are torn down when the modal closes (`useEffect` cleanup).

### Streaming endpoint

`POST /v1/status/updates` accepts a JSON array of endpoint names to subscribe to. The server pushes newline-delimited JSON chunks whenever any of those endpoints changes. A `timer/system_time` heartbeat is always included regardless of the subscription list. The `Accept: text/event-stream` header can be sent to get SSE format instead.

### Key ProPresenter API endpoints in use

| Endpoint | Purpose |
|---|---|
| `GET /v1/stage/screens` | List configured stage screens |
| `GET /v1/stage/layout_map` | Screen → layout assignments |
| `GET /v1/stage/layout/{id}/thumbnail` | JPEG thumbnail of a layout (~400×225) |
| `GET /v1/status/stage_screens` | Stage output enabled boolean |
| `POST /v1/status/updates` | Multiplex streaming endpoint for live data |
| `status/slide` _(stream topic)_ | Current + next slide text and speaker notes |

The full API spec is at `http://localhost:49659/v1/doc/index.html` (Swagger UI). The raw OpenAPI spec is embedded in `http://localhost:49659/v1/doc/swagger.json` as `var openapi_spec = {...}`.

## Styling conventions

- Dark theme only; all colors are CSS custom properties defined in `index.css`.
- All component styles live in `App.css` using plain class names (no CSS modules).
- No UI library dependency — keep it that way unless complexity warrants it.

## Future work to consider

- **Slide thumbnails**: `GET /v1/presentation/{uuid}/thumbnail/{index}` returns an image of the rendered slide. Could replace or supplement the plain text in `ScreenDetail`.
- **Multiple stream topics**: The `status/updates` stream can subscribe to `presentation/slide_index`, `stage/layout_map`, `timers/current`, etc. simultaneously — useful for adding a timer display or detecting layout changes without reloading.
- **Auto-refresh on layout change**: Subscribe to `stage/layout_map` in the background stream and update the card grid live instead of requiring a manual refresh.
- **Production deployment**: The app is a static bundle — serve `dist/` from any web server. Add a reverse proxy rule to forward `/api` to `http://localhost:49659`.
