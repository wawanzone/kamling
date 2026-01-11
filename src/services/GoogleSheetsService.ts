
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

const API_BASE_URL = 'http://localhost:3001/api';

class GoogleSheetsService {
  // Client-side implementation that calls the backend API

  async initializeUser(user: User): Promise<void> {
    console.log(`[Client] Initializing user: ${user.name}`);
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }
      console.log('[Client] User initialization successful');
    } catch (error) {
      console.error('[Client] Failed to initialize user:', error);
      // Fallback or rethrow depending on UX needs. For now, log and continue (maybe offline mode?)
      throw error;
    }
  }

  async getTransactions(user: User): Promise<Transaction[]> {
    console.log(`[Client] Fetching transactions for: ${user.name}`);
    try {
      const params = new URLSearchParams({
        phone: parseInt(user.phone).toString(),
        name: user.name
      });

      const response = await fetch(`${API_BASE_URL}/transactions?${params.toString()}`);

      console.log(response)

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const transactions = await response.json();
      console.log(`[Client] Fetched ${transactions.length} transactions`);
      return transactions;
    } catch (error) {
      console.error('[Client] Failed to fetch transactions:', error);
      return [];
    }
  }

  async getAllUsers(): Promise<User[]> {
    console.log('[Client] Fetching all users');
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      if (!response.ok) throw new Error(response.statusText);
      return await response.json();
    } catch (error) {
      console.error('[Client] Failed to fetch all users:', error);
      return [];
    }
  }

  async getAllTransactions(): Promise<Transaction[]> {
    console.log('[Client] Fetching all transactions');
    try {
      const response = await fetch(`${API_BASE_URL}/transactions`);
      if (!response.ok) throw new Error(response.statusText);
      return await response.json();
    } catch (error) {
      console.error('[Client] Failed to fetch all transactions:', error);
      return [];
    }
  }

  async saveTransaction(transaction: Transaction, user: User): Promise<{ success: boolean; data?: Transaction }> {
    console.log('[Client] Saving transaction...');
    try {
      const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transaction, user }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('[Client] Transaction saved:', result);
      return { success: result.success, data: result.data };
    } catch (error) {
      console.error('[Client] Failed to save transaction:', error);
      return { success: false };
    }
  }
}

export default new GoogleSheetsService();
