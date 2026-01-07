#!/bin/bash
set -e

# Ensure we're using Node.js 18
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 18

# Initialize git submodules if needed
cd /workspace
if [ ! -d "keyteki-json-data/.git" ]; then
    git submodule init
    git submodule update
fi

# Create server logs directory if needed
mkdir -p server/logs

# Install npm dependencies
npm install
