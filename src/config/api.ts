// API Configuration for Google Sheets
// This file contains configuration for Google Sheets API integration

export const GOOGLE_SHEETS_CONFIG = {
  // Your Google Sheets spreadsheet ID
  SPREADSHEET_ID: '1MbjeDkD51X0fmr8D_pXvK28mpUq9MQ3IITnQtljTgYM',
  
  // API endpoint configuration
  API_BASE_URL: 'https://sheets.googleapis.com/v4/spreadsheets',
  
  // Sheet names in your Google Sheets document
  SHEETS: {
    USERS: 'Users', // Sheet for storing user information
    TRANSACTIONS: 'Transactions', // Sheet for storing transaction data
  },
  
  // Column mappings for data storage
  COLUMN_MAPPINGS: {
    USERS: {
      NAME: 'A',      // Column A for user name
      PHONE: 'B',     // Column B for phone number
      CREATED_AT: 'C' // Column C for creation timestamp
    },
    TRANSACTIONS: {
      ID: 'A',        // Column A for transaction ID
      DATE: 'B',      // Column B for date
      DAY: 'C',       // Column C for day
      NAME: 'D',      // Column D for user name
      AMOUNT: 'E',    // Column E for amount
      TYPE: 'F',      // Column F for transaction type (masuk/keluar)
      PHONE: 'G'      // Column G for user phone (to link to user)
    }
  }
};

// Function to get API key - in a real app, this would come from environment variables
export const getApiKey = (): string => {
  // In a real application, you would get this from environment variables
  // For now, return an empty string - this would need to be configured properly
  return process.env.REACT_APP_GOOGLE_SHEETS_API_KEY || '';
};