# Migration Guide: Old → New Architecture

This guide explains how to migrate from the old Electron + Angular architecture to the new Node.js + React architecture.

## Key Changes

### Architecture
- **Old**: Monolithic Electron desktop app
- **New**: Separated server (Node.js) and client (React SPA)

### Technology Stack
- **Frontend**: Angular → React
- **Backend**: Komponist + Electron → Express + WebSocket
- **Build**: Angular CLI + electron-builder → Vite + Docker
- **MPD Client**: Browserified library → Native Node.js TCP client

## Migration Steps

### 1. Review New Structure

The new architecture consists of two separate projects:

```
server-new/     # Backend Node.js server
client/         # Frontend React SPA
```

### 2. Configuration

Create environment files:

**server-new/.env**
```
MPD_HOST=localhost
MPD_PORT=6600
PORT=3001
```

**client/.env** (optional, for custom backend URL)
```
VITE_API_URL=http://your-server:3001
VITE_WS_URL=ws://your-server:3001
```

### 3. Development Workflow

**Old workflow:**
```bash
npm run start  # Started Electron app
```

**New workflow:**
```bash
npm run install:all  # Install all dependencies
npm run dev         # Start both server and client in dev mode
```

This runs:
- Server on http://localhost:3001 (API + WebSocket)
- Client on http://localhost:3000 (with HMR)

### 4. Building for Production

**Old workflow:**
```bash
npm run build:prod
npm run electron:linux/windows/mac
```

**New workflow:**
```bash
npm run build        # Build React client
npm start           # Run production server
```

Or with Docker:
```bash
npm run docker:build
npm run docker:run
```

### 5. Feature Mapping

All features from the old app are preserved:

| Old Feature | New Implementation |
|-------------|-------------------|
| Browse library | Browser component + /api/browse |
| Playback control | Controls component + /api/play, /api/pause, etc. |
| Playlist management | Playlist component + WebSocket updates |
| Now playing display | NowPlaying component + real-time updates |
| Library rescan | Browser component + /api/update |

### 6. API Changes

**Old (Komponist):**
```javascript
komponist.play()
komponist.pause()
komponist.list(path)
```

**New (REST API):**
```javascript
fetch('/api/play', { method: 'POST' })
fetch('/api/pause', { method: 'POST' })
fetch('/api/browse?path=' + path)
```

### 7. Real-time Updates

**Old:** Polling or Komponist events

**New:** WebSocket connection
```javascript
const ws = new WebSocket('ws://localhost:3001');
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  // Handle updates
};
```

### 8. Deployment Options

The new architecture offers more flexibility:

1. **Traditional Server**: Deploy Node.js server + serve static client
2. **Docker**: Use provided Dockerfile and docker-compose.yml
3. **Kubernetes**: Easy to containerize and orchestrate
4. **Separate Hosting**: Host client on CDN, server anywhere

### 9. Advantages of New Architecture

- ✅ **Separation of Concerns**: Frontend and backend are independent
- ✅ **Scalability**: Can run multiple server instances
- ✅ **Flexibility**: Access from any device (not just desktop)
- ✅ **Modern Stack**: Latest React, ES modules, async/await
- ✅ **Docker Ready**: Easy containerization
- ✅ **Better DevEx**: HMR, faster builds, better debugging
- ✅ **No Electron Overhead**: Smaller, faster, less memory

### 10. Old Files to Remove (After Testing)

Once you've confirmed the new architecture works:

```bash
# Old files (can be removed)
.angular-cli.json
electron-builder.json
karma.conf.js
main.ts
protractor.conf.js
tslint.json
e2e/
ext/
hooks/
src/  (old Angular app)
server/  (old MPD client library)
```

Keep these if you want to maintain backwards compatibility:
- `server/` directory (the MPD library might be useful as reference)

### 11. Testing the Migration

1. Start an MPD server (or use an existing one)
2. Start the new server: `cd server-new && npm start`
3. Build and serve the client: `cd client && npm run build && npm run preview`
4. Test all features:
   - [ ] Connect to MPD
   - [ ] Browse library
   - [ ] Play/pause/stop
   - [ ] Add tracks to playlist
   - [ ] Remove tracks from playlist
   - [ ] Real-time updates work
   - [ ] UI is responsive

### 12. Rollback Plan

If you need to rollback:

1. The old code is still in the repository
2. Switch branches: `git checkout master`
3. Run old app: `npm install && npm start`

## Questions?

Check README-NEW.md for detailed documentation on the new architecture.
