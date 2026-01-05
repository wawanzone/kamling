// OAuth 2.0 Service for Google Sheets API
// Handles the OAuth 2.0 flow for Google Sheets access

import { GOOGLE_OAUTH_CONFIG, getOAuthToken, saveOAuthToken } from '../config/oauth';

class OAuthService {
  private static instance: OAuthService;
  private accessToken: string | null = null;

  private constructor() {
    // Initialize with token from localStorage if available
    this.accessToken = getOAuthToken();
  }

  public static getInstance(): OAuthService {
    if (!OAuthService.instance) {
      OAuthService.instance = new OAuthService();
    }
    return OAuthService.instance;
  }

  // Check if user is authenticated
  public isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // Check if OAuth is properly configured
  public isConfigured(): boolean {
    return !!GOOGLE_OAUTH_CONFIG.CLIENT_ID;
  }

  // Get the current access token
  public getAccessToken(): string | null {
    return this.accessToken;
  }

  // Generate the OAuth authorization URL
  public getAuthorizationUrl(): string {
    if (!GOOGLE_OAUTH_CONFIG.CLIENT_ID) {
      throw new Error('Google Client ID is not configured. Please set VITE_GOOGLE_CLIENT_ID in your environment variables.');
    }

    const state = this.generateRandomString(32);
    const url = new URL(GOOGLE_OAUTH_CONFIG.AUTHORIZATION_URL);

    url.searchParams.set('client_id', GOOGLE_OAUTH_CONFIG.CLIENT_ID);
    url.searchParams.set('redirect_uri', GOOGLE_OAUTH_CONFIG.REDIRECT_URI);
    url.searchParams.set('scope', GOOGLE_OAUTH_CONFIG.SCOPES);
    url.searchParams.set('response_type', 'token');
    url.searchParams.set('state', state);
    url.searchParams.set('access_type', 'offline');
    url.searchParams.set('prompt', 'consent');

    // Store state in localStorage for validation after redirect
    localStorage.setItem('oauth_state', state);

    return url.toString();
  }

  // Process the OAuth callback and extract the token
  public processCallback(hash: string): boolean {
    try {
      // Parse the hash fragment from the URL
      const params = new URLSearchParams(hash.replace('#', ''));
      const accessToken = params.get('access_token');
      const state = params.get('state');
      const expiresIn = params.get('expires_in');

      // Validate state parameter to prevent CSRF
      const storedState = localStorage.getItem('oauth_state');
      if (!state || state !== storedState) {
        console.error('Invalid OAuth state parameter');
        return false;
      }

      // Clear the stored state
      localStorage.removeItem('oauth_state');

      // Check if we have an access token
      if (!accessToken) {
        console.error('No access token received from OAuth callback');
        return false;
      }

      // Store the access token
      this.accessToken = accessToken;
      saveOAuthToken(accessToken);

      // Calculate expiration time and store it
      const expirationTime = Date.now() + (parseInt(expiresIn || '3600') * 1000);
      localStorage.setItem('oauth_token_expiration', expirationTime.toString());

      return true;
    } catch (error) {
      console.error('Error processing OAuth callback:', error);
      return false;
    }
  }

  // Check if the current token is expired
  public isTokenExpired(): boolean {
    const expiration = localStorage.getItem('oauth_token_expiration');
    if (!expiration) {
      return true;
    }
    return Date.now() >= parseInt(expiration);
  }

  // Generate a random string for state parameter
  private generateRandomString(length: number): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Clear the stored authentication
  public logout(): void {
    this.accessToken = null;
    localStorage.removeItem('google_oauth_token');
    localStorage.removeItem('oauth_token_expiration');
    localStorage.removeItem('oauth_state');
  }
}

export default OAuthService.getInstance();