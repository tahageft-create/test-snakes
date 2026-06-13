import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import StatCard from "../components/StatCard";
import { useLanguage } from "../contexts/LanguageContext";
import type { TranslationKey } from "../lib/translations";
import api from "../lib/api";
import type { ServerStats, Event, Game, TeamMember, FAQ } from "../lib/types";
import { HiUsers, HiStatusOnline, HiMicrophone, HiBadgeCheck } from "react-icons/hi";
import { FaDiscord } from "react-icons/fa";
import { MdEvent } from "react-icons/md";
import { GameIcon } from "../components/GameIcon";

const SNAKES_LOGO = "https://images-ext-1.discordapp.net/external/qmYy-6LU-SDQrqF0V62hqyKCGd86cACC-IS_Lu0M2NU/%3Fsize%3D1024/https/cdn.discordapp.com/icons/1400333179126157342/a_8d32d26812a7ecd9464b3ed4c86255e5.gif?width=1692&height=1692";
const SNAKES_BANNER = "https://images-ext-1.discordapp.net/external/KIIqZ7Nl9yebpj8m345MQ4IL86gYWY8QpTRGIGsMxDs/%3Fsize%3D512/https/cdn.discordapp.com/banners/1400333179126157342/a_ce29f69bedc010609208c908cee32888.gif?width=1200&height=675";

const values: { titleKey: TranslationKey; descKey: TranslationKey; icon: string; gradient: string }[] = [
  {
    titleKey: "home.valueRespect",
    descKey: "home.valueRespectDesc",
    icon: "01",
    gradient: "from-gold-500/20 to-gold-900/20",
  },
  {
    titleKey: "home.valueSkill",
    descKey: "home.valueSkillDesc",
    icon: "02",
    gradient: "from-olive-500/20 to-olive-900/20",
  },
  {
    titleKey: "home.valueUnity",
    descKey: "home.valueUnityDesc",
    icon: "03",
    gradient: "from-gold-500/20 to-olive-900/20",
  },
  {
    titleKey: "home.valueGrowth",
    descKey: "home.valueGrowthDesc",
    icon: "04",
    gradient: "from-olive-500/20 to-gold-900/20",
  },
];

const faqHome: FAQ[] = [
  { id: 1, question: "How do I join the server?", answer: 'Click the "Join Discord" button anywhere on this page. You\'ll be redirected to our Discord invite link. Accept the invite, read the rules, and you\'re in.', category: "general", display_order: 1, created_at: "" },
  { id: 2, question: "Is the server free to join?", answer: "Yes — 100% free. We may offer optional premium perks in the future, but the core community experience will always be free.", category: "general", display_order: 2, created_at: "" },
  { id: 3, question: "What games do you support?", answer: "We actively support Valorant, League of Legends, CS2, Fortnite, Apex Legends, Rocket League, Overwatch 2, and Call of Duty. We're always adding more based on community interest.", category: "general", display_order: 3, created_at: "" },
  { id: 4, question: "How do tournaments work?", answer: "Tournaments are announced in our #events channel. Sign up through the bot, form or find a team, and compete in bracket-style or round-robin formats. Prizes vary by event.", category: "general", display_order: 4, created_at: "" },
  { id: 5, question: "Can I become a moderator?", answer: "Yes! Active, respectful members can apply through our staff application process. We look for consistency, maturity, and a genuine desire to help the community.", category: "general", display_order: 5, created_at: "" },
  { id: 6, question: "What are the server rules?", answer: "Respect everyone, no toxicity, no spam, no NSFW content, no cheating. Full rules are in the #rules channel on Discord.", category: "general", display_order: 6, created_at: "" },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Home() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<ServerStats | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  useEffect(() => {
    api.get("/stats").then((r) => setStats(r.data)).catch(() => {});
    api.get("/events?status=upcoming,active").then((r) => setEvents(r.data)).catch(() => {});
    api.get("/games").then((r) => setGames(r.data)).catch(() => {});
    api.get("/team").then((r) => setTeam(r.data)).catch(() => {});
    api.get("/faq").then((r) => setFaqs(r.data)).catch(() => {});
  }, []);

  return (
    <PageWrapper className="!pt-0 !pb-0">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={SNAKES_BANNER} alt="" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-dark-950/60 via-dark-950/85 to-dark-950" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(251,191,36,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(251,191,36,0.03)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-gold-500/10 via-olive-500/5 to-transparent rounded-full blur-3xl" />
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: "easeOut" }}>
            <div className="mb-6 flex justify-center">
              <img src={SNAKES_LOGO} alt="SNAKES" className="w-24 h-24 md:w-32 md:h-32 rounded-full ring-2 ring-gold-500/30 shadow-2xl shadow-gold-500/20" />
            </div>
            <div className="mb-6">
              <span className="inline-block px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-sm font-medium tracking-wide">
                {t("home.badge")}
              </span>
            </div>
            <h1 className="text-7xl sm:text-8xl md:text-9xl font-bold font-gaming tracking-widest mb-6">
              <span className="text-gradient">SNAKES</span>
            </h1>
            <p className="text-xl md:text-2xl text-dark-300 max-w-2xl mx-auto mb-8 leading-relaxed">
              {t("home.subtitle")}
            </p>
            {/* Hero Stats */}
            <div className="flex items-center justify-center gap-6 mb-10 flex-wrap">
              <div className="text-center">
                <div className="text-3xl font-bold text-gold-400">{stats?.memberCount ?? "--"}</div>
                <div className="text-sm text-dark-400 mt-1">{t("home.totalMembers")}</div>
              </div>
              <div className="w-px h-10 bg-dark-600" />
              <div className="text-center">
                <div className="text-3xl font-bold text-olive-400">{stats?.onlineCount ?? "--"}</div>
                <div className="text-sm text-dark-400 mt-1">{t("home.onlineNow")}</div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://discord.gg/auccThQpMH"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-lg py-4 px-8 inline-flex items-center gap-3"
              >
                <FaDiscord size={22} /> {t("home.joinDen")}
              </a>
              <a href="#features" className="btn-secondary text-lg py-4 px-8">
                {t("home.exploreGames")}
              </a>
            </div>
          </motion.div>
        </div>
        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2" animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-dark-500 tracking-widest uppercase">{t("home.scroll")}</span>
            <div className="w-5 h-8 rounded-full border-2 border-dark-600 flex items-start justify-center pt-2">
              <div className="w-1 h-2 bg-gold-400 rounded-full" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section id="features" className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants} className="text-center mb-14">
            <h2 className="section-title mb-3">
              {t("home.serverStats")}
            </h2>
            <p className="text-dark-400 text-lg">{t("home.statsDesc")}</p>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <StatCard label={t("home.totalMembers")} value={stats?.memberCount ?? 0} icon={<HiUsers />} color="#fbbf24" />
            <StatCard label={t("home.onlineNow")} value={stats?.onlineCount ?? 0} icon={<HiStatusOnline />} color="#84cc16" />
            <StatCard label={t("home.inVoice")} value={stats?.voiceActive ?? 0} icon={<HiMicrophone />} color="#d97706" />
            <StatCard label={t("home.staffOnline")} value={Math.floor((stats?.onlineCount ?? 0) * 0.08)} icon={<HiBadgeCheck />} color="#65a30d" />
          </div>
        </div>
      </section>

      {/* Games Section */}
      {games.length > 0 && (
        <section className="py-20 px-4 bg-dark-900/30">
          <div className="max-w-7xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants} className="flex items-end justify-between mb-10">
              <div>
                <h2 className="section-title mb-2">{t("home.ourGames")}</h2>
                <p className="text-dark-400">{t("home.gamesDesc")}</p>
              </div>
              <Link to="/games" className="btn-secondary text-sm py-2 px-4 whitespace-nowrap">{t("home.viewAll")}</Link>
            </motion.div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {games.slice(0, 5).map((game, i) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }} whileHover={{ y: -6 }}
                  className="glass-card p-5 text-center group"
                >
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform overflow-hidden" style={{ backgroundColor: `${game.color}20` }}>
                    <GameIcon icon={game.icon} color={game.color} size="text-3xl" />
                  </div>
                  <h3 className="font-bold text-sm mb-1" style={{ color: game.color }}>{game.name}</h3>
                  <p className="text-dark-500 text-xs mb-3">{game.player_count} {t("home.players")}</p>
                  <a href="https://discord.gg/auccThQpMH" target="_blank" rel="noopener noreferrer" className="inline-block text-xs py-1.5 px-4 rounded-lg bg-dark-800/50 text-dark-300 hover:text-gold-400 hover:bg-gold-500/10 transition-all border border-dark-700/50">
                    {t("home.join")}
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Events Section */}
      {events.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants} className="flex items-end justify-between mb-10">
              <div>
                <h2 className="section-title mb-2">{t("home.whatsHappening")}</h2>
                <p className="text-dark-400">{t("home.eventsDesc")}</p>
              </div>
              <Link to="/events" className="btn-secondary text-sm py-2 px-4 whitespace-nowrap">{t("home.viewAll")}</Link>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.slice(0, 3).map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }} whileHover={{ y: -6 }}
                  className="glass-card overflow-hidden group"
                >
                  {event.image && (
                    <div className="h-40 overflow-hidden">
                      <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      {event.status === "ended" ? (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-dark-800 text-dark-400">{t("home.ended")}</span>
                      ) : (
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${event.status === "active" ? "bg-gold-500/20 text-gold-400" : "bg-olive-500/20 text-olive-400"}`}>
                          {event.status === "active" ? t("events.live") : t("events.upcoming")}
                        </span>
                      )}
                      <span className="text-dark-500 text-xs">
                        {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                    <h3 className="text-base font-bold mb-1 group-hover:text-gold-400 transition-colors">{event.title}</h3>
                    <p className="text-dark-400 text-xs line-clamp-2">{event.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Values Section */}
      <section className="py-20 px-4 bg-dark-900/30">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants} className="text-center mb-14">
            <h2 className="section-title mb-3">{t("home.ourValues")}</h2>
            <p className="text-dark-400 text-lg">{t("home.valuesDesc")}</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <motion.div
                key={value.titleKey}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }} whileHover={{ y: -6 }}
                className="glass-card p-6 text-center group"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${value.gradient} flex items-center justify-center text-xl font-bold text-gold-400 mx-auto mb-5 group-hover:scale-110 transition-transform`}>
                  {value.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{t(value.titleKey)}</h3>
                <p className="text-dark-400 text-sm leading-relaxed">{t(value.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      {team.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants} className="text-center mb-14">
              <h2 className="section-title mb-3">{t("home.meetTheTeam")}</h2>
              <p className="text-dark-400 text-lg">{t("home.teamDesc")}</p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {team.slice(0, 4).map((member, i) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }}
                  className="glass-card p-6 text-center group"
                >
                  <img
                    src={member.avatar || SNAKES_LOGO}
                    alt={member.username}
                    className="w-20 h-20 rounded-full mx-auto mb-4 ring-2 ring-gold-500/20 group-hover:ring-gold-500/40 transition-all object-cover"
                  />
                  <h3 className="font-bold text-base">{member.username}</h3>
                  <p className="text-gold-400 text-xs font-medium mb-2">{member.role}</p>
                  <p className="text-dark-400 text-xs leading-relaxed line-clamp-2">{member.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-dark-900/30">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants} className="text-center mb-14">
            <h2 className="section-title mb-3">{t("home.gotQuestions")}</h2>
            <p className="text-dark-400 text-lg">{t("home.faqDesc")}</p>
          </motion.div>
          <div className="space-y-3">
            {(faqs.length > 0 ? faqs.slice(0, 4) : faqHome).map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-5 group cursor-pointer"
              >
                <h3 className="font-semibold text-sm mb-1 text-gold-400">{item.question}</h3>
                    <p className="text-dark-400 text-sm leading-relaxed">{item.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-28 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-gold-500/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.08),transparent_70%)]" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <img src={SNAKES_LOGO} alt="SNAKES" className="w-16 h-16 rounded-full mx-auto mb-6 ring-2 ring-gold-500/30" />
            <h2 className="text-4xl md:text-6xl font-bold font-gaming mb-4">{t("home.readyToPlay")}</h2>
            <p className="text-dark-300 text-lg mb-8">{t("home.readyPlayDesc")}</p>
            <div className="flex items-center justify-center gap-2 text-dark-400 text-sm mb-8">
              <span className="inline-block w-2 h-2 rounded-full bg-olive-500 animate-pulse" />
              <span>{stats?.onlineCount ?? 0} {t("home.onlineMembers")}</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="https://discord.gg/auccThQpMH" target="_blank" rel="noopener noreferrer" className="btn-primary text-lg py-4 px-10 inline-flex items-center gap-3">
                <FaDiscord size={22} /> {t("home.joinDiscord")}
              </a>
              <Link to="/events" className="btn-secondary text-lg py-4 px-10 inline-flex items-center gap-2">
                <MdEvent size={20} /> {t("home.viewEvents")}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </PageWrapper>
  );
}
