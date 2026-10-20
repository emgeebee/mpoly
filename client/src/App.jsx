import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import NowPlaying from './components/NowPlaying';
import Controls from './components/Controls';
import Playlist from './components/Playlist';
import Browser from './components/Browser';

const API_BASE = import.meta.env.VITE_API_URL || '';
const WS_URL = import.meta.env.VITE_WS_URL ||
  `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws`;

function App() {
  const [state, setState] = useState({
    connected: false,
    status: {},
    currentSong: {},
    playlist: []
  });
  const [ws, setWs] = useState(null);

  // Fetch initial state
  const fetchState = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/status`);
      const data = await response.json();
      setState(data);
    } catch (error) {
      console.error('Error fetching state:', error);
    }
  }, []);

  // WebSocket connection
  useEffect(() => {
    let socket;
    let reconnectTimeout;

    const connect = () => {
      socket = new WebSocket(WS_URL);

      socket.onopen = () => {
        console.log('WebSocket connected');
      };

      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        
        if (message.type === 'initial' || message.type === 'update') {
          setState(message.data);
        } else if (message.type === 'disconnected') {
          setState(prev => ({ ...prev, ...message.data, connected: false }));
        }
      };

      socket.onclose = () => {
        console.log('WebSocket disconnected, reconnecting...');
        reconnectTimeout = setTimeout(connect, 2000);
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      setWs(socket);
    };

    connect();

    return () => {
      if (socket) {
        socket.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, []);

  // Initial fetch and polling
  useEffect(() => {
    fetchState();
    
    // Poll server every 10 seconds
    const pollInterval = setInterval(() => {
      fetchState();
    }, 10000);
    
    return () => clearInterval(pollInterval);
  }, [fetchState]);

  // API commands
  const api = {
    play: async (pos) => {
      await fetch(`${API_BASE}/api/play`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pos })
      });
    },
    pause: async () => {
      await fetch(`${API_BASE}/api/pause`, { method: 'POST' });
    },
    stop: async () => {
      await fetch(`${API_BASE}/api/stop`, { method: 'POST' });
    },
    next: async () => {
      await fetch(`${API_BASE}/api/next`, { method: 'POST' });
    },
    previous: async () => {
      await fetch(`${API_BASE}/api/previous`, { method: 'POST' });
    },
    clear: async () => {
      await fetch(`${API_BASE}/api/clear`, { method: 'POST' });
    },
    add: async (uri) => {
      await fetch(`${API_BASE}/api/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uri })
      });
    },
    delete: async (pos) => {
      await fetch(`${API_BASE}/api/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pos })
      });
    },
    update: async () => {
      await fetch(`${API_BASE}/api/update`, { method: 'POST' });
    },
    setVolume: async (volume) => {
      await fetch(`${API_BASE}/api/volume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volume })
      });
    },
    seek: async (pos, time) => {
      await fetch(`${API_BASE}/api/seek`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pos, time })
      });
    },
    shuffle: async () => {
      await fetch(`${API_BASE}/api/shuffle`, { method: 'POST' });
    },
    repeat: async (enabled) => {
      await fetch(`${API_BASE}/api/repeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });
    },
    random: async (enabled) => {
      await fetch(`${API_BASE}/api/random`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });
    },
    browse: async (path = '') => {
      const response = await fetch(`${API_BASE}/api/browse?path=${encodeURIComponent(path)}`);
      return response.json();
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>MPoly</h1>
          <span className="version">v{__APP_VERSION__}</span>
        </div>
        <div
          className={`status ${state.connected ? 'connected' : 'disconnected'}`}
          title={state.error || ''}
        >
          {state.connected
            ? '● Connected'
            : `○ Waiting for MPD${state.mpd ? ` at ${state.mpd}` : ''}…`}
        </div>
      </header>

      <div className="app-content">
        <NowPlaying 
          currentSong={state.currentSong} 
          status={state.status}
          api={api}
        />
        <Controls 
          status={state.status} 
          api={api}
        />
        
        <div className="bottom-section">
          <Browser api={api} connected={state.connected} />
          <Playlist 
            playlist={state.playlist || []} 
            status={state.status}
            api={api}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
