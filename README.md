# Mobile Financial Tracking App

This is a code bundle for Mobile Financial Tracking App. The original project is available at https://www.figma.com/design/BKoFIfm8UkINaegrBv45de/Mobile-Financial-Tracking-App.

## Features

- User authentication with name and phone number
- Google Sheets integration for data storage
- Transaction tracking (income and expenses)
- Real-time data synchronization

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

## Google Sheets Integration

This application uses Google Sheets as a backend database. To set it up:

1. Follow the instructions in [GOOGLE_SHEETS_INTEGRATION.md](./GOOGLE_SHEETS_INTEGRATION.md)
2. Create a `.env` file based on `.env.example`
3. Add your Google Sheets API key to the `.env` file

## Usage

1. On first visit, you'll be prompted to enter your name and phone number
2. After login, you can track your income and expenses
3. All data is stored in your Google Sheet and synchronized in real-time
