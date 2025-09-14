#!/bin/bash

echo "Installing project dependencies..."

# Remove node_modules if it exists
if [ -d "node_modules" ]; then
  echo "Removing existing node_modules directory..."
  rm -rf node_modules
fi

# Remove package-lock.json if it exists
if [ -f "package-lock.json" ]; then
  echo "Removing package-lock.json..."
  rm package-lock.json
fi

# Install dependencies
echo "Installing npm packages..."
npm install

echo "Dependencies installed successfully."
echo "You can now start the server with 'npm start'"
