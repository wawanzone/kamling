#!/bin/bash
# Setup script for Mobile Financial Tracking App

echo "Mobile Financial Tracking App - Setup"
echo "====================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "Please edit the .env file with your actual credentials."
    echo "You need to provide:"
    echo "  - Google Sheets API Key (for read operations)"
    echo "  - Google OAuth 2.0 Client ID (for write operations)"
    echo "  - Spreadsheet ID"
else
    echo ".env file already exists."
fi

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check for npm
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install npm first."
    exit 1
fi

echo "Installing dependencies..."
npm install

echo ""
echo "Setup complete!"
echo ""
echo "To run the application:"
echo "  1. Edit the .env file with your Google credentials"
echo "  2. Run: npm run dev"
echo ""
echo "For more information about OAuth requirements, see OAUTH_NEEDED.md"