import React, { useState, useEffect } from 'react';
import './Controls.css';

function Controls({ status, api }) {
  const state = status?.state || 'stop';
  const isPlaying = state === 'play';
  const [volume, setVolume] = useState(parseInt(status?.volume || 50));
  const [repeat, setRepeat] = useState(status?.repeat === '1');

  useEffect(() => {
    setVolume(parseInt(status?.volume || 50));
    setRepeat(status?.repeat === '1');
  }, [status]);

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    api.setVolume(newVolume);
  };

  const toggleRepeat = () => {
    const newRepeat = !repeat;
    setRepeat(newRepeat);
    api.repeat(newRepeat);
  };

  return (
    <div className="controls">
      <div className="controls-main">
        <button onClick={api.previous} className="control-btn" title="Previous">
          ⏮
        </button>
        
        {isPlaying ? (
          <button onClick={api.pause} className="control-btn primary" title="Pause">
            ⏸
          </button>
        ) : (
          <button onClick={() => api.play()} className="control-btn primary" title="Play">
            ▶
          </button>
        )}
        
        <button onClick={api.stop} className="control-btn" title="Stop">
          ⏹
        </button>
        
        <button onClick={api.next} className="control-btn" title="Next">
          ⏭
        </button>
        
        <button 
          onClick={api.shuffle} 
          className="control-btn" 
          title="Shuffle Playlist"
        >
          🔀
        </button>
      </div>
      
      <div className="controls-secondary">
        <button 
          onClick={toggleRepeat} 
          className={`control-btn-small ${repeat ? 'active' : ''}`}
          title="Repeat"
        >
          🔁
        </button>
        
        <div className="volume-control">
          <span className="volume-icon">🔊</span>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={volume}
            onChange={handleVolumeChange}
            className="volume-slider"
            title={`Volume: ${volume}%`}
          />
          <span className="volume-label">{volume}%</span>
        </div>
      </div>
    </div>
  );
}

export default Controls;
