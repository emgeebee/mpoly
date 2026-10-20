import React from 'react';
import './Playlist.css';

function Playlist({ playlist, status, api }) {
  const currentSongPos = parseInt(status?.song || -1);

  const handlePlay = (index) => {
    api.play(index);
  };

  const handleDelete = (index) => {
    if (confirm('Remove this track from playlist?')) {
      api.delete(index);
    }
  };

  const handleMoveUp = (index) => {
    if (index > 0) {
      api.move(index, index - 1);
    }
  };

  const handleMoveDown = (index) => {
    if (index < playlist.length - 1) {
      api.move(index, index + 1);
    }
  };

  return (
    <div className="playlist">
      <div className="playlist-header">
        <h2>Playlist ({playlist.length})</h2>
        <button onClick={api.clear} className="btn-clear">
          Clear All
        </button>
      </div>
      
      <div className="playlist-items">
        {playlist.length === 0 ? (
          <div className="empty-playlist">Playlist is empty</div>
        ) : (
          playlist.map((track, index) => (
            <div 
              key={index}
              className={`playlist-item ${index === currentSongPos ? 'active' : ''}`}
            >
              <div className="playlist-item-controls">
                <button 
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="btn-move"
                  title="Move up"
                >
                  ▲
                </button>
                <button 
                  onClick={() => handleMoveDown(index)}
                  disabled={index === playlist.length - 1}
                  className="btn-move"
                  title="Move down"
                >
                  ▼
                </button>
              </div>
              <div className="playlist-item-info" onClick={() => handlePlay(index)}>
                <div className="playlist-item-title">
                  {track.title || track.file}
                </div>
                <div className="playlist-item-meta">
                  {track.artist && <span>{track.artist}</span>}
                  {track.album && <span> - {track.album}</span>}
                </div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(index);
                }}
                className="btn-delete"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Playlist;
