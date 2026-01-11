# Mobile Financial Tracking App

This is a code bundle for Mobile Financial Tracking App. The original project is available at https://www.figma.com/design/BKoFIfm8UkINaegrBv45de/Mobile-Financial-Tracking-App.

## Features

- User authentication with name and phone number
- Google Sheets integration for data storage
- Transaction tracking (income and expenses)
- Real-time data synchronization
- Dashboard with financial overview showing all data
- OAuth 2.0 authentication for secure access
- Clear visual indicators: green for income, red for expenses
- OAuth status indicator showing what's needed for full functionality

## Data Display

All application data is displayed on the main dashboard, including:
- Financial summary with total income and expenses
- Recent transactions list (up to 10 most recent)
- Date and user information
- OAuth status indicator
- Interactive forms for adding new transactions
- Toggle to view all Google Sheets data in a modal

## OAuth Status Indicator

The app displays an OAuth status indicator in the dashboard showing the current authentication state:
- Green: Fully authenticated with both read and write access
- Yellow: Read-only access (API key only)
- Red: No authentication configured

For detailed information about what's needed for full functionality, see [OAUTH_NEEDED.md](OAUTH_NEEDED.md).

## Running the code

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` file with your Google Sheets API key and OAuth Client ID. For full functionality, you need both:
   - Google Sheets API Key (for read operations)
   - Google OAuth 2.0 Client ID (for write operations)

3. For OAuth setup, follow the instructions in [OAUTH_SETUP.md](OAUTH_SETUP.md)

4. Start the development server:
   ```bash
   npm run dev
   ```

## Google Sheets Integration

This application uses Google Sheets as a backend database. To set it up:

1. Follow the instructions in [GOOGLE_SHEETS_INTEGRATION.md](./GOOGLE_SHEETS_INTEGRATION.md)
2. For read-only operations, an API key is sufficient
3. For write operations (adding users and transactions), OAuth 2.0 authentication is required
4. Follow the OAuth setup guide in [OAUTH_SETUP.md](./OAUTH_SETUP.md) to configure OAuth credentials
5. Create a `.env` file based on `.env.example`
6. Add your Google Sheets API key and OAuth Client ID to the `.env` file
7. For troubleshooting common issues, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## Usage

1. On first visit, you'll be prompted to enter your name and phone number
2. After login, you can track your income and expenses
3. All data is stored in your Google Sheet and synchronized in real-time
4. Dashboard displays financial summary with clear visual indicators:
   - Green color for income transactions
   - Red color for expense transactions
   - Status indicator for Google Sheets synchronization
