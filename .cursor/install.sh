#!/bin/bash
set -e

# Source nvm to ensure correct Node version
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Initialize git submodules if needed
if [ ! -f "keyteki-json-data/packs/CotA.json" ]; then
    git submodule init
    git submodule update
fi

# Install npm dependencies
npm install

# Create server logs directory if needed
mkdir -p server/logs
