# Keyteki Cloud Environment

## Node.js Version

This project requires **Node.js v16.20.2**. The environment uses nvm with this version set as the default. Source nvm in scripts if needed:

```bash
source ~/.nvm/nvm.sh
```

## Git Submodules

The `keyteki-json-data` submodule contains card data. If it's empty, run:

```bash
git submodule init && git submodule update
```

## Running Tests

Run all tests:
```bash
npm test
```

Run a specific test file:
```bash
npm test -- test/server/cards/01-Core/AFairGame.spec.js
```

Debug with game logs:
```bash
DEBUG_TEST=1 npm test -- test/server/cards/11-PV/BadOmen.spec.js
```

## Linting

```bash
npm run lint
```

## Building

```bash
npm run build
```

## Running the Server

The full server requires PostgreSQL and Redis. For local development without Docker:

1. Start Redis and PostgreSQL services
2. Configure `config/local.json5` with database connection details
3. Run `npm start` for the lobby server
4. Run `npm run game` for the game node
