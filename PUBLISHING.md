# Publishing to npm

MPoly is published as [`@emgeebee/mpoly`](https://www.npmjs.com/package/@emgeebee/mpoly).

## How releases happen

[`.github/workflows/publish.yml`](.github/workflows/publish.yml) runs on every push to `master` (and can be run manually via **Run workflow**). It:

1. Reads the version from `server-new/package.json`
2. Skips everything if `@emgeebee/mpoly@<version>` is already on npm
3. Builds the client
4. Assembles `dist/` (server files, `client/dist`, `README.md`, `LICENSE`)
5. Runs [`scripts/prepare-publish.js`](scripts/prepare-publish.js) to write the published `package.json` and `bin/mpoly.js`
6. Publishes to npm and creates a `v<version>` GitHub release

So to release, bump the version and push to `master`:

```bash
cd server-new
npm version patch --no-git-tag-version   # or minor / major
cd ..
npm pkg set version=$(node -p "require('./server-new/package.json').version")
git commit -am "chore: bump version to X.Y.Z"
git push origin master
```

The root `package.json` version is kept in step for consistency, but only `server-new/package.json` drives publishing.

If you're releasing a version the Synology compose file should use, update the pinned version in [`docker/synology-compose.yml`](docker/synology-compose.yml) and the README.

## Authentication: npm trusted publishing

The workflow authenticates with [npm trusted publishing](https://docs.npmjs.com/trusted-publishers) (OIDC), so there's no `NPM_TOKEN` secret. It's configured on npmjs.com under the package settings for `@emgeebee/mpoly`:

- Publisher: GitHub Actions
- Repository: `emgeebee/mpoly`
- Workflow: `publish.yml`

Trusted publishing needs npm 11.5.1+, so the workflow runs on Node 24 and upgrades npm before publishing. Provenance is attached automatically.

## Published package layout

```
@emgeebee/mpoly/
├── index.js           # server entry point
├── mpd-client.js      # MPD client
├── client/dist/       # built React app (served by index.js)
├── bin/mpoly.js       # `mpoly` executable
├── package.json
├── README.md
└── LICENSE
```

## Testing the package locally

```bash
cd client && npm ci && npm run build && cd ..
rm -rf dist && mkdir -p dist/client
cp -r server-new/* dist/
cp -r client/dist dist/client/
cp README.md LICENSE dist/
node scripts/prepare-publish.js

cd dist
npm install
MPD_HOST=192.168.1.50 node bin/mpoly.js   # UI on http://localhost:3001
npm pack --dry-run                        # inspect the tarball contents
```

## Troubleshooting

- **`ENEEDAUTH` / `401` / `403`**: the trusted publisher on npmjs.com doesn't match the repo or workflow file name, or npm on the runner is older than 11.5.1.
- **`EPUBLISHCONFLICT`**: the version is already published. Bump it; npm never allows republishing a version.
- **Workflow ran but nothing published**: the version wasn't bumped. Check the "Determine version and check npm" step output.

## CI

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs on pushes and PRs to `master`/`main`: installs and builds the client, smoke-tests the server start, and builds and runs the Docker image.
