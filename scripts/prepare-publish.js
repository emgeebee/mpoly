#!/usr/bin/env node

/**
 * Prepare package.json for npm publishing
 * This script modifies the package.json to be suitable for npm distribution
 */

const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '../dist');
const serverPkgPath = path.join(distDir, 'package.json');

// Read the server package.json
const serverPkg = JSON.parse(fs.readFileSync(serverPkgPath, 'utf8'));

// Create the publishable package.json
const publishPkg = {
  name: '@emgeebee/mpoly',
  version: serverPkg.version || '2.0.0',
  description: 'Modern MPD (Music Player Daemon) client with Node.js server and React SPA - Winamp-inspired UI',
  main: 'index.js',
  type: 'module',
  bin: {
    mpoly: './bin/mpoly.js'
  },
  scripts: {
    start: 'node index.js',
    postinstall: 'echo "MPoly installed! Run with: npx @emgeebee/mpoly"'
  },
  keywords: [
    'mpd',
    'music',
    'player',
    'daemon',
    'client',
    'music-player',
    'mpd-client',
    'winamp',
    'react',
    'websocket'
  ],
  author: serverPkg.author || '',
  license: serverPkg.license || 'MIT',
  repository: {
    type: 'git',
    url: 'https://github.com/emgeebee/mpoly.git'
  },
  bugs: {
    url: 'https://github.com/emgeebee/mpoly/issues'
  },
  homepage: 'https://github.com/emgeebee/mpoly#readme',
  dependencies: serverPkg.dependencies || {},
  engines: {
    node: '>=18.0.0'
  },
  files: [
    'index.js',
    'mpd-client.js',
    'client/',
    'bin/',
    'README.md',
    'LICENSE'
  ]
};

// Write the new package.json
fs.writeFileSync(serverPkgPath, JSON.stringify(publishPkg, null, 2));
console.log('✓ package.json prepared for publishing');

// Create bin script
const binDir = path.join(distDir, 'bin');
fs.mkdirSync(binDir, { recursive: true });

const binScript = `#!/usr/bin/env node

/**
 * MPoly - MPD Client Server
 * Run with: npx @emgeebee/mpoly
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverPath = join(__dirname, '../index.js');

console.log('🎵 Starting MPoly server...');
console.log('');
console.log('Configuration:');
console.log('  MPD_HOST:', process.env.MPD_HOST || 'localhost');
console.log('  MPD_PORT:', process.env.MPD_PORT || '6600');
console.log('  PORT:', process.env.PORT || '3001');
console.log('');
console.log('Server will be available at: http://localhost:' + (process.env.PORT || '3001'));
console.log('');

const server = spawn('node', [serverPath], {
  stdio: 'inherit',
  env: process.env
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\\n🛑 Shutting down MPoly server...');
  server.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  server.kill('SIGTERM');
  process.exit(0);
});
`;

const binPath = path.join(binDir, 'mpoly.js');
fs.writeFileSync(binPath, binScript);
fs.chmodSync(binPath, '755');
console.log('✓ bin/mpoly.js created');

console.log('');
console.log('Package ready for publishing!');
