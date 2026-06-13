import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import Scene3D from "../components/Scene3D";
import StatCard from "../components/StatCard";
import { useLanguage } from "../contexts/LanguageContext";
import { type TranslationKey } from "../lib/translations";
import api from "../lib/api";
import type {
  ServerStats,
  Event,
  Announcement,
  Game,
  Tournament,
  Giveaway,
} from "../lib/types";
import {
  HiUsers,
  HiStatusOnline,
  HiMicrophone,
  HiChat,
  HiGift,
  HiSparkles,
} from "react-icons/hi";
import { FaDiscord, FaTrophy } from "react-icons/fa";
const values: {
  titleKey: TranslationKey;
  descKey: TranslationKey;
  icon: string;
  gradient: string;
  border: string;
}[] = [
  {
    titleKey: "home.valueRespect",
    descKey: "home.valueRespectDesc",
    icon: "🤝",
    gradient: "from-gold-500/20 to-gold-900/20",
    border: "border-gold-500/20",
  },
  {
    titleKey: "home.valueSkill",
    descKey: "home.valueSkillDesc",
    icon: "⚡",
    gradient: "from-olive-500/20 to-olive-900/20",
    border: "border-olive-500/20",
  },
  {
    titleKey: "home.valueUnity",
    descKey: "home.valueUnityDesc",
    icon: "🔗",
    gradient: "from-gold-500/20 to-olive-900/20",
    border: "border-gold-500/20",
  },
  {
    titleKey: "home.valueGrowth",
    descKey: "home.valueGrowthDesc",
    icon: "🌱",
    gradient: "from-olive-500/20 to-gold-900/20",
    border: "border-olive-500/20",
  },
];
export default function Home() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<ServerStats | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [featuredGames, setFeaturedGames] = useState<Game[]>([]);
  const [activeTournaments, setActiveTournaments] = useState<Tournament[]>([]);
  const [activeGiveaways, setActiveGiveaways] = useState<Giveaway[]>([]);
  useEffect(() => {
    api
      .get("/stats")
      .then((r) => setStats(r.data))
      .catch(() => {});
    api
      .get("/events?status=upcoming,active")
      .then((r) => setEvents(r.data))
      .catch(() => {});
    api
      .get("/announcements?pinned=true")
      .then((r) => setAnnouncements(r.data))
      .catch(() => {});
    api
      .get("/games?featured=true")
      .then((r) => setFeaturedGames(r.data))
      .catch(() => {});
    api
      .get("/tournaments?status=upcoming,active")
      .then((r) => setActiveTournaments(r.data))
      .catch(() => {});
    api
      .get("/giveaways?status=active")
      .then((r) => setActiveGiveaways(r.data))
      .catch(() => {});
  }, []);
  return (
    <PageWrapper className="!pt-0 !pb-0">
      {" "}
      <Scene3D /> {/* Hero Section */}{" "}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {" "}
        <div className="absolute inset-0">
          {" "}
          <img
            src="/banner.gif"
            alt=""
            className="w-full h-full object-cover opacity-30"
          />{" "}
          <div className="absolute inset-0 bg-gradient-to-b from-dark-950/60 via-dark-950/85 to-dark-950" />{" "}
        </div>{" "}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(251,191,36,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(251,191,36,0.03)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />{" "}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-gold-500/10 via-olive-500/5 to-transparent rounded-full blur-3xl" />{" "}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          {" "}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.8,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
            }}
          >
            {" "}
            <div className="mb-6 flex justify-center">
              {" "}
              <img
                src="/logo.gif"
                alt="SNAKES"
                className="w-24 h-24 md:w-32 md:h-32 rounded-2xl shadow-2xl shadow-gold-500/20"
              />{" "}
            </div>{" "}
            <div className="mb-6">
              {" "}
              <span className="inline-block px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-sm font-medium tracking-wide">
                {" "}
                {t("home.badge")}{" "}
              </span>{" "}
            </div>{" "}
            <h1 className="text-7xl sm:text-8xl md:text-9xl font-bold font-gaming tracking-widest mb-6">
              {" "}
              <span className="text-gradient">SNAKES</span>{" "}
            </h1>{" "}
            <p className="text-xl md:text-2xl text-dark-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              {" "}
              {t("home.subtitle")} <br />{" "}
              <span className="text-dark-400">{t("home.subtitle2")}</span>{" "}
            </p>{" "}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {" "}
              <a
                href="https://discord.gg/auccThQpMH"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-lg py-4 px-8 inline-flex items-center gap-3"
              >
                {" "}
                <FaDiscord size={22} /> {t("home.joinDen")}{" "}
              </a>{" "}
              <Link to="/games" className="btn-secondary text-lg py-4 px-8">
                {" "}
                {t("home.exploreGames")}{" "}
              </Link>{" "}
            </div>{" "}
          </motion.div>{" "}
        </div>{" "}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          {" "}
          <div className="w-6 h-10 rounded-full border-2 border-dark-600 flex items-start justify-center pt-2">
            {" "}
            <div className="w-1 h-2 bg-gold-400 rounded-full" />{" "}
          </div>{" "}
        </motion.div>{" "}
      </section>{" "}
      {/* Stats Section */}{" "}
      <section id="stats" className="relative py-24 px-4">
        {" "}
        <div className="max-w-7xl mx-auto">
          {" "}
          <motion.div
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
            className="text-center mb-16"
          >
            {" "}
            <h2 className="section-title mb-4">
              {" "}
              {t("home.serverStats").split(" ")[0]}{" "}
              <span className="text-gradient">
                {t("home.serverStats").split(" ").slice(1).join(" ")}
              </span>{" "}
            </h2>{" "}
            <p className="text-dark-400 text-lg">{t("home.statsDesc")}</p>{" "}
          </motion.div>{" "}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {" "}
            <StatCard
              label={t("home.totalMembers")}
              value={stats?.memberCount ?? 0}
              icon={<HiUsers />}
              color="#fbbf24"
            />{" "}
            <StatCard
              label={t("home.onlineNow")}
              value={stats?.onlineCount ?? 0}
              icon={<HiStatusOnline />}
              color="#84cc16"
            />{" "}
            <StatCard
              label={t("home.inVoice")}
              value={stats?.voiceActive ?? 0}
              icon={<HiMicrophone />}
              color="#d97706"
            />{" "}
            <StatCard
              label={t("home.channels")}
              value={stats?.totalChannels ?? 0}
              icon={<HiChat />}
              color="#65a30d"
            />{" "}
          </div>{" "}
        </div>{" "}
      </section>{" "}
      {/* Our Values Section */}{" "}
      <section className="py-24 px-4 bg-dark-900/30">
        {" "}
        <div className="max-w-7xl mx-auto">
          {" "}
          <motion.div
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
            className="text-center mb-16"
          >
            {" "}
            <h2 className="section-title mb-4"> {t("home.ourValues")} </h2>{" "}
            <p className="text-dark-400 text-lg">{t("home.valuesDesc")}</p>{" "}
          </motion.div>{" "}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {" "}
            {values.map((value, i) => (
              <motion.div
                key={value.titleKey}
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
                className={`glass-card p-8 hover:${value.border} transition-all duration-300 group text-center`}
              >
                {" "}
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${value.gradient} flex items-center justify-center text-3xl mx-auto mb-6 group-hover:scale-110 transition-transform`}
                >
                  {" "}
                  {value.icon}{" "}
                </div>{" "}
                <h3 className="text-xl font-bold mb-3">{t(value.titleKey)}</h3>{" "}
                <p className="text-dark-400 text-sm leading-relaxed">
                  {t(value.descKey)}
                </p>{" "}
              </motion.div>
            ))}{" "}
          </div>{" "}
        </div>{" "}
      </section>{" "}
      {/* Featured Games Section */}{" "}
      {featuredGames.length > 0 && (
        <section className="py-24 px-4">
          {" "}
          <div className="max-w-7xl mx-auto">
            {" "}
            <motion.div
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
              className="flex items-end justify-between mb-10"
            >
              {" "}
              <div>
                {" "}
                <h2 className="section-title mb-2">
                  {" "}
                  {t("home.ourGames")}{" "}
                </h2>{" "}
                <p className="text-dark-400 text-lg">
                  {t("home.gamesDesc")}
                </p>{" "}
              </div>{" "}
              <Link to="/games" className="btn-secondary text-sm py-2 px-4">
                {t("home.viewAll")}
              </Link>{" "}
            </motion.div>{" "}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {" "}
              {featuredGames.slice(0, 4).map((game, i) => (
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
                    delay: i * 0.1,
                  }}
                  whileHover={{
                    y: -6,
                  }}
                  className="glass-card p-5 text-center group cursor-pointer"
                >
                  {" "}
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl mx-auto mb-3 group-hover:scale-110 transition-transform"
                    style={{
                      backgroundColor: `${game.color}20`,
                    }}
                  >
                    {" "}
                    {game.icon}{" "}
                  </div>{" "}
                  <h3
                    className="font-bold text-sm mb-1"
                    style={{
                      color: game.color,
                    }}
                  >
                    {game.name}
                  </h3>{" "}
                  <p className="text-dark-500 text-xs">
                    {game.player_count} {t("home.players")}
                  </p>{" "}
                </motion.div>
              ))}{" "}
            </div>{" "}
          </div>{" "}
        </section>
      )}{" "}
      {/* Active Tournaments */}{" "}
      {activeTournaments.length > 0 && (
        <section className="py-24 px-4 bg-dark-900/30">
          {" "}
          <div className="max-w-7xl mx-auto">
            {" "}
            <motion.div
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
              className="flex items-end justify-between mb-10"
            >
              {" "}
              <div>
                {" "}
                <h2 className="section-title mb-2">
                  {" "}
                  <span className="text-gradient">
                    {t("home.tournamentsTitle")}
                  </span>{" "}
                </h2>{" "}
                <p className="text-dark-400 text-lg">
                  {t("home.tournamentsDesc")}
                </p>{" "}
              </div>{" "}
              <Link
                to="/tournaments"
                className="btn-secondary text-sm py-2 px-4"
              >
                {t("home.viewAll")}
              </Link>{" "}
            </motion.div>{" "}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {" "}
              {activeTournaments.slice(0, 2).map((tournament, i) => (
                <motion.div
                  key={tournament.id}
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
                  whileHover={{
                    y: -4,
                  }}
                  className="glass-card p-6 group"
                >
                  {" "}
                  <div className="flex items-center gap-2 mb-3">
                    {" "}
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold ${
                        tournament.status === "active"
                          ? "bg-gold-500/20 text-gold-400"
                          : "bg-olive-500/20 text-olive-400"
                      }`}
                    >
                      {" "}
                      {tournament.status === "active"
                        ? t("home.live")
                        : t("home.upcoming")}{" "}
                    </span>{" "}
                    <span className="text-dark-500 text-xs">
                      {tournament.game}
                    </span>{" "}
                  </div>{" "}
                  <h3 className="text-lg font-bold mb-2 group-hover:text-gold-400 transition-colors">
                    {" "}
                    {tournament.name}{" "}
                  </h3>{" "}
                  <p className="text-dark-400 text-sm mb-4 line-clamp-2">
                    {tournament.description}
                  </p>{" "}
                  <div className="flex items-center gap-4">
                    {" "}
                    <div className="flex items-center gap-1.5 text-gold-400 text-sm">
                      {" "}
                      <FaTrophy size={12} />{" "}
                      <span className="font-medium">
                        {tournament.prize_pool}
                      </span>{" "}
                    </div>{" "}
                    <span className="text-dark-500 text-xs">
                      {" "}
                      {tournament.current_participants}/
                      {tournament.max_participants} {t("home.slots")}{" "}
                    </span>{" "}
                  </div>{" "}
                </motion.div>
              ))}{" "}
            </div>{" "}
          </div>{" "}
        </section>
      )}{" "}
      {/* Upcoming Events */}{" "}
      {events.length > 0 && (
        <section className="py-24 px-4">
          {" "}
          <div className="max-w-7xl mx-auto">
            {" "}
            <motion.div
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
              className="flex items-end justify-between mb-10"
            >
              {" "}
              <div>
                {" "}
                <h2 className="section-title mb-2">
                  {" "}
                  {t("home.upcomingEvents")}{" "}
                </h2>{" "}
              </div>{" "}
              <Link to="/events" className="btn-secondary text-sm py-2 px-4">
                {t("home.viewAll")}
              </Link>{" "}
            </motion.div>{" "}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {" "}
              {events.slice(0, 3).map((event, i) => (
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
                  className="glass-card p-6 hover:glow-border transition-all duration-300 group"
                >
                  {" "}
                  <div className="flex items-center gap-2 mb-3">
                    {" "}
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        event.status === "active"
                          ? "bg-gold-500/20 text-gold-400"
                          : "bg-olive-500/20 text-olive-400"
                      }`}
                    >
                      {" "}
                      {event.status === "active"
                        ? t("home.live")
                        : t("home.upcoming")}{" "}
                    </span>{" "}
                  </div>{" "}
                  <h3 className="text-lg font-bold mb-2 group-hover:text-gold-400 transition-colors">
                    {event.title}
                  </h3>{" "}
                  <p className="text-dark-400 text-sm mb-4">
                    {event.description}
                  </p>{" "}
                  <div className="text-dark-500 text-xs font-mono">
                    {" "}
                    {new Date(event.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                  </div>{" "}
                </motion.div>
              ))}{" "}
            </div>{" "}
          </div>{" "}
        </section>
      )}{" "}
      {/* Active Giveaways */}{" "}
      {activeGiveaways.length > 0 && (
        <section className="py-24 px-4 bg-dark-900/30">
          {" "}
          <div className="max-w-7xl mx-auto">
            {" "}
            <motion.div
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
              className="flex items-end justify-between mb-10"
            >
              {" "}
              <div>
                {" "}
                <h2 className="section-title mb-2">
                  {" "}
                  <span className="text-gradient">
                    {t("home.giveawaysTitle")}
                  </span>{" "}
                </h2>{" "}
                <p className="text-dark-400 text-lg">
                  {t("home.giveawaysDesc")}
                </p>{" "}
              </div>{" "}
              <Link to="/giveaways" className="btn-secondary text-sm py-2 px-4">
                {t("home.viewAll")}
              </Link>{" "}
            </motion.div>{" "}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {" "}
              {activeGiveaways.slice(0, 3).map((giveaway, i) => (
                <motion.div
                  key={giveaway.id}
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
                  whileHover={{
                    y: -4,
                  }}
                  className="glass-card overflow-hidden group"
                >
                  {" "}
                  <div className="h-1 bg-gradient-to-r from-gold-400 to-olive-400" />{" "}
                  <div className="p-6">
                    {" "}
                    <div className="flex items-center gap-2 mb-3">
                      {" "}
                      <HiGift className="text-gold-400" size={18} />{" "}
                      <span className="text-gold-400 text-xs font-bold">
                        {t("home.active")}
                      </span>{" "}
                    </div>{" "}
                    <h3 className="font-bold text-lg mb-2 group-hover:text-gold-400 transition-colors">
                      {" "}
                      {giveaway.title}{" "}
                    </h3>{" "}
                    <p className="text-gold-400 font-medium text-sm mb-3">
                      {giveaway.prize}
                    </p>{" "}
                    <div className="flex items-center justify-between text-dark-400 text-xs">
                      {" "}
                      <span>
                        {giveaway.participants} {t("home.entries")}
                      </span>{" "}
                      <span>
                        {t("home.ends")}{" "}
                        {new Date(giveaway.end_date).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </span>{" "}
                    </div>{" "}
                  </div>{" "}
                </motion.div>
              ))}{" "}
            </div>{" "}
          </div>{" "}
        </section>
      )}{" "}
      {/* Community Highlights */}{" "}
      <section className="py-24 px-4">
        {" "}
        <div className="max-w-7xl mx-auto">
          {" "}
          <motion.div
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
            className="text-center mb-16"
          >
            {" "}
            <h2 className="section-title mb-4">
              {" "}
              {t("home.communityHighlights")}{" "}
            </h2>{" "}
            <p className="text-dark-400 text-lg">
              {t("home.highlightsDesc")}
            </p>{" "}
          </motion.div>{" "}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {" "}
            {[
              {
                title: t("home.highlight1Title"),
                desc: t("home.highlight1Desc"),
                icon: "🎉",
                color: "#fbbf24",
              },
              {
                title: t("home.highlight2Title"),
                desc: t("home.highlight2Desc"),
                icon: "🏆",
                color: "#84cc16",
              },
              {
                title: t("home.highlight3Title"),
                desc: t("home.highlight3Desc"),
                icon: "🎙️",
                color: "#d97706",
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
                whileHover={{
                  y: -6,
                }}
                className="glass-card p-6 text-center group"
              >
                {" "}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform"
                  style={{
                    backgroundColor: `${h.color}20`,
                  }}
                >
                  {" "}
                  {h.icon}{" "}
                </div>{" "}
                <h3
                  className="font-bold mb-2"
                  style={{
                    color: h.color,
                  }}
                >
                  {h.title}
                </h3>{" "}
                <p className="text-dark-400 text-sm leading-relaxed">
                  {h.desc}
                </p>{" "}
              </motion.div>
            ))}{" "}
          </div>{" "}
        </div>{" "}
      </section>{" "}
      {/* Announcements */}{" "}
      {announcements.length > 0 && (
        <section className="py-24 px-4 bg-dark-900/30">
          {" "}
          <div className="max-w-4xl mx-auto">
            {" "}
            <motion.div
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
              className="text-center mb-16"
            >
              {" "}
              <h2 className="section-title mb-4">
                {" "}
                <span className="text-gradient">
                  {t("home.announcements")}
                </span>{" "}
              </h2>{" "}
            </motion.div>{" "}
            <div className="space-y-4">
              {" "}
              {announcements.slice(0, 3).map((ann, i) => (
                <motion.div
                  key={ann.id}
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
                  className="glass-card p-6 border-l-2 border-l-gold-500"
                >
                  {" "}
                  <div className="flex items-start justify-between gap-4">
                    {" "}
                    <div>
                      {" "}
                      <h3 className="text-lg font-bold mb-1">
                        {ann.title}
                      </h3>{" "}
                      <p className="text-dark-400 text-sm">
                        {ann.content}
                      </p>{" "}
                    </div>{" "}
                    <span className="text-dark-600 text-xs whitespace-nowrap">
                      {ann.author}
                    </span>{" "}
                  </div>{" "}
                </motion.div>
              ))}{" "}
            </div>{" "}
          </div>{" "}
        </section>
      )}{" "}
      {/* CTA Section */}{" "}
      <section className="py-32 px-4 relative overflow-hidden">
        {" "}
        <div className="absolute inset-0 bg-gradient-to-t from-gold-500/5 via-transparent to-transparent" />{" "}
        <div className="max-w-3xl mx-auto text-center relative z-10">
          {" "}
          <motion.div
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
          >
            {" "}
            <h2 className="text-4xl md:text-6xl font-bold font-gaming mb-6">
              {" "}
              {t("home.readyToJoin")}{" "}
            </h2>{" "}
            <p className="text-dark-300 text-lg mb-10">
              {" "}
              {t("home.readyDesc")}{" "}
            </p>{" "}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {" "}
              <a
                href="https://discord.gg/auccThQpMH"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-lg py-4 px-10 inline-flex items-center gap-3 animate-glow-pulse"
              >
                {" "}
                <FaDiscord size={22} /> {t("home.joinNow")}{" "}
              </a>{" "}
              <Link to="/faq" className="btn-secondary text-lg py-4 px-10">
                {" "}
                {t("home.learnMore")}{" "}
              </Link>{" "}
            </div>{" "}
          </motion.div>{" "}
        </div>{" "}
      </section>{" "}
    </PageWrapper>
  );
}
