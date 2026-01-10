# Keyteki Cloud Agent Environment

## Node.js Version
This project requires **Node.js v16.20.2**. The nvm default has been set to this version. If you need to ensure the correct version is active, run:
```bash
source ~/.nvm/nvm.sh && nvm use 16.20.2
```

## Git Submodule
The `keyteki-json-data` submodule contains card metadata. If the submodule directory is empty, initialize it with:
```bash
git submodule update --init --recursive
```

## Common Commands
- `npm test` - Run all tests (takes several minutes due to 2000+ test files)
- `npm test -- test/server/cards/04-MM/Envy.spec.js` - Run a single test file
- `DEBUG_TEST=1 npm test -- <path>` - Run tests with debug output
- `npm run lint` - Run ESLint
- `npm run lint:js:fix` - Auto-fix lint issues

## Server Requirements
The full application requires PostgreSQL and Redis. For unit tests, these are not needed.

## Logs Directory
The server expects `server/logs/` to exist for logging.
