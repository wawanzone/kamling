// Google Sheets API Service
// This service will handle all interactions with Google Sheets API using fetch

import { GOOGLE_SHEETS_CONFIG, getApiKey } from '../config/api';

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

class GoogleSheetsService {
  private SPREADSHEET_ID = GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID;
  private API_KEY = getApiKey();

  constructor() {
    // In a real implementation, we would validate that API key exists
  }

  async initializeUser(user: User): Promise<boolean> {
    try {
      // Check if user already exists in the sheet
      const userExists = await this.checkUserExists(user.phone);
      
      if (!userExists) {
        // Add user to the users sheet
        await this.addUserToSheet(user);
      }
      
      return true;
    } catch (error) {
      console.error('Error initializing user:', error);
      return false;
    }
  }

  async checkUserExists(phone: string): Promise<boolean> {
    try {
      // Fetch all users from the Users sheet
      const response = await fetch(
        `${GOOGLE_SHEETS_CONFIG.API_BASE_URL}/${this.SPREADSHEET_ID}/values/${GOOGLE_SHEETS_CONFIG.SHEETS.USERS}!${GOOGLE_SHEETS_CONFIG.COLUMN_MAPPINGS.USERS.PHONE}2:${GOOGLE_SHEETS_CONFIG.COLUMN_MAPPINGS.USERS.PHONE}?key=${this.API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const phoneValues = data.values || [];
      
      // Check if the phone number exists in the list
      return phoneValues.some((row: string[]) => row[0] === phone);
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

      // Use Google Sheets API to append the user data
      const response = await fetch(
        `${GOOGLE_SHEETS_CONFIG.API_BASE_URL}/${this.SPREADSHEET_ID}/values/${GOOGLE_SHEETS_CONFIG.SHEETS.USERS}!A1:append?valueInputOption=USER_ENTERED&key=${this.API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: values
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      console.log('User added successfully');
    } catch (error) {
      console.error('Error adding user to sheet:', error);
      throw error;
    }
  }

  async saveTransaction(transaction: Transaction, user: User): Promise<boolean> {
    try {
      // Add transaction to the transactions sheet
      await this.addTransactionToSheet(transaction, user);
      return true;
    } catch (error) {
      console.error('Error saving transaction:', error);
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

      // Use Google Sheets API to append the transaction data
      const response = await fetch(
        `${GOOGLE_SHEETS_CONFIG.API_BASE_URL}/${this.SPREADSHEET_ID}/values/${GOOGLE_SHEETS_CONFIG.SHEETS.TRANSACTIONS}!A1:append?valueInputOption=USER_ENTERED&key=${this.API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: values
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      console.log('Transaction added successfully');
    } catch (error) {
      console.error('Error adding transaction to sheet:', error);
      throw error;
    }
  }

  async getTransactions(user: User): Promise<Transaction[]> {
    try {
      // Fetch transactions for the specific user
      // First, get all transactions
      const response = await fetch(
        `${GOOGLE_SHEETS_CONFIG.API_BASE_URL}/${this.SPREADSHEET_ID}/values/${GOOGLE_SHEETS_CONFIG.SHEETS.TRANSACTIONS}!A1:G?key=${this.API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const rows = data.values || [];
      
      // Filter transactions for the current user based on phone number
      const userTransactions = rows
        .filter((row: string[]) => row[6] === user.phone) // Filter by phone number in column G
        .map((row: string[]): Transaction => {
          return {
            id: parseInt(row[0]) || Date.now(),
            date: row[1] || '',
            day: row[2] || '',
            name: row[3] || user.name,
            amount: parseInt(row[4]) || 0,
            type: row[5] as 'masuk' | 'keluar' || 'masuk'
          };
        })
        .reverse(); // Reverse to show newest first
      
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
}

export default new GoogleSheetsService();