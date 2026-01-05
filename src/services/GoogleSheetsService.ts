// Google Sheets API Service
// This service will handle all interactions with Google Sheets API using fetch
// Note: API keys only work for public sheets and read operations
// For write operations, we now support OAuth 2.0 authentication

import { GOOGLE_SHEETS_CONFIG, getApiKey } from '../config/api';
import OAuthService from './OAuthService';

interface User {
  name: string;
  phone: string;
}

interface Transaction {
  id: number;
  date: string;
  day: string;
  name: string;
  amount: number;
  type: 'masuk' | 'keluar';
}

// Local storage keys
const LOCAL_STORAGE_KEYS = {
  USERS: 'app_users',
  TRANSACTIONS: 'app_transactions'
};

class GoogleSheetsService {
  private SPREADSHEET_ID = GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID;
  private API_KEY = getApiKey();

  constructor() {
    // Validate that API key exists
    if (!this.API_KEY) {
      console.warn('Google Sheets API key not found. Read operations may fail.');
    }
  }

  // Initialize local storage if not present
  private initializeLocalStorage(): void {
    if (!localStorage.getItem(LOCAL_STORAGE_KEYS.USERS)) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify([]));
    }
    if (!localStorage.getItem(LOCAL_STORAGE_KEYS.TRANSACTIONS)) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
    }
  }

  // Get users from local storage
  private getLocalUsers(): User[] {
    this.initializeLocalStorage();
    const usersStr = localStorage.getItem(LOCAL_STORAGE_KEYS.USERS);
    return usersStr ? JSON.parse(usersStr) : [];
  }

  // Add user to local storage
  private addLocalUser(user: User): void {
    this.initializeLocalStorage();
    const users = this.getLocalUsers();
    // Check if user already exists
    const existingUser = users.find(u => u.phone === user.phone);
    if (!existingUser) {
      users.push(user);
      localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(users));
    }
  }

  // Get transactions from local storage
  private getLocalTransactions(): Transaction[] {
    this.initializeLocalStorage();
    const transactionsStr = localStorage.getItem(LOCAL_STORAGE_KEYS.TRANSACTIONS);
    return transactionsStr ? JSON.parse(transactionsStr) : [];
  }

  // Add transaction to local storage
  private addLocalTransaction(transaction: Transaction): void {
    this.initializeLocalStorage();
    const transactions = this.getLocalTransactions();
    // Check if transaction already exists
    const existingTransaction = transactions.find(t => t.id === transaction.id);
    if (!existingTransaction) {
      transactions.push(transaction);
      localStorage.setItem(LOCAL_STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    }
  }

  // Get user transactions from local storage
  private getUserLocalTransactions(phone: string): Transaction[] {
    this.initializeLocalStorage();
    const transactions = this.getLocalTransactions();
    return transactions.filter(t => t.name === phone || (t as any).phone === phone);
  }

  async initializeUser(user: User): Promise<boolean> {
    try {
      // Check if user already exists in the sheet
      const userExists = await this.checkUserExists(user.phone);
      
      if (!userExists) {
        // Add user to the users sheet
        await this.addUserToSheet(user);
      }
      
      // Always add to local storage as backup
      this.addLocalUser(user);
      
      return true;
    } catch (error) {
      console.error('Error initializing user:', error);
      // Still try to save to local storage even if there's an error
      try {
        this.addLocalUser(user);
      } catch (localError) {
        console.error('Error saving user locally:', localError);
      }
      return false;
    }
  }

  async checkUserExists(phone: string): Promise<boolean> {
    try {
      // Debug: Log the API call details
      console.log('Checking user existence with API call:');
      console.log('Spreadsheet ID:', this.SPREADSHEET_ID);
      console.log('Sheet:', GOOGLE_SHEETS_CONFIG.SHEETS.USERS);
      console.log('Column mapping:', GOOGLE_SHEETS_CONFIG.COLUMN_MAPPINGS.USERS.PHONE);
      console.log('API Key available:', !!this.API_KEY);
      console.log('Full URL:', `${GOOGLE_SHEETS_CONFIG.API_BASE_URL}/${this.SPREADSHEET_ID}/values/${GOOGLE_SHEETS_CONFIG.SHEETS.USERS}!${GOOGLE_SHEETS_CONFIG.COLUMN_MAPPINGS.USERS.PHONE}2:${GOOGLE_SHEETS_CONFIG.COLUMN_MAPPINGS.USERS.PHONE}?key=${this.API_KEY ? '***HIDDEN***' : 'MISSING'}`);
      
      // Check if the expected sheet exists by first getting spreadsheet info
      const sheetExists = await this.verifySheetExists(GOOGLE_SHEETS_CONFIG.SHEETS.USERS);
      if (!sheetExists) {
        console.warn(`Sheet "${GOOGLE_SHEETS_CONFIG.SHEETS.USERS}" does not exist. Using fallback behavior.`);
        return false;
      }
      
      // Fetch all users from the Users sheet
      const response = await fetch(
        `${GOOGLE_SHEETS_CONFIG.API_BASE_URL}/${this.SPREADSHEET_ID}/values/${GOOGLE_SHEETS_CONFIG.SHEETS.USERS}!${GOOGLE_SHEETS_CONFIG.COLUMN_MAPPINGS.USERS.PHONE}2:${GOOGLE_SHEETS_CONFIG.COLUMN_MAPPINGS.USERS.PHONE}?key=${this.API_KEY}`
      );
      
      console.log('Response status:', response.status);
      console.log('Response status text:', response.statusText);
      
      if (!response.ok) {
        // Handle authentication errors gracefully
        if (response.status === 401 || response.status === 403) {
          console.warn('Read operations require proper authentication. Assuming user does not exist.');
          return false;
        }
        // For 400 errors, get more details
        if (response.status === 400) {
          const errorText = await response.text();
          console.error('Bad Request details:', errorText);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('User data fetched successfully:', data);
      const phoneValues = data.values || [];
      
      // Check if the phone number exists in the list
      const exists = phoneValues.some((row: string[]) => row[0] === phone);
      console.log('User exists result:', exists);
      return exists;
    } catch (error) {
      console.error('Error checking user existence:', error);
      // In case of error, assume user doesn't exist to prevent blocking
      return false;
    }
  }

  async addUserToSheet(user: User): Promise<void> {
    try {
      // Prepare the data to be inserted
      const values = [
        [
          user.name,
          user.phone,
          new Date().toISOString() // Creation timestamp
        ]
      ];

      // Check if the expected sheet exists before attempting write
      const sheetExists = await this.verifySheetExists(GOOGLE_SHEETS_CONFIG.SHEETS.USERS);
      if (!sheetExists) {
        console.warn(`Sheet "${GOOGLE_SHEETS_CONFIG.SHEETS.USERS}" does not exist. Cannot add user.`);
        return;
      }

      // Debug: Log the API call details
      console.log('Adding user to sheet with API call:');
      console.log('Spreadsheet ID:', this.SPREADSHEET_ID);
      console.log('Sheet:', GOOGLE_SHEETS_CONFIG.SHEETS.USERS);
      console.log('API Key available:', !!this.API_KEY);
      console.log('Data to insert:', values);
      console.log('Full URL:', `${GOOGLE_SHEETS_CONFIG.API_BASE_URL}/${this.SPREADSHEET_ID}/values/${GOOGLE_SHEETS_CONFIG.SHEETS.USERS}!A1:append?valueInputOption=USER_ENTERED&key=${this.API_KEY ? '***HIDDEN***' : 'MISSING'}`);

      // Use Google Sheets API to append the user data
      // First try with OAuth token if available, otherwise fall back to API key
      let headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Use OAuth token if available and valid, otherwise use API key
      if (OAuthService.isAuthenticated() && !OAuthService.isTokenExpired()) {
        headers['Authorization'] = `Bearer ${OAuthService.getAccessToken()}`;
      } else {
        // If no OAuth token, add to local storage as fallback and return
        console.warn('No valid OAuth token available for write operation. Data saved locally only.');
        this.addLocalUser(user);
        return;
      }
      
      const response = await fetch(
        `${GOOGLE_SHEETS_CONFIG.API_BASE_URL}/${this.SPREADSHEET_ID}/values/${GOOGLE_SHEETS_CONFIG.SHEETS.USERS}!A1:append?valueInputOption=USER_ENTERED`,
        {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            values: values
          })
        }
      );

      console.log('Add user response status:', response.status);
      console.log('Add user response status text:', response.statusText);

      if (!response.ok) {
        // Handle specific error codes
        if (response.status === 401 || response.status === 403) {
          console.warn('Write operations require proper authentication. Using fallback to local storage.');
          // Add to local storage as fallback
          this.addLocalUser(user);
          return;
        }
        // For 400 errors, get more details
        if (response.status === 400) {
          const errorText = await response.text();
          console.error('Bad Request details for user add:', errorText);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      console.log('User added successfully to Google Sheets');
    } catch (error) {
      console.error('Error adding user to Google Sheets:', error);
      // Add to local storage as fallback when API fails
      console.warn('Adding user to local storage as fallback...');
      this.addLocalUser(user);
    }
  }

  async saveTransaction(transaction: Transaction, user: User): Promise<boolean> {
    try {
      // Add transaction to the transactions sheet
      await this.addTransactionToSheet(transaction, user);
      
      // Always save to local storage as backup
      this.addLocalTransaction(transaction);
      return true;
    } catch (error) {
      console.error('Error saving transaction:', error);
      // Still try to save to local storage even if there's an error
      try {
        this.addLocalTransaction(transaction);
      } catch (localError) {
        console.error('Error saving transaction locally:', localError);
      }
      return false;
    }
  }

  async addTransactionToSheet(transaction: Transaction, user: User): Promise<void> {
    try {
      // Prepare the data to be inserted
      const values = [
        [
          transaction.id.toString(), // ID
          transaction.date,          // Date
          transaction.day,           // Day
          transaction.name,          // Name
          transaction.amount.toString(), // Amount
          transaction.type,          // Type
          user.phone                 // Phone (to link to user)
        ]
      ];

      // Check if the expected sheet exists before attempting write
      const sheetExists = await this.verifySheetExists(GOOGLE_SHEETS_CONFIG.SHEETS.TRANSACTIONS);
      if (!sheetExists) {
        console.warn(`Sheet "${GOOGLE_SHEETS_CONFIG.SHEETS.TRANSACTIONS}" does not exist. Cannot add transaction.`);
        return;
      }

      // Debug: Log the API call details
      console.log('Adding transaction to sheet with API call:');
      console.log('Spreadsheet ID:', this.SPREADSHEET_ID);
      console.log('Sheet:', GOOGLE_SHEETS_CONFIG.SHEETS.TRANSACTIONS);
      console.log('API Key available:', !!this.API_KEY);
      console.log('Data to insert:', values);
      console.log('Full URL:', `${GOOGLE_SHEETS_CONFIG.API_BASE_URL}/${this.SPREADSHEET_ID}/values/${GOOGLE_SHEETS_CONFIG.SHEETS.TRANSACTIONS}!A1:append?valueInputOption=USER_ENTERED&key=${this.API_KEY ? '***HIDDEN***' : 'MISSING'}`);

      // Use Google Sheets API to append the transaction data
      // First try with OAuth token if available, otherwise fall back to API key
      let headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Use OAuth token if available and valid, otherwise use API key
      if (OAuthService.isAuthenticated() && !OAuthService.isTokenExpired()) {
        headers['Authorization'] = `Bearer ${OAuthService.getAccessToken()}`;
      } else {
        // If no OAuth token, return without error to allow app to continue
        console.warn('No valid OAuth token available for write operation. Data saved locally only.');
        return;
      }
      
      const response = await fetch(
        `${GOOGLE_SHEETS_CONFIG.API_BASE_URL}/${this.SPREADSHEET_ID}/values/${GOOGLE_SHEETS_CONFIG.SHEETS.TRANSACTIONS}!A1:append?valueInputOption=USER_ENTERED`,
        {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            values: values
          })
        }
      );

      console.log('Add transaction response status:', response.status);
      console.log('Add transaction response status text:', response.statusText);

      if (!response.ok) {
        // Handle specific error codes
        if (response.status === 401 || response.status === 403) {
          console.warn('Write operations require proper authentication. Using fallback to local storage.');
          return;
          // Fallback: don't throw error, just warn - user can still proceed
          return;
        }
        // For 400 errors, get more details
        if (response.status === 400) {
          const errorText = await response.text();
          console.error('Bad Request details for transaction add:', errorText);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      console.log('Transaction added successfully');
    } catch (error) {
      console.error('Error adding transaction to sheet:', error);
      // Don't throw error for write failures, just warn
      // This allows the app to continue functioning
      console.warn('Failed to add transaction to sheet, but continuing...');
    }
  }

  async getTransactions(user: User): Promise<Transaction[]> {
    try {
      // Debug: Log the API call details
      console.log('Fetching transactions with API call:');
      console.log('Spreadsheet ID:', this.SPREADSHEET_ID);
      console.log('Sheet:', GOOGLE_SHEETS_CONFIG.SHEETS.TRANSACTIONS);
      console.log('API Key available:', !!this.API_KEY);
      console.log('Full URL:', `${GOOGLE_SHEETS_CONFIG.API_BASE_URL}/${this.SPREADSHEET_ID}/values/${GOOGLE_SHEETS_CONFIG.SHEETS.TRANSACTIONS}!A1:G?key=${this.API_KEY ? '***HIDDEN***' : 'MISSING'}`);
      
      // Check if the expected sheet exists by first getting spreadsheet info
      const sheetExists = await this.verifySheetExists(GOOGLE_SHEETS_CONFIG.SHEETS.TRANSACTIONS);
      if (!sheetExists) {
        console.warn(`Sheet "${GOOGLE_SHEETS_CONFIG.SHEETS.TRANSACTIONS}" does not exist. Returning mock data.`);
        // Return mock data in case of missing sheet
        return [
          {
            id: 1,
            date: '1 Jan 2026',
            day: 'Malam Jumat',
            name: user.name,
            amount: 23000,
            type: 'masuk'
          },
          {
            id: 2,
            date: '31 Des 2025',
            day: 'Malam Kamis',
            name: user.name,
            amount: 19000,
            type: 'masuk'
          },
          {
            id: 3,
            date: '31 Des 2025',
            day: 'Malam Kamis',
            name: user.name,
            amount: 15000,
            type: 'keluar'
          },
          {
            id: 4,
            date: '30 Des 2025',
            day: 'Malam Rabu',
            name: user.name,
            amount: 30000,
            type: 'masuk'
          }
        ];
      }

      // Fetch transactions for the specific user
      // First, get all transactions
      const response = await fetch(
        `${GOOGLE_SHEETS_CONFIG.API_BASE_URL}/${this.SPREADSHEET_ID}/values/${GOOGLE_SHEETS_CONFIG.SHEETS.TRANSACTIONS}!A1:G?key=${this.API_KEY}`
      );
      
      console.log('Response status:', response.status);
      console.log('Response status text:', response.statusText);
      
      if (!response.ok) {
        // Handle authentication errors gracefully
        if (response.status === 401 || response.status === 403) {
          console.warn('Read operations require proper authentication. Returning mock data.');
          // Return mock data in case of authentication error
          return [
            {
              id: 1,
              date: '1 Jan 2026',
              day: 'Malam Jumat',
              name: user.name,
              amount: 23000,
              type: 'masuk'
            },
            {
              id: 2,
              date: '31 Des 2025',
              day: 'Malam Kamis',
              name: user.name,
              amount: 19000,
              type: 'masuk'
            },
            {
              id: 3,
              date: '31 Des 2025',
              day: 'Malam Kamis',
              name: user.name,
              amount: 15000,
              type: 'keluar'
            },
            {
              id: 4,
              date: '30 Des 2025',
              day: 'Malam Rabu',
              name: user.name,
              amount: 30000,
              type: 'masuk'
            }
          ];
        }
        // For 400 errors, get more details
        if (response.status === 400) {
          const errorText = await response.text();
          console.error('Bad Request details:', errorText);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Transaction data fetched successfully:', data);
      const rows = data.values || [];
      
      // Map all transactions without filtering by user phone
      // This ensures all transactions from the sheet are displayed in the "Transaksi Terkini" section
      const userTransactions = rows
        .slice(1) // Skip header row
        .map((row: string[]): Transaction => {
          // Normalize the type value to lowercase and handle case variations
          let typeValue = (row[5] || 'masuk').toLowerCase();
          if (typeValue === 'masuk' || typeValue === 'income' || typeValue === 'in') {
            typeValue = 'masuk';
          } else if (typeValue === 'keluar' || typeValue === 'expense' || typeValue === 'out') {
            typeValue = 'keluar';
          }
          
          return {
            id: parseInt(row[0]) || Date.now(),
            date: row[1] || '',
            day: row[2] || '',
            name: row[3] || user.name,
            amount: parseInt(row[4]) || 0,
            type: typeValue as 'masuk' | 'keluar' || 'masuk'
          };
        })
        .sort((a, b) => b.id - a.id); // Sort by ID (timestamp) in descending order (newest first)
      
      console.log('User transactions filtered:', userTransactions);
      return userTransactions;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Return mock data in case of error
      return [
        {
          id: 1,
          date: '1 Jan 2026',
          day: 'Malam Jumat',
          name: user.name,
          amount: 23000,
          type: 'masuk'
        },
        {
          id: 2,
          date: '31 Des 2025',
          day: 'Malam Kamis',
          name: user.name,
          amount: 19000,
          type: 'masuk'
        },
        {
          id: 3,
          date: '31 Des 2025',
          day: 'Malam Kamis',
          name: user.name,
          amount: 15000,
          type: 'keluar'
        },
        {
          id: 4,
          date: '30 Des 2025',
          day: 'Malam Rabu',
          name: user.name,
          amount: 30000,
          type: 'masuk'
        }
      ];
    }
  }

  // Helper method to verify if a sheet exists in the spreadsheet
  private async verifySheetExists(sheetName: string): Promise<boolean> {
    try {
      // Get spreadsheet metadata to check if the sheet exists
      const response = await fetch(
        `${GOOGLE_SHEETS_CONFIG.API_BASE_URL}/${this.SPREADSHEET_ID}?key=${this.API_KEY}`
      );
      
      if (!response.ok) {
        console.error(`Failed to get spreadsheet metadata: ${response.status} ${response.statusText}`);
        return false;
      }
      
      const spreadsheetData = await response.json();
      const sheetNames = spreadsheetData.sheets?.map((sheet: any) => sheet.properties.title) || [];
      
      console.log(`Available sheets in spreadsheet:`, sheetNames);
      console.log(`Looking for sheet: ${sheetName}`);
      
      const exists = sheetNames.includes(sheetName);
      console.log(`Sheet "${sheetName}" exists:`, exists);
      
      return exists;
    } catch (error) {
      console.error(`Error verifying sheet existence:`, error);
      return false;
    }
  }

  // Get all users from the Google Sheets
  async getAllUsers(): Promise<User[]> {
    try {
      console.log('Fetching all users from Google Sheets...');
      
      // Check if the Users sheet exists
      const sheetExists = await this.verifySheetExists(GOOGLE_SHEETS_CONFIG.SHEETS.USERS);
      if (!sheetExists) {
        console.warn(`Users sheet does not exist. Returning empty array.`);
        return [];
      }
      
      // Fetch all users from the Users sheet
      const response = await fetch(
        `${GOOGLE_SHEETS_CONFIG.API_BASE_URL}/${this.SPREADSHEET_ID}/values/${GOOGLE_SHEETS_CONFIG.SHEETS.USERS}!A1:C?key=${this.API_KEY}`
      );
      
      console.log('Get all users response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.warn('Read operations require proper authentication. Returning empty array.');
          return [];
        }
        // For 400 errors, get more details
        if (response.status === 400) {
          const errorText = await response.text();
          console.error('Bad Request details:', errorText);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('All users data fetched successfully:', data);
      const rows = data.values || [];
      
      // Skip the header row and map to User objects
      const users = rows.slice(1).map((row: string[]): User => {
        return {
          name: row[0] || '',
          phone: row[1] || ''
        };
      });
      
      console.log('All users processed:', users);
      return users;
    } catch (error) {
      console.error('Error fetching all users:', error);
      return [];
    }
  }

  // Get all transactions from the Google Sheets
  async getAllTransactions(): Promise<Transaction[]> {
    try {
      console.log('Fetching all transactions from Google Sheets...');
      
      // Check if the Transactions sheet exists
      const sheetExists = await this.verifySheetExists(GOOGLE_SHEETS_CONFIG.SHEETS.TRANSACTIONS);
      if (!sheetExists) {
        console.warn(`Transactions sheet does not exist. Returning empty array.`);
        return [];
      }
      
      // Fetch all transactions from the Transactions sheet
      const response = await fetch(
        `${GOOGLE_SHEETS_CONFIG.API_BASE_URL}/${this.SPREADSHEET_ID}/values/${GOOGLE_SHEETS_CONFIG.SHEETS.TRANSACTIONS}!A1:G?key=${this.API_KEY}`
      );
      
      console.log('Get all transactions response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.warn('Read operations require proper authentication. Returning empty array.');
          return [];
        }
        // For 400 errors, get more details
        if (response.status === 400) {
          const errorText = await response.text();
          console.error('Bad Request details:', errorText);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('All transactions data fetched successfully:', data);
      const rows = data.values || [];
      
      // Skip the header row and map to Transaction objects
      const transactions = rows.slice(1).map((row: string[]): Transaction => {
        // Normalize the type value to lowercase and handle case variations
        let typeValue = (row[5] || 'masuk').toLowerCase();
        if (typeValue === 'masuk' || typeValue === 'income' || typeValue === 'in') {
          typeValue = 'masuk';
        } else if (typeValue === 'keluar' || typeValue === 'expense' || typeValue === 'out') {
          typeValue = 'keluar';
        }
        
        return {
          id: parseInt(row[0]) || Date.now(),
          date: row[1] || '',
          day: row[2] || '',
          name: row[3] || '',
          amount: parseInt(row[4]) || 0,
          type: typeValue as 'masuk' | 'keluar' || 'masuk'
        };
      });

      // Sort transactions by ID (timestamp) in descending order (newest first)
      transactions.sort((a, b) => b.id - a.id);
      
      console.log('All transactions processed:', transactions);
      return transactions;
    } catch (error) {
      console.error('Error fetching all transactions:', error);
      return [];
    }
  }
}

export default new GoogleSheetsService();
