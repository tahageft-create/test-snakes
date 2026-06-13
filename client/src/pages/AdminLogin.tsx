import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', {
        username,
        password,
      });
      localStorage.setItem('snakes_token', res.data.token);
      localStorage.setItem('snakes_user', JSON.stringify(res.data.user));
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <motion.div
        initial={{
          opacity: 0,
          y: 30,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="glass-card p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <img
            src="/logo.gif"
            alt="SNAKES"
            className="w-16 h-16 rounded-2xl mx-auto mb-4"
          />

          <h1 className="text-2xl font-bold font-gaming">Staff Login</h1>
          <p className="text-dark-400 text-sm mt-2">
            Access the SNAKES admin panel
          </p>
        </div>{' '}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {' '}
            {error}{' '}
          </div>
        )}{' '}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/25 transition-all outline-none"
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/25 transition-all outline-none"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {' '}
            {loading ? 'Signing in...' : 'Sign In'}{' '}
          </button>
        </form>
        <p className="text-center text-dark-500 text-xs mt-6">
          {' '}
          Default admin: admin / snakes2024{' '}
        </p>
      </motion.div>
    </div>
  );
}
