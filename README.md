# Milemark: ELD trip planner

A full-stack app (Django REST + React) that takes a truck driver's trip details and returns the route with every required stop, plus filled-out FMCSA **Driver's Daily Log** sheets drawn from the plan.

![Route, stops and itinerary](docs/screenshots/02-route-and-stops.png)

## The problem

Inputs: current location, pickup location, drop-off location, and the hours already used in the driver's 70-hour / 8-day cycle.

Outputs:

1. A map showing the route and the stops and rests along it.
2. Daily log sheets, drawn and filled out like the paper form. Longer trips need several sheets.

Assumptions given with the assignment: property-carrying driver, 70 hr / 8 day cycle, no adverse driving conditions, fueling at least once every 1,000 miles, 1 hour for pickup and 1 hour for drop-off.

The hard part is that the log sheets are only correct if the schedule underneath them obeys the federal hours-of-service (HOS) rules in the *Interstate Truck Driver's Guide to Hours of Service* (FMCSA, April 2022), and the sheet itself has to match the paper form.

## The solution

1. **Route.** The backend geocodes the places, asks OSRM for the driving route (one request, three waypoints) and splits it into a deadhead leg (to pickup) and a loaded leg (to drop-off).
2. **HOS simulation.** A pure, deterministic simulation walks the route minute by minute and inserts every stop the rules require (table below).
3. **Log sheets.** The resulting duty segments are cut at midnight into calendar-day sheets. Each sheet gets totals that add up to 24 hours, remarks with the city and state of every change of duty status, miles for the day and the 70-hour recap.
4. **UI.** React shows the map and an itinerary per day, and redraws each sheet as an SVG replica of the paper form supplied with the assignment, with the duty line drawn in pen blue. Sheets can be expanded full screen, downloaded as PNG or printed (one sheet per page).

![Daily log sheet](docs/screenshots/03-log-sheet.png)

### How the log sheet follows the provided form

The sheet keeps every field of the blank *Drivers Daily Log* supplied with the assignment. It is drawn and filled the way a driver fills a paper log, following the FMCSA guide's "A Completed Log" (page 19) and the Schneider walkthrough *How to fill out a log book for truck drivers*:

- Printed form in blue, entries in black handwriting, like a real paper log.
- Header: the date in digit boxes (month / day / year), From and To, the two mileage boxes, the truck and trailer box, and the carrier, main office and home terminal lines.
- Grid: hour labels from Midnight to 11 across the top, repeated on a ruler under the grid. Each hour is split into 15-minute ticks, and there is one row per duty status.
- Pen line: a dot at every change of duty status, connected by horizontal and vertical lines.
- Line totals: HOURS and MINUTES boxes (00, 15, 30 or 45) for each line, plus a TOTAL HOURS row that always reads 24 00.
- Remarks: a bracket under the grid marks the time the truck did not move, and a 45° flag gives the city and state plus what the driver did ("Pickup, loading", "Fuel", "30 min break", "10 hr break (sleeper)", "34 hr restart", "Start driving"). Shipping documents sit bottom-left, and the instruction line sits in the gap of the bottom rule.
- Recap: on lines, as on the form. On-duty hours today (lines 3 and 4) are circled, as the walkthrough shows. A / B / C are filled for the 70 hour / 8 day driver; the 60 hour / 7 day columns stay blank.
- Next to the sheet, the app lists every change of duty in plain text, the hours per line, the recap, and a key explaining dots, brackets and flags.

![FMCSA sample day as drawn by the app](docs/screenshots/04-fmcsa-sample-sheet.png)

### Interface design

- A navy sidebar holds every input; the light workspace shows the results. Signal orange is used only for actions and the current selection; the duty statuses keep their own colors everywhere (driving blue, on duty amber, sleeper violet, off duty slate).
- The route fields are drawn as a connected timeline (current location, then pickup, then drop-off), with a cycle-hours meter, a stepper and quick example trips.
- On desktop the page never scrolls: day tabs replace long lists, the log sheet scales to fit, and "Expand" opens it full screen.
- The trip title, stats and a duty-hours bar summarise the plan. The itinerary is a timeline per day with drive legs between stops, and a day spent entirely in a restart says so. Each day card on the Logs tab carries a mini 24-hour duty bar.
- Motion is limited to transform and opacity: staggered entrances, count-up numbers, a pen reveal on each sheet, and pin and tab transitions. All of it is turned off under `prefers-reduced-motion`. Dark mode follows the system.
- Accessibility: proper tabs with arrow-key navigation, combobox semantics on the place search, labelled controls, visible focus rings, and 44 px touch targets.

### HOS rules implemented

Source for every rule: the FMCSA guide supplied with the assignment.

| Rule | Value | Where |
|---|---|---|
| Driving limit | 11 h of driving, then a 10 h rest | `backend/apps/trips/services/hos_rules.py:9`, `hos_planner.py:68` |
| Driving window | 14 consecutive hours from the start of the shift | `hos_rules.py:10`, `hos_planner.py:56` |
| Rest break | 30 min off after 8 cumulative driving hours; any non-driving block of 30 min or more resets the clock (pickup, drop-off and fuel stops count) | `hos_rules.py:11`, `hos_planner.py:136` |
| Cycle limit | 70 on-duty hours in 8 days | `hos_rules.py:14`, `hos_planner.py:79` |
| 34-hour restart | Inserted when the 70 hours are used up; resets the cycle to zero | `hos_rules.py:15`, `hos_planner.py:153` |
| Fueling | A 30 min on-duty stop when 1,000 miles have been driven since the last fill | `hos_rules.py:16`, `hos_planner.py:60`, `hos_planner.py:144` |
| Pickup / drop-off | 1 h each, on duty, not driving | `hos_planner.py` (`plan_duty_segments`) |
| Log sheet | 24 h grid, totals sum to 24, remarks with city and state, miles, recap | `backend/apps/trips/services/logbook.py:182` |

Logging conventions: 10 h rests are logged as **sleeper berth**; 30 min breaks and 34 h restarts as **off duty**; pickup, drop-off and fueling as **on duty (not driving)**.

### Assumptions I made where the brief is silent

- Average truck speed is 55 mph (`HosRules.speed_mph`); OSRM provides distance, not truck speed.
- Paper logs are kept in 15-minute increments, so the plan is too (`HosRules.log_increment`). The departure, cycle hours and each drive leg are rounded up to the next quarter hour, and a fuel stop is rounded to the quarter hour before 1,000 miles. Every rounding errs toward a legal, slightly conservative plan.
- The truck leaves with a full tank, and the driver starts the trip rested (at least 10 hours off) at the chosen departure time.
- Departure time is entered in home-terminal time, as the FMCSA guide requires. There is no timezone conversion.
- Hours already used in the cycle are treated as one block that does not roll off during the trip. This is the conservative choice, because the app is not given the daily history.
- Recap line C ("last 5 days") counts hours worked on the trip only. The carried-in cycle hours appear in A and B.
- The split-sleeper provisions (7/3 and 8/2) and the adverse-conditions and short-haul exceptions are not implemented. The brief rules out adverse conditions, and the split provisions are optional.
- Contiguous US only (location search is limited to that bounding box).

## Verification against the FMCSA example

The guide contains a completed log (John E. Doe, Richmond VA to Newark NJ, 350 miles). `backend/tests/test_fmcsa_sample.py` feeds that day's duty changes through the same log builder the API uses and checks the result against the printed sheet:

| Field on the official sheet | Official | This app |
|---|---|---|
| Off duty | 10 | 10.00 |
| Sleeper berth | 1.75 | 1.75 |
| Driving | 7.75 | 7.75 |
| On duty (not driving) | 4.5 | 4.50 |
| Total | 24 | 24.00 |
| Total miles driving today | 350 | 350.0 |
| Remarks (change-of-duty cities) | Richmond, Fredericksburg, Baltimore, Philadelphia, Cherry Hill, Newark | same cities recorded |

The same trip planned through the app ("FMCSA sample day" example) gives 324.8 road miles, 6.00 h driving and 2.00 h on duty. It differs from the printed example because the assignment's assumptions replace the example's ad-hoc stops (1 h pickup and drop-off, no lunch, no sleeper nap), and OSRM's road distance and 55 mph replace the example's 350 miles and slower pace. The structure, totals and header fields are identical.

## Architecture

```
React (Vite, TypeScript)  ──/api──▶  Django + DRF  ──▶  Photon (geocoding)
        │                                  │       ──▶  OSRM (routing)
   Leaflet + OSM tiles                     └──▶  GeoNames place index (bundled CSV)
```

```
backend/
  config/                  settings, urls, wsgi/asgi
  apps/trips/
    api/                   views, serializers, throttles, exception handler (HTTP edge)
    services/
      trip_service.py      orchestrates one plan: geocode, route, simulate, build logs
      hos_rules.py         HOS limits as one frozen dataclass
      hos_planner.py       the simulation (pure, no I/O)
      logbook.py           duty segments into daily sheets, totals, remarks, recap
      stops.py, summary.py presentation helpers
      geocoding.py, routing.py   external API clients (cached, with timeouts)
      places.py, route_path.py, locations.py   offline "nearest city" lookup along the route
    utils/                 polyline decoding, geo math, http client, cache keys, time helpers
    data/us_places.csv     17k US places from GeoNames (generated by scripts/build_places.py)
  tests/                   1,075 tests

frontend/src/
  api/                     fetch client, endpoints
  hooks/                   form state, planner, location search, combobox, count-up
  utils/                   time and distance formatting, polyline, validation, itinerary, PNG export
  components/
    ui/                    Button, IconButton, TextField, Tabs, Dialog, Alert, Meter, Disclosure, Panel, Skeleton, ErrorBoundary
    layout/                brand
    trip-form/             sidebar form, route timeline, location combobox, cycle field, example chips
    results/               trip header, stats and duty bar, itinerary timeline, overlays, log viewer
    map/                   Leaflet route, pins, legend
    logs/sheet/            the paper log as SVG (header, grid, remarks, recap)
  styles/                  design tokens (light and dark), global, map, print
```

### API

`POST /api/trips/plan/`

```json
{
  "current_location": {"label": "Chicago, IL", "lat": 41.8756, "lng": -87.6244},
  "pickup_location": "Dallas, TX",
  "dropoff_location": {"label": "Atlanta, GA", "lat": 33.749, "lng": -84.388},
  "cycle_used_hours": 24,
  "start_time": "2026-10-05T07:00",
  "log_details": {"carrier_name": "Northline Freight LLC", "vehicle_numbers": "T-4821 / TR-1130"}
}
```

A location is either a place object (from the search endpoint) or free text that the server geocodes. `start_time` is optional; `log_details` is optional and is copied onto every sheet. The response contains:

- `summary`: miles, driving and on-duty minutes, trip length, number of sheets, counts of fuel stops, breaks, rests and restarts.
- `route`: the route as an encoded polyline (precision 6), the three waypoints and the two legs.
- `stops`: start, pickup, drop-off and every fuel stop, break, rest and restart, with place, mile marker, arrival, departure and day number.
- `logs`: one object per calendar day with header fields, duty segments in minutes since midnight, totals, remarks and recap.

`GET /api/locations/search/?q=chicago&limit=6` returns `{"results": [{"label", "lat", "lng"}]}` for the autocomplete. `GET /api/health/` is a liveness check.

Errors share one shape, `{"error": {"code", "message", "fields"?}}`: `400 validation_error` (with per-field messages), `422 location_not_found` or `route_not_found`, `429 rate_limited`, `502 upstream_unavailable`.

## Design decisions

| Decision | Chosen | Runner-up and why it lost |
|---|---|---|
| Routing and geocoding | OSRM public server and Photon, no API keys | OpenRouteService and Google need keys and quotas for a reviewer to run the app. Nominatim forbids search-as-you-type. |
| City and state for the remarks | Offline nearest-place index over a bundled GeoNames CSV (about 30 lookups take under 1 ms) | Reverse-geocoding every stop would add 10 to 30 rate-limited network calls per plan. |
| HOS engine | Integer-minute event simulation with all state in one small dataclass | Floating-point hours drift and need epsilon checks everywhere. A constraint solver is overkill for a deterministic schedule. |
| State | Stateless API, results cached for 24 h | Persisting trips needs models, auth and migrations the brief does not ask for. |
| Log sheet | SVG generated from the API data | HTML tables cannot draw the duty line precisely, and canvas is not crisp when printed or zoomed. SVG also exports to PNG and unit-tests on its geometry. |
| Styling | CSS Modules with design tokens, small purpose-built component kit | Tailwind or a component library adds a dependency for a UI of this size and makes the paper-form SVG harder to keep self-contained. |

Edge cases the design handles on purpose: cycle hours already at 70 (a 34 h restart before any work), pickup equal to current location (zero-length deadhead leg), trips that cross midnight (segments split at midnight, totals still sum to 24), a trip that ends exactly at midnight (no empty extra sheet), and a fuel limit that falls within one minute of the destination.

### External calls

| Call | Timeout | Retry | If it still fails |
|---|---|---|---|
| Photon (search, geocode) | 8 s | 1 retry on connection errors and 502/503/504, 0.2 s backoff | `502 upstream_unavailable`; the autocomplete shows an inline notice and the user can still type a full place name |
| OSRM (route) | 8 s | same | `502 upstream_unavailable` with a message in the UI; the form stays filled |

Both are GET requests, so retries are safe. Results are cached for 24 hours. Requests share one pooled HTTP session. The browser aborts in-flight requests when a newer one starts.

### Performance

- Planning and building the logs for a 2,798-mile, 6-day trip takes about 0.7 ms (median of 20 runs). The first request additionally decodes the route geometry and warms the place index (about 75 ms).
- A cold plan is bounded by the external routing call (measured 1.4 s with coordinates supplied, 1.7 to 2.3 s when three places must also be geocoded, which is done in parallel). A repeat plan is served from cache in about 3 ms.
- Responses are gzip-compressed (a 2,800-mile response is about 119 KB over the wire). The initial JS bundle is about 90 KB gzipped and the map code (Leaflet) loads lazily as a separate 48 KB chunk.
- The desktop layout fits the viewport without page scroll: day tabs replace long lists, and the log sheet scales to fit its panel.

## Testing

Backend (`backend/`):

```bash
uv run pytest        # 1,075 tests
uv run ruff check .  # lint, including complexity limits
```

- Planner: every individual rule has a focused test, plus 980 parameterized trips (all combinations of leg lengths, cycle hours and start times) checked against `tests/helpers.py::ComplianceChecker`, an independent re-implementation of the rules. `test_compliance_checker.py` proves the checker rejects violations, so those passes are not vacuous.
- Logbook: midnight splitting, 24-hour totals, remarks, recap, restart days, empty-day edge cases.
- FMCSA sample: see the table above.
- API: validation, free-text geocoding, error mapping, rate limiting. External services are faked, so the suite runs offline.

Frontend (`frontend/`):

```bash
npm test             # 94 unit and component tests (Vitest and Testing Library)
npm run test:e2e     # 10 browser tests (Playwright); add PLAYWRIGHT_CHANNEL=chrome to use installed Chrome,
                     # otherwise run `npx playwright install chromium` once
npm run lint         # oxlint, including a 40-line function limit
npm run typecheck
npm run build
```

Unit and component tests cover utilities (time, polyline, validation, itinerary, duty math), the SVG sheet geometry (including the six remark brackets of the FMCSA completed log), the rendered sheet, tabs with keyboard navigation, the location combobox (typing, keyboard and mouse selection, clearing, outage), example chips, stats, legend, the itinerary's restart days, and the whole app flow with a mocked API.

The Playwright suite (`frontend/e2e/`) runs the real app in Chrome against fixtures recorded from the real backend, with map tiles stubbed, so it is deterministic and works offline. It covers validation, the FMCSA sample sheet's content, expand and Escape, PNG download, a 5-day trip with a 34-hour restart, typed place selection, server errors, no page scroll at 1440 x 900, no sideways scroll on a phone, and a regression test for re-planning while the map is hidden.

End-to-end in a real Chrome against the running stack (backend on `:8000`, Vite on `:5173`): empty state, validation messages, typeahead with keyboard selection, a typed trip, the FMCSA sample day, a 6-day cross-country trip with day tabs and stop focus, the near-70-hour example (34 h restart), PNG download, print (6 pages for 6 sheets), dark mode, and a 390 px mobile layout with no horizontal scroll. Screenshots, including dark mode and phone, are in `docs/screenshots/`.

## Running locally

Requirements: Python 3.13 with [uv](https://docs.astral.sh/uv/), Node 22.

```bash
cd backend
uv sync
DJANGO_DEBUG=1 uv run python manage.py runserver 8000

cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The Vite dev server proxies `/api` to `localhost:8000` (override with `VITE_PROXY_TARGET`).

### Configuration

Backend (`backend/.env.example`): `DJANGO_SECRET_KEY` (required unless `DJANGO_DEBUG=1`), `DJANGO_ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `PLAN_RATE_LIMIT`, `SEARCH_RATE_LIMIT`, `NUM_PROXIES` (set to the number of reverse proxies in front of the app so rate limiting sees the client IP).

Frontend (`frontend/.env.example`): `VITE_API_URL` is the backend origin when the frontend is hosted separately; leave it empty to use a same-origin `/api`.

### Deploying

- **Backend** (Render, Railway, Fly and similar): build with `pip install -r requirements.txt`, start with the included `Procfile` (gunicorn), and set the environment variables above, with `CORS_ALLOWED_ORIGINS` set to the frontend URL.
- **Frontend** (Vercel): root directory `frontend`, build command `npm run build`, output `dist`, and `VITE_API_URL` set to the backend URL.

The public OSRM and Photon servers are shared community services and are meant for light use. For heavy traffic, point `OSRM_URL` and `PHOTON_URL` (in `services/routing.py` and `services/geocoding.py`) at self-hosted instances.

## Data and attribution

Map tiles and geocoding data: © OpenStreetMap contributors (ODbL). Routing: OSRM. Place names for the remarks: GeoNames (CC BY 4.0), regenerated with `backend/scripts/build_places.py`. Regulatory text: FMCSA, *Interstate Truck Driver's Guide to Hours of Service* (April 2022).
