import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiBell, HiBellAlert } from 'react-icons/hi2';
import {
  useNotifications,
  type AppNotification,
} from '../contexts/NotificationContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';
export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();
  const { t, lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const timeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return lang === 'ar' ? 'الآن' : 'just now';
    if (mins < 60) return lang === 'ar' ? `منذ ${mins} د` : `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return lang === 'ar' ? `منذ ${hours} س` : `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return lang === 'ar' ? `منذ ${days} ي` : `${days}d ago`;
  };
  const handleNotificationClick = (n: AppNotification) => {
    markAsRead(n.id);
    setIsOpen(false);
  };
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-dark-400 hover:text-gold-400 hover:bg-dark-800/50 transition-all"
        title={lang === 'ar' ? 'الإشعارات' : 'Notifications'}
      >
        {' '}
        {unreadCount > 0 ? (
          <HiBellAlert size={20} className="text-gold-400" />
        ) : (
          <HiBell size={20} />
        )}{' '}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -end-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 leading-none">
            {' '}
            {unreadCount > 9 ? '9+' : unreadCount}{' '}
          </span>
        )}{' '}
      </button>
      <AnimatePresence>
        {' '}
        {isOpen && (
          <motion.div
            initial={{
              opacity: 0,
              y: -8,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -8,
              scale: 0.95,
            }}
            transition={{
              duration: 0.15,
            }}
            className="absolute top-full mt-2 end-0 w-80 sm:w-96 glass-card p-2 shadow-xl shadow-dark-950/50 z-50 max-h-[70vh] flex flex-col"
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-dark-800/50 mb-1">
              <h3 className="text-sm font-bold text-white">
                {' '}
                {lang === 'ar' ? 'الإشعارات' : 'Notifications'}{' '}
              </h3>{' '}
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-gold-400 hover:text-gold-300 transition-colors"
                >
                  {' '}
                  {lang === 'ar'
                    ? 'تحديد الكل كمقروء'
                    : 'Mark all as read'}{' '}
                </button>
              )}{' '}
            </div>
            <div className="overflow-y-auto flex-1 space-y-1">
              {' '}
              {notifications.length === 0 ? (
                <p className="text-center text-dark-500 text-sm py-8">
                  {' '}
                  {lang === 'ar' ? 'لا توجد إشعارات' : 'No notifications'}{' '}
                </p>
              ) : (
                notifications.map((n) => (
                  <div key={n.id}>
                    {' '}
                    {n.link ? (
                      <Link
                        to={n.link}
                        onClick={() => handleNotificationClick(n)}
                        className={`flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer ${
                          n.read
                            ? 'opacity-60 hover:opacity-80'
                            : 'bg-gold-500/5 hover:bg-gold-500/10'
                        }`}
                      >
                        <span className="text-lg leading-none mt-0.5">
                          {n.title.split(' ')[0]}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm ${n.read ? 'text-dark-400' : 'text-white font-medium'}`}
                          >
                            {' '}
                            {n.title.replace(/^[^\s]+\s/, '')}{' '}
                          </p>
                          <p className="text-xs text-dark-500 mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-dark-600 mt-1">
                            {timeAgo(n.timestamp)}
                          </p>
                        </div>
                      </Link>
                    ) : (
                      <div
                        onClick={() => handleNotificationClick(n)}
                        className={`flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer ${
                          n.read
                            ? 'opacity-60 hover:opacity-80'
                            : 'bg-gold-500/5 hover:bg-gold-500/10'
                        }`}
                      >
                        <span className="text-lg leading-none mt-0.5">
                          {n.title.split(' ')[0]}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm ${n.read ? 'text-dark-400' : 'text-white font-medium'}`}
                          >
                            {' '}
                            {n.title.replace(/^[^\s]+\s/, '')}{' '}
                          </p>
                          <p className="text-xs text-dark-500 mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-dark-600 mt-1">
                            {timeAgo(n.timestamp)}
                          </p>
                        </div>
                      </div>
                    )}{' '}
                  </div>
                ))
              )}{' '}
            </div>
          </motion.div>
        )}{' '}
      </AnimatePresence>
    </div>
  );
}
