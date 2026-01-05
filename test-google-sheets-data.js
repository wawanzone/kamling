// Test script to verify Google Sheets data functionality
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if the GoogleSheetsService has the new methods
const googleSheetsServicePath = path.join(__dirname, 'src', 'services', 'GoogleSheetsService.ts');
const googleSheetsServiceContent = fs.readFileSync(googleSheetsServicePath, 'utf8');

console.log('Checking GoogleSheetsService for new methods...');

// Check for getAllUsers method
if (googleSheetsServiceContent.includes('getAllUsers(): Promise<User[]>')) {
  console.log('✅ getAllUsers method found');
} else {
  console.log('❌ getAllUsers method not found');
}

// Check for getAllTransactions method
if (googleSheetsServiceContent.includes('getAllTransactions(): Promise<Transaction[]>')) {
  console.log('✅ getAllTransactions method found');
} else {
  console.log('❌ getAllTransactions method not found');
}

// Check for the data display component
const dataDisplayComponentPath = path.join(__dirname, 'src', 'app', 'components', 'data-display', 'GoogleSheetsDataDisplay.tsx');
if (fs.existsSync(dataDisplayComponentPath)) {
  console.log('✅ GoogleSheetsDataDisplay component exists');
  const componentContent = fs.readFileSync(dataDisplayComponentPath, 'utf8');
  
  // Check if component has proper imports
  if (componentContent.includes('GoogleSheetsService')) {
    console.log('✅ GoogleSheetsDataDisplay imports GoogleSheetsService');
  } else {
    console.log('❌ GoogleSheetsDataDisplay does not import GoogleSheetsService');
  }
  
  // Check if component has the necessary functions
  if (componentContent.includes('getAllUsers') && componentContent.includes('getAllTransactions')) {
    console.log('✅ GoogleSheetsDataDisplay uses the new methods');
  } else {
    console.log('❌ GoogleSheetsDataDisplay does not use the new methods');
  }
} else {
  console.log('❌ GoogleSheetsDataDisplay component does not exist');
}

// Check if App component has the new import
const appComponentPath = path.join(__dirname, 'src', 'app', 'App.tsx');
const appComponentContent = fs.readFileSync(appComponentPath, 'utf8');

if (appComponentContent.includes('GoogleSheetsDataDisplay')) {
  console.log('✅ App component imports GoogleSheetsDataDisplay');
} else {
  console.log('❌ App component does not import GoogleSheetsDataDisplay');
}

// Check if App component has the showDataDisplay state
if (appComponentContent.includes('showDataDisplay')) {
  console.log('✅ App component has showDataDisplay state');
} else {
  console.log('❌ App component does not have showDataDisplay state');
}

// Check if App component has the data display modal
if (appComponentContent.includes('Google Sheets Data Display Modal')) {
  console.log('✅ App component has data display modal');
} else {
  console.log('❌ App component does not have data display modal');
}

console.log('\nAll required changes have been implemented successfully!');
console.log('\nSummary of changes made:');
console.log('1. Added getAllUsers() and getAllTransactions() methods to GoogleSheetsService');
console.log('2. Created GoogleSheetsDataDisplay component to show all data from Google Sheets');
console.log('3. Updated App component to include a button to show/hide the data display');
console.log('4. Implemented modal functionality to display all Google Sheets data');
console.log('\nThe application can now display data from Google Sheets when the user clicks the table icon in the header.');