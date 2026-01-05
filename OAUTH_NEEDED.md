# OAuth Configuration Requirements

This application requires proper OAuth configuration to function correctly. Here's what you need to know:

## Required Configuration

### 1. Google Cloud Project Setup
- Create a project at [Google Cloud Console](https://console.cloud.google.com/)
- Enable the Google Sheets API
- Create OAuth 2.0 credentials

### 2. Environment Variables Required
You need to set these environment variables in your `.env` file:

```
VITE_GOOGLE_SHEETS_API_KEY=your_api_key_here
VITE_SPREADSHEET_ID=your_spreadsheet_id_here
VITE_GOOGLE_CLIENT_ID=your_oauth_client_id_here
VITE_REDIRECT_URI=http://localhost:5173
```

## OAuth Status Indicators

The app displays different OAuth status indicators:

- **Green (OAuth OK)**: Fully authenticated with both read and write access
- **Blue (OAuth Needed)**: OAuth is configured but user needs to authenticate
- **Yellow (OAuth Expired)**: Token has expired and needs renewal
- **Red (OAuth Not Configured)**: Missing VITE_GOOGLE_CLIENT_ID in environment

## Common Issues and Solutions

### Issue: 401 Unauthorized Error
**Cause**: Missing or invalid API key
**Solution**: 
1. Get a valid API key from Google Cloud Console
2. Add it to your `.env` file as `VITE_GOOGLE_SHEETS_API_KEY`

### Issue: Sheet does not exist
**Cause**: Spreadsheet doesn't have required sheets ("Users" and "Transactions")
**Solution**: 
1. Create a Google Spreadsheet with the ID specified in `VITE_SPREADSHEET_ID`
2. Add two sheets named exactly "Users" and "Transactions"
3. For "Users" sheet, columns should be: A (Name), B (Phone), C (Created Date)
4. For "Transactions" sheet, columns should be: A (ID), B (Date), C (Day), D (Name), E (Amount), F (Type), G (Phone)

### Issue: Write operations fail
**Cause**: API keys only work for public sheets and read operations
**Solution**: 
1. Implement OAuth 2.0 for write operations
2. Ensure your OAuth client has Google Sheets API access enabled
3. Add the correct OAuth scope: `https://www.googleapis.com/auth/spreadsheets`

## OAuth Scopes Required

Your OAuth client needs these scopes:
- `https://www.googleapis.com/auth/spreadsheets.currentonly` (for current spreadsheet)
- Or `https://www.googleapis.com/auth/spreadsheets` (for any spreadsheet)

## Spreadsheet Structure

### Users Sheet
| Column A | Column B | Column C |
|----------|----------|----------|
| Name     | Phone    | Created Date |

### Transactions Sheet
| Column A | Column B | Column C | Column D | Column E | Column F | Column G |
|----------|----------|----------|----------|----------|----------|----------|
| ID       | Date     | Day      | Name     | Amount   | Type     | Phone    |

## Fallback Behavior

When Google Sheets integration fails, the app will:
1. Use local storage as a fallback
2. Show mock data for display purposes
3. Continue to function with local data only
4. Attempt to sync when connectivity is restored