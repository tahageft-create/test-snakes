import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useLanguage } from '../contexts/LanguageContext';
export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState('');
  const [message, setMessage] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setResetToken('');
    try {
      const res = await api.post('/auth/forgot-password', {
        username: identifier.includes('@') ? undefined : identifier,
        email: identifier.includes('@') ? identifier : undefined,
      });
      setMessage(res.data.message);
      if (res.data.resetToken) {
        setResetToken(res.data.resetToken);
      }
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Something went wrong');
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
            {t('auth.forgotPassword')}
          </h1>{' '}
          <p className="text-dark-400 text-sm mt-2">
            {t('auth.forgotDesc')}
          </p>{' '}
        </div>{' '}
        {message && (
          <div className="mb-4 p-3 rounded-lg bg-olive-500/10 border border-olive-500/20 text-olive-400 text-sm">
            {' '}
            {message}{' '}
          </div>
        )}{' '}
        {resetToken && (
          <div className="mb-4 p-3 rounded-lg bg-gold-500/10 border border-gold-500/20 text-gold-400 text-sm">
            {' '}
            <p className="font-medium mb-1">Dev mode - Reset Token:</p>{' '}
            <code className="text-xs break-all">{resetToken}</code>{' '}
            <Link
              to={`/reset-password?token=${resetToken}`}
              className="block mt-2 text-gold-400 hover:text-gold-300 underline text-xs"
            >
              {' '}
              Go to Reset Password{' '}
            </Link>{' '}
          </div>
        )}{' '}
        <form onSubmit={handleSubmit} className="space-y-5">
          {' '}
          <div>
            {' '}
            <label className="block text-sm font-medium text-dark-300 mb-2">
              {' '}
              {t('auth.username')} / {t('auth.email')}{' '}
            </label>{' '}
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/25 transition-all outline-none"
              placeholder={t('auth.usernamePlaceholder') + ' or email'}
            />{' '}
          </div>{' '}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {' '}
            {loading ? '...' : t('auth.sendReset')}{' '}
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
