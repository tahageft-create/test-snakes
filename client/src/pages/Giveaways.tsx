import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../lib/api';
import type { Giveaway } from '../lib/types';
import { HiGift, HiClock, HiUserGroup, HiCheckCircle } from 'react-icons/hi';
export default function Giveaways() {
  const { t } = useLanguage();
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'ended'>('all');
  const [enterName, setEnterName] = useState('');
  const [enterMsg, setEnterMsg] = useState<{
    id: number;
    msg: string;
  } | null>(null);
  useEffect(() => {
    api
      .get('/giveaways')
      .then((r) => setGiveaways(r.data))
      .catch(() => {});
  }, []);
  const filtered =
    filter === 'all' ? giveaways : giveaways.filter((g) => g.status === filter);
  const handleEnter = async (giveawayId: number) => {
    if (!enterName.trim()) return;
    try {
      await api.post(`/giveaways/${giveawayId}/enter`, {
        username: enterName,
      });
      setEnterMsg({
        id: giveawayId,
        msg: t('giveaways.enteredSuccess'),
      });
      setEnterName('');
      const res = await api.get('/giveaways');
      setGiveaways(res.data);
      setTimeout(() => setEnterMsg(null), 3000);
    } catch (err: any) {
      setEnterMsg({
        id: giveawayId,
        msg: err.response?.data?.message || t('giveaways.enterFailed'),
      });
      setTimeout(() => setEnterMsg(null), 3000);
    }
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
            <span className="text-gradient">{t('giveaways.title')}</span>{' '}
          </h1>{' '}
          <p className="text-dark-400 text-lg max-w-2xl mx-auto">
            {' '}
            {t('giveaways.desc')}{' '}
          </p>{' '}
        </motion.div>{' '}
        {/* Filter */}{' '}
        <div className="flex gap-2 mb-10 justify-center">
          {' '}
          {(['all', 'active', 'ended'] as const).map((f) => (
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
              {f === 'all' ? 'All' : f} (
              {f === 'all'
                ? giveaways.length
                : giveaways.filter((g) => g.status === f).length}
              ){' '}
            </button>
          ))}{' '}
        </div>{' '}
        {/* Active giveaways - prominent display */}{' '}
        {filtered.filter((g) => g.status === 'active').length > 0 &&
          filter !== 'ended' && (
            <div className="mb-12">
              {' '}
              <h2 className="text-2xl font-bold font-gaming mb-6 flex items-center gap-3">
                {' '}
                <HiGift className="text-gold-400" size={24} />{' '}
                {t('giveaways.activeTitle')}{' '}
              </h2>{' '}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {' '}
                {filtered
                  .filter((g) => g.status === 'active')
                  .map((giveaway, i) => (
                    <motion.div
                      key={giveaway.id}
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
                        y: -6,
                      }}
                      className="glass-card overflow-hidden group"
                    >
                      {' '}
                      {/* Animated top border */}{' '}
                      <div className="h-1.5 bg-gradient-to-r from-gold-400 via-olive-400 to-gold-400 animate-pulse" />{' '}
                      <div className="p-6">
                        {' '}
                        <div className="flex items-start gap-4 mb-4">
                          {' '}
                          <div className="w-14 h-14 rounded-xl bg-gold-500/10 flex items-center justify-center text-3xl shrink-0">
                            {' '}
                            🎁{' '}
                          </div>{' '}
                          <div className="flex-1">
                            {' '}
                            <h3 className="text-xl font-bold mb-1 group-hover:text-gold-400 transition-colors">
                              {' '}
                              {giveaway.title}{' '}
                            </h3>{' '}
                            <p className="text-dark-400 text-sm leading-relaxed">
                              {giveaway.description}
                            </p>{' '}
                          </div>{' '}
                        </div>{' '}
                        {/* Prize highlight */}{' '}
                        <div className="glass-card p-4 mb-4 text-center">
                          {' '}
                          <p className="text-xs text-dark-400 uppercase tracking-wider mb-1">
                            {t('giveaways.prize')}
                          </p>{' '}
                          <p className="text-lg font-bold text-gold-400">
                            {giveaway.prize}
                          </p>{' '}
                        </div>{' '}
                        {/* Stats row */}{' '}
                        <div className="flex gap-4 mb-4">
                          {' '}
                          <div className="flex items-center gap-2 text-dark-300 text-sm">
                            {' '}
                            <HiClock
                              className="text-olive-400"
                              size={14}
                            />{' '}
                            {t('giveaways.ending')}{' '}
                            {new Date(giveaway.end_date).toLocaleDateString(
                              'en-US',
                              {
                                month: 'short',
                                day: 'numeric',
                              },
                            )}{' '}
                          </div>{' '}
                          <div className="flex items-center gap-2 text-dark-300 text-sm">
                            {' '}
                            <HiUserGroup
                              className="text-gold-400"
                              size={14}
                            />{' '}
                            {giveaway.participants}{' '}
                            {t('giveaways.entries')}{' '}
                          </div>{' '}
                        </div>{' '}
                        {/* Rules */}{' '}
                        {giveaway.rules && (
                          <div className="mb-4 p-3 rounded-lg bg-dark-800/30 text-dark-400 text-xs leading-relaxed">
                            {' '}
                            <span className="font-semibold text-dark-300">
                              {t('giveaways.rules')}
                            </span>{' '}
                            {giveaway.rules}{' '}
                          </div>
                        )}{' '}
                        {/* Enter button */}{' '}
                        <div className="flex gap-3">
                          {' '}
                          <input
                            type="text"
                            placeholder={t('giveaways.username')}
                            value={enterName}
                            onChange={(e) => setEnterName(e.target.value)}
                            className="flex-1 px-4 py-2.5 bg-dark-800/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:border-gold-500/50 outline-none transition-all text-sm"
                          />{' '}
                          <button
                            onClick={() => handleEnter(giveaway.id)}
                            className="btn-primary text-sm py-2.5 px-5 inline-flex items-center gap-2"
                          >
                            {' '}
                            <HiGift size={14} /> {t('giveaways.enter')}{' '}
                          </button>{' '}
                        </div>{' '}
                        {enterMsg?.id === giveaway.id && (
                          <p
                            className={`mt-2 text-sm ${enterMsg.msg.includes('success') ? 'text-olive-400' : 'text-gold-400'}`}
                          >
                            {' '}
                            {enterMsg.msg}{' '}
                          </p>
                        )}{' '}
                      </div>{' '}
                    </motion.div>
                  ))}{' '}
              </div>{' '}
            </div>
          )}{' '}
        {/* Ended giveaways */}{' '}
        {filtered.filter((g) => g.status === 'ended').length > 0 &&
          filter !== 'active' && (
            <div>
              {' '}
              <h2 className="text-2xl font-bold font-gaming mb-6 flex items-center gap-3">
                {' '}
                <HiCheckCircle className="text-olive-400" size={24} />{' '}
                {t('giveaways.pastWinners')}{' '}
              </h2>{' '}
              <div className="space-y-4">
                {' '}
                {filtered
                  .filter((g) => g.status === 'ended')
                  .map((giveaway, i) => (
                    <motion.div
                      key={giveaway.id}
                      initial={{
                        opacity: 0,
                        x: -20,
                      }}
                      whileInView={{
                        opacity: 1,
                        x: 0,
                      }}
                      viewport={{
                        once: true,
                      }}
                      transition={{
                        delay: i * 0.1,
                      }}
                      className="glass-card p-5 flex items-center gap-4"
                    >
                      {' '}
                      <div className="w-12 h-12 rounded-xl bg-olive-500/10 flex items-center justify-center text-2xl shrink-0">
                        {' '}
                        🎉{' '}
                      </div>{' '}
                      <div className="flex-1 min-w-0">
                        {' '}
                        <h3 className="font-bold mb-1">
                          {giveaway.title}
                        </h3>{' '}
                        <p className="text-dark-400 text-sm">
                          {giveaway.prize}
                        </p>{' '}
                      </div>{' '}
                      <div className="text-right shrink-0">
                        {' '}
                        <p className="text-xs text-dark-500">
                          {t('giveaways.winner')}
                        </p>{' '}
                        <p className="text-gold-400 font-bold">
                          {giveaway.winner || 'N/A'}
                        </p>{' '}
                      </div>{' '}
                      <div className="text-right shrink-0">
                        {' '}
                        <p className="text-xs text-dark-500">
                          {t('giveaways.entries')}
                        </p>{' '}
                        <p className="text-dark-300 font-mono text-sm">
                          {giveaway.participants}
                        </p>{' '}
                      </div>{' '}
                    </motion.div>
                  ))}{' '}
              </div>{' '}
            </div>
          )}{' '}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            {' '}
            <p className="text-dark-500 text-lg">
              {t('giveaways.noGiveaways')}
            </p>{' '}
          </div>
        )}{' '}
      </div>{' '}
    </PageWrapper>
  );
}
