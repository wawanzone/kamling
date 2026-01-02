# Google Sheets Integration Guide

This application integrates with Google Sheets to store user information and transaction data. Follow these steps to set up the integration:

## Prerequisites

1. A Google account
2. Access to Google Sheets
3. Basic knowledge of Google Cloud Platform

## Step 1: Set up Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Dashboard"
4. Click "Enable APIs and Services"
5. Search for "Google Sheets API" and enable it

## Step 2: Create API Key

1. In the Google Cloud Console, go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API key (you'll need this for your environment variables)

## Step 3: Prepare Your Google Sheet

1. Create a new Google Sheet or use an existing one
2. Create two sheets named exactly:
   - `Users` - for storing user information
   - `Transactions` - for storing transaction data
3. The spreadsheet structure should be:
   - **Users sheet**:
     - Column A: Name
     - Column B: Phone Number
     - Column C: Creation Timestamp
   - **Transactions sheet**:
     - Column A: Transaction ID
     - Column B: Date
     - Column C: Day
     - Column D: Name
     - Column E: Amount
     - Column F: Type (masuk/keluar)
     - Column G: Phone Number (to link to user)

## Step 4: Configure Environment Variables

1. Create a `.env` file in the root directory (copy from `.env.example`)
2. Add your API key:
   ```
   REACT_APP_GOOGLE_SHEETS_API_KEY=your_actual_api_key_here
   ```

## Step 5: Update Spreadsheet Configuration

The application uses the spreadsheet ID from your provided link. If you're using a different spreadsheet, update the ID in `src/config/api.ts`.

## Important Security Notes

- Never commit your actual API key to version control
- Restrict your API key to only allow access to Google Sheets API
- Consider using OAuth 2.0 instead of API keys for production applications that handle sensitive data

## How It Works

1. When a user logs in with their name and phone number, the app checks if they exist in the Users sheet
2. If not, the user is added to the Users sheet
3. When a transaction is created, it's added to the Transactions sheet with the user's phone number for reference
4. When loading the app, transactions are filtered by the logged-in user's phone number

## Troubleshooting

- If you get "API key not valid" errors, double-check your API key and ensure the Google Sheets API is enabled
- If data isn't saving, check that your sheet names and column structure match the expected format
- Ensure your API key doesn't have restrictions that prevent access to your specific spreadsheet