import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../lib/api';
import { FaDiscord } from 'react-icons/fa';
export default function Login() {
  const [username, setUsername] = useState('');

  const [password, setPassword] = useState('');

  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);

  const [discordConfigured, setDiscordConfigured] = useState(false);

  const [discordLoading, setDiscordLoading] = useState(false);

  const { login } = useAuth();

  const { t } = useLanguage();

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  useEffect(() => {
    // Check if Discord OAuth2 is configured
    api
      .get('/discord/config')
      .then((res) => {
        setDiscordConfigured(res.data.configured);
      })
      .catch(() => {}); // Handle error from Discord callback
    const err = searchParams.get('error');
    if (err) {
      if (err === 'discord_denied') setError(t('auth.discordDenied'));
      else setError(t('auth.discordError'));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscordLogin = async () => {
    setError('');
    setDiscordLoading(true);
    try {
      const res = await api.get('/discord/login');
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Discord login failed');
      setDiscordLoading(false);
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

          <h1 className="text-2xl font-bold font-gaming">{t('auth.login')}</h1>
          <p className="text-dark-400 text-sm mt-2">{t('auth.loginDesc')}</p>
        </div>{' '}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {' '}
            {error}{' '}
          </div>
        )}{' '}
        {/* Discord OAuth2 Button */}{' '}
        {discordConfigured && (
          <>
            <button
              onClick={handleDiscordLogin}
              disabled={discordLoading}
              className="w-full py-3 px-4 mb-4 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaDiscord size={20} />{' '}
              {discordLoading ? '...' : t('auth.loginWithDiscord')}{' '}
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-dark-800" />

              <span className="text-dark-500 text-xs">
                {t('auth.orContinueWith')}
              </span>
              <div className="flex-1 h-px bg-dark-800" />
            </div>
          </>
        )}{' '}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              {t('auth.username')}
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/25 transition-all outline-none"
              placeholder={t('auth.usernamePlaceholder')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              {t('auth.password')}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/25 transition-all outline-none"
              placeholder={t('auth.passwordPlaceholder')}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {' '}
            {loading ? t('auth.signingIn') : t('auth.signIn')}{' '}
          </button>
        </form>
        <div className="mt-6 space-y-2 text-center text-sm">
          <Link
            to="/forgot-password"
            className="text-dark-400 hover:text-gold-400 transition-colors block"
          >
            {' '}
            {t('auth.forgotPassword')}{' '}
          </Link>
          <p className="text-dark-500">
            {' '}
            {t('auth.noAccount')}{' '}
            <Link
              to="/register"
              className="text-gold-400 hover:text-gold-300 transition-colors font-medium"
            >
              {' '}
              {t('auth.signUp')}{' '}
            </Link>
          </p>
        </div>
        <p className="text-center text-dark-600 text-xs mt-4">
          {' '}
          {t('auth.defaultAdmin')}{' '}
        </p>
      </motion.div>
    </div>
  );
}
