import { useState, useEffect } from 'react';
import GoogleSheetsService from '../../../services/GoogleSheetsService';

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

export default function GoogleSheetsDataDisplay() {
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all users and transactions from Google Sheets
        const [allUsers, allTransactions] = await Promise.all([
          GoogleSheetsService.getAllUsers(),
          GoogleSheetsService.getAllTransactions()
        ]);
        
        setUsers(allUsers);
        setTransactions(allTransactions);
      } catch (err) {
        console.error('Error fetching data from Google Sheets:', err);
        setError('Gagal mengambil data dari Google Sheets');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Memuat data dari Google Sheets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  // Calculate totals
  const totalMasuk = transactions
    .filter(t => t.type === 'masuk')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalKeluar = transactions
    .filter(t => t.type === 'keluar')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalKamling = totalMasuk - totalKeluar;

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Data dari Google Sheets</h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl p-4 text-white shadow-md">
          <div className="text-sm opacity-90">Total Users</div>
          <div className="text-2xl font-bold">{users.length}</div>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-2xl p-4 text-white shadow-md">
          <div className="text-sm opacity-90">Total Masuk</div>
          <div className="text-2xl font-bold">{formatCurrency(totalMasuk)}</div>
        </div>
        
        <div className="bg-gradient-to-br from-rose-400 to-rose-500 rounded-2xl p-4 text-white shadow-md">
          <div className="text-sm opacity-90">Total Keluar</div>
          <div className="text-2xl font-bold">{formatCurrency(totalKeluar)}</div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-2xl p-4 text-white shadow-md">
        <div className="text-sm opacity-90">Total Saldo</div>
        <div className="text-2xl font-bold">{formatCurrency(totalKamling)}</div>
      </div>

      {/* Users Table */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">Daftar Pengguna</h3>
        {users.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            Tidak ada data pengguna ditemukan
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Nama</th>
                  <th className="px-4 py-2 text-left">Nomor HP</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-2">{user.name}</td>
                    <td className="px-4 py-2">{user.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transactions Table */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">Daftar Transaksi</h3>
        {transactions.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            Tidak ada data transaksi ditemukan
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Tanggal</th>
                  <th className="px-4 py-2 text-left">Hari</th>
                  <th className="px-4 py-2 text-left">Nama</th>
                  <th className="px-4 py-2 text-left">Jumlah</th>
                  <th className="px-4 py-2 text-left">Tipe</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-2">{transaction.id}</td>
                    <td className="px-4 py-2">{transaction.date}</td>
                    <td className="px-4 py-2">{transaction.day}</td>
                    <td className="px-4 py-2">{transaction.name}</td>
                    <td className="px-4 py-2">
                      <span className={transaction.type === 'masuk' ? 'text-emerald-600' : 'text-rose-600'}>
                        {transaction.type === 'masuk' ? '+' : '-'} {formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        transaction.type === 'masuk' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}