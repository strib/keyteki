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

## Running the Full Application
The application requires PostgreSQL and Redis to run. To start all services:

```bash
# Start Redis (if not already running)
redis-server --daemonize yes

# Start PostgreSQL (if not already running)
sudo pg_ctlcluster 16 main start

# Start the lobby server (port 4000)
npm start

# In a separate terminal, start the game node (port 9500)
npm run game
```

The website is accessible at http://localhost:4000

### Default Users
The database includes default users for testing:
- `admin` / `password`
- `test0` / `password`
- `test1` / `password`

## Common Commands
- `npm test` - Run all tests (takes several minutes due to 2000+ test files)
- `npm test -- test/server/cards/04-MM/Envy.spec.js` - Run a single test file
- `DEBUG_TEST=1 npm test -- <path>` - Run tests with debug output
- `npm run lint` - Run ESLint
- `npm run lint:js:fix` - Auto-fix lint issues
- `node server/scripts/fetchdata` - Fetch/update card data from external API

## Configuration
Local configuration is in `config/local.json5`. This overrides `config/default.json5`.

## Logs Directory
The server expects `server/logs/` to exist for logging.
