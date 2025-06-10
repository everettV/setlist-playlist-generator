
const jwt = require('jsonwebtoken');

const fs = require('fs');

require('dotenv').config();

console.log('�� Apple Music Configuration Test');

console.log('================================\n');

// Your actual values

const teamId = '9Z629B5YHG';

const keyId = 'CL75Y83769';

const privateKeyPath = './AuthKey_CL75Y83769.p8';

console.log('Team ID:', teamId);

console.log('Key ID:', keyId);

console.log('Private Key Path:', privateKeyPath);

// Check if private key file exists

if (!fs.existsSync(privateKeyPath)) {

  console.log('❌ Private key file not found!');

  console.log('Expected location:', privateKeyPath);

  console.log('Current directory files:');

  console.log(fs.readdirSync('.').filter(f => f.includes('AuthKey') || f.includes('.p8')));

  process.exit(1);

}

try {

  const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

  console.log('✅ Private key file found and readable');

  

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

  console.log('❌ Token generation failed:', error.message);

}

