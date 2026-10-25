import React, { useState, useEffect } from 'react';
import './Controls.css';

function Controls({ status, api }) {
  const state = status?.state || 'stop';
  const isPlaying = state === 'play';
  const [repeat, setRepeat] = useState(status?.repeat === '1');

  useEffect(() => {
    setRepeat(status?.repeat === '1');
  }, [status]);

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
          className={`control-btn ${repeat ? 'active' : ''}`}
          title="Repeat"
        >
          🔁
        </button>
      </div>
    </div>
  );
}

export default Controls;
