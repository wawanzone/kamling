# Troubleshooting Guide

This guide explains common issues and their solutions for the Mobile Financial Tracking App.

## Common Error: 401 Unauthorized

### What it means:
- The Google Sheets API key is missing, invalid, or doesn't have proper permissions
- The OAuth token is expired or invalid (for write operations)

### Why it happens:
- No API key provided in environment variables
- API key doesn't have Google Sheets API enabled
- API key has expired or been revoked
- For write operations: API keys only work for public sheets; OAuth is required for private sheets

### How to fix:
1. Get a valid API key from Google Cloud Console
2. Ensure the Google Sheets API is enabled for your project
3. Add the API key to your `.env` file as `VITE_GOOGLE_SHEETS_API_KEY`
4. For write operations, set up OAuth 2.0 authentication

## Common Issue: Sheet "Users" or "Transactions" does not exist

### What it means:
- The expected sheets are missing from your Google Spreadsheet
- Sheet names don't match what the application expects

### Why it happens:
- Spreadsheet structure doesn't match the expected format
- Sheet names are different from "Users" and "Transactions"
- Sheet names have extra spaces or different capitalization

### How to fix:
1. Ensure your Google Spreadsheet has exactly these sheets:
   - "Users" (for user information)
   - "Transactions" (for transaction data)
2. Verify the sheet names match exactly (case-sensitive)
3. Ensure the correct column structure (see OAUTH_NEEDED.md for details)

## OAuth Status Colors and Meanings

The app uses color-coded status indicators:

| Color | Status | Meaning |
|-------|--------|---------|
| Green | OAuth OK | Fully authenticated with read and write access |
| Blue | OAuth Needed | OAuth configured but user needs to authenticate |
| Yellow | OAuth Expired | Token expired, needs renewal |
| Red | OAuth Not Configured | Missing client ID in environment |

## Fallback Behavior

When Google Sheets integration fails, the app:
1. Uses local storage as a backup
2. Shows mock data for display purposes
3. Continues to function with local data only
4. Attempts to sync when connectivity is restored

## Testing Your Setup

1. Check that environment variables are properly set:
   - `VITE_GOOGLE_SHEETS_API_KEY`
   - `VITE_SPREADSHEET_ID`
   - `VITE_GOOGLE_CLIENT_ID`

2. Verify your Google Spreadsheet has the correct structure:
   - Sheet named "Users" with columns A (Name), B (Phone), C (Created Date)
   - Sheet named "Transactions" with columns A-G as specified

3. Test authentication by clicking the OAuth button in the app

## Debugging Steps

If you're still having issues:

1. Check browser console for detailed error messages
2. Verify your Google Cloud project has billing enabled (required for Google Sheets API)
3. Ensure OAuth redirect URIs are properly configured in Google Cloud Console
4. Check that your spreadsheet is shared with the correct permissions
5. Verify that OAuth scopes include Google Sheets access