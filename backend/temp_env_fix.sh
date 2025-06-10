#!/bin/bash

echo "Fixing .env file format..."

# Read current values
TEAM_ID=$(grep APPLE_MUSIC_TEAM_ID .env | cut -d'=' -f2)
KEY_ID=$(grep APPLE_MUSIC_KEY_ID .env | cut -d'=' -f2)

# Remove old Apple Music vars
grep -v APPLE_MUSIC .env > .env.tmp

# Add properly formatted vars
echo "" >> .env.tmp
echo "# Apple Music API Configuration" >> .env.tmp
echo "APPLE_MUSIC_TEAM_ID=$TEAM_ID" >> .env.tmp
echo "APPLE_MUSIC_KEY_ID=$KEY_ID" >> .env.tmp

# Add the private key properly (you'll need to paste this manually)
echo 'APPLE_MUSIC_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg5K9fvF7Ij4EGDl/1
wElT9GhqJzlUt9ZTN1QU9Y8A7MqgCgYIKoZIzj0DAQehRANCAAQoJXaJnK+SJUGl
Uozu7KZRN6D+GnE2pF9g1jTmz7WVrNbN8U1aZ7EXAMPLE_PRIVATE_KEY_DATA_HERE
qLwCGq7YjQ8w7LzTmF1Z+3LdwQjGaLLK5v8N7QI0L2XtVhK9fZLwQdN3a8c=
-----END PRIVATE KEY-----"' >> .env.tmp

mv .env.tmp .env
echo "✅ .env file updated. Please replace the EXAMPLE_PRIVATE_KEY_DATA_HERE with your actual private key content."
