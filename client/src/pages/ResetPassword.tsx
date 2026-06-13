import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useLanguage } from '../contexts/LanguageContext';
export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const res = await api.post('/auth/reset-password', {
        token,
        newPassword,
      });
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      {' '}
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
        {' '}
        <div className="text-center mb-8">
          {' '}
          <img
            src="/logo.gif"
            alt="SNAKES"
            className="w-16 h-16 rounded-2xl mx-auto mb-4"
          />{' '}
          <h1 className="text-2xl font-bold font-gaming">
            {t('auth.resetPassword')}
          </h1>{' '}
          <p className="text-dark-400 text-sm mt-2">
            {t('auth.resetDesc')}
          </p>{' '}
        </div>{' '}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {' '}
            {error}{' '}
          </div>
        )}{' '}
        {message && (
          <div className="mb-4 p-3 rounded-lg bg-olive-500/10 border border-olive-500/20 text-olive-400 text-sm">
            {' '}
            {message}{' '}
          </div>
        )}{' '}
        <form onSubmit={handleSubmit} className="space-y-5">
          {' '}
          <div>
            {' '}
            <label className="block text-sm font-medium text-dark-300 mb-2">
              {t('auth.resetToken')}
            </label>{' '}
            <input
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/25 transition-all outline-none font-mono text-sm"
              placeholder="Paste your reset token"
            />{' '}
          </div>{' '}
          <div>
            {' '}
            <label className="block text-sm font-medium text-dark-300 mb-2">
              {t('auth.newPassword')}
            </label>{' '}
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/25 transition-all outline-none"
              placeholder={t('auth.newPassword')}
            />{' '}
          </div>{' '}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {' '}
            {loading ? '...' : t('auth.reset')}{' '}
          </button>{' '}
        </form>{' '}
        <p className="text-center text-sm mt-6">
          {' '}
          <Link
            to="/login"
            className="text-dark-400 hover:text-gold-400 transition-colors"
          >
            {' '}
            {t('auth.backToLogin')}{' '}
          </Link>{' '}
        </p>{' '}
      </motion.div>{' '}
    </div>
  );
}
