import { useState } from 'react';
import { motion } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';
import { useLanguage } from '../contexts/LanguageContext';
import { type TranslationKey } from '../lib/translations';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi';
const channelCategories = [
  {
    name: 'Welcome',
    icon: '👋',
    channels: ['# welcome', '# rules', '# announcements', '# roles'],
  },
  {
    name: 'General',
    icon: '💬',
    channels: ['# general', '# memes', '# off-topic', '# media'],
  },
  {
    name: 'Gaming',
    icon: '🎮',
    channels: [
      '# valorant',
      '# minecraft',
      '# fortnite',
      '# league',
      '# other-games',
    ],
  },
  {
    name: 'Voice Channels',
    icon: '🔊',
    channels: [
      '🎙 General Voice',
      '🎙 Gaming 1',
      '🎙 Gaming 2',
      '🎙 Chill Zone',
      '🎵 Music',
    ],
  },
  {
    name: 'Rank Exclusives',
    icon: '⭐',
    channels: ['# elite-lounge', '# archon-den', '# vip-chat'],
  },
  {
    name: 'Staff',
    icon: '🛡️',
    channels: ['# staff-chat', '# mod-logs', '# reports'],
  },
];
const ruleKeys: {
  titleKey: TranslationKey;
  descKey: TranslationKey;
}[] = [
  {
    titleKey: 'info.rule1Title',
    descKey: 'info.rule1Desc',
  },
  {
    titleKey: 'info.rule2Title',
    descKey: 'info.rule2Desc',
  },
  {
    titleKey: 'info.rule3Title',
    descKey: 'info.rule3Desc',
  },
  {
    titleKey: 'info.rule4Title',
    descKey: 'info.rule4Desc',
  },
  {
    titleKey: 'info.rule5Title',
    descKey: 'info.rule5Desc',
  },
  {
    titleKey: 'info.rule6Title',
    descKey: 'info.rule6Desc',
  },
  {
    titleKey: 'info.rule7Title',
    descKey: 'info.rule7Desc',
  },
];
export default function ServerInfo() {
  const { t } = useLanguage();
  const [expandedCategory, setExpandedCategory] = useState<number | null>(0);
  const [formData, setFormData] = useState({
    username: '',
    age: '',
    experience: '',
    reason: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({
      username: '',
      age: '',
      experience: '',
      reason: '',
    });
  };
  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto px-4">
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
          <h1 className="section-title mb-4"> {t('info.title')} </h1>
          <p className="text-dark-400 text-lg">{t('info.desc')}</p>
        </motion.div>{' '}
        {/* Channels Overview */}{' '}
        <section className="mb-20">
          <motion.h2
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
            className="text-2xl font-bold mb-8 font-gaming"
          >
            {' '}
            {t('info.channelMap')}{' '}
          </motion.h2>
          <div className="glass-card p-6">
            <div className="space-y-2">
              {' '}
              {channelCategories.map((cat, i) => (
                <div key={cat.name}>
                  <button
                    onClick={() =>
                      setExpandedCategory(expandedCategory === i ? null : i)
                    }
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-dark-800/50 transition-all group"
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="font-semibold text-dark-200 group-hover:text-white transition-colors flex-1 text-left">
                      {' '}
                      {cat.name}{' '}
                    </span>
                    <span className="text-dark-500 text-xs font-mono">
                      {cat.channels.length} {t('info.channels')}
                    </span>{' '}
                    {expandedCategory === i ? (
                      <HiChevronUp className="text-dark-500" />
                    ) : (
                      <HiChevronDown className="text-dark-500" />
                    )}{' '}
                  </button>
                  <motion.div
                    initial={false}
                    animate={{
                      height: expandedCategory === i ? 'auto' : 0,
                      opacity: expandedCategory === i ? 1 : 0,
                    }}
                    transition={{
                      duration: 0.2,
                    }}
                    className="overflow-hidden"
                  >
                    <div className="pl-12 pb-3 space-y-1">
                      {' '}
                      {cat.channels.map((ch) => (
                        <div
                          key={ch}
                          className="flex items-center gap-2 py-1.5 text-sm text-dark-400 hover:text-dark-200 transition-colors"
                        >
                          <span className="text-dark-600">#</span> {ch}{' '}
                        </div>
                      ))}{' '}
                    </div>
                  </motion.div>
                </div>
              ))}{' '}
            </div>
          </div>
        </section>{' '}
        {/* Rules */}{' '}
        <section id="rules" className="mb-20">
          <motion.h2
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
            className="text-2xl font-bold mb-8 font-gaming"
          >
            {' '}
            {t('info.rules')}{' '}
          </motion.h2>
          <div className="space-y-4">
            {' '}
            {ruleKeys.map((rule, i) => (
              <motion.div
                key={i}
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
                  delay: i * 0.05,
                }}
                className="glass-card p-5 flex items-start gap-4"
              >
                <div className="w-8 h-8 rounded-lg bg-olive-500/10 flex items-center justify-center text-sm font-bold text-olive-400 shrink-0">
                  {' '}
                  {i + 1}{' '}
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">
                    {t(rule.titleKey)}
                  </h3>
                  <p className="text-dark-400 text-sm">{t(rule.descKey)}</p>
                </div>
              </motion.div>
            ))}{' '}
          </div>
        </section>{' '}
        {/* Staff Apply */}{' '}
        <section id="apply" className="mb-20">
          <motion.h2
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
            className="text-2xl font-bold mb-8 font-gaming"
          >
            {' '}
            {t('info.staffApp')}{' '}
          </motion.h2>
          <div className="glass-card p-8 max-w-2xl">
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
                <div className="text-4xl mb-4">✅</div>
                <h3 className="text-xl font-bold text-gold-400 mb-2">
                  {t('info.submitted')}
                </h3>
                <p className="text-dark-400">{t('info.submittedDesc')}</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    {t('info.discordUsername')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/25 transition-all outline-none"
                    placeholder="username#0000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    {t('info.age')}
                  </label>
                  <input
                    type="number"
                    required
                    min="13"
                    value={formData.age}
                    onChange={(e) =>
                      setFormData({ ...formData, age: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/25 transition-all outline-none"
                    placeholder={t('info.agePlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    {t('info.staffExp')}
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.experience}
                    onChange={(e) =>
                      setFormData({ ...formData, experience: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/25 transition-all outline-none resize-none"
                    placeholder={t('info.expPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    {t('info.whyJoin')}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData({ ...formData, reason: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/25 transition-all outline-none resize-none"
                    placeholder={t('info.reasonPlaceholder')}
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary w-full py-3 text-base"
                >
                  {' '}
                  {t('info.submitApp')}{' '}
                </button>
              </form>
            )}{' '}
          </div>
        </section>{' '}
        {/* Community Highlights */}{' '}
        <section>
          <motion.h2
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
            className="text-2xl font-bold mb-8 font-gaming"
          >
            {' '}
            {t('info.communityHighlights')}{' '}
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {' '}
            {[
              {
                title: t('info.active247'),
                desc: t('info.active247Desc'),
                icon: '🌍',
              },
              {
                title: t('info.weeklyEvents'),
                desc: t('info.weeklyEventsDesc'),
                icon: '📅',
              },
              {
                title: t('info.supportive'),
                desc: t('info.supportiveDesc'),
                icon: '🤝',
              },
            ].map((h, i) => (
              <motion.div
                key={i}
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
                  delay: i * 0.1,
                }}
                className="glass-card p-6 text-center"
              >
                <div className="text-3xl mb-3">{h.icon}</div>
                <h3 className="font-bold mb-2">{h.title}</h3>
                <p className="text-dark-400 text-sm">{h.desc}</p>
              </motion.div>
            ))}{' '}
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}
