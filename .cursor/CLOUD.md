# Keyteki Cloud Environment

## Overview
Keyteki is a web-based Keyforge card game server with a Node.js backend and React.js frontend.

## Environment Requirements
- Node.js 18 (required for canvas native module compatibility)
- npm for package management
- Git submodule `keyteki-json-data` must be initialized

## Key Commands

### Run tests
```bash
npm test
```
Tests take approximately 70 seconds to run 19,451 specs.

### Run linting
```bash
npm run lint
```
Note: The codebase has pre-existing prettier formatting issues that haven't been addressed.

### Build production bundle
```bash
npm run build
```

### Start server (requires Redis and PostgreSQL)
```bash
node .              # Lobby server
node server/gamenode  # Game node server
```

## Architecture Notes
- Lobby server runs on port 4000 by default
- Game nodes run separately on port 9500 by default
- Configuration is in `config/default.json5` (can override with `config/local.json5`)
- Server requires Redis and PostgreSQL to be running

## Running the Full Application
The application requires external services (Redis, PostgreSQL) which are not available in the Cloud Agent environment. Use Docker Compose for full local development:
```bash
docker-compose up
```

For testing and development without the full server, running `npm test` verifies the game engine logic.
