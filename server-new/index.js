import express from 'express';
import { WebSocketServer } from 'ws';
import cors from 'cors';
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

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../client/dist');
  app.use(express.static(clientBuildPath));
}

// MPD client instance
let mpdClient = null;
let reconnectInterval = null;

// Connect to MPD
async function connectToMPD() {
  try {
    mpdClient = new MPDClient();
    await mpdClient.connect(MPD_HOST, MPD_PORT);
    
    // Broadcast to all WebSocket clients when MPD state changes
    mpdClient.on('changed', async (subsystem) => {
      console.log(`MPD changed: ${subsystem}`);
      
      // Broadcast the change to all connected clients
      const data = await getFullState();
      broadcast({ type: 'update', subsystem, data });
    });

    mpdClient.on('disconnected', () => {
      console.log('MPD disconnected, will try to reconnect...');
      broadcast({ type: 'disconnected' });
      scheduleReconnect();
    });

    // Clear any existing reconnect interval
    if (reconnectInterval) {
      clearInterval(reconnectInterval);
      reconnectInterval = null;
    }

    console.log('MPD client initialized');
    return true;
  } catch (error) {
    console.error('Failed to connect to MPD:', error.message);
    scheduleReconnect();
    return false;
  }
}

function scheduleReconnect() {
  if (!reconnectInterval) {
    reconnectInterval = setInterval(async () => {
      console.log('Attempting to reconnect to MPD...');
      const connected = await connectToMPD();
      if (connected && reconnectInterval) {
        clearInterval(reconnectInterval);
        reconnectInterval = null;
      }
    }, 5000);
  }
}

// Get full MPD state
async function getFullState() {
  if (!mpdClient || !mpdClient.connected) {
    return { connected: false };
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
      playlist: Array.isArray(playlist) ? playlist : (playlist ? [playlist] : [])
    };
  } catch (error) {
    console.error('Error getting MPD state:', error);
    return { connected: false, error: error.message };
  }
}

// REST API Endpoints

app.get('/api/status', async (req, res) => {
  try {
    const state = await getFullState();
    res.json(state);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/play', async (req, res) => {
  try {
    const { pos } = req.body;
    await mpdClient.play(pos);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/pause', async (req, res) => {
  try {
    await mpdClient.pause();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/stop', async (req, res) => {
  try {
    await mpdClient.stop();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/next', async (req, res) => {
  try {
    await mpdClient.next();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/previous', async (req, res) => {
  try {
    await mpdClient.previous();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/clear', async (req, res) => {
  try {
    await mpdClient.clear();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/add', async (req, res) => {
  try {
    const { uri } = req.body;
    await mpdClient.add(uri);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/delete', async (req, res) => {
  try {
    const { pos } = req.body;
    await mpdClient.delete(pos);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/browse', async (req, res) => {
  try {
    const { path = '' } = req.query;
    const items = await mpdClient.lsinfo(path);
    res.json({ items: Array.isArray(items) ? items : (items ? [items] : []) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/update', async (req, res) => {
  try {
    await mpdClient.update();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/volume', async (req, res) => {
  try {
    const { volume } = req.body;
    await mpdClient.setVolume(volume);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/seek', async (req, res) => {
  try {
    const { pos, time } = req.body;
    await mpdClient.seek(pos, time);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve React app for all other routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
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
  ws.send(JSON.stringify({ type: 'initial', data: state }));

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
  if (mpdClient) {
    mpdClient.disconnect();
  }
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
