import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../lib/api';
import type { TeamMember } from '../lib/types';
import { FaDiscord, FaTwitch, FaYoutube, FaGithub } from 'react-icons/fa';
const categoryLabels: Record<
  string,
  {
    labelKey: string;
    color: string;
  }
> = {
  founder: {
    labelKey: 'team.leadership',
    color: 'text-gold-400',
  },
  developer: {
    labelKey: 'team.development',
    color: 'text-olive-400',
  },
  moderator: {
    labelKey: 'team.moderation',
    color: 'text-gold-300',
  },
  staff: {
    labelKey: 'team.staffTeam',
    color: 'text-olive-300',
  },
};

const roleColors: Record<string, string> = {
  'Founder & Owner': 'from-gold-500 to-gold-600',
  'Co-Founder': 'from-gold-400 to-olive-500',
  'Lead Developer': 'from-olive-400 to-olive-500',
  'Head Moderator': 'from-gold-500 to-gold-400',
  'Senior Moderator': 'from-gold-400 to-gold-300',
  'Event Manager': 'from-olive-400 to-gold-400',
  'Community Manager': 'from-olive-500 to-olive-400',
  'Content Creator': 'from-gold-400 to-olive-400',
};

function SocialIcon({ platform }: { platform: string }) {
  switch (platform) {
    case 'discord':
      return <FaDiscord size={14} />;
    case 'twitch':
      return <FaTwitch size={14} />;
    case 'youtube':
      return <FaYoutube size={14} />;
    case 'github':
      return <FaGithub size={14} />;
    default:
      return null;
  }
}

export default function Team() {
  const { t } = useLanguage();

  const [team, setTeam] = useState<TeamMember[]>([]);
  useEffect(() => {
    api
      .get('/team')
      .then((r) => setTeam(r.data))
      .catch(() => {});
  }, []); // Group by category
  const grouped = team.reduce<Record<string, TeamMember[]>>((acc, m) => {
    if (!acc[m.category]) acc[m.category] = [];
    acc[m.category].push(m);
    return acc;
  }, {});
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
          <h1 className="section-title mb-4"> {t('team.title')} </h1>
          <p className="text-dark-400 text-lg max-w-2xl mx-auto">
            {' '}
            {t('team.desc')}{' '}
          </p>
        </motion.div>{' '}
        {/* Team categories */}{' '}
        {Object.entries(grouped).map(([category, members]) => {
          const catInfo = categoryLabels[category] || {
            labelKey: '',
            color: 'text-dark-300',
          };
          return (
            <div key={category} className="mb-16">
              <motion.h2
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
                className={`text-2xl font-bold font-gaming mb-8 ${catInfo.color}`}
              >
                {' '}
                {catInfo.labelKey ? t(catInfo.labelKey as any) : category}{' '}
              </motion.h2>
              <div
                className={`grid gap-6 ${
                  category === 'founder'
                    ? 'grid-cols-1 md:grid-cols-2'
                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                }`}
              >
                {' '}
                {members.map((member, i) => (
                  <motion.div
                    key={member.id}
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
                    }}
                    className="glass-card overflow-hidden group"
                  >
                    {' '}
                    {/* Role gradient bar */}{' '}
                    <div
                      className={`h-1.5 bg-gradient-to-r ${roleColors[member.role] || 'from-gold-500 to-olive-500'}`}
                    />
                    <div className="p-6 text-center">
                      {' '}
                      {/* Avatar */}{' '}
                      <div className="relative mx-auto mb-4 w-20 h-20">
                        {' '}
                        {member.avatar ? (
                          <img
                            src={member.avatar}
                            alt={member.username}
                            className="w-20 h-20 rounded-2xl object-cover"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold-500/20 to-olive-500/20 flex items-center justify-center text-3xl font-bold font-gaming text-gold-400 border-2 border-gold-500/20 group-hover:border-gold-500/40 transition-all">
                            {' '}
                            {member.username.charAt(0)}{' '}
                          </div>
                        )}{' '}
                        {/* Online indicator */}{' '}
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-olive-500 border-2 border-dark-900" />
                      </div>
                      <h3 className="text-lg font-bold mb-1 group-hover:text-gold-400 transition-colors">
                        {' '}
                        {member.username}{' '}
                      </h3>
                      <p className="text-gold-400 text-sm font-medium mb-3">
                        {member.role}
                      </p>
                      <p className="text-dark-400 text-sm leading-relaxed mb-4 line-clamp-3">
                        {' '}
                        {member.description}{' '}
                      </p>{' '}
                      {/* Social links */}{' '}
                      {member.socials &&
                        Object.keys(member.socials).length > 0 && (
                          <div className="flex items-center justify-center gap-2 pt-4 border-t border-dark-800/50">
                            {' '}
                            {Object.entries(member.socials).map(
                              ([platform, handle]) => (
                                <a
                                  key={platform}
                                  href={
                                    platform === 'discord'
                                      ? 'https://discord.gg/auccThQpMH'
                                      : platform === 'twitch'
                                        ? `https://twitch.tv/${handle}`
                                        : platform === 'youtube'
                                          ? `https://youtube.com/${handle}`
                                          : platform === 'github'
                                            ? `https://github.com/${handle}`
                                            : '#'
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-9 h-9 rounded-lg bg-dark-800/50 flex items-center justify-center text-dark-400 hover:text-gold-400 hover:bg-gold-500/10 transition-all"
                                  title={`${platform}: ${handle}`}
                                >
                                  <SocialIcon platform={platform} />
                                </a>
                              ),
                            )}{' '}
                          </div>
                        )}{' '}
                    </div>
                  </motion.div>
                ))}{' '}
              </div>
            </div>
          );
        })}{' '}
      </div>
    </PageWrapper>
  );
}
