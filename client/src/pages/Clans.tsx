import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import { useLanguage } from "../contexts/LanguageContext";
import { FaDiscord, FaTrophy, FaUsers, FaGamepad } from "react-icons/fa";

const clans = [
  { name: "Shadow Vipers", members: 45, wins: 12, game: "Valorant", icon: "🐍", color: "#84cc16" },
  { name: "Golden Fangs", members: 38, wins: 8, game: "CS2", icon: "🦈", color: "#fbbf24" },
  { name: "Night Stalkers", members: 52, wins: 15, game: "League of Legends", icon: "🐺", color: "#d97706" },
  { name: "Desert Vipers", members: 29, wins: 6, game: "Fortnite", icon: "🦂", color: "#65a30d" },
  { name: "Crimson Serpents", members: 33, wins: 10, game: "Apex Legends", icon: "🐉", color: "#f59e0b" },
  { name: "Iron Coils", members: 41, wins: 9, game: "Rocket League", icon: "🛡️", color: "#a3e635" },
];

export default function Clans() {
  const { t } = useLanguage();
  return (
    <PageWrapper>
      <div className="page-container">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
            <h1 className="section-title mb-3">
              <span className="text-gradient">{t("clans.title")}</span>
            </h1>
            <p className="text-dark-400 text-lg">{t("clans.desc")}</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {clans.map((clan, i) => (
              <motion.div
                key={clan.name}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className="glass-card p-6 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{clan.icon}</div>
                    <div>
                      <h3 className="font-bold text-lg">{clan.name}</h3>
                      <span className="text-xs text-dark-400 flex items-center gap-1">
                        <FaGamepad size={10} /> {clan.game}
                      </span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ backgroundColor: `${clan.color}20`, color: clan.color }}>
                    #{i + 1}
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1.5 text-dark-400 text-sm">
                    <FaUsers size={12} /> {clan.members}
                  </div>
                  <div className="flex items-center gap-1.5 text-gold-400 text-sm">
                    <FaTrophy size={12} /> {clan.wins} wins
                  </div>
                </div>
                <button className="w-full py-2 rounded-lg text-sm font-medium border border-dark-600 text-dark-300 hover:text-gold-400 hover:border-gold-500/30 transition-all">
                  {t("clans.joinClan")}
                </button>
              </motion.div>
            ))}
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-center mt-12">
            <p className="text-dark-400 text-sm mb-4">{t("clans.createNote")}</p>
            <a href="https://discord.gg/auccThQpMH" target="_blank" rel="noopener noreferrer" className="btn-secondary inline-flex items-center gap-2 py-3 px-6">
              <FaDiscord size={18} /> {t("clans.joinDiscord")}
            </a>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
