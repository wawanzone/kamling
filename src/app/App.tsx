import { useState } from 'react';
import { LogOut, TrendingUp, TrendingDown, Plus, Minus } from 'lucide-react';
import exampleImage from 'figma:asset/79031c485935095e720ea9f69b24c9432ddcb1b7.png';

interface Transaction {
  id: number;
  date: string;
  day: string;
  name: string;
  amount: number;
  type: 'masuk' | 'keluar';
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'masuk' | 'keluar'>('masuk');
  const [nominal, setNominal] = useState('');
  const [keterangan, setKeterangan] = useState('');

  // Mock data
  const totalKamling = 4586000;
  const lastMonthChange = 12.5; // percentage
  const totalMasuk = 2450000;
  const totalKeluar = 710000;

  const transactions: Transaction[] = [
    {
      id: 1,
      date: '1 Jan 2026',
      day: 'Malam Jumat',
      name: 'Ronald',
      amount: 23000,
      type: 'masuk'
    },
    {
      id: 2,
      date: '31 Des 2025',
      day: 'Malam Kamis',
      name: 'Alex',
      amount: 19000,
      type: 'masuk'
    },
    {
      id: 3,
      date: '31 Des 2025',
      day: 'Malam Kamis',
      name: 'Sarah',
      amount: 15000,
      type: 'keluar'
    },
    {
      id: 4,
      date: '30 Des 2025',
      day: 'Malam Rabu',
      name: 'Budi',
      amount: 30000,
      type: 'masuk'
    }
  ];

  const handleSave = () => {
    if (!nominal) return;
    // In a real app, this would save to backend
    console.log('Saving:', { type: activeTab, nominal, keterangan });
    setNominal('');
    setKeterangan('');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID').format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-neutral-50 p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Main Card Container */}
        <div className="bg-white rounded-3xl shadow-lg p-6 space-y-6">
          {/* Header Section */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={exampleImage} 
                alt="User avatar"
                className="w-14 h-14 rounded-full object-cover"
              />
              <div>
                <h2 className="text-gray-800">Hey, Jacob!</h2>
                <p className="text-sm text-gray-500">+62 812 3456 7890</p>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Date */}
          <div className="text-sm text-gray-600">
            Malam Jumat, 1 Jan 2026
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
            <h3 className="text-gray-800">Transaksi Terkini</h3>
            
            <div className="space-y-3">
              {transactions.map((transaction) => (
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
                      className={`text-lg ${
                        transaction.type === 'masuk'
                          ? 'text-emerald-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {transaction.type === 'masuk' ? '+' : '-'} {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
