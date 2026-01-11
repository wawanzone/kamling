# Google Sheets API Debugging Guide

This document explains the debugging process and fixes implemented for the Google Sheets API integration in the application.

## Issues Identified

### 1. Sheet Name Mismatch
- **Problem**: The application expected sheets named "Users" and "Transactions", but the actual Google Spreadsheet only had "Sheet1" and "Sheet2"
- **Error**: `400 Bad Request` with message "Unable to parse range: Users!B2:B"
- **Solution**: Updated the configuration to use the actual sheet names ("Sheet1" and "Sheet2")

### 2. API Key Limitations
- **Problem**: API keys only support read operations, not write operations
- **Error**: `401 Unauthorized` with message "API keys are not supported by this API. Expected OAuth2 access token"
- **Solution**: Enhanced error handling with proper fallbacks for write operations

### 3. Missing Sheet Verification
- **Problem**: API calls were made without checking if the target sheets existed
- **Solution**: Added `verifySheetExists` method to check sheet existence before API calls

## Implemented Fixes

### 1. Enhanced Error Logging
Added comprehensive logging to identify exactly where errors occur:

```typescript
// Debug: Log the API call details
console.log('Checking user existence with API call:');
console.log('Spreadsheet ID:', this.SPREADSHEET_ID);
console.log('Sheet:', GOOGLE_SHEETS_CONFIG.SHEETS.USERS);
console.log('Column mapping:', GOOGLE_SHEETS_CONFIG.COLUMN_MAPPINGS.USERS.PHONE);
console.log('API Key available:', !!this.API_KEY);
console.log('Full URL:', `${...}`);
```

### 2. Sheet Verification
Added a method to verify if sheets exist before making API calls:

```typescript
private async verifySheetExists(sheetName: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${GOOGLE_SHEETS_CONFIG.API_BASE_URL}/${this.SPREADSHEET_ID}?key=${this.API_KEY}`
    );
    
    if (!response.ok) {
      console.error(`Failed to get spreadsheet metadata: ${response.status} ${response.statusText}`);
      return false;
    }
    
    const spreadsheetData = await response.json();
    const sheetNames = spreadsheetData.sheets?.map((sheet: any) => sheet.properties.title) || [];
    
    console.log(`Available sheets in spreadsheet:`, sheetNames);
    console.log(`Looking for sheet: ${sheetName}`);
    
    const exists = sheetNames.includes(sheetName);
    console.log(`Sheet "${sheetName}" exists:`, exists);
    
    return exists;
  } catch (error) {
    console.error(`Error verifying sheet existence:`, error);
    return false;
  }
}
```

### 3. Updated Configuration
Updated the configuration to use actual sheet names that exist in the spreadsheet:

```typescript
SHEETS: {
  USERS: 'Sheet1', // Changed from 'Users'
  TRANSACTIONS: 'Sheet2', // Changed from 'Transactions'
},
```

### 4. Better Error Handling
- Added sheet existence checks before API calls
- Enhanced error messages with more specific details
- Added proper fallbacks for missing sheets and authentication issues

## Testing Process

The following test scripts were created to identify the issues:

1. `test-api-connection.js` - Tests basic API connectivity
2. `test-sheets-structure.js` - Checks the actual structure of the Google Spreadsheet

## Expected Sheet Structure

For the application to work properly, your Google Spreadsheet should have:

### Sheet1 (Users)
- Column A: Name
- Column B: Phone (used for user lookup)
- Column C: Created At timestamp

### Sheet2 (Transactions)
- Column A: ID
- Column B: Date
- Column C: Day
- Column D: Name
- Column E: Amount
- Column F: Type (masuk/keluar)
- Column G: Phone (to link to user)

## Limitations

1. **Write Operations**: API keys cannot be used for write operations. Only read operations are supported.
2. **Sheet Names**: Must match the names specified in the configuration.
3. **Public Access**: The spreadsheet must be shared publicly for API key access to work.

## Next Steps

For full write functionality, implement OAuth 2.0 authentication instead of API key authentication.