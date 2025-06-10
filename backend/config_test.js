// test-musickit-config.js
const jwt = require('jsonwebtoken');
const fs = require('fs');

// Your configuration
const teamId = 'ABC123DEF4';
const keyId = 'XYZ789GHI0';
const privateKeyPath = './AuthKey_XYZ789GHI0.p8';

try {
  const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
  
  const token = jwt.sign(
    {
      iss: teamId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600
    },
    privateKey,
    {
      algorithm: 'ES256',
      keyid: keyId
    }
  );
  
  console.log('✅ Token generated successfully!');
  console.log('Token length:', token.length);
  console.log('First 50 characters:', token.substring(0, 50) + '...');
} catch (error) {
  console.error('❌ Token generation failed:', error.message);
}

