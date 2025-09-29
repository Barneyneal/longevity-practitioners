import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const apiUrl = import.meta.env.VITE_APP_URL || '';
            const response = await fetch(`${apiUrl}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }
            setMessage(data.message);
            toast.success(data.message);
        } catch (err: any) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.1)] p-6 md:p-8">
          <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-white shadow-[0_7px_10px_rgba(0,0,0,0.05)] mb-4 flex items-center justify-center">
                  <img src="/favicon-192.png" alt="Logo" className="w-16 h-16 object-contain" />
              </div>
              <h1 className="text-2xl md:text-3xl font-semibold mb-2">Forgot Password?</h1>
              <p className="text-gray-500 mb-6">
              Enter your email and we'll send a reset link.
              </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left" htmlFor="email">
                E-Mail Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                placeholder="Enter your email..."
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {message && <p className="text-green-600 text-sm">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className={`w-full h-12 text-white font-semibold rounded-full transition-colors duration-300 ${loading ? 'bg-blue-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {loading ? (
                <span className="flex h-full items-center justify-center gap-1.5">
                  <span className="w-2 h-2 bg-white/90 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-white/90 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <span className="w-2 h-2 bg-white/90 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                </span>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <Link to="/login" className="text-blue-600 hover:underline font-medium">
              Back to Login
            </Link>
          </div>
        </div>
        <Toaster />
      </div>
    );
};

export default ForgotPasswordPage;
