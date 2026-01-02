# Google Sheets OAuth 2.0 Setup Guide

## Required Steps:

### 1. Set up Google Cloud Project
1. Go to https://console.cloud.google.com/
2. Create a new project or select existing one
3. Enable the Google Sheets API
4. Navigate to "Credentials" in the left sidebar

### 2. Create OAuth 2.0 Client ID
1. Click "Create Credentials" > "OAuth 2.0 Client IDs"
2. Application type: "Web application"
3. Add authorized redirect URIs:
   - For development: `http://localhost:3000` (or your dev server port)
   - For production: your actual domain
4. Download the credentials JSON file

### 3. Share Google Sheet
1. Open your Google Sheet
2. Click "Share" 
3. Add the email associated with your OAuth client or service account
4. Grant Editor access

### 4. Update Your Code
Replace API key authentication with OAuth 2.0 for write operations:

```javascript
// You'll need to implement the OAuth flow to get an access token
const accessToken = await getOAuthAccessToken();

// Use Authorization header instead of API key for write operations
fetch(url, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
```

### 5. Alternative: Service Account (for server-side applications)
If your application runs on a server, consider using a service account:
1. Create service account in Google Cloud Console
2. Download service account key JSON file
3. Share the Google Sheet with the service account email
4. Use the service account credentials in your application