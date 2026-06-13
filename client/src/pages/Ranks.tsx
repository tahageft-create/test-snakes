import { useState } from 'react';
import { motion } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';
import { useLanguage } from '../contexts/LanguageContext';
import type { Rank } from '../lib/types';
const voiceRanks: Rank[] = [
  {
    id: 1,
    name: 'Novice',
    type: 'voice',
    level: 10,
    color: '#94a3b8',
    icon: '🌱',
    permissions: ['Access to general voice channels', 'Basic emotes'],
  },
  {
    id: 2,
    name: 'Adept',
    type: 'voice',
    level: 20,
    color: '#84cc16',
    icon: '⚔️',
    permissions: ['Custom nickname', 'Voice channel priority'],
  },
  {
    id: 3,
    name: 'Sentinel',
    type: 'voice',
    level: 30,
    color: '#65a30d',
    icon: '🛡️',
    permissions: ['Private voice channel creation', 'Embed links'],
  },
  {
    id: 4,
    name: 'Elite',
    type: 'voice',
    level: 40,
    color: '#d97706',
    icon: '💎',
    permissions: ['Exclusive voice lounge access', 'Custom role color'],
  },
  {
    id: 5,
    name: 'Expert',
    type: 'voice',
    level: 60,
    color: '#fbbf24',
    icon: '👑',
    permissions: ['Event hosting rights', 'VIP voice channel'],
  },
  {
    id: 6,
    name: 'Archon',
    type: 'voice',
    level: 100,
    color: '#fcd34d',
    icon: '🔥',
    permissions: [
      'All Elite perks',
      'Server influence voting',
      'Exclusive Archon lounge',
    ],
  },
];
const chatRanks: Rank[] = [
  {
    id: 7,
    name: 'Explorer',
    type: 'chat',
    level: 10,
    color: '#94a3b8',
    icon: '🗺️',
    permissions: ['Image uploads', 'Reaction access'],
  },
  {
    id: 8,
    name: 'Socialite',
    type: 'chat',
    level: 30,
    color: '#84cc16',
    icon: '💬',
    permissions: ['Custom nickname', 'Sticker access'],
  },
  {
    id: 9,
    name: 'Enthusiast',
    type: 'chat',
    level: 60,
    color: '#d97706',
    icon: '⚡',
    permissions: ['Embed links', 'Thread creation'],
  },
  {
    id: 10,
    name: 'Analyste',
    type: 'chat',
    level: 80,
    color: '#fbbf24',
    icon: '🧠',
    permissions: [
      'All Enthusiast perks',
      'Exclusive chat channels',
      'Poll creation',
    ],
  },
];
function RankCard({ rank, index }: { rank: Rank; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useLanguage();
  return (
    <motion.div
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
        delay: index * 0.08,
      }}
      className="glass-card overflow-hidden transition-all duration-300 hover:border-opacity-60 cursor-pointer"
      style={{
        borderColor: `${rank.color}30`,
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-5 flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{
            backgroundColor: `${rank.color}15`,
          }}
        >
          {' '}
          {rank.icon}{' '}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h3
              className="font-bold text-lg"
              style={{
                color: rank.color,
              }}
            >
              {rank.name}
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-dark-800 text-dark-300">
              {' '}
              {t('ranks.level')} {rank.level}{' '}
            </span>
          </div>
        </div>
        <motion.div
          animate={{
            rotate: expanded ? 180 : 0,
          }}
          transition={{
            duration: 0.2,
          }}
          className="text-dark-500"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </motion.div>
      </div>
      <motion.div
        initial={false}
        animate={{
          height: expanded ? 'auto' : 0,
          opacity: expanded ? 1 : 0,
        }}
        transition={{
          duration: 0.3,
        }}
        className="overflow-hidden"
      >
        <div className="px-5 pb-5 border-t border-dark-800/50 pt-4">
          <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">
            {t('ranks.unlockedPerms')}
          </p>
          <ul className="space-y-2">
            {' '}
            {rank.permissions.map((perm) => (
              <li
                key={perm}
                className="flex items-center gap-2 text-sm text-dark-300"
              >
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: rank.color,
                  }}
                />{' '}
                {perm}{' '}
              </li>
            ))}{' '}
          </ul>
        </div>
      </motion.div>
    </motion.div>
  );
}

function RankProgression({
  ranks,
  title,
  subtitle,
}: {
  ranks: Rank[];
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-16">
      <div className="text-center mb-10">
        <h3 className="text-2xl md:text-3xl font-bold font-gaming mb-2">
          {title}
        </h3>
        <p className="text-dark-400">{subtitle}</p>
      </div>{' '}
      {/* Visual progression bar */}{' '}
      <div className="relative mb-10 px-4">
        <div className="flex items-center justify-between relative">
          {' '}
          {/* Background line */}{' '}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-dark-800 -translate-y-1/2 rounded-full" />{' '}
          {/* Gradient progress */}{' '}
          <div
            className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-dark-600 via-gold-500 to-olive-500 -translate-y-1/2 rounded-full"
            style={{
              width: '100%',
            }}
          />{' '}
          {ranks.map((rank, i) => (
            <motion.div
              key={rank.id}
              initial={{
                opacity: 0,
                scale: 0,
              }}
              whileInView={{
                opacity: 1,
                scale: 1,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                delay: 0.3 + i * 0.15,
                type: 'spring',
                stiffness: 200,
              }}
              className="relative z-10 flex flex-col items-center"
            >
              <div
                className="w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center text-lg md:text-2xl border-2 transition-transform hover:scale-125"
                style={{
                  borderColor: rank.color,
                  backgroundColor: `${rank.color}20`,
                  boxShadow: `0 0 20px ${rank.color}30`,
                }}
              >
                {' '}
                {rank.icon}{' '}
              </div>
              <span
                className="mt-2 text-xs font-medium hidden md:block"
                style={{
                  color: rank.color,
                }}
              >
                {' '}
                {rank.name}{' '}
              </span>
              <span className="text-[10px] text-dark-500 font-mono">
                {' '}
                L{rank.level}{' '}
              </span>
            </motion.div>
          ))}{' '}
        </div>
      </div>{' '}
      {/* Rank cards */}{' '}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {' '}
        {ranks.map((rank, i) => (
          <RankCard key={rank.id} rank={rank} index={i} />
        ))}{' '}
      </div>
    </div>
  );
}

export default function Ranks() {
  const { t } = useLanguage();
  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto px-4">
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
          <h1 className="section-title mb-4"> {t('ranks.title')} </h1>
          <p className="text-dark-400 text-lg max-w-2xl mx-auto">
            {' '}
            {t('ranks.desc')}{' '}
          </p>
        </motion.div>
        <RankProgression
          ranks={voiceRanks}
          title={t('ranks.voiceTitle')}
          subtitle={t('ranks.voiceSub')}
        />

        <RankProgression
          ranks={chatRanks}
          title={t('ranks.chatTitle')}
          subtitle={t('ranks.chatSub')}
        />
      </div>
    </PageWrapper>
  );
}
