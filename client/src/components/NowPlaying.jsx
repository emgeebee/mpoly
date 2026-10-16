import React from 'react';
import './NowPlaying.css';

function NowPlaying({ currentSong, status }) {
  const title = currentSong?.title || currentSong?.file || 'No track playing';
  const artist = currentSong?.artist || '';
  const album = currentSong?.album || '';
  
  const elapsed = parseFloat(status?.elapsed || 0);
  const duration = parseFloat(status?.duration || 0);
  const progress = duration > 0 ? (elapsed / duration) * 100 : 0;
  
  const bitrate = status?.bitrate || status?.audio?.split(':')[2]?.split('kbps')[0] || '';
  const sampleRate = status?.audio ? Math.round(parseFloat(status.audio.split(':')[0]) / 1000) : '';

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
        <div className="progress-bar">
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
