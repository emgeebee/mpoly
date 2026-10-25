import React, { useState, useEffect, useRef } from 'react';
import './VolumeBar.css';

function VolumeBar({ status, api }) {
  const [volume, setVolume] = useState(parseInt(status?.volume || 50));
  const lastSentVolume = useRef(parseInt(status?.volume || 50));

  // Sync volume from the server
  useEffect(() => {
    const v = parseInt(status?.volume || 50);
    setVolume(v);
    lastSentVolume.current = v;
  }, [status]);

  // Only update the local UI while dragging without sending requests (to avoid high-frequency setvol calls causing MPD disconnection)
  const handleChange = (e) => {
    setVolume(parseInt(e.target.value));
  };

  // Send the final value only on release / key up / blur
  const handleCommit = () => {
    if (lastSentVolume.current !== volume) {
      lastSentVolume.current = volume;
      api.setVolume(volume);
    }
  };

  const icon = volume === 0 ? '🔇' : volume < 50 ? '🔉' : '🔊';

  return (
    <div className="volume-bar">
      <span className="volume-bar-icon" aria-hidden="true">{icon}</span>
      <input
        type="range"
        min="0"
        max="100"
        value={volume}
        onChange={handleChange}
        onMouseUp={handleCommit}
        onTouchEnd={handleCommit}
        onKeyUp={handleCommit}
        onBlur={handleCommit}
        className="volume-bar-slider"
        title={`Volume: ${volume}%`}
        aria-label="Volume"
      />
      <span className="volume-bar-label">{volume}%</span>
    </div>
  );
}

export default VolumeBar;
