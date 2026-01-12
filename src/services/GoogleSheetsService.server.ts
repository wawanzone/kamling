import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Transaction {
  id: number;
  date: string;
  day: string;
  name: string;
  amount: number;
  type: 'masuk' | 'keluar';
  phone?: string;
}

interface User {
  name: string;
  phone: string;
}

class GoogleSheetsService {
  private auth: any;
  private sheets: any;
  private spreadsheetId: string | undefined;

  constructor() {
    this.spreadsheetId = process.env.VITE_SPREADSHEET_ID;
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      const credentialsPath = path.join(process.cwd(), 'credentials.json');

      // Validation: Check if file exists
      if (!fs.existsSync(credentialsPath)) {
        throw new Error(`credentials.json not found at ${credentialsPath}`);
      }

      // Validation: Check if valid JSON and has required fields
      const credsRaw = fs.readFileSync(credentialsPath, 'utf-8');
      try {
        const creds = JSON.parse(credsRaw);
        if (!creds.client_email || !creds.private_key) {
          throw new Error('credentials.json is missing client_email or private_key');
        }
      } catch (e) {
        throw new Error('credentials.json is not valid JSON or is malformed');
      }

      this.auth = new google.auth.GoogleAuth({
        keyFile: credentialsPath,
        scopes: [
          'https://www.googleapis.com/auth/spreadsheets',
          'https://www.googleapis.com/auth/drive.file',
        ],
      });

      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      console.log('Google Sheets API Authentication successful');
    } catch (error: any) {
      console.error('Authentication failed:', error.message);
      throw new Error(`Failed to authenticate with Google Sheets API: ${error.message}`);
    }
  }

  /**
   * Ensure the service is initialized before making requests
   */
  private async ensureInitialized() {
    if (!this.sheets) {
      await this.initializeAuth();
    }
  }

  /**
   * Get spreadsheet details including sheet names
   */
  async getSpreadsheetDetails(spreadsheetId?: string) {
    await this.ensureInitialized();
    const targetId = spreadsheetId || this.spreadsheetId;

    if (!targetId) {
      throw new Error('Spreadsheet ID is not configured');
    }

    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: targetId,
      });
      return response.data;
    } catch (error) {
      console.error('Error getting spreadsheet details:', error);
      throw error;
    }
  }

  /**
   * Initialize user in "Users" sheet
   */
  async initializeUser(user: User): Promise<void> {
    await this.ensureInitialized();
    if (!this.spreadsheetId) throw new Error('Spreadsheet ID not configured');

    const sheetName = 'Users';
    // Ensure sheet exists (omitted for brevity, assuming setup correct or handling error)

    // Check if user exists
    const users = await this.read(`${sheetName}!A:B`);
    const exists = users.some((row: any[]) => row[1] === user.phone); // Phone is unique key

    if (!exists) {
      const createdAt = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
      await this.append(sheetName, [[user.name, user.phone, createdAt]]);
      console.log(`[Internal] User initialized: ${user.name}`);
    } else {
      console.log(`[Internal] User already exists: ${user.name}`);
    }
  }

  /**
   * Get transactions for a user
   */
  async getTransactions(user: User): Promise<Transaction[]> {
    await this.ensureInitialized();
    if (!this.spreadsheetId) throw new Error('Spreadsheet ID not configured');

    console.log(`[Internal] Fetching transactions for user: ${user.name} (${user.phone})`);
    const sheetName = 'Transactions';
    const rows = await this.read(`${sheetName}!A:G`);

    // Filter by phone (column G, index 6)
    // Map to Transaction object
    const transactions: Transaction[] = rows
      .filter((row: any[]) => row[6] === user.phone) // Check phone matches
      .map((row: any[]) => ({
        id: Number(row[0]),
        date: row[1],
        day: row[2],
        name: row[3],
        amount: Number(row[4]),
        type: row[5] as 'masuk' | 'keluar',
        phone: row[6]
      }));

    console.log(`[Internal] Found ${transactions.length} transactions for user ${user.name}`);
    return transactions;
  }

  /**
   * Save a transaction
   */
  async saveTransaction(transaction: Transaction, user: User): Promise<boolean> {
    await this.ensureInitialized();
    if (!this.spreadsheetId) throw new Error('Spreadsheet ID not configured');

    const sheetName = 'Transactions';
    const row = [
      transaction.id,
      transaction.date,
      transaction.day,
      transaction.name,
      transaction.amount,
      transaction.type,
      user.phone
    ];

    try {
      console.log(`[Internal] Saving transaction for ${user.name} (${transaction.amount})`);
      await this.append(sheetName, [row]);
      console.log('[Internal] Transaction saved successfully');
      return true;
    } catch (e) {
      console.error('[Internal] Failed to save transaction', e);
      return false;
    }
  }

  /**
   * Append data to a sheet
   */
  async append(range: string, values: any[][], spreadsheetId?: string) {
    await this.ensureInitialized();
    const targetId = spreadsheetId || this.spreadsheetId;
    if (!targetId) throw new Error('Spreadsheet ID not configured');

    try {
      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: targetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values }
      });
      return response.data;
    } catch (error) {
      console.error(`Error appending to ${range}:`, error);
      throw error;
    }
  }

  /**
   * Create a new spreadsheet
   */
  async create(title: string) {
    await this.ensureInitialized();
    try {
      const response = await this.sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title,
          },
        },
      });
      console.log(`Spreadsheet created: ${title} (ID: ${response.data.spreadsheetId})`);
      return response.data;
    } catch (error) {
      console.error('Error creating spreadsheet:', error);
      throw error;
    }
  }

  /**
   * Read data from a specific range
   */
  async read(range: string, spreadsheetId?: string) {
    await this.ensureInitialized();
    const targetId = spreadsheetId || this.spreadsheetId;

    if (!targetId) {
      throw new Error('Spreadsheet ID is not configured');
    }

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: targetId,
        range,
      });
      return response.data.values || [];
    } catch (error) {
      console.error(`Error reading from range ${range}:`, error);
      throw error;
    }
  }

  /**
   * Update data in a specific range
   */
  async update(range: string, values: any[][], spreadsheetId?: string) {
    await this.ensureInitialized();
    const targetId = spreadsheetId || this.spreadsheetId;

    if (!targetId) {
      throw new Error('Spreadsheet ID is not configured');
    }

    try {
      const response = await this.sheets.spreadsheets.values.update({
        spreadsheetId: targetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values,
        },
      });
      console.log(`Updated range ${range} in spreadsheet ${targetId}`);
      return response.data;
    } catch (error) {
      console.error(`Error updating range ${range}:`, error);
      throw error;
    }
  }

  /**
   * Delete data from a specific range (Clear values)
   */
  async delete(range: string, spreadsheetId?: string) {
    await this.ensureInitialized();
    const targetId = spreadsheetId || this.spreadsheetId;

    if (!targetId) {
      throw new Error('Spreadsheet ID is not configured');
    }

    try {
      const response = await this.sheets.spreadsheets.values.clear({
        spreadsheetId: targetId,
        range,
      });
      console.log(`Cleared range ${range} in spreadsheet ${targetId}`);
      return response.data;
    } catch (error) {
      console.error(`Error clearing range ${range}:`, error);
      throw error;
    }
  }
}

export default new GoogleSheetsService();
