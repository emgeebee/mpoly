import React from 'react';
import './Controls.css';

function Controls({ status, api }) {
  const state = status?.state || 'stop';
  const isPlaying = state === 'play';

  return (
    <div className="controls">
      <button onClick={api.previous} className="control-btn">
        ⏮ Previous
      </button>
      
      {isPlaying ? (
        <button onClick={api.pause} className="control-btn primary">
          ⏸ Pause
        </button>
      ) : (
        <button onClick={() => api.play()} className="control-btn primary">
          ▶ Play
        </button>
      )}
      
      <button onClick={api.stop} className="control-btn">
        ⏹ Stop
      </button>
      
      <button onClick={api.next} className="control-btn">
        ⏭ Next
      </button>
    </div>
  );
}

export default Controls;
