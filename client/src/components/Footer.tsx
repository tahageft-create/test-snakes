import { Link } from 'react-router-dom';
import {
  FaDiscord,
  FaTwitch,
  FaYoutube,
  FaInstagram,
  FaTwitter,
} from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-dark-800/50 bg-dark-950">
      {' '}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {' '}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {' '}
          {/* Brand */}{' '}
          <div className="md:col-span-2">
            {' '}
            <div className="flex items-center gap-2 mb-4">
              {' '}
              <img
                src="/logo.gif"
                alt="SNAKES"
                className="w-8 h-8 rounded-lg object-cover"
              />{' '}
              <span className="text-lg font-bold font-gaming tracking-wider text-gradient">
                SNAKES
              </span>{' '}
            </div>{' '}
            <p className="text-dark-400 text-sm leading-relaxed mb-6">
              {t('footer.desc')}
            </p>{' '}
            <div className="flex items-center gap-3">
              {' '}
              <a
                href="https://discord.gg/auccThQpMH"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-dark-800/50 flex items-center justify-center text-dark-400 hover:text-gold-400 hover:bg-gold-500/10 transition-all"
              >
                <FaDiscord size={18} />
              </a>{' '}
              <a
                href="https://twitch.tv/snakes"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-dark-800/50 flex items-center justify-center text-dark-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all"
              >
                <FaTwitch size={18} />
              </a>{' '}
              <a
                href="https://youtube.com/@snakes"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-dark-800/50 flex items-center justify-center text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
              >
                <FaYoutube size={18} />
              </a>{' '}
              <a
                href="https://instagram.com/snakes"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-dark-800/50 flex items-center justify-center text-dark-400 hover:text-pink-400 hover:bg-pink-500/10 transition-all"
              >
                <FaInstagram size={18} />
              </a>{' '}
              <a
                href="https://twitter.com/snakes"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-dark-800/50 flex items-center justify-center text-dark-400 hover:text-sky-400 hover:bg-sky-500/10 transition-all"
              >
                <FaTwitter size={18} />
              </a>{' '}
            </div>{' '}
          </div>{' '}
          <div>
            {' '}
            <h4 className="text-sm font-semibold text-dark-200 uppercase tracking-wider mb-4">
              {t('footer.navigate')}
            </h4>{' '}
            <ul className="space-y-2">
              {' '}
              <li>
                <Link
                  to="/games"
                  className="text-dark-400 hover:text-gold-400 transition-colors text-sm"
                >
                  {t('footer.ourGames')}
                </Link>
              </li>{' '}
              <li>
                <Link
                  to="/events"
                  className="text-dark-400 hover:text-gold-400 transition-colors text-sm"
                >
                  {t('footer.events')}
                </Link>
              </li>{' '}
              <li>
                <Link
                  to="/tournaments"
                  className="text-dark-400 hover:text-gold-400 transition-colors text-sm"
                >
                  {t('footer.tournaments')}
                </Link>
              </li>{' '}
              <li>
                <Link
                  to="/ranks"
                  className="text-dark-400 hover:text-gold-400 transition-colors text-sm"
                >
                  {t('footer.ranks')}
                </Link>
              </li>{' '}
              <li>
                <Link
                  to="/giveaways"
                  className="text-dark-400 hover:text-gold-400 transition-colors text-sm"
                >
                  {t('footer.giveaways')}
                </Link>
              </li>{' '}
            </ul>{' '}
          </div>{' '}
          <div>
            {' '}
            <h4 className="text-sm font-semibold text-dark-200 uppercase tracking-wider mb-4">
              {t('footer.community')}
            </h4>{' '}
            <ul className="space-y-2">
              {' '}
              <li>
                <Link
                  to="/team"
                  className="text-dark-400 hover:text-gold-400 transition-colors text-sm"
                >
                  {t('footer.ourTeam')}
                </Link>
              </li>{' '}
              <li>
                <Link
                  to="/info"
                  className="text-dark-400 hover:text-gold-400 transition-colors text-sm"
                >
                  {t('footer.serverInfo')}
                </Link>
              </li>{' '}
              <li>
                <Link
                  to="/info#rules"
                  className="text-dark-400 hover:text-gold-400 transition-colors text-sm"
                >
                  {t('footer.rules')}
                </Link>
              </li>{' '}
              <li>
                <Link
                  to="/faq"
                  className="text-dark-400 hover:text-gold-400 transition-colors text-sm"
                >
                  {t('footer.faq')}
                </Link>
              </li>{' '}
              <li>
                <Link
                  to="/apply"
                  className="text-dark-400 hover:text-gold-400 transition-colors text-sm"
                >
                  {t('footer.staffApply')}
                </Link>
              </li>{' '}
            </ul>{' '}
          </div>{' '}
          <div>
            {' '}
            <h4 className="text-sm font-semibold text-dark-200 uppercase tracking-wider mb-4">
              {t('footer.joinUs')}
            </h4>{' '}
            <div className="glass-card p-4 mb-4">
              {' '}
              <div className="flex items-center gap-3 mb-3">
                {' '}
                <div className="w-3 h-3 rounded-full bg-olive-500 animate-pulse" />{' '}
                <span className="text-sm text-dark-300">
                  {t('footer.serverOnline')}
                </span>{' '}
              </div>{' '}
              <p className="text-xs text-dark-500 mb-3">
                {t('footer.joinMembers')}
              </p>{' '}
              <a
                href="https://discord.gg/auccThQpMH"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm font-medium transition-colors"
              >
                {' '}
                <FaDiscord size={14} /> {t('footer.joinDiscord')}{' '}
              </a>{' '}
            </div>{' '}
          </div>{' '}
        </div>{' '}
        <div className="mt-10 pt-8 border-t border-dark-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
          {' '}
          <p className="text-dark-500 text-xs">
            &copy; {new Date().getFullYear()} SNAKES Community. All rights
            reserved.
          </p>{' '}
          <div className="flex items-center gap-4">
            {' '}
            <Link
              to="/login"
              className="text-dark-600 hover:text-dark-400 transition-colors text-xs"
            >
              {t('footer.staffLogin')}
            </Link>{' '}
          </div>{' '}
        </div>{' '}
      </div>{' '}
    </footer>
  );
}
