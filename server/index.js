import express from 'express';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MPDClient } from './mpd-client.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3001;

// MPD configuration from environment
const MPD_HOST = process.env.MPD_HOST || 'localhost';
const MPD_PORT = process.env.MPD_PORT || 6600;

// Middleware
app.use(cors());
app.use(express.json());

// Built React app: ./client/dist in the npm package, ../client/dist in Docker and the repo
const clientBuildPath = [
  path.join(__dirname, 'client/dist'),
  path.join(__dirname, '../client/dist')
].find((dir) => fs.existsSync(path.join(dir, 'index.html')));

if (clientBuildPath) {
  app.use(express.static(clientBuildPath));
}

const MPD_ADDRESS = `${MPD_HOST}:${MPD_PORT}`;
const RECONNECT_MIN_MS = 2000;
const RECONNECT_MAX_MS = 30000;

// MPD client instance
let mpdClient = null;
let reconnectTimer = null;
let reconnectDelay = RECONNECT_MIN_MS;
let lastConnectError = null;

function isMPDConnected() {
  return Boolean(mpdClient && mpdClient.connected);
}

function disconnectedState() {
  return {
    connected: false,
    mpd: MPD_ADDRESS,
    error: lastConnectError,
    status: {},
    currentSong: {},
    playlist: []
  };
}

// Connect to MPD. Failures are logged once per outage, then retried quietly
// with backoff until MPD is back.
async function connectToMPD() {
  reconnectTimer = null;
  const client = new MPDClient();

  try {
    await client.connect(MPD_HOST, MPD_PORT);
  } catch (error) {
    client.disconnect();
    if (lastConnectError !== error.message) {
      console.warn(`MPD unavailable at ${MPD_ADDRESS} (${error.message}); retrying in the background`);
      lastConnectError = error.message;
    }
    scheduleReconnect();
    return;
  }

  mpdClient = client;
  lastConnectError = null;
  reconnectDelay = RECONNECT_MIN_MS;
  console.log(`Connected to MPD at ${MPD_ADDRESS}`);

  client.on('changed', async (subsystem) => {
    const data = await getFullState();
    broadcast({ type: 'update', subsystem, data });
  });

  client.on('disconnected', () => {
    if (mpdClient !== client) return;
    mpdClient = null;
    lastConnectError = 'connection lost';
    console.warn(`Lost connection to MPD at ${MPD_ADDRESS}; retrying in the background`);
    broadcast({ type: 'disconnected', data: disconnectedState() });
    scheduleReconnect();
  });

  broadcast({ type: 'update', subsystem: 'connection', data: await getFullState() });
}

function scheduleReconnect() {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(connectToMPD, reconnectDelay);
  reconnectDelay = Math.min(reconnectDelay * 2, RECONNECT_MAX_MS);
}

// Get full MPD state
async function getFullState() {
  if (!isMPDConnected()) {
    return disconnectedState();
  }

  try {
    const [status, currentSong, playlist] = await Promise.all([
      mpdClient.status(),
      mpdClient.currentSong(),
      mpdClient.playlist()
    ]);

    return {
      connected: true,
      status,
      currentSong,
      playlist: toList(playlist)
    };
  } catch (error) {
    if (!isMPDConnected()) {
      return disconnectedState();
    }
    console.error('Error getting MPD state:', error.message);
    return { ...disconnectedState(), connected: true, error: error.message };
  }
}

// MPD returns a single object for one-item results and {} for none
function toList(result) {
  if (Array.isArray(result)) return result;
  return result && Object.keys(result).length > 0 ? [result] : [];
}

// REST API Endpoints

app.use('/api', (req, res, next) => {
  if (req.path === '/status' || isMPDConnected()) {
    return next();
  }
  res.status(503).json({ error: `MPD unavailable at ${MPD_ADDRESS}` });
});

function sendError(res, error) {
  res.status(isMPDConnected() ? 500 : 503).json({ error: error.message });
}

app.get('/api/status', async (req, res) => {
  try {
    const state = await getFullState();
    res.json(state);
  } catch (error) {
    sendError(res, error);
  }
});

app.post('/api/play', async (req, res) => {
  try {
    const { pos } = req.body;
    await mpdClient.play(pos);
    res.json({ success: true });
  } catch (error) {
    sendError(res, error);
  }
});

app.post('/api/pause', async (req, res) => {
  try {
    await mpdClient.pause();
    res.json({ success: true });
  } catch (error) {
    sendError(res, error);
  }
});

app.post('/api/stop', async (req, res) => {
  try {
    await mpdClient.stop();
    res.json({ success: true });
  } catch (error) {
    sendError(res, error);
  }
});

app.post('/api/next', async (req, res) => {
  try {
    await mpdClient.next();
    res.json({ success: true });
  } catch (error) {
    sendError(res, error);
  }
});

app.post('/api/previous', async (req, res) => {
  try {
    await mpdClient.previous();
    res.json({ success: true });
  } catch (error) {
    sendError(res, error);
  }
});

app.post('/api/clear', async (req, res) => {
  try {
    await mpdClient.clear();
    res.json({ success: true });
  } catch (error) {
    sendError(res, error);
  }
});

app.post('/api/add', async (req, res) => {
  try {
    const { uri } = req.body;
    await mpdClient.add(uri);
    res.json({ success: true });
  } catch (error) {
    sendError(res, error);
  }
});

app.post('/api/delete', async (req, res) => {
  try {
    const { pos } = req.body;
    await mpdClient.delete(pos);
    res.json({ success: true });
  } catch (error) {
    sendError(res, error);
  }
});

app.post('/api/move', async (req, res) => {
  try {
    const { from, to } = req.body;
    await mpdClient.move(from, to);
    res.json({ success: true });
  } catch (error) {
    sendError(res, error);
  }
});

app.get('/api/browse', async (req, res) => {
  try {
    const { path = '' } = req.query;
    const items = await mpdClient.lsinfo(path);
    res.json({ items: toList(items) });
  } catch (error) {
    sendError(res, error);
  }
});

app.post('/api/update', async (req, res) => {
  try {
    await mpdClient.update();
    res.json({ success: true });
  } catch (error) {
    sendError(res, error);
  }
});

app.post('/api/volume', async (req, res) => {
  try {
    const { volume } = req.body;
    await mpdClient.setVolume(volume);
    res.json({ success: true });
  } catch (error) {
    sendError(res, error);
  }
});

app.post('/api/seek', async (req, res) => {
  try {
    const { pos, time } = req.body;
    await mpdClient.seek(pos, time);
    res.json({ success: true });
  } catch (error) {
    sendError(res, error);
  }
});

app.post('/api/shuffle', async (req, res) => {
  try {
    await mpdClient.shuffle();
    res.json({ success: true });
  } catch (error) {
    sendError(res, error);
  }
});

app.post('/api/repeat', async (req, res) => {
  try {
    const { enabled } = req.body;
    await mpdClient.repeat(enabled);
    res.json({ success: true });
  } catch (error) {
    sendError(res, error);
  }
});

app.post('/api/random', async (req, res) => {
  try {
    const { enabled } = req.body;
    await mpdClient.random(enabled);
    res.json({ success: true });
  } catch (error) {
    sendError(res, error);
  }
});

// Serve React app for all other routes
if (clientBuildPath) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Start HTTP server
const server = app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await connectToMPD();
});

// WebSocket server
const wss = new WebSocketServer({ server });

const clients = new Set();

function broadcast(message) {
  const data = JSON.stringify(message);
  clients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      client.send(data);
    }
  });
}

wss.on('connection', async (ws) => {
  console.log('WebSocket client connected');
  clients.add(ws);

  // Send initial state
  const state = await getFullState();
  if (ws.readyState === 1) {
    ws.send(JSON.stringify({ type: 'initial', data: state }));
  }

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  clearTimeout(reconnectTimer);
  if (mpdClient) {
    mpdClient.disconnect();
  }
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
