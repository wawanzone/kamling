# Google OAuth Setup Guide

This application uses Google OAuth 2.0 to access Google Sheets. Follow these steps to set up OAuth credentials:

## 1. Create Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" and then "New Project"
3. Enter a project name (e.g., "Kamling App")
4. Click "Create"

## 2. Enable Google Sheets API

1. In your project, go to "APIs & Services" > "Library"
2. Search for "Google Sheets API"
3. Click on "Google Sheets API" and click "Enable"

## 3. Create OAuth 2.0 Client ID

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Click "Configure consent screen"
4. Select "External" and click "Create"
5. Fill in:
   - App name: "Kamling App" (or your preferred name)
   - User support email: your email
   - Developer contact information: your email
6. Click "Save and Continue"
7. In "Scopes", click "Add or remove scopes"
8. Add these scopes:
   - `https://www.googleapis.com/auth/spreadsheets`
   - `https://www.googleapis.com/auth/drive.file`
9. Click "Save and Continue" until you reach "Test users", add your email, then click "Save and Continue"

## 4. Create Client ID and Secret

1. Go back to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. For "Application type", select "Web application"
4. For "Name", enter "Kamling App"
5. In "Authorized JavaScript origins", add:
   - `http://localhost:5173` (for development)
   - Your production URL (if applicable)
6. In "Authorized redirect URIs", add:
   - `http://localhost:5173` (for development)
   - Your production URL (if applicable)
7. Click "Create"
8. Copy the "Client ID" and "Client Secret"

## 5. Configure Environment Variables

Create a `.env` file in the root of your project with the following content:

```env
VITE_GOOGLE_CLIENT_ID=your_client_id_here
VITE_REDIRECT_URI=http://localhost:5173
```

Replace `your_client_id_here` with the actual Client ID you copied in step 4.

## 6. Configure Google Sheets

1. Create a Google Sheet with two sheets named exactly:
   - `Users` (with columns: Name, Phone, Created At)
   - `Transactions` (with columns: ID, Date, Day, Name, Amount, Type, Phone)

2. Share the Google Sheet with the email address associated with your Google Cloud Project (or make it publicly accessible for read operations)

3. Get the Spreadsheet ID from the URL:
   - Google Sheet URL format: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit#gid=0`
   - Copy the `SPREADSHEET_ID` part

4. Add the Spreadsheet ID to your environment variables:
```env
VITE_GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id_here
```

## 7. Running the Application

1. Make sure you have Node.js installed
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. The application will run on `http://localhost:5173`

## Troubleshooting

- If you get "OAuth Not Configured" in the app, make sure your `.env` file has the correct `VITE_GOOGLE_CLIENT_ID`
- If OAuth fails, ensure the redirect URI in Google Cloud Console matches your app's URL
- For write operations, OAuth authentication is required; for read-only operations, an API key might be sufficient

## Important Notes

- OAuth tokens are stored in browser's localStorage and will expire after a period of time
- The application stores data both in Google Sheets (when authenticated) and in localStorage as a backup
- Users will need to authenticate via OAuth to write data to Google Sheets