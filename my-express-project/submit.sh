#!/bin/bash

# Team handle for the hackathon
TEAM_HANDLE="BRACU_RuntimeError"

# Clean up node_modules to reduce zip size
echo "Cleaning up node_modules..."
rm -rf node_modules

# Create the submission zip file
echo "Creating submission zip file..."
cd ..
zip -r "$TEAM_HANDLE.zip" node_express -x "node_express/node_modules/*"

# Move the zip to a convenient location
mv "$TEAM_HANDLE.zip" ./

echo "Submission file created: $TEAM_HANDLE.zip"
echo "Don't forget to run 'npm install' if you want to continue development."
