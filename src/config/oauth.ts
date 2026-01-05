// OAuth 2.0 Configuration for Google Sheets API
// This file contains configuration for Google OAuth 2.0 integration

export const GOOGLE_OAUTH_CONFIG = {
  // Client ID for OAuth 2.0
  CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  
  // Scopes required for Google Sheets access
  SCOPES: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file'
  ].join(' '),
  
  // OAuth 2.0 endpoints
  AUTHORIZATION_URL: 'https://accounts.google.com/o/oauth2/v2/auth',
  TOKEN_URL: 'https://oauth2.googleapis.com/token',
  REDIRECT_URI: import.meta.env.VITE_REDIRECT_URI || window.location.origin,
  
  // Google API endpoints
  API_BASE_URL: 'https://sheets.googleapis.com/v4/spreadsheets',
};

// Function to get OAuth access token from localStorage
export const getOAuthToken = (): string | null => {
  return localStorage.getItem('google_oauth_token');
};

// Function to save OAuth access token to localStorage
export const saveOAuthToken = (token: string): void => {
  localStorage.setItem('google_oauth_token', token);
};

// Function to remove OAuth access token from localStorage
export const removeOAuthToken = (): void => {
  localStorage.removeItem('google_oauth_token');
};