import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../lib/api';
import type { Game } from '../lib/types';
import { FaDiscord } from 'react-icons/fa';
import { HiUsers } from 'react-icons/hi';
import { GameIcon } from '../components/GameIcon';
export default function Games() {
  const { t } = useLanguage();
  const [games, setGames] = useState<Game[]>([]);
  const [filter, setFilter] = useState('all');
  useEffect(() => {
    api
      .get('/games')
      .then((r) => setGames(r.data))
      .catch(() => {});
  }, []);
  const categories = [
    'all',
    ...Array.from(new Set(games.map((g) => g.category))),
  ];
  const filtered =
    filter === 'all' ? games : games.filter((g) => g.category === filter);
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
          <h1 className="section-title mb-4"> {t('games.title')} </h1>{' '}
          <p className="text-dark-400 text-lg max-w-2xl mx-auto">
            {' '}
            {t('games.desc')}{' '}
          </p>{' '}
        </motion.div>{' '}
        {/* Category filter */}{' '}
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          {' '}
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                filter === cat
                  ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20'
                  : 'text-dark-400 hover:text-white hover:bg-dark-800/50 border border-transparent'
              }`}
            >
              {' '}
              {cat === 'battle-royale'
                ? 'Battle Royale'
                : cat === 'fps'
                  ? 'FPS'
                  : cat === 'moba'
                    ? 'MOBA'
                    : cat === 'rpg'
                      ? 'RPG'
                      : cat === 'sandbox'
                        ? 'Sandbox'
                        : cat === 'party'
                          ? 'Party'
                          : cat === 'sports'
                            ? 'Sports'
                            : cat}{' '}
            </button>
          ))}{' '}
        </div>{' '}
        {/* Featured games */}{' '}
        <div className="mb-12">
          {' '}
          <h2 className="text-2xl font-bold font-gaming mb-6">
            {' '}
            {t('games.featured')}{' '}
          </h2>{' '}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {' '}
            {filtered
              .filter((g) => g.featured)
              .map((game, i) => (
                <motion.div
                  key={game.id}
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
                    y: -8,
                    scale: 1.02,
                  }}
                  className="glass-card overflow-hidden group cursor-pointer"
                >
                  {' '}
                  {/* Color bar */}{' '}
                  <div
                    className="h-1.5 w-full"
                    style={{
                      backgroundColor: game.color,
                    }}
                  />{' '}
                  <div className="p-6">
                    {' '}
                    <div className="flex items-center gap-4 mb-4">
                      {' '}
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0 transition-transform group-hover:scale-110"
                        style={{
                          backgroundColor: `${game.color}20`,
                        }}
                      >
                        {' '}
                        <GameIcon icon={game.icon} color={game.color} size="text-3xl" />{' '}
                      </div>{' '}
                      <div>
                        {' '}
                        <h3
                          className="font-bold text-lg"
                          style={{
                            color: game.color,
                          }}
                        >
                          {game.name}
                        </h3>{' '}
                        <div className="flex items-center gap-1.5 text-dark-400 text-sm">
                          {' '}
                          <HiUsers size={14} />{' '}
                          <span>
                            {game.player_count} {t('games.players')}
                          </span>{' '}
                        </div>{' '}
                      </div>{' '}
                    </div>{' '}
                    <p className="text-dark-400 text-sm leading-relaxed mb-5 line-clamp-2">
                      {' '}
                      {game.description}{' '}
                    </p>{' '}
                    <a
                      href="https://discord.gg/auccThQpMH"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
                      style={{
                        backgroundColor: `${game.color}15`,
                        color: game.color,
                        border: `1px solid ${game.color}30`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `${game.color}25`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = `${game.color}15`;
                      }}
                    >
                      {' '}
                      <FaDiscord size={14} /> {t('games.joinChannel')}{' '}
                    </a>{' '}
                  </div>{' '}
                </motion.div>
              ))}{' '}
          </div>{' '}
        </div>{' '}
        {/* All games grid */}{' '}
        <div>
          {' '}
          <h2 className="text-2xl font-bold font-gaming mb-6">
            {' '}
            {t('games.all')}{' '}
          </h2>{' '}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {' '}
            {filtered
              .filter((g) => !g.featured)
              .map((game, i) => (
                <motion.div
                  key={game.id}
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    delay: i * 0.05,
                  }}
                  whileHover={{
                    y: -4,
                  }}
                  className="glass-card p-4 group cursor-pointer transition-all hover:glow-border"
                >
                  {' '}
                  <div className="flex items-center gap-3 mb-3">
                    {' '}
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0"
                      style={{
                        backgroundColor: `${game.color}20`,
                      }}
                    >
                      {' '}
                      <GameIcon icon={game.icon} color={game.color} size="text-xl" />{' '}
                    </div>{' '}
                    <div className="flex-1 min-w-0">
                      {' '}
                      <h3
                        className="font-semibold text-sm truncate"
                        style={{
                          color: game.color,
                        }}
                      >
                        {game.name}
                      </h3>{' '}
                      <span className="text-dark-500 text-xs">
                        {game.player_count} {t('games.players')}
                      </span>{' '}
                    </div>{' '}
                  </div>{' '}
                  <p className="text-dark-400 text-xs leading-relaxed line-clamp-2 mb-3">
                    {' '}
                    {game.description}{' '}
                  </p>{' '}
                  <a
                    href="https://discord.gg/auccThQpMH"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition-all"
                    style={{
                      color: game.color,
                      backgroundColor: `${game.color}10`,
                    }}
                  >
                    {' '}
                    <FaDiscord size={10} /> {t('games.join')}{' '}
                  </a>{' '}
                </motion.div>
              ))}{' '}
          </div>{' '}
        </div>{' '}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            {' '}
            <p className="text-dark-500 text-lg">{t('games.noGames')}</p>{' '}
          </div>
        )}{' '}
      </div>{' '}
    </PageWrapper>
  );
}
