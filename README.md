# MPoly - Modern MPD Client

A web client for [Music Player Daemon (MPD)](https://www.musicpd.org/): a Node.js server that talks to MPD over TCP, and a React SPA served by that same server.

Published as [`@emgeebee/mpoly`](https://www.npmjs.com/package/@emgeebee/mpoly) on npm.

## Features

- Browse your music library and trigger a library rescan
- Playback control: play, pause, stop, next, previous, seek, volume
- Playlist management: add, remove, clear
- Real-time updates over WebSocket, with auto-reconnect to MPD
- Runs anywhere Node.js 18+ runs: npx, Docker, or a Synology NAS

## Quick start (npx)

```bash
MPD_HOST=192.168.1.50 MPD_PORT=6600 npx @emgeebee/mpoly
```

Open `http://localhost:3001`. The UI, REST API and WebSocket are all served from that one port.

Or install globally:

```bash
npm install -g @emgeebee/mpoly
mpoly
```

## Configuration

All configuration is through environment variables:

| Variable   | Default     | Description           |
|------------|-------------|-----------------------|
| `MPD_HOST` | `localhost` | MPD server host       |
| `MPD_PORT` | `6600`      | MPD server port       |
| `PORT`     | `3001`      | HTTP / WebSocket port |

## Synology / Docker

### Synology (npx, no image build)

See [`docker/synology-compose.yml`](docker/synology-compose.yml). In Container Manager, go to **Project → Create** and paste it in, then set `MPD_HOST` / `MPD_PORT` to point at your MPD server. If MPD runs on the NAS itself, leave `MPD_HOST` as `host.docker.internal`.

The container runs:

```bash
npx --yes @emgeebee/mpoly@2.1.0
```

To upgrade, change the version in the compose file and rebuild the project.

### Docker (build from source)

```bash
npm run build                                  # build the client first
docker build -t mpoly .
docker run -p 3001:3001 -e MPD_HOST=192.168.1.50 mpoly
```

Or with the root [`docker-compose.yml`](docker-compose.yml):

```bash
npm run build
MPD_HOST=192.168.1.50 docker compose up --build
```

## Development

```bash
npm install            # root tooling (npm-run-all)
npm run install:all    # server + client dependencies
MPD_HOST=192.168.1.50 npm run dev   # server on :3001, Vite dev server on :3000
```

Open `http://localhost:3000`. Vite proxies `/api` and `/ws` to the server, so hot reload works against a real MPD.

Production build from source:

```bash
npm run build          # builds client/dist
npm start              # server serves the built UI on :3001
```

The client can be pointed at a different backend at build time with `VITE_API_URL` and `VITE_WS_URL` (in `client/.env`). By default it uses the same host and port it was loaded from.

## API

### REST

| Method | Path               | Body / query          |
|--------|--------------------|-----------------------|
| GET    | `/api/status`      | –                     |
| POST   | `/api/play`        | `{ pos? }`            |
| POST   | `/api/pause`       | –                     |
| POST   | `/api/stop`        | –                     |
| POST   | `/api/next`        | –                     |
| POST   | `/api/previous`    | –                     |
| POST   | `/api/clear`       | –                     |
| POST   | `/api/add`         | `{ uri }`             |
| POST   | `/api/delete`      | `{ pos }`             |
| GET    | `/api/browse`      | `?path=`              |
| POST   | `/api/update`      | –                     |
| POST   | `/api/volume`      | `{ volume }`          |
| POST   | `/api/seek`        | `{ pos, time }`       |

`/api/status` returns `{ connected, status, currentSong, playlist }`.

### WebSocket

Connect to `ws://<host>:<port>/ws`. Messages:

- `{ type: 'initial', data }` – full state on connect
- `{ type: 'update', subsystem, data }` – full state after an MPD change
- `{ type: 'disconnected' }` – lost connection to MPD (the server retries every 5s)

## Project structure

```
.
├── server/                  # Node.js server (Express + ws)
│   ├── index.js             # REST API, WebSocket, static UI
│   └── mpd-client.js        # MPD TCP client
├── client/                  # React SPA (Vite)
│   └── src/
│       ├── App.jsx
│       └── components/      # NowPlaying, Controls, Playlist, Browser
├── docker/
│   └── synology-compose.yml # Synology Container Manager project
├── scripts/
│   └── prepare-publish.js   # builds the npm package.json + bin
├── Dockerfile
└── docker-compose.yml
```

## Publishing

Every push to `master` publishes to npm if the version in `server/package.json` isn't already published. See [PUBLISHING.md](PUBLISHING.md).

## License

MIT
