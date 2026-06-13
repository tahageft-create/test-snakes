import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../lib/api';
import type { Event } from '../lib/types';
import { HiCalendar, HiClock, HiLocationMarker } from 'react-icons/hi';
export default function Events() {
  const { t } = useLanguage();

  const [events, setEvents] = useState<Event[]>([]);

  const [filter, setFilter] = useState<'all' | 'upcoming' | 'active' | 'ended'>(
    'all',
  );

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const [registerName, setRegisterName] = useState('');

  const [registerMsg, setRegisterMsg] = useState('');
  useEffect(() => {
    api
      .get('/events')
      .then((r) => setEvents(r.data))
      .catch(() => {});
  }, []);

  const filtered =
    filter === 'all' ? events : events.filter((e) => e.status === filter);

  const handleRegister = async (eventId: number) => {
    if (!registerName.trim()) return;
    try {
      await api.post(`/events/${eventId}/register`, {
        username: registerName,
      });
      setRegisterMsg(t('events.registeredSuccess'));
      setRegisterName('');
      setTimeout(() => setRegisterMsg(''), 3000);
    } catch (err: any) {
      setRegisterMsg(
        err.response?.data?.message || t('events.registrationFailed'),
      );
      setTimeout(() => setRegisterMsg(''), 3000);
    }
  };

  const statusColors: Record<string, string> = {
    upcoming: 'bg-olive-500/20 text-olive-400',
    active: 'bg-gold-500/20 text-gold-400',
    ended: 'bg-dark-700 text-dark-400',
  };

  const statusLabels: Record<string, string> = {
    upcoming: t('events.upcoming'),
    active: t('events.live'),
    ended: t('events.completed'),
  }; // Group events by month for calendar-like view
  const eventsByMonth: Record<string, Event[]> = {};
  filtered.forEach((e) => {
    const date = new Date(e.date);

    const key = date.toLocaleString('en-US', {
      month: 'long',
      year: 'numeric',
    });
    if (!eventsByMonth[key]) eventsByMonth[key] = [];
    eventsByMonth[key].push(e);
  });
  return (
    <PageWrapper>
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
          <h1 className="section-title mb-4"> {t('events.title')} </h1>
          <p className="text-dark-400 text-lg max-w-2xl mx-auto">
            {' '}
            {t('events.desc')}{' '}
          </p>
        </motion.div>{' '}
        {/* Filter tabs */}{' '}
        <div className="flex gap-2 mb-10 justify-center">
          {' '}
          {(['all', 'upcoming', 'active', 'ended'] as const).map((f) => (
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
              {f === 'all' ? t('events.all') : f}{' '}
              {f !== 'all' && (
                <span className="ml-1.5 text-xs opacity-50">
                  {' '}
                  ({events.filter((e) => e.status === f).length})
                </span>
              )}{' '}
            </button>
          ))}{' '}
        </div>{' '}
        {/* Events Calendar View */}{' '}
        <div className="space-y-12">
          {' '}
          {Object.entries(eventsByMonth).map(([month, monthEvents]) => (
            <div key={month}>
              <h2 className="text-xl font-bold font-gaming mb-6 flex items-center gap-3">
                <HiCalendar className="text-gold-400" size={22} /> {month}{' '}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {' '}
                {monthEvents.map((event, i) => (
                  <motion.div
                    key={event.id}
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
                    className="glass-card overflow-hidden group cursor-pointer"
                    onClick={() => setSelectedEvent(event)}
                  >
                    {' '}
                    {/* Status indicator */}{' '}
                    <div className="h-1 w-full bg-gradient-to-r from-gold-500 to-olive-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold ${statusColors[event.status]}`}
                        >
                          {' '}
                          {statusLabels[event.status]}{' '}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold mb-3 group-hover:text-gold-400 transition-colors">
                        {' '}
                        {event.title}{' '}
                      </h3>
                      <p className="text-dark-400 text-sm leading-relaxed mb-4 line-clamp-2">
                        {' '}
                        {event.description}{' '}
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-dark-400 text-sm">
                          <HiClock size={14} className="text-gold-500" />{' '}
                          {new Date(event.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                        </div>
                        <div className="flex items-center gap-2 text-dark-400 text-sm">
                          <HiLocationMarker
                            size={14}
                            className="text-olive-500"
                          />{' '}
                          {t('events.discordVoice')}{' '}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}{' '}
              </div>
            </div>
          ))}{' '}
        </div>{' '}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-dark-500 text-lg">{t('events.noEvents')}</p>
          </div>
        )}{' '}
        {/* Event Detail Modal */}{' '}
        <AnimatePresence>
          {' '}
          {selectedEvent && (
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
                setSelectedEvent(null);
                setRegisterMsg('');
              }}
            >
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
                className="glass-card p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-block mb-4 ${statusColors[selectedEvent.status]}`}
                >
                  {' '}
                  {statusLabels[selectedEvent.status]}{' '}
                </span>
                <h2 className="text-2xl font-bold mb-3">
                  {selectedEvent.title}
                </h2>
                <p className="text-dark-300 leading-relaxed mb-6">
                  {selectedEvent.description}
                </p>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-dark-300">
                    <HiClock className="text-gold-400" size={18} />

                    <span>
                      {new Date(selectedEvent.date).toLocaleString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-dark-300">
                    <HiLocationMarker className="text-olive-400" size={18} />

                    <span>{t('events.discordServerVoice')}</span>
                  </div>
                </div>{' '}
                {selectedEvent.status !== 'ended' && (
                  <div className="border-t border-dark-800/50 pt-6">
                    <h3 className="font-bold mb-3">
                      {t('events.registerFor')}
                    </h3>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder={t('events.username')}
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        className="flex-1 px-4 py-2.5 bg-dark-800/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:border-gold-500/50 outline-none transition-all text-sm"
                      />

                      <button
                        onClick={() => handleRegister(selectedEvent.id)}
                        className="btn-primary text-sm py-2.5 px-5"
                      >
                        {' '}
                        {t('events.register')}{' '}
                      </button>
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
                    setSelectedEvent(null);
                    setRegisterMsg('');
                  }}
                  className="mt-6 w-full btn-secondary text-sm py-2.5"
                >
                  {' '}
                  {t('events.close')}{' '}
                </button>
              </motion.div>
            </motion.div>
          )}{' '}
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
}
