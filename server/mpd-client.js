import net from 'net';
import { EventEmitter } from 'events';

export class MPDClient extends EventEmitter {
  constructor() {
    super();
    this.socket = null;
    this.buffer = '';
    this.callbacks = [];
    this.isIdle = false;
    this.connected = false;
  }

  connect(host = 'localhost', port = 6600) {
    return new Promise((resolve, reject) => {
      this.socket = net.createConnection(port, host);
      
      this.socket.on('connect', () => {
        this.connected = true;
        console.log(`Connected to MPD at ${host}:${port}`);
      });

      this.socket.on('data', (data) => {
        this.handleData(data.toString());
      });

      this.socket.on('error', (err) => {
        console.error('MPD connection error:', err);
        this.connected = false;
        reject(err);
      });

      this.socket.on('close', () => {
        this.connected = false;
        this.emit('disconnected');
        console.log('Disconnected from MPD');
      });

      // Wait for the initial OK message
      const initialCallback = (err, data) => {
        if (err) {
          reject(err);
        } else {
          this.emit('ready');
          resolve();
          this.startIdleMode();
        }
      };
      this.callbacks.push(initialCallback);
    });
  }

  handleData(data) {
    const lines = data.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('OK')) {
        this.flushBuffer(null);
      } else if (line.startsWith('ACK')) {
        const error = line.substring(4);
        this.flushBuffer(new Error(error));
      } else if (line) {
        this.buffer += line + '\n';
      }
    }
  }

  flushBuffer(error) {
    const callback = this.callbacks.shift();
    if (callback) {
      const result = error ? null : this.parseResponse(this.buffer);
      this.buffer = '';
      callback(error, result);
    }
  }

  parseResponse(buffer) {
    const lines = buffer.trim().split('\n');
    const result = {};
    const items = [];
    let currentItem = {};

    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) continue;

      const key = line.substring(0, colonIndex).toLowerCase();
      const value = line.substring(colonIndex + 2);

      // If we encounter 'file' or 'directory', it's a new item
      if ((key === 'file' || key === 'directory') && Object.keys(currentItem).length > 0) {
        items.push(currentItem);
        currentItem = {};
      }

      currentItem[key] = value;
    }

    if (Object.keys(currentItem).length > 0) {
      items.push(currentItem);
    }

    // If we have multiple items, return array; otherwise return single object
    return items.length > 1 ? items : (items.length === 1 ? items[0] : currentItem);
  }

  command(cmd, args = []) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.connected) {
        return reject(new Error('Not connected to MPD'));
      }

      // Exit idle mode if active
      if (this.isIdle) {
        this.isIdle = false;
        this.socket.write('noidle\n');
        // Consume the idle callback
        this.callbacks.shift();
      }

      let commandStr = cmd;
      if (args.length > 0) {
        const escapedArgs = args.map(arg => `"${String(arg).replace(/"/g, '\\"')}"`);
        commandStr += ' ' + escapedArgs.join(' ');
      }
      commandStr += '\n';

      this.callbacks.push((err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
          // Re-enter idle mode after command completes
          if (cmd !== 'idle') {
            this.startIdleMode();
          }
        }
      });

      this.socket.write(commandStr);
    });
  }

  startIdleMode() {
    if (this.isIdle || !this.connected) return;
    
    this.isIdle = true;
    this.callbacks.push((err, data) => {
      this.isIdle = false;
      if (!err && data) {
        // Parse changed subsystem
        const match = data.changed || (typeof data === 'string' && data.match(/changed:\s*(\w+)/));
        const subsystem = match ? (match[1] || match) : null;
        if (subsystem) {
          this.emit('changed', subsystem);
        }
      }
      // Continue idle loop
      if (this.connected) {
        this.startIdleMode();
      }
    });

    this.socket.write('idle\n');
  }

  // High-level API methods
  async status() {
    return this.command('status');
  }

  async currentSong() {
    return this.command('currentsong');
  }

  async play(pos) {
    return this.command('play', pos !== undefined ? [pos] : []);
  }

  async pause(state = 1) {
    return this.command('pause', [state]);
  }

  async stop() {
    return this.command('stop');
  }

  async next() {
    return this.command('next');
  }

  async previous() {
    return this.command('previous');
  }

  async playlist() {
    return this.command('playlistinfo');
  }

  async clear() {
    return this.command('clear');
  }

  async add(uri) {
    return this.command('add', [uri]);
  }

  async delete(pos) {
    return this.command('delete', [pos]);
  }

  async lsinfo(path = '') {
    return this.command('lsinfo', path ? [path] : []);
  }

  async update() {
    return this.command('update');
  }

  async setVolume(vol) {
    return this.command('setvol', [vol]);
  }

  async seek(pos, time) {
    return this.command('seek', [pos, time]);
  }

  disconnect() {
    if (this.socket) {
      this.socket.end();
      this.socket = null;
    }
  }
}
