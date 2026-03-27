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

## Design constraints

This app runs on large monitors and televisions in live production environments. Follow these rules:

- **No modals or overlays.** Any detail or drill-down view must be a full page. Modals are hard to read at distance and disorienting in a live setting.
- **Prefer large, readable text.** Use `clamp()` with viewport-relative units so text scales with screen size.
- **Avoid hover-only affordances.** Controls must be visible without a mouse hover; confidence monitors are often touch or keyboard driven.
- **Keep navigation simple.** The routing structure is flat: list → detail. Do not add nested routes or multi-level navigation.

### File layout

```
src/
  api.js              — fetch wrappers + streaming generator for the ProPresenter REST API
  useProPresenter.js  — hook; fetches screens + layout map + status in parallel on load
  useStageStream.js   — hook; opens a live stream via POST /v1/status/updates for all stage data
  ScreenList.jsx      — screen grid page (route: /)
  ScreenCard.jsx      — card for a single stage screen; navigates to /screen/:uuid on click
  ScreenPage.jsx      — full-page live view for a single screen (route: /screen/:uuid)
  App.jsx             — router root; declares the two routes
  App.css             — all component styles (dark theme, CSS custom properties)
  index.css           — global resets and CSS variable definitions
```

### Routing

React Router v6 is used. Routes are declared in `App.jsx`:

| Route | Component | Purpose |
|---|---|---|
| `/` | `ScreenList` | Grid of all configured stage screens |
| `/screen/:uuid` | `ScreenPage` | Full-page live view for one screen |

`ScreenCard` passes `{ screen, layout }` as router `state` when navigating so `ScreenPage` does not need to re-fetch. If a user navigates directly via URL (e.g. bookmark), `state` will be `undefined` and `ScreenPage` falls back to the UUID alone.

### Data flow

**Initial load (`useProPresenter`)**
1. Fires three requests in parallel on mount:
   - `GET /v1/stage/screens` — list of configured stage screens (`[{ uuid, name, index }]`)
   - `GET /v1/stage/layout_map` — which layout is assigned to each screen (`[{ screen, layout }]`)
   - `GET /v1/status/stage_screens` — boolean; whether stage output is enabled
2. Joins `screens` + `layoutMap` into a `screenLayouts` map keyed by screen UUID.
3. `ScreenList` renders one `ScreenCard` per screen.

**Screen page (`useStageStream`)**
1. When a card is clicked, the router navigates to `/screen/:uuid` and `ScreenPage` mounts.
2. `useStageStream` opens a persistent connection via `POST /v1/status/updates`, subscribing to `status/slide`, `timers/current`, `timer/video_countdown`, and `timer/system_time` in a single stream.
3. The stream returns newline-delimited JSON: `{"url": "<endpoint>", "data": <payload>}`.
4. Each event routes to the matching piece of state; the page re-renders only the changed zone.
5. The stream and `AbortController` are torn down on unmount (`useEffect` cleanup).

### Stage view layout

`ScreenPage` replicates the visual zones shown in the layout thumbnail (pure black background):

| Zone | Content | Color | Grid row |
|---|---|---|---|
| Current (top) | Active slide text | White | `1fr` |
| Next (middle) | Next slide text | Amber `#d4920a` | `0.38fr` |
| Bottom bar | Timer · Clock · Video countdown | Amber `#d4920a` | `0.3fr` |

The bottom bar always shows three cells regardless of how many timers are configured. The **first timer** (`timers[0]`) is shown in the left cell; its name comes from `id.name`. The clock is derived from `timer/system_time` (Unix seconds → 12-hour format). The right cell shows `timer/video_countdown`.

If the layout changes to show a different number of timer elements, this mapping will need to be updated manually — the ProPresenter layout API does not expose which timer UUID is bound to which layout element.

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
| `timers/current` _(stream topic)_ | Array of `{ id: { uuid, name }, time, state }` for all timers |
| `timer/video_countdown` _(stream topic)_ | Formatted video countdown string e.g. `"0:12:34"` |
| `timer/system_time` _(stream topic)_ | Unix timestamp (seconds); used to derive the clock display |

The full API spec is at `http://localhost:49659/v1/doc/index.html` (Swagger UI). The raw OpenAPI spec is embedded in `http://localhost:49659/v1/doc/swagger.json` as `var openapi_spec = {...}`.

## Styling conventions

- Dark theme only; all colors are CSS custom properties defined in `index.css`.
- All component styles live in `App.css` using plain class names (no CSS modules).
- No UI library dependency — keep it that way unless complexity warrants it.

## Future work to consider

- **Slide thumbnails**: `GET /v1/presentation/{uuid}/thumbnail/{index}` returns an image of the rendered slide. Could replace or supplement the plain text in `ScreenPage`.
- **Multiple stream topics**: The `status/updates` stream can subscribe to `presentation/slide_index`, `stage/layout_map`, `timers/current`, etc. simultaneously — useful for adding a timer display or detecting layout changes without reloading.
- **Auto-refresh on layout change**: Subscribe to `stage/layout_map` in the background stream and update the card grid live instead of requiring a manual refresh.
- **Production deployment**: The app is a static bundle — serve `dist/` from any web server. Add a reverse proxy rule to forward `/api` to `http://localhost:49659`.
