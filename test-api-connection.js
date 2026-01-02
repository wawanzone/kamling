// Test script to check Google Sheets API connection
import dotenv from 'dotenv';
dotenv.config();

// Access environment variables using process.env
const API_KEY = process.env.VITE_GOOGLE_SHEETS_API_KEY || process.env.REACT_APP_GOOGLE_SHEETS_API_KEY;
const SPREADSHEET_ID = process.env.VITE_SPREADSHEET_ID || '1MbjeDkD51X0fmr8D_pXvK28mpUq9MQ3IITnQtljTgYM';

console.log('Testing Google Sheets API connection...');
console.log('API Key available:', !!API_KEY);
console.log('Spreadsheet ID:', SPREADSHEET_ID);

if (!API_KEY) {
  console.log('❌ No API key found. Please set VITE_GOOGLE_SHEETS_API_KEY in your .env file.');
  process.exit(1);
}

// Test read operation
async function testReadOperation() {
  try {
    console.log('\n🔍 Testing read operation...');
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Users!A1:A?key=${API_KEY}`;
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
    console.log('✅ Read operation successful:', data);
    return true;
  } catch (error) {
    console.log('❌ Read operation error:', error.message);
    return false;
  }
}

// Test write operation
async function testWriteOperation() {
  try {
    console.log('\n📝 Testing write operation...');
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Users!A1:append?valueInputOption=USER_ENTERED&key=${API_KEY}`;
    console.log('Request URL:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [['Test', new Date().toISOString()]]
      })
    });
    
    console.log('Response Status:', response.status);
    console.log('Response Status Text:', response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Write operation failed:', errorText);
      return false;
    }
    
    const data = await response.json();
    console.log('✅ Write operation successful:', data);
    return true;
  } catch (error) {
    console.log('❌ Write operation error:', error.message);
    return false;
  }
}

async function main() {
  console.log('\n🚀 Starting API connection tests...\n');
  
  const readSuccess = await testReadOperation();
  const writeSuccess = await testWriteOperation();
  
  console.log('\n📊 Test Results:');
  console.log('Read Operation:', readSuccess ? '✅ PASSED' : '❌ FAILED');
  console.log('Write Operation:', writeSuccess ? '✅ PASSED' : '❌ FAILED');
  
  if (readSuccess && writeSuccess) {
    console.log('\n🎉 All tests passed! Your API connection is working properly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the error messages above for details.');
  }
}

// Run the tests
main().catch(console.error);