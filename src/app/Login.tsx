import { useState } from 'react';

interface LoginProps {
  onLogin: (name: string, phone: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!name.trim()) {
      setError('Nama harus diisi');
      return;
    }
    
    if (!phone.trim()) {
      setError('Nomor HP harus diisi');
      return;
    }
    
    // Validate phone number format (Indonesian format)
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;
    if (!phoneRegex.test(phone)) {
      setError('Format nomor HP tidak valid (contoh: +6281234567890)');
      return;
    }
    
    setError('');
    onLogin(name.trim(), phone.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-neutral-50 p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-lg p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">Selamat Datang</h1>
            <p className="text-gray-600 mt-2">Silakan masuk untuk melanjutkan</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama lengkap"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Nomor HP
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Contoh: +6281234567890"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl text-white shadow-md transition-all"
            >
              Masuk
            </button>
          </form>

          <div className="text-center text-xs text-gray-500 mt-4">
            Data yang Anda masukkan akan digunakan untuk identifikasi
          </div>
        </div>
      </div>
    </div>
  );
}