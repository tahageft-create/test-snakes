import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../lib/api';
import type { Tournament } from '../lib/types';
import { HiUsers, HiClock, HiDocumentText } from 'react-icons/hi';
import { FaTrophy } from 'react-icons/fa';
export default function Tournaments() {
  const { t } = useLanguage();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [filter, setFilter] = useState<
    'all' | 'upcoming' | 'active' | 'completed'
  >('all');
  const [selectedTournament, setSelectedTournament] =
    useState<Tournament | null>(null);
  const [registerName, setRegisterName] = useState('');
  const [registerMsg, setRegisterMsg] = useState('');
  useEffect(() => {
    api
      .get('/tournaments')
      .then((r) => setTournaments(r.data))
      .catch(() => {});
  }, []);
  const filtered =
    filter === 'all'
      ? tournaments
      : tournaments.filter((t) => t.status === filter);
  const handleRegister = async (tournamentId: number) => {
    if (!registerName.trim()) return;
    try {
      await api.post(`/tournaments/${tournamentId}/register`, {
        username: registerName,
      });
      setRegisterMsg(t('tournaments.registeredSuccess'));
      setRegisterName(''); // Refresh tournaments
      const res = await api.get('/tournaments');
      setTournaments(res.data);
      setTimeout(() => setRegisterMsg(''), 3000);
    } catch (err: any) {
      setRegisterMsg(
        err.response?.data?.message || t('tournaments.registrationFailed'),
      );
      setTimeout(() => setRegisterMsg(''), 3000);
    }
  };
  const statusStyles: Record<
    string,
    {
      bg: string;
      text: string;
      label: string;
    }
  > = {
    upcoming: {
      bg: 'bg-olive-500/20',
      text: 'text-olive-400',
      label: t('events.upcoming'),
    },
    active: {
      bg: 'bg-gold-500/20',
      text: 'text-gold-400',
      label: t('events.live'),
    },
    completed: {
      bg: 'bg-dark-700',
      text: 'text-dark-400',
      label: t('events.completed'),
    },
  };
  return (
    <PageWrapper>
      {' '}
      <div className="max-w-7xl mx-auto px-4">
        {' '}
        {/* Header */}{' '}
        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="text-center mb-16"
        >
          {' '}
          <h1 className="section-title mb-4">
            {' '}
            <span className="text-gradient">{t('tournaments.title')}</span>{' '}
          </h1>{' '}
          <p className="text-dark-400 text-lg max-w-2xl mx-auto">
            {' '}
            {t('tournaments.desc')}{' '}
          </p>{' '}
        </motion.div>{' '}
        {/* Filter tabs */}{' '}
        <div className="flex gap-2 mb-10 justify-center">
          {' '}
          {(['all', 'upcoming', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${
                filter === f
                  ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20'
                  : 'text-dark-400 hover:text-white hover:bg-dark-800/50 border border-transparent'
              }`}
            >
              {' '}
              {f === 'all' ? t('tournaments.all') : f} (
              {f === 'all'
                ? tournaments.length
                : tournaments.filter((t2) => t2.status === f).length}
              ){' '}
            </button>
          ))}{' '}
        </div>{' '}
        {/* Tournament cards */}{' '}
        <div className="space-y-6">
          {' '}
          {filtered.map((tournament, i) => {
            const style =
              statusStyles[tournament.status] || statusStyles.upcoming;
            const fillPct = Math.min(
              (tournament.current_participants / tournament.max_participants) *
                100,
              100,
            );
            return (
              <motion.div
                key={tournament.id}
                initial={{
                  opacity: 0,
                  y: 30,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  delay: i * 0.1,
                }}
                whileHover={{
                  x: 4,
                }}
                className="glass-card overflow-hidden group cursor-pointer"
                onClick={() => setSelectedTournament(tournament)}
              >
                {' '}
                {/* Status bar */}{' '}
                <div className="h-1 bg-gradient-to-r from-gold-500 via-olive-500 to-gold-500 opacity-50 group-hover:opacity-100 transition-opacity" />{' '}
                <div className="p-6 md:p-8">
                  {' '}
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    {' '}
                    {/* Main info */}{' '}
                    <div className="flex-1">
                      {' '}
                      <div className="flex items-center gap-3 mb-2">
                        {' '}
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold ${style.bg} ${style.text}`}
                        >
                          {' '}
                          {style.label}{' '}
                        </span>{' '}
                        <span className="text-dark-500 text-xs font-mono">
                          {tournament.game}
                        </span>{' '}
                      </div>{' '}
                      <h3 className="text-xl md:text-2xl font-bold mb-2 group-hover:text-gold-400 transition-colors">
                        {' '}
                        {tournament.name}{' '}
                      </h3>{' '}
                      <p className="text-dark-400 text-sm leading-relaxed mb-4 line-clamp-2">
                        {' '}
                        {tournament.description}{' '}
                      </p>{' '}
                      <div className="flex flex-wrap gap-4">
                        {' '}
                        <div className="flex items-center gap-2 text-dark-300 text-sm">
                          {' '}
                          <FaTrophy className="text-gold-400" size={16} />{' '}
                          <span>{tournament.prize_pool}</span>{' '}
                        </div>{' '}
                        <div className="flex items-center gap-2 text-dark-300 text-sm">
                          {' '}
                          <HiClock className="text-olive-400" size={16} />{' '}
                          <span>
                            {new Date(tournament.start_date).toLocaleDateString(
                              'en-US',
                              {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              },
                            )}
                          </span>{' '}
                        </div>{' '}
                      </div>{' '}
                    </div>{' '}
                    {/* Participation tracker */}{' '}
                    <div className="w-full md:w-64 shrink-0">
                      {' '}
                      <div className="flex items-center justify-between mb-2">
                        {' '}
                        <span className="text-sm text-dark-300">
                          {' '}
                          <HiUsers className="inline mr-1" size={14} />{' '}
                          {t('tournaments.participants')}{' '}
                        </span>{' '}
                        <span className="text-sm font-mono text-gold-400">
                          {' '}
                          {tournament.current_participants}/
                          {tournament.max_participants}{' '}
                        </span>{' '}
                      </div>{' '}
                      <div className="w-full h-3 bg-dark-800 rounded-full overflow-hidden">
                        {' '}
                        <motion.div
                          initial={{
                            width: 0,
                          }}
                          whileInView={{
                            width: `${fillPct}%`,
                          }}
                          viewport={{
                            once: true,
                          }}
                          transition={{
                            duration: 1,
                            delay: 0.3,
                          }}
                          className="h-full rounded-full bg-gradient-to-r from-gold-500 to-olive-500"
                        />{' '}
                      </div>{' '}
                      {tournament.status !== 'completed' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTournament(tournament);
                          }}
                          className="mt-4 w-full btn-primary text-sm py-2.5"
                        >
                          {' '}
                          {t('tournaments.registerNow')}{' '}
                        </button>
                      )}{' '}
                      {tournament.status === 'completed' && (
                        <div className="mt-4 w-full py-2.5 text-center text-dark-500 text-sm font-medium rounded-xl bg-dark-800/50">
                          {' '}
                          {t('tournaments.ended')}{' '}
                        </div>
                      )}{' '}
                    </div>{' '}
                  </div>{' '}
                </div>{' '}
              </motion.div>
            );
          })}{' '}
        </div>{' '}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            {' '}
            <p className="text-dark-500 text-lg">
              {t('tournaments.noTournaments')}
            </p>{' '}
          </div>
        )}{' '}
        {/* Tournament Detail Modal */}{' '}
        <AnimatePresence>
          {' '}
          {selectedTournament && (
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm"
              onClick={() => {
                setSelectedTournament(null);
                setRegisterMsg('');
              }}
            >
              {' '}
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.9,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.9,
                  y: 20,
                }}
                className="glass-card p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {' '}
                {(() => {
                  const style =
                    statusStyles[selectedTournament.status] ||
                    statusStyles.upcoming;
                  return (
                    <>
                      {' '}
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-block mb-4 ${style.bg} ${style.text}`}
                      >
                        {' '}
                        {style.label}{' '}
                      </span>{' '}
                      <h2 className="text-2xl md:text-3xl font-bold mb-2">
                        {selectedTournament.name}
                      </h2>{' '}
                      <p className="text-gold-400 font-medium mb-4">
                        {selectedTournament.game}
                      </p>{' '}
                      <p className="text-dark-300 leading-relaxed mb-6">
                        {selectedTournament.description}
                      </p>{' '}
                      {/* Prize pool highlight */}{' '}
                      <div className="glass-card p-5 mb-6 text-center">
                        {' '}
                        <FaTrophy
                          className="text-gold-400 mx-auto mb-2"
                          size={28}
                        />{' '}
                        <p className="text-xs text-dark-400 uppercase tracking-wider mb-1">
                          {t('tournaments.prizePool')}
                        </p>{' '}
                        <p className="text-xl font-bold text-gold-400">
                          {selectedTournament.prize_pool}
                        </p>{' '}
                      </div>{' '}
                      {/* Details grid */}{' '}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        {' '}
                        <div className="glass-card p-4">
                          {' '}
                          <HiClock
                            className="text-olive-400 mb-1"
                            size={18}
                          />{' '}
                          <p className="text-xs text-dark-400">
                            {t('tournaments.start')}
                          </p>{' '}
                          <p className="text-sm font-medium">
                            {new Date(
                              selectedTournament.start_date,
                            ).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>{' '}
                        </div>{' '}
                        <div className="glass-card p-4">
                          {' '}
                          <HiUsers
                            className="text-gold-400 mb-1"
                            size={18}
                          />{' '}
                          <p className="text-xs text-dark-400">
                            {t('tournaments.slots')}
                          </p>{' '}
                          <p className="text-sm font-medium">
                            {selectedTournament.current_participants}/
                            {selectedTournament.max_participants}
                          </p>{' '}
                        </div>{' '}
                      </div>{' '}
                      {/* Rules */}{' '}
                      {selectedTournament.rules && (
                        <div className="mb-6">
                          {' '}
                          <div className="flex items-center gap-2 mb-3">
                            {' '}
                            <HiDocumentText
                              className="text-olive-400"
                              size={18}
                            />{' '}
                            <h3 className="font-bold">
                              {t('tournaments.rules')}
                            </h3>{' '}
                          </div>{' '}
                          <p className="text-dark-400 text-sm leading-relaxed">
                            {selectedTournament.rules}
                          </p>{' '}
                        </div>
                      )}{' '}
                      {/* Registration */}{' '}
                      {selectedTournament.status !== 'completed' && (
                        <div className="border-t border-dark-800/50 pt-6">
                          {' '}
                          <h3 className="font-bold mb-3">
                            {t('tournaments.registerFor')}
                          </h3>{' '}
                          <div className="flex gap-3">
                            {' '}
                            <input
                              type="text"
                              placeholder={t('tournaments.username')}
                              value={registerName}
                              onChange={(e) => setRegisterName(e.target.value)}
                              className="flex-1 px-4 py-2.5 bg-dark-800/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:border-gold-500/50 outline-none transition-all text-sm"
                            />{' '}
                            <button
                              onClick={() =>
                                handleRegister(selectedTournament.id)
                              }
                              className="btn-primary text-sm py-2.5 px-5"
                            >
                              {' '}
                              {t('events.register')}{' '}
                            </button>{' '}
                          </div>{' '}
                          {registerMsg && (
                            <p
                              className={`mt-2 text-sm ${registerMsg.includes('success') ? 'text-olive-400' : 'text-gold-400'}`}
                            >
                              {' '}
                              {registerMsg}{' '}
                            </p>
                          )}{' '}
                        </div>
                      )}{' '}
                      <button
                        onClick={() => {
                          setSelectedTournament(null);
                          setRegisterMsg('');
                        }}
                        className="mt-6 w-full btn-secondary text-sm py-2.5"
                      >
                        {' '}
                        {t('tournaments.close')}{' '}
                      </button>{' '}
                    </>
                  );
                })()}{' '}
              </motion.div>{' '}
            </motion.div>
          )}{' '}
        </AnimatePresence>{' '}
      </div>{' '}
    </PageWrapper>
  );
}
