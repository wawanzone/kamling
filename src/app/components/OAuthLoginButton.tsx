import React from 'react';
import OAuthService from '../../services/OAuthService';

interface OAuthLoginButtonProps {
  onLoginSuccess?: () => void;
  onLoginFailure?: (error: string) => void;
}

const OAuthLoginButton: React.FC<OAuthLoginButtonProps> = ({ 
  onLoginSuccess, 
  onLoginFailure 
}) => {
  const handleOAuthLogin = () => {
    try {
      // Check if we have a client ID configured
      if (!OAuthService.getAccessToken()) {
        // Redirect to Google OAuth
        const authUrl = OAuthService.getAuthorizationUrl();
        window.location.href = authUrl;
      } else {
        // If already authenticated, call success callback
        onLoginSuccess?.();
      }
    } catch (error) {
      console.error('OAuth login error:', error);
      onLoginFailure?.((error as Error).message);
    }
  };

  return (
    <button
      onClick={handleOAuthLogin}
      className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 17h12l-4 4-4-4z"></path>
        <path d="M6 3h12v10H6z"></path>
      </svg>
      Login with Google
    </button>
  );
};

export default OAuthLoginButton;