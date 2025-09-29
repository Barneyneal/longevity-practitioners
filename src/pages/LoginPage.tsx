import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useQuizStore from '../store';
import { Toaster, toast } from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, authToken } = useQuizStore();

  useEffect(() => {
    // Redirect only if user arrives already logged in, not during submit
    if (authToken && !isLoading) {
      navigate('/');
    }
  }, [authToken, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to login');
      }

      const { token } = await response.json();
      login(token);

      // Ensure user and submissions are loaded before navigating (using the fresh token)
      const authHeader = { Authorization: `Bearer ${token}` };
      const [userRes, subsRes] = await Promise.all([
        fetch('/api/users/me', { headers: authHeader }),
        fetch('/api/submissions/me', { headers: authHeader }),
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        useQuizStore.setState((state) => ({ user: { ...state.user, ...userData } }));
      }
      if (subsRes.ok) {
        const subsData = await subsRes.json();
        useQuizStore.setState({ submissions: subsData });
      }

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.2)] p-6 md:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-white shadow-[0_7px_10px_rgba(0,0,0,0.2)] mb-4 flex items-center justify-center">
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
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-700 focus:outline-none focus:ring-0 focus:border-gray-300 placeholder-gray-400"
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
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-700 focus:outline-none focus:ring-0 focus:border-gray-300 placeholder-gray-400"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex items-center justify-between text-sm">
            <label className="inline-flex items-center gap-2 text-gray-700">
              <input type="checkbox" checked={remember} onChange={() => setRemember(!remember)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-0" />
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
            className={`w-full h-12 text-white font-semibold rounded-full transition-colors duration-300 ${isLoading ? 'bg-blue-500 cursor-wait' : 'bg-blue-600 hover:bg-blue-700'}`}
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
          <Link to="/longevity-quiz" className="text-blue-600 hover:underline font-medium">
            Get started
          </Link>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default LoginPage;
