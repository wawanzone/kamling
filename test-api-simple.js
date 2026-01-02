// Simple test script to check Google Sheets API connection
import fs from 'fs';
import path from 'path';

// Read .env file manually
let envConfig = {};
if (fs.existsSync('.env')) {
  const envFile = fs.readFileSync('.env', 'utf8');
  const lines = envFile.split('\n');
  for (const line of lines) {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...value] = line.split('=');
      if (key && value) {
        envConfig[key.trim()] = value.join('=').trim();
      }
    }
  }
}

// Access environment variables
const API_KEY = envConfig['VITE_GOOGLE_SHEETS_API_KEY'] || process.env.VITE_GOOGLE_SHEETS_API_KEY || '';
const SPREADSHEET_ID = envConfig['VITE_SPREADSHEET_ID'] || process.env.VITE_SPREADSHEET_ID || '1MbjeDkD51X0fmr8D_pXvK28mpUq9MQ3IITnQtljTgYM';

console.log('Testing Google Sheets API connection...');
console.log('API Key available:', !!API_KEY);
console.log('API Key (masked):', API_KEY ? API_KEY.substring(0, 10) + '...' : 'N/A');
console.log('Spreadsheet ID:', SPREADSHEET_ID);

if (!API_KEY) {
  console.log('❌ No API key found. Please set VITE_GOOGLE_SHEETS_API_KEY in your .env file.');
  process.exit(1);
}

// Test read operation
async function testReadOperation() {
  try {
    console.log('\n🔍 Testing read operation...');
    
    // Use the correct sheet name from the config
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Users!B2:B?key=${API_KEY}`;
    console.log('Request URL:', url);
    
    const response = await fetch(url);
    console.log('Response Status:', response.status);
    console.log('Response Status Text:', response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Read operation failed:', errorText);
      return false;
    }
    
    const data = await response.json();
    console.log('✅ Read operation successful:', JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.log('❌ Read operation error:', error.message);
    return false;
  }
}

// Test write operation (this will likely fail with API key auth)
async function testWriteOperation() {
  try {
    console.log('\n📝 Testing write operation...');
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Transactions!A1:append?valueInputOption=USER_ENTERED&key=${API_KEY}`;
    console.log('Request URL:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [[Date.now(), 'Test', 'Test Day', 'Test Transaction', '100', 'masuk', 'test-phone']]
      })
    });
    
    console.log('Response Status:', response.status);
    console.log('Response Status Text:', response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Write operation failed (expected with API key):', errorText);
      return false;
    }
    
    const data = await response.json();
    console.log('✅ Write operation successful:', JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.log('❌ Write operation error:', error.message);
    return false;
  }
}

async function main() {
  console.log('\n🚀 Starting API connection tests...\n');
  
  const readSuccess = await testReadOperation();
  console.log('\n⚠️  Note: Write operations typically fail with API key authentication (only read is allowed)');
  console.log('   Testing write anyway to confirm the error...\n');
  const writeSuccess = await testWriteOperation();
  
  console.log('\n📊 Test Results:');
  console.log('Read Operation:', readSuccess ? '✅ PASSED' : '❌ FAILED (or no data)');
  console.log('Write Operation:', writeSuccess ? '✅ PASSED' : '❌ FAILED (expected with API key)');
  
  if (readSuccess) {
    console.log('\n🎉 Read operation worked! Your API key is valid and has read access.');
    console.log('   Note: Write operations require OAuth 2.0 or service account authentication.');
  } else {
    console.log('\n⚠️  Read operation failed. Check your API key and spreadsheet permissions.');
  }
}

// Run the tests
main().catch(console.error);