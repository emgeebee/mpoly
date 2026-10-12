# Publishing to NPM

This document explains how to publish MPoly to npm.

## Prerequisites

1. **NPM Account**: You need an npm account with publishing permissions
2. **NPM Token**: Add `NPM_TOKEN` to GitHub repository secrets
3. **Version**: Update version in `server-new/package.json`

## Publishing Process

### Automatic Publishing (Recommended)

1. **Update version** in `server-new/package.json`:
   ```bash
   cd server-new
   # Update version: 2.0.0 -> 2.0.1, 2.1.0, 3.0.0, etc.
   ```

2. **Commit changes**:
   ```bash
   git add server-new/package.json
   git commit -m "chore: bump version to 2.0.1"
   git push
   ```

3. **Merge to `master`**. The `publish.yml` workflow runs on every push to
   `master` (and can also be run manually via "Run workflow"). If the version in
   `server-new/package.json` is already on npm, the workflow skips publishing,
   so bump the version in any merge you want released.

4. **GitHub Actions will automatically** (when the version is new):
   - Build the client
   - Prepare the package
   - Publish to npm
   - Create a GitHub release

### Manual Publishing

If you need to publish manually:

```bash
# Build client
cd client
npm install
npm run build
cd ..

# Prepare distribution
mkdir -p dist
cp -r server-new/* dist/
mkdir -p dist/client
cp -r client/dist dist/client/
cp README-NEW.md dist/README.md
cp LICENSE dist/

# Prepare package.json
node scripts/prepare-publish.js

# Publish
cd dist
npm login
npm publish --access public
```

## Package Configuration

The published package includes:

```
mpoly/
├── index.js           # Server entry point
├── mpd-client.js      # MPD client library
├── client/            # Built React app
│   └── dist/
├── bin/
│   └── mpoly.js       # CLI executable
├── package.json
├── README.md
└── LICENSE
```

## Usage After Publishing

Users can install and run:

```bash
# Run directly with npx
npx mpoly

# Or install globally
npm install -g mpoly
mpoly

# Or install locally
npm install mpoly
node node_modules/mpoly/index.js
```

## Environment Variables

Users can configure via environment variables:

```bash
MPD_HOST=192.168.1.100 MPD_PORT=6600 PORT=8080 npx mpoly
```

## Version Numbering

Follow semantic versioning:

- **Major** (3.0.0): Breaking changes
- **Minor** (2.1.0): New features, backwards compatible
- **Patch** (2.0.1): Bug fixes

## GitHub Secrets Setup

Add to repository secrets (Settings → Secrets and variables → Actions):

1. **NPM_TOKEN**: Your npm access token
   - Create at: https://www.npmjs.com/settings/[username]/tokens
   - Type: Automation or Publish
   - Scope: Read and write

## Testing Before Publishing

Test the build pipeline:

```bash
# Run CI checks
npm run build

# Test Docker build
npm run docker:build

# Test package creation
node scripts/prepare-publish.js

# Test the packaged version
cd dist
npm install
node index.js
```

## Troubleshooting

### "403 Forbidden" Error

- Check NPM_TOKEN in GitHub secrets
- Verify npm account has publishing permissions
- Check package name isn't taken

### "EPUBLISHCONFLICT" Error

- Version already published
- Increment version number
- Cannot republish same version

### Build Failures

- Check Node.js version (requires 18+)
- Verify all dependencies install correctly
- Check client build succeeds

## CI/CD Pipeline

The GitHub Actions workflows:

### `ci.yml` (Pull Requests & Pushes)
- Runs on every push/PR
- Builds client
- Tests server start
- Builds Docker image

### `publish.yml` (Merges to master)
- Runs on every push to `master` or manually
- Skips if the version is already published to npm
- Builds everything
- Publishes to npm
- Creates GitHub release

## Package Info

Published package info:
- **Name**: `mpoly`
- **Registry**: https://www.npmjs.com/package/mpoly
- **Executable**: `mpoly` (via bin)
- **Type**: ESM module

## Unpublishing

To unpublish (within 72 hours):

```bash
npm unpublish mpoly@2.0.1
```

After 72 hours, contact npm support.
