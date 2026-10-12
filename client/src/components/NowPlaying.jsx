import React from 'react';
import './NowPlaying.css';

function NowPlaying({ currentSong, status }) {
  const title = currentSong?.title || currentSong?.file || 'No track playing';
  const artist = currentSong?.artist || '';
  const album = currentSong?.album || '';
  
  const elapsed = parseFloat(status?.elapsed || 0);
  const duration = parseFloat(status?.duration || 0);
  const progress = duration > 0 ? (elapsed / duration) * 100 : 0;

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="now-playing">
      <div className="now-playing-info">
        <div className="track-title">{title}</div>
        {artist && <div className="track-artist">{artist}</div>}
        {album && <div className="track-album">{album}</div>}
      </div>
      <div className="progress-container">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="time-display">
          <span>{formatTime(elapsed)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}

export default NowPlaying;
