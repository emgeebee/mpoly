import React, { useState, useEffect, useRef } from 'react';
import './NowPlaying.css';

function NowPlaying({ currentSong, status, api }) {
  const title = currentSong?.title || currentSong?.file || 'No track playing';
  const artist = currentSong?.artist || '';
  const album = currentSong?.album || '';
  
  const serverElapsed = parseFloat(status?.elapsed || 0);
  const duration = parseFloat(status?.duration || 0);
  const isPlaying = status?.state === 'play';
  
  // Optimistic time update
  const [localElapsed, setLocalElapsed] = useState(serverElapsed);
  const lastServerUpdate = useRef(Date.now());
  
  // Update local elapsed when server updates
  useEffect(() => {
    setLocalElapsed(serverElapsed);
    lastServerUpdate.current = Date.now();
  }, [serverElapsed]);
  
  // Increment time locally when playing
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setLocalElapsed(prev => {
        const next = prev + 1;
        return next < duration ? next : duration;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isPlaying, duration]);
  
  const elapsed = localElapsed;
  const progress = duration > 0 ? (elapsed / duration) * 100 : 0;
  
  const bitrate = status?.bitrate || status?.audio?.split(':')[2]?.split('kbps')[0] || '';
  const sampleRate = status?.audio ? Math.round(parseFloat(status.audio.split(':')[0]) / 1000) : '';

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e) => {
    if (!duration || !api) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const newTime = Math.max(0, Math.min(duration, percent * duration));
    
    // Update local state immediately for instant feedback
    setLocalElapsed(newTime);
    
    // Get current song position from status
    const currentPos = parseInt(status?.song || 0);
    api.seek(currentPos, Math.floor(newTime));
  };

  return (
    <div className="now-playing">
      <div className="display-header">
        <div className="time-display-large">
          <span className="time-elapsed">{formatTime(elapsed)}</span>
        </div>
        <div className="audio-info">
          {bitrate && <span className="bitrate">{bitrate} kbps</span>}
          {sampleRate && <span className="samplerate">{sampleRate} kHz</span>}
          <span className="channels">stereo</span>
        </div>
      </div>
      
      <div className="track-info-display">
        <marquee className="track-title" scrollamount="3">
          {title}
        </marquee>
        {artist && (
          <div className="track-artist">{artist}</div>
        )}
      </div>
      
      <div className="progress-container">
        <div className="progress-bar" onClick={handleProgressClick}>
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="time-display-small">
          <span>{formatTime(elapsed)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}

export default NowPlaying;
