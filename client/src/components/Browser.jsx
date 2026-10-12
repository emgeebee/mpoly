import React, { useState, useEffect } from 'react';
import './Browser.css';

function Browser({ api, connected }) {
  const [currentPath, setCurrentPath] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (connected) {
      loadPath(currentPath);
    } else {
      setItems([]);
    }
  }, [currentPath, connected]);

  const loadPath = async (path) => {
    setLoading(true);
    try {
      const data = await api.browse(path);
      setItems(data.items || []);
    } catch (error) {
      console.error('Error browsing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item) => {
    if (item.directory) {
      setCurrentPath(item.directory);
    } else if (item.file) {
      api.add(item.file);
    }
  };

  const goUp = () => {
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    setCurrentPath(parts.join('/'));
  };

  const goHome = () => {
    setCurrentPath('');
  };

  return (
    <div className="browser">
      <div className="browser-header">
        <h2>Browse Library</h2>
        <div className="browser-nav">
          <button onClick={goHome} disabled={!currentPath}>
            🏠 Home
          </button>
          <button onClick={goUp} disabled={!currentPath}>
            ⬆ Up
          </button>
          <button onClick={api.update}>
            🔄 Update Library
          </button>
        </div>
      </div>

      <div className="browser-path">
        {currentPath || '/'}
      </div>

      <div className="browser-items">
        {!connected ? (
          <div className="empty">Library unavailable while MPD is offline</div>
        ) : loading ? (
          <div className="loading">Loading...</div>
        ) : items.length === 0 ? (
          <div className="empty">No items found</div>
        ) : (
          items.map((item, index) => (
            <div 
              key={index}
              className={`browser-item ${item.directory ? 'directory' : 'file'}`}
              onClick={() => handleItemClick(item)}
            >
              <span className="item-icon">
                {item.directory ? '📁' : '🎵'}
              </span>
              <span className="item-name">
                {item.directory ? item.directory.split('/').pop() : 
                 item.title || item.file?.split('/').pop() || 'Unknown'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Browser;
