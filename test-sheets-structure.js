// Test script to check the structure of the Google Sheet
import fs from 'fs';

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

console.log('Checking Google Sheets structure...');
console.log('Spreadsheet ID:', SPREADSHEET_ID);

if (!API_KEY) {
  console.log('❌ No API key found. Please set VITE_GOOGLE_SHEETS_API_KEY in your .env file.');
  process.exit(1);
}

// Get spreadsheet metadata to see actual sheet names
async function getSpreadsheetInfo() {
  try {
    console.log('\n🔍 Getting spreadsheet metadata...');
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?key=${API_KEY}`;
    console.log('Request URL:', url);
    
    const response = await fetch(url);
    console.log('Response Status:', response.status);
    console.log('Response Status Text:', response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Failed to get spreadsheet info:', errorText);
      return null;
    }
    
    const data = await response.json();
    console.log('\n✅ Spreadsheet metadata retrieved successfully!');
    console.log('Spreadsheet Title:', data.properties.title);
    console.log('\nAvailable sheets:');
    
    if (data.sheets) {
      data.sheets.forEach((sheet, index) => {
        console.log(`  ${index + 1}. "${sheet.properties.title}" (ID: ${sheet.properties.sheetId})`);
        console.log(`     Grid: ${sheet.properties.gridProperties.rowCount} rows × ${sheet.properties.gridProperties.columnCount} columns`);
      });
    } else {
      console.log('  No sheets found');
    }
    
    return data;
  } catch (error) {
    console.log('❌ Error getting spreadsheet info:', error.message);
    return null;
  }
}

// Check if a specific sheet exists
async function checkSheetExists(sheetName) {
  try {
    console.log(`\n🔍 Checking if sheet "${sheetName}" exists...`);
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${sheetName}!A1:A1?key=${API_KEY}`;
    console.log('Request URL:', url);
    
    const response = await fetch(url);
    console.log('Response Status:', response.status);
    console.log('Response Status Text:', response.statusText);
    
    if (response.status === 400) {
      const errorText = await response.text();
      console.log('❌ Sheet does not exist or has formatting issues:', errorText);
      return false;
    } else if (response.status === 200) {
      console.log('✅ Sheet exists and is accessible');
      return true;
    } else {
      const errorText = await response.text();
      console.log('❌ Unexpected response:', errorText);
      return false;
    }
  } catch (error) {
    console.log('❌ Error checking sheet:', errorText);
    return false;
  }
}

async function main() {
  console.log('\n🚀 Starting spreadsheet structure analysis...\n');
  
  // Get spreadsheet info
  const spreadsheetInfo = await getSpreadsheetInfo();
  
  if (spreadsheetInfo && spreadsheetInfo.sheets) {
    console.log('\n📋 Summary of available sheets:');
    spreadsheetInfo.sheets.forEach((sheet, index) => {
      console.log(`  - ${sheet.properties.title}`);
    });
    
    // Check for expected sheets
    console.log('\n🔍 Checking for expected sheets from your app config...');
    const expectedSheets = ['Users', 'Transactions'];
    
    for (const sheetName of expectedSheets) {
      const exists = await checkSheetExists(sheetName);
      console.log(`  ${sheetName} sheet: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
    }
  }
  
  console.log('\n💡 Recommendations:');
  console.log('  1. Make sure your Google Sheet has sheets named "Users" and "Transactions"');
  console.log('  2. The "Users" sheet should have columns: A(Name), B(Phone), C(Created At)');
  console.log('  3. The "Transactions" sheet should have columns: A(ID), B(Date), C(Day), D(Name), E(Amount), F(Type), G(Phone)');
  console.log('  4. Make sure your Google Sheet is shared with "Anyone with the link can view"');
}

// Run the tests
main().catch(console.error);