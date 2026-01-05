import { useState, useEffect } from 'react';
import { LogOut, TrendingUp, TrendingDown, Plus, Minus, Table, X } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';
import Login from './Login';
import GoogleSheetsService from '../services/GoogleSheetsService';
import OAuthService from '../services/OAuthService';
import GoogleSheetsDataDisplay from './components/data-display/GoogleSheetsDataDisplay';

interface Transaction {
  id: number;
  date: string;
  day: string;
  name: string;
  amount: number;
  type: 'masuk' | 'keluar';
}

interface User {
  name: string;
  phone: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'masuk' | 'keluar'>('masuk');
  const [nominal, setNominal] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDataDisplay, setShowDataDisplay] = useState(false);

  // Process OAuth callback if present in URL
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      // Process the OAuth callback
      const success = OAuthService.processCallback(hash);
      if (success) {
        console.log('OAuth authentication successful');
        // Remove the hash from URL to prevent reprocessing
        window.location.hash = '';
      } else {
        console.error('OAuth authentication failed');
      }
    }
  }, []);

  // Check OAuth status
  const isOAuthConfigured = OAuthService.isConfigured();
  const isOAuthAuthenticated = OAuthService.isAuthenticated();
  const isOAuthTokenExpired = isOAuthAuthenticated && OAuthService.isTokenExpired();

  // Function to initiate OAuth flow
  const initiateOAuth = () => {
    if (!isOAuthConfigured) {
      alert('Google OAuth is not properly configured. Please set VITE_GOOGLE_CLIENT_ID in your environment variables.');
      return;
    }
    const authUrl = OAuthService.getAuthorizationUrl();
    window.location.href = authUrl;
  };

  // Load transactions when user logs in
  useEffect(() => {
    const loadTransactions = async () => {
      if (user) {
        setLoading(true);
        const userTransactions = await GoogleSheetsService.getTransactions(user);
        setTransactions(userTransactions);
        setLoading(false);
      }
    };
    
    loadTransactions();
  }, [user]);

  const handleLogin = async (name: string, phone: string) => {
    const userObj = { name, phone };
    setUser(userObj);
    
    // Initialize user in Google Sheets
    await GoogleSheetsService.initializeUser(userObj);
  };

  const handleLogout = () => {
    setUser(null);
  };

  // If user is not logged in, show login screen
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Calculate totals from actual transactions
  const totalMasuk = transactions
    .filter(t => t.type === 'masuk')  // 'masuk' means income (green)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalKeluar = transactions
    .filter(t => t.type === 'keluar')  // 'keluar' means expenses (red)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalKamling = totalMasuk - totalKeluar;
  const lastMonthChange = 12.5; // percentage (could be calculated based on previous period)

  const handleSave = async () => {
    if (!nominal || !user) return;
    
    const amount = parseInt(nominal);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Nominal harus berupa angka positif');
      return;
    }
    
    // Create transaction object
    const newTransaction: Transaction = {
      id: Date.now(), // Using timestamp as ID for now
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      day: new Date().toLocaleDateString('id-ID', { weekday: 'long' }),
      name: user.name,
      amount: amount,
      type: activeTab
    };
    
    // Save to Google Sheets
    const success = await GoogleSheetsService.saveTransaction(newTransaction, user);
    
    if (success) {
      // Reload transactions from Google Sheets to ensure sync
      const userTransactions = await GoogleSheetsService.getTransactions(user);
      setTransactions(userTransactions);
      // Clear form
      setNominal('');
      setKeterangan('');
      console.log('Transaction saved successfully and data synced from Google Sheets');
      toast.success('Transaksi berhasil disimpan!');
    } else {
      console.error('Failed to save transaction');
      toast.error('Gagal menyimpan transaksi!');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID').format(amount);
  };

  const handleRefresh = async () => {
    if (user) {
      setLoading(true);
      const userTransactions = await GoogleSheetsService.getTransactions(user);
      setTransactions(userTransactions);
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-neutral-50 p-4 flex items-center justify-center">
        <div className="w-full max-w-md">
          {/* Main Card Container */}
          <div className="bg-white rounded-3xl shadow-lg p-6 space-y-6">
            {/* Header Section */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-gray-800">Hey, {user.name}!</h2>
                  <p className="text-sm text-gray-500">{user.phone}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {/* Show Data Button */}
                <button 
                  onClick={() => setShowDataDisplay(!showDataDisplay)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title={showDataDisplay ? "Tutup Data" : "Lihat Semua Data"}
                >
                  {showDataDisplay ? <X className="w-5 h-5 text-gray-600" /> : <Table className="w-5 h-5 text-gray-600" />}
                </button>
                <button 
                  onClick={handleLogout}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <LogOut className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Date */}
            <div className="text-sm text-gray-600">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>

            {/* Summary Section */}
            <div className="text-center space-y-2">
              <div className="text-4xl text-gray-800">
                Rp {formatCurrency(totalKamling)}
              </div>
              <div className="text-gray-500">Total Uang Kamling</div>
              <div className="flex items-center justify-center gap-2 text-sm">
                {lastMonthChange > 0 ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-green-500">+{lastMonthChange}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4 text-red-500" />
                    <span className="text-red-500">{lastMonthChange}%</span>
                  </>
                )}
                <span className="text-gray-500">dari bulan lalu</span>
              </div>
              
              {/* Integration Status Indicator */}
              <div className="mt-3">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${
                  isOAuthConfigured && isOAuthAuthenticated && !isOAuthTokenExpired 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    isOAuthConfigured && isOAuthAuthenticated && !isOAuthTokenExpired 
                      ? 'bg-green-500' 
                      : 'bg-yellow-500'
                  }`}></div>
                  {isOAuthConfigured && isOAuthAuthenticated && !isOAuthTokenExpired 
                    ? 'Sinkronisasi Aktif' 
                    : 'Sinkronisasi Terbatas'}
                </div>
              </div>
            </div>

            {/* Total Masuk & Keluar Cards */}
            <div className="grid grid-cols-2 gap-4">
              {/* Total Masuk */}
              <div className="bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-2xl p-4 text-white shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <Plus className="w-5 h-5" />
                  <span className="text-sm opacity-90">Total Masuk</span>
                </div>
                <div className="text-xl">
                  Rp {formatCurrency(totalMasuk)}
                </div>
              </div>

              {/* Total Keluar */}
              <div className="bg-gradient-to-br from-rose-400 to-rose-500 rounded-2xl p-4 text-white shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <Minus className="w-5 h-5" />
                  <span className="text-sm opacity-90">Total Keluar</span>
                </div>
                <div className="text-xl">
                  Rp {formatCurrency(totalKeluar)}
                </div>
              </div>
            </div>

            {/* Direct Input Section */}
            <div className="space-y-4">
              {/* Tab Switcher */}
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setActiveTab('masuk')}
                  className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                    activeTab === 'masuk'
                      ? 'bg-white shadow-sm text-emerald-600'
                      : 'text-gray-600'
                  }`}
                >
                  Masuk
                </button>
                <button
                  onClick={() => setActiveTab('keluar')}
                  className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                    activeTab === 'keluar'
                      ? 'bg-white shadow-sm text-rose-600'
                      : 'text-gray-600'
                  }`}
                >
                  Keluar
                </button>
              </div>

              {/* Input Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Nominal *
                  </label>
                  <input
                    type="number"
                    value={nominal}
                    onChange={(e) => setNominal(e.target.value)}
                    placeholder="Masukkan nominal"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Keterangan (opsional)
                  </label>
                  <input
                    type="text"
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                    placeholder="Tambahkan keterangan"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>

                <button
                  onClick={handleSave}
                  className={`w-full py-3 rounded-xl text-white shadow-md transition-all ${
                    activeTab === 'masuk'
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700'
                      : 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700'
                  }`}
                >
                  Simpan
                </button>
              </div>
            </div>

            {/* Recent Transactions Section */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-gray-800">Transaksi Terkini</h3>
                <button 
                  onClick={handleRefresh}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  title="Refresh data dari Google Sheets"
                >
                  Refresh
                </button>
              </div>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="mt-2 text-gray-600">Memuat transaksi...</p>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500">Belum ada transaksi</p>
                  </div>
                ) : (
                  transactions.slice(0, 10).map((transaction) => (  // Show only 10 most recent transactions
                    <div
                      key={transaction.id}
                      className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="text-gray-800">{transaction.day}</div>
                          <div className="text-sm text-gray-500">{transaction.date}</div>
                          <div className="text-sm text-gray-600 mt-1">{transaction.name}</div>
                        </div>
                        <div
                          className={`text-lg font-semibold ${
                            transaction.type === 'masuk'
                              ? 'text-emerald-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {transaction.type === 'masuk' ? '+' : '-'} {formatCurrency(transaction.amount)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Google Sheets Data Display Modal */}
        {showDataDisplay && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Data dari Google Sheets</h2>
                  <button 
                    onClick={() => setShowDataDisplay(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <GoogleSheetsDataDisplay />
              </div>
            </div>
          </div>
        )}
      </div>
      <Toaster position="top-center" />
    </>
  );
}
