import React, { useState } from 'react';
import { Truck, Eye, EyeOff, Loader, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
    } catch (error: any) {
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-caterpillar-yellow via-yellow-400 to-caterpillar-yellow flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-caterpillar-black rounded-2xl shadow-brand-lg mb-4 transform hover:scale-110 transition-transform duration-300">
            <Truck className="h-10 w-10 text-caterpillar-yellow" />
          </div>
          <h1 className="text-4xl font-bold text-caterpillar-black mb-2">EcoTrackAI</h1>
          <p className="text-caterpillar-black/80 text-lg font-medium">Smart Rental Tracking System</p>
          <p className="text-caterpillar-black/60 text-sm mt-2">Dealer Portal Login</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-brand-lg p-8 border border-gray-200 animate-scale-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3 animate-fade-in">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-caterpillar-black mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-caterpillar-black placeholder-gray-500 focus:ring-2 focus:ring-caterpillar-yellow focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-caterpillar-black mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl bg-white text-caterpillar-black placeholder-gray-500 focus:ring-2 focus:ring-caterpillar-yellow focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-caterpillar-black transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-caterpillar-yellow hover:bg-yellow-400 text-caterpillar-black font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-brand hover:shadow-brand-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In to Dashboard</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Demo Credentials:
            </p>
            <div className="mt-2 text-center text-xs text-gray-500 space-y-1">
              <p><strong>Email:</strong> dealer@example.com</p>
              <p><strong>Password:</strong> password123</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 animate-fade-in">
          <p className="text-caterpillar-black/60 text-sm">
            © 2025 EcoTrackAI. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;