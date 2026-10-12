# MPoly - Modern MPD Client

A modern Music Player Daemon (MPD) client with a Node.js backend and React frontend.

## Architecture

- **Backend**: Node.js server with Express and WebSocket support for real-time updates
- **Frontend**: React SPA with Vite
- **Communication**: REST API + WebSocket for live updates

## Features

- 🎵 Browse your music library
- ▶️ Control playback (play, pause, stop, next, previous)
- 📋 Manage playlists
- 🔄 Real-time updates via WebSocket
- 🎨 Modern, responsive UI
- 🐳 Docker support

## Prerequisites

- Node.js 18+ (or Docker)
- Running MPD server

## Installation

### From NPM (Easiest)

```bash
# Run directly with npx (no installation needed)
npx @emgeebee/mpoly

# Or install globally
npm install -g @emgeebee/mpoly
mpoly

# Or install in a project
npm install @emgeebee/mpoly
```

Set environment variables for MPD connection:
```bash
MPD_HOST=localhost MPD_PORT=6600 npx @emgeebee/mpoly
```

The server will start on http://localhost:3001 with the web interface.

### From Source

Clone and build from source for development.

## Quick Start

### Development

1. **Install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Configure MPD connection:**
   Create a `.env` file in the `server-new` directory:
   ```
   MPD_HOST=localhost
   MPD_PORT=6600
   ```

3. **Start development servers:**
   ```bash
   npm run dev
   ```
   
   This starts:
   - Server on http://localhost:3001
   - Client on http://localhost:3000

### Production

1. **Build the client:**
   ```bash
   npm run build
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

### Docker

1. **Build and run with Docker Compose:**
   ```bash
   npm run docker:build
   npm run docker:run
   ```

2. **Or manually:**
   ```bash
   docker build -t mpoly .
   docker run -p 3001:3001 -e MPD_HOST=your-mpd-host mpoly
   ```

## Environment Variables

### Server (`server-new/.env`)

- `MPD_HOST` - MPD server host (default: localhost)
- `MPD_PORT` - MPD server port (default: 6600)
- `PORT` - HTTP server port (default: 3001)

### Client (`client/.env`)

- `VITE_API_URL` - Backend API URL (default: empty, uses proxy)
- `VITE_WS_URL` - WebSocket URL (default: ws://localhost:3001)

## API Endpoints

### REST API

- `GET /api/status` - Get current MPD status, current song, and playlist
- `POST /api/play` - Start playback (optionally at specific position)
- `POST /api/pause` - Pause/unpause playback
- `POST /api/stop` - Stop playback
- `POST /api/next` - Next track
- `POST /api/previous` - Previous track
- `POST /api/clear` - Clear playlist
- `POST /api/add` - Add track to playlist
- `POST /api/delete` - Remove track from playlist
- `GET /api/browse?path=` - Browse music library
- `POST /api/update` - Update music library
- `POST /api/volume` - Set volume
- `POST /api/seek` - Seek to position

### WebSocket

Connect to `ws://localhost:3001` for real-time updates.

Messages:
- `{ type: 'initial', data: {...} }` - Initial state on connection
- `{ type: 'update', subsystem: '...', data: {...} }` - State update
- `{ type: 'disconnected' }` - MPD disconnected

## Project Structure

```
.
├── server-new/          # Node.js server
│   ├── index.js         # Express + WebSocket server
│   ├── mpd-client.js    # MPD client implementation
│   └── package.json
│
├── client/              # React SPA
│   ├── src/
│   │   ├── App.jsx      # Main app component
│   │   ├── components/  # React components
│   │   └── main.jsx     # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── Dockerfile
├── docker-compose.yml
└── package.json         # Root package for scripts
```

## Running with npx

Once published to npm, users can run directly:

```bash
npx @emgeebee/mpoly
```

Or during development:

```bash
cd server-new
node index.js
```

The server will:
- Connect to MPD at the configured host/port
- Start REST API on port 3001
- Serve the web interface
- Enable WebSocket for real-time updates
- Auto-reconnect to MPD if disconnected

## Differences from Old Architecture

### Old (Electron + Angular + Komponist)
- Desktop app with Electron
- Angular frontend
- Komponist for browser-based MPD communication
- Tightly coupled architecture

### New (Node.js + React)
- Separate server and client
- Modern React with hooks
- Direct TCP connection to MPD
- REST API + WebSocket
- Docker-ready
- Can run anywhere (not just desktop)

## License

MIT
