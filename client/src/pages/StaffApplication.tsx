import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../lib/api';
import type { StaffApplication } from '../lib/types';
import { Link } from 'react-router-dom';
export default function StaffApplication() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [form, setForm] = useState({
    position: 'Moderator',
    age: '',
    experience: '',
    reason: '',
    availability: '',
  });
  const [myApps, setMyApps] = useState<StaffApplication[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (isAuthenticated) {
      api
        .get('/applications/my')
        .then((r) => setMyApps(r.data))
        .catch(() => {});
    }
  }, [isAuthenticated]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/applications', form);
      setSubmitted(true);
      setForm({
        position: 'Moderator',
        age: '',
        experience: '',
        reason: '',
        availability: '',
      });
      api
        .get('/applications/my')
        .then((r) => setMyApps(r.data))
        .catch(() => {});
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };
  const inputClass =
    'w-full px-4 py-3 bg-dark-800/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/25 transition-all outline-none';
  const statusColors: Record<string, string> = {
    pending: 'bg-gold-500/20 text-gold-400',
    approved: 'bg-olive-500/20 text-olive-400',
    rejected: 'bg-red-500/20 text-red-400',
  };
  return (
    <PageWrapper>
      {' '}
      <div className="max-w-3xl mx-auto px-4">
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
          className="text-center mb-12"
        >
          {' '}
          <h1 className="section-title mb-4">
            {' '}
            {t('apply.title')
              .split(' ')
              .map((word, i) => (
                <span key={i} className={i % 2 === 0 ? '' : 'text-gradient'}>
                  {word}{' '}
                </span>
              ))}{' '}
          </h1>{' '}
          <p className="text-dark-400 text-lg">{t('apply.desc')}</p>{' '}
        </motion.div>{' '}
        {!isAuthenticated ? (
          <div className="glass-card p-8 text-center">
            {' '}
            <div className="text-4xl mb-4">🔒</div>{' '}
            <p className="text-dark-400 mb-4">{t('apply.loginRequired')}</p>{' '}
            <Link
              to="/login"
              className="btn-primary text-sm py-2 px-6 inline-block"
            >
              {t('nav.login')}
            </Link>{' '}
          </div>
        ) : (
          <>
            {' '}
            {/* Application Form */}{' '}
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="glass-card p-8 mb-8"
            >
              {' '}
              {submitted ? (
                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  className="text-center py-8"
                >
                  {' '}
                  <div className="text-4xl mb-4">✅</div>{' '}
                  <h3 className="text-xl font-bold text-gold-400 mb-2">
                    {t('apply.submitted')}
                  </h3>{' '}
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {' '}
                  {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {error}
                    </div>
                  )}{' '}
                  <div>
                    {' '}
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      {t('apply.position')}
                    </label>{' '}
                    <select
                      value={form.position}
                      onChange={(e) =>
                        setForm({ ...form, position: e.target.value })
                      }
                      className={inputClass}
                    >
                      {' '}
                      <option value="Moderator">
                        {t('apply.moderator')}
                      </option>{' '}
                      <option value="Event Manager">
                        {t('apply.eventManager')}
                      </option>{' '}
                      <option value="Community Manager">
                        {t('apply.communityManager')}
                      </option>{' '}
                      <option value="Content Creator">
                        {t('apply.contentCreator')}
                      </option>{' '}
                    </select>{' '}
                  </div>{' '}
                  <div>
                    {' '}
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      {t('apply.age')}
                    </label>{' '}
                    <input
                      type="number"
                      required
                      min="13"
                      value={form.age}
                      onChange={(e) =>
                        setForm({ ...form, age: e.target.value })
                      }
                      className={inputClass}
                      placeholder="18"
                    />{' '}
                  </div>{' '}
                  <div>
                    {' '}
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      {t('apply.experience')}
                    </label>{' '}
                    <textarea
                      required
                      rows={3}
                      value={form.experience}
                      onChange={(e) =>
                        setForm({ ...form, experience: e.target.value })
                      }
                      className={`${inputClass} resize-none`}
                      placeholder={t('apply.expPlaceholder')}
                    />{' '}
                  </div>{' '}
                  <div>
                    {' '}
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      {t('apply.reason')}
                    </label>{' '}
                    <textarea
                      required
                      rows={4}
                      value={form.reason}
                      onChange={(e) =>
                        setForm({ ...form, reason: e.target.value })
                      }
                      className={`${inputClass} resize-none`}
                      placeholder={t('apply.reasonPlaceholder')}
                    />{' '}
                  </div>{' '}
                  <div>
                    {' '}
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      {t('apply.availability')}
                    </label>{' '}
                    <input
                      type="text"
                      value={form.availability}
                      onChange={(e) =>
                        setForm({ ...form, availability: e.target.value })
                      }
                      className={inputClass}
                      placeholder={t('apply.availPlaceholder')}
                    />{' '}
                  </div>{' '}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-3 text-base disabled:opacity-50"
                  >
                    {' '}
                    {loading ? '...' : t('apply.submit')}{' '}
                  </button>{' '}
                </form>
              )}{' '}
            </motion.div>{' '}
            {/* My Applications */}{' '}
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.2,
              }}
            >
              {' '}
              <h2 className="text-xl font-bold font-gaming mb-4">
                {t('apply.myApps')}
              </h2>{' '}
              {myApps.length === 0 ? (
                <div className="glass-card p-6 text-center">
                  {' '}
                  <p className="text-dark-500">{t('apply.noApps')}</p>{' '}
                </div>
              ) : (
                <div className="space-y-3">
                  {' '}
                  {myApps.map((app) => (
                    <div key={app.id} className="glass-card p-5">
                      {' '}
                      <div className="flex items-center gap-3 mb-2">
                        {' '}
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-bold ${statusColors[app.status]}`}
                        >
                          {' '}
                          {t(`apply.${app.status}` as any)}{' '}
                        </span>{' '}
                        <span className="text-sm text-dark-300">
                          {app.position}
                        </span>{' '}
                        <span className="text-xs text-dark-500 ms-auto font-mono">
                          {new Date(app.created_at).toLocaleDateString()}
                        </span>{' '}
                      </div>{' '}
                      {app.review_note && (
                        <p className="text-dark-400 text-sm mt-2">
                          {' '}
                          <span className="text-dark-500">
                            {t('apply.reviewNote')}:
                          </span>{' '}
                          {app.review_note}{' '}
                        </p>
                      )}{' '}
                    </div>
                  ))}{' '}
                </div>
              )}{' '}
            </motion.div>{' '}
          </>
        )}{' '}
      </div>{' '}
    </PageWrapper>
  );
}
