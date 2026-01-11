import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import GoogleSheetsService from '../services/GoogleSheetsService.server.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Logging Middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Users API
app.post('/api/users', async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    console.log(`Initializing user: ${name} (${phone})`);
    await GoogleSheetsService.initializeUser({ name, phone });
    res.json({ success: true, message: 'User initialized successfully' });
  } catch (error: any) {
    console.error('Error initializing user:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

app.get('/api/users', async (req, res) => {
  // Logic to get all users or check specific user
  // Since we don't have a getAllUsers method explicitly exposed as public with return, 
  // we might want to add one or use the read method.
  // For now, let's implement a simple check or list if needed.
  // But based on requirements "GET /api/users - untuk mengambil data user", 
  // let's assume it might return a list or filter by phone.
  
  try {
    const { phone } = req.query;
    const usersData = await GoogleSheetsService.read('Users!A:B');
    
    // Transform data
    const users = usersData.map((row: any[]) => ({
      name: row[0],
      phone: row[1]
    }));

    if (phone) {
      const user = users.find((u: any) => u.phone === phone);
      if (user) {
        return res.json(user);
      } else {
        return res.status(404).json({ error: 'User not found' });
      }
    }

    res.json(users);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

// Transactions API
app.get('/api/transactions', async (req, res) => {
  try {
    const { phone, name } = req.query;
    
    // If specific user requested
    if (phone && name) {
      const user = { name: String(name), phone: String(phone) };
      console.log(`Fetching transactions for user: ${user.name}`);
      const transactions = await GoogleSheetsService.getTransactions(user);
      return res.json(transactions);
    }

    // Otherwise fetch all transactions
    console.log('Fetching all transactions');
    const rows = await GoogleSheetsService.read('Transactions!A:G');
    const transactions = rows.map((row: any[]) => ({
        id: Number(row[0]),
        date: row[1],
        day: row[2],
        name: row[3],
        amount: Number(row[4]),
        type: row[5] as 'masuk' | 'keluar',
        phone: row[6]
    }));
    res.json(transactions);
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const { transaction, user } = req.body;
    
    if (!transaction || !user) {
      return res.status(400).json({ error: 'Transaction and User data are required' });
    }

    console.log(`Saving transaction for user: ${user.name}`);
    const success = await GoogleSheetsService.saveTransaction(transaction, user);
    
    if (success) {
      res.json({ 
        success: true, 
        message: 'Transaction saved successfully',
        data: transaction 
      });
    } else {
      res.status(500).json({ error: 'Failed to save transaction' });
    }
  } catch (error: any) {
    console.error('Error saving transaction:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API Endpoint: http://localhost:${PORT}/api`);
});
