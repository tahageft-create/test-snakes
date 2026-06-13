import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageWrapper from "../components/PageWrapper";
import { useLanguage } from "../contexts/LanguageContext";
import { FaDiscord } from "react-icons/fa";
import { HiRefresh } from "react-icons/hi";

const items = ["SNAKES", "GOLD", "VIP", "XP", "NITRO", "COINS", "FREE", "LUCK"];

function getRandomColor() {
  const colors = ["#fbbf24", "#84cc16", "#d97706", "#65a30d", "#f59e0b", "#a3e635"];
  return colors[Math.floor(Math.random() * colors.length)];
}

export default function Roulette() {
  const { t } = useLanguage();
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    const winner = items[Math.floor(Math.random() * items.length)];
    const extraSpins = 5 + Math.floor(Math.random() * 3);
    const itemAngle = (items.indexOf(winner) / items.length) * 360;
    const totalRotation = rotation + extraSpins * 360 + (360 - itemAngle);
    setRotation(totalRotation);
    setTimeout(() => {
      setResult(winner);
      setSpinning(false);
    }, 3000);
  };

  return (
    <PageWrapper>
      <div className="page-container flex items-center justify-center">
        <div className="max-w-lg mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="section-title mb-2">
              <span className="text-gradient">{t("roulette.title")}</span>
            </h1>
            <p className="text-dark-400 mb-10">{t("roulette.desc")}</p>
          </motion.div>

          <div className="relative w-72 h-72 mx-auto mb-10">
            <motion.div
              className="w-full h-full rounded-full border-4 border-gold-500/30 shadow-2xl shadow-gold-500/20 relative overflow-hidden"
              style={{ rotate: `${rotation}deg` }}
              transition={{ duration: 3, ease: [0.09, 0.79, 0.1, 1] }}
            >
              {items.map((item, i) => {
                const angle = (360 / items.length) * i;
                return (
                  <div
                    key={item}
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ rotate: `${angle}deg` }}
                  >
                    <div
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 origin-bottom"
                      style={{
                        background: `linear-gradient(to right, transparent, ${getRandomColor()}40, transparent)`,
                        clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                      }}
                    />
                    <span
                      className="absolute top-6 left-1/2 -translate-x-1/2 text-xs font-bold"
                      style={{ rotate: `${-angle}deg`, color: getRandomColor() }}
                    >
                      {item}
                    </span>
                  </div>
                );
              })}
              <div className="absolute inset-4 rounded-full border-2 border-dark-800/50 bg-dark-950/80 flex items-center justify-center">
                <span className="text-2xl">🎰</span>
              </div>
            </motion.div>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-gold-400 drop-shadow-lg" />
          </div>

          <AnimatePresence>
            {result && !spinning && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="mb-6">
                <div className="glass-card p-4 border-gold-500/30">
                  <p className="text-sm text-dark-400 mb-1">{t("roulette.won")}</p>
                  <p className="text-2xl font-bold text-gold-400">{result}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={spin}
            disabled={spinning}
            className="btn-primary text-lg py-4 px-10 inline-flex items-center gap-3 mx-auto"
          >
            <HiRefresh size={20} className={spinning ? "animate-spin" : ""} />
            {spinning ? t("roulette.spinning") : t("roulette.spin")}
          </button>

          <p className="text-dark-500 text-xs mt-8 max-w-md mx-auto">
            {t("roulette.disclaimer")}
          </p>
        </div>
      </div>
    </PageWrapper>
  );
}
