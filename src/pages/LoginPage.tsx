import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useQuizStore from '../store';
import { Toaster, toast } from 'react-hot-toast';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useQuizStore();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await login(email, password);
            toast.success('Login successful!');
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);
        } catch (err) {
            setError('Invalid email or password.');
            toast.error('Invalid email or password.');
            setIsLoading(false);
        }
    };

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.1)] p-6 md:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-white shadow-[0_7px_10px_rgba(0,0,0,0.05)] mb-4 flex items-center justify-center">
              <img src="/favicon-192.png" alt="Logo" className="w-16 h-16 object-contain" />
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold mb-2">Welcome back</h1>
            <p className="text-gray-500 mb-6">Please enter your details to sign in.</p>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                placeholder="••••••••"
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2 text-gray-700">
                <input type="checkbox" checked={remember} onChange={() => setRemember(!remember)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                Remember me
              </label>
              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full h-12 text-white font-semibold rounded-full transition-colors duration-300 ${isLoading ? 'bg-blue-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isLoading ? (
                <span className="flex h-full items-center justify-center gap-1.5">
                  <span className="w-2 h-2 bg-white/90 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-white/90 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <span className="w-2 h-2 bg-white/90 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                </span>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <span>Don't have an account yet?</span>{' '}
            <Link to="/onboarding" className="text-blue-600 hover:underline font-medium">
              Get started
            </Link>
          </div>
        </div>
        <Toaster
          toastOptions={{
            success: {
              iconTheme: {
                primary: '#2563eb',
                secondary: 'white',
              },
            },
          }}
        />
      </div>
    );
};

export default LoginPage;
