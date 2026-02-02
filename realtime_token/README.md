# Token-only Socket.IO server

Same behavior as Frappe's default realtime server (doctype/doc subscribe, Redis events, ping/pong) but **accepts only token authentication** (no cookie/sid).

## Config

- **Port**: Set `socketio_token_port` in `sites/common_site_config.json` (default: `9001`).
- **Redis**: Uses same Redis as Frappe (`redis_queue`) for `events` channel.

## Client connection

Connect to namespace `/<site_name>` with `Authorization: Bearer <access_token>`.

### Development

```js
import { io } from "socket.io-client";

const socket = io("http://localhost:9001/development.localhost", {
  extraHeaders: {
    Authorization: "Bearer <your_jwt_access_token>",
  },
});
```

### Production

Use your **production host** and **site name**. Prefer **WSS** (TLS) and, if possible, the **same host as your API** (via reverse proxy) so you avoid CORS and exposing an extra port.

**Option A – Direct to token socket port (same host as API)**

```js
// If your API is https://api.example.com and token socket runs on 9001
const SOCKET_URL = "https://api.example.com:9001";  // or wss://api.example.com:9001
const SITE_NAME = "example.com";  // your production site name

const socket = io(`${SOCKET_URL}/${SITE_NAME}`, {
  extraHeaders: {
    Authorization: "Bearer <your_jwt_access_token>",
  },
  secure: true,
});
```

**Option B – Reverse proxy (recommended)**

Proxy a path on your API host to the token socket server so the client uses the same origin and port (no extra port, simpler TLS).

Example **nginx**:

```nginx
# Proxy /socket-token to the token Socket.IO server
location /socket-token/ {
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_pass http://127.0.0.1:9001/;
}
```

Client:

```js
// When your app is served from the same host as the API (e.g. https://api.example.com)
const SOCKET_PATH = "/socket-token";
const SITE_NAME = "example.com";

const socket = io(SITE_NAME, {
  path: SOCKET_PATH,
  extraHeaders: {
    Authorization: "Bearer <your_jwt_access_token>",
  },
  secure: true,
});

// When your app is on a different host, use the full socket URL (namespace = site name)
// const socket = io("https://api.example.com/example.com", {
//   path: "/socket-token",
//   extraHeaders: { Authorization: "Bearer <token>" },
//   secure: true,
// });
```

**Site name**

- Namespace is always `/<site_name>` (e.g. `/development.localhost` in dev, `/example.com` in prod).
- If the client’s request host differs from the site name, send it via header: `x-frappe-site-name: example.com`.

### Traefik (one config for all sites)

Frappe works with one entrypoint per site: Traefik sends **Host(site)** to nginx, and nginx proxies both web and the default socketio on the **same host** (e.g. by path). You don’t add a separate route per site — the site name is in the socket connection (namespace).

Do the same for the token socket: **one** path-based route on the **same Host(s)** as your site, so every site uses the same URL pattern: `https://<site>/socket-token` with namespace `/<site_name>`.

**Option 1 – Nginx in front (like Frappe)**

If Traefik sends traffic to nginx (e.g. `excel-erpnext-nginx`) and nginx proxies to web + default socketio, add a proxy to the token socket in **that nginx** config:

```nginx
# Same host as the site; nginx proxies /socket-token to token socket container
location /socket-token/ {
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_pass http://socketio-token:9001/;  # token socket service name
}
```

- Add a `socketio-token` service (or reuse your app’s image with `node socketio_token.js`) in the same compose.
- No extra Traefik route: same Host → nginx → nginx routes `/` to web and `/socket-token/` to token socket.
- New sites: same Host label; client uses `path: "/socket-token"` and namespace = site name.

**Option 2 – Traefik routes directly to services**

If Traefik routes by Host to your app (no nginx), add **one** router for the token socket on the **same Host** and path:

```yaml
# Docker labels on the token socket service (same compose as web)
labels:
  - "traefik.enable=true"
  # Same Host(s) as your site — one rule for all sites
  - "traefik.http.routers.socketio-token.rule=Host(`site1.com`) && PathPrefix(`/socket-token`)"
  - "traefik.http.routers.socketio-token.entrypoints=websecure"
  - "traefik.http.routers.socketio-token.service=socketio-token"
  - "traefik.http.services.socketio-token.loadbalancer.server.port=9001"
```

For multiple sites, use a single rule that matches all site hosts (e.g. `HostRegexp(\`{site:.+}\`)` and a shared backend), or one router per host if you prefer. The token socket server is one service; the **site name is sent as the Socket.IO namespace** by the client, so you never add a route “per site” — only one path `/socket-token` on the same host(s).

**Example: same Host as your staff service**

If your staff service uses labels like:

- `traefik.http.routers.staff--http.rule: Host(${SITES:?No sites set})`
- `traefik.http.routers.staff--https.rule: Host(${SITES})`
- `traefik.http.services.staff-.loadbalancer.server.port: "8080"`
- `traefik.docker.network: traefik-public`, `traefik.constraint-label: traefik-public`

Add a **token socket service** in the same compose with labels that use the **same Host and path prefix** so `/socket-token` goes to the token socket; everything else stays on staff:

```yaml
# Token socket service — same network and constraint-label as staff
traefik.docker.network: traefik-public
traefik.enable: "true"
traefik.constraint-label: traefik-public
# HTTP
traefik.http.routers.staff-socket-token--http.rule: Host(`${SITES}`) && PathPrefix(`/socket-token`)
traefik.http.routers.staff-socket-token--http.entrypoints: http
traefik.http.routers.staff-socket-token--http.middlewares: https-redirect
# HTTPS (higher priority so /socket-token hits this router)
traefik.http.routers.staff-socket-token--https.rule: Host(`${SITES}`) && PathPrefix(`/socket-token`)
traefik.http.routers.staff-socket-token--https.entrypoints: https
traefik.http.routers.staff-socket-token--https.tls: "true"
traefik.http.routers.staff-socket-token--https.tls.certresolver: le
traefik.http.routers.staff-socket-token--https.priority: "100"
traefik.http.services.staff-socket-token.loadbalancer.server.port: "9001"
```

Use the same `SITES` variable as staff. `PathPrefix(/socket-token)` limits this router to the socket path; `priority: "100"` ensures it wins over the staff router for that path.

**Client (same for every site)**

The app gets the current site from boot/config and builds the socket URL from the **same origin + path**:

```js
// Same host as the page (e.g. https://site1.com), path fixed once
const socket = io(siteName, {
  path: "/socket-token",
  extraHeaders: { Authorization: "Bearer " + accessToken },
  secure: true,
});
```

So when you create a new site, you only add the site’s Host in Traefik (as you do today); the token socket is already exposed on the same host at `/socket-token` and works for all sites.

## Events (same as Frappe)

- `ping` / `pong`
- `doctype_subscribe` / `doctype_unsubscribe`
- `doc_subscribe` / `doc_unsubscribe`
- `doc_open` / `doc_close`
- `task_subscribe` / `task_unsubscribe`
- `progress_subscribe`

Python: `frappe.publish_realtime(...)` publishes to the same Redis channel, so both default socketio and this token server receive events.

## Run

From bench root:

```bash
node apps/excel_restaurant_pos/socketio_token.js
```

Or add to Procfile (e.g. `socketio_token: node apps/excel_restaurant_pos/socketio_token.js`) and start with `bench start`.

## Docker Compose (e.g. with Traefik and arc-pos image)

If you already have a **websocket** service running Frappe’s default socketio and a **frontend** (nginx) with Traefik labels on `Host(${SITES})`, add a **websocket-token** service and route `/socket-token` to it (same host, path-based).

**1. Optional: set token socket port in configurator**

In your configurator `command`, add:

```yaml
bench set-config -gp socketio_token_port 9001;
```

**2. Add the websocket-token service**

Use the same image and `sites` volume as your existing **websocket** service. Example:

```yaml
websocket-token:
  <<: [*customizable_image]
  command:
    - node
    - /home/frappe/frappe-bench/apps/excel_restaurant_pos/socketio_token.js
  volumes:
    - sites:/home/frappe/frappe-bench/sites
  networks:
    - frappe_erp_overlay_network
    - traefik-public
  deploy:
    replicas: 1
    restart_policy:
      condition: on-failure
      delay: 5s
    labels:
      traefik.docker.network: traefik-public
      traefik.enable: "true"
      traefik.constraint-label: traefik-public
      traefik.http.routers.pos-staging-erp-socket-token-http.rule: Host(${SITES:?No sites set}) && PathPrefix(`/socket-token`)
      traefik.http.routers.pos-staging-erp-socket-token-http.entrypoints: http
      traefik.http.routers.pos-staging-erp-socket-token-http.middlewares: https-redirect
      traefik.http.routers.pos-staging-erp-socket-token-https.rule: Host(${SITES}) && PathPrefix(`/socket-token`)
      traefik.http.routers.pos-staging-erp-socket-token-https.entrypoints: https
      traefik.http.routers.pos-staging-erp-socket-token-https.tls: "true"
      traefik.http.routers.pos-staging-erp-socket-token-https.tls.certresolver: le
      traefik.http.routers.pos-staging-erp-socket-token-https.priority: "100"
      traefik.http.services.pos-staging-erp-socket-token.loadbalancer.server.port: "9001"
```

- Replace `pos-staging-erp` in router/service names if your stack uses a different prefix.
- Same `SITES` as frontend: one host, `/socket-token` goes to this service, everything else to frontend (nginx).
- Token server reads `redis_queue` and other config from the shared `sites` volume (same as configurator/websocket).

**3. Client**

Same host as your app, path `/socket-token`, namespace = site name:

```js
io(siteName, {
  path: "/socket-token",
  extraHeaders: { Authorization: "Bearer " + accessToken },
  secure: true,
});
```

No change to the existing **websocket** (default Frappe socketio) or **frontend**; the default socket stays at `SOCKETIO: websocket:9000` in nginx. Token clients use `path: "/socket-token"` and Traefik sends that path to **websocket-token**.
