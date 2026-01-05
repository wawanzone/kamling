# Google Sheets OAuth 2.0 Integration Guide

This guide explains how to set up OAuth 2.0 authentication for Google Sheets write operations in your application.

## Why OAuth 2.0 is Required

- API keys only work for public sheets and read operations
- Write operations to Google Sheets require OAuth 2.0 authentication
- This implementation allows your app to write data to Google Sheets securely

## Prerequisites

1. A Google account
2. Access to Google Cloud Console
3. A Google Sheet that you want to write to

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Dashboard"
4. Click "Enable APIs and Services"
5. Search for "Google Sheets API" and enable it
6. Also enable the "Google Drive API" (needed for accessing spreadsheets)

### 2. Create OAuth 2.0 Credentials

1. In Google Cloud Console, navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Configure the OAuth consent screen if prompted:
   - Application type: "External" or "Internal" depending on your needs
   - Add your email to test users if it's an external app
4. Application type: "Web application"
5. Add authorized redirect URIs:
   - For development: `http://localhost:3000`
   - For production: your actual domain
6. Download the credentials JSON file
7. Copy the "Client ID" value

### 3. Configure Environment Variables

1. Create or update your `.env` file in the project root
2. Add your Google Client ID:
   ```
   VITE_GOOGLE_CLIENT_ID=your_actual_client_id_here
   VITE_REDIRECT_URI=http://localhost:3000
   ```

### 4. Share Your Google Sheet

1. Open your Google Sheet
2. Click "Share" 
3. Add the email associated with the account that will be used for OAuth
4. Grant "Editor" access to allow write operations

## How the OAuth Flow Works

1. When the app needs to write data to Google Sheets, it checks for a valid OAuth token
2. If no valid token exists, the user is redirected to Google's OAuth consent screen
3. After user grants permission, Google redirects back to your app with an access token
4. The app stores the token and uses it for subsequent Google Sheets write operations
5. Tokens have expiration times and will be refreshed automatically when needed

## Implementation Details

The application includes:

- `OAuthService`: Handles the OAuth flow and token management
- `GoogleSheetsService`: Uses OAuth tokens for write operations when available
- Automatic fallback to localStorage when OAuth is not configured
- URL hash processing for OAuth callback handling

## Security Notes

- Never commit your actual client ID to version control
- Restrict your OAuth client ID to only allow access from your authorized domains
- The access tokens are stored in browser localStorage (consider the security implications)
- For production applications, consider using a backend service for OAuth flow

## Troubleshooting

### OAuth Not Working
- Verify your redirect URI matches exactly what you registered in Google Cloud Console
- Check that you've enabled both Google Sheets API and Google Drive API
- Ensure your Google Sheet is shared with the correct account

### Write Operations Still Failing
- Verify the account has "Editor" access to the Google Sheet
- Check that the sheet names match exactly what's configured in `src/config/api.ts`
- Ensure the column structure matches the expected format

### Local Development Issues
- Make sure you're running the app on the same domain/port that you registered
- Some browsers may block 3rd party cookies which can affect OAuth flows

## Example OAuth Flow

```typescript
// Check if authenticated
if (!OAuthService.isAuthenticated()) {
  // Redirect to Google OAuth
  const authUrl = OAuthService.getAuthorizationUrl();
  window.location.href = authUrl;
} else {
  // Use the service directly
  await GoogleSheetsService.addUserToSheet(user);
}
```

The OAuth token is automatically included in write requests when available, allowing the application to write data to Google Sheets.