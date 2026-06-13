import { motion } from "framer-motion";
import PageWrapper from "../components/PageWrapper";
import { useLanguage } from "../contexts/LanguageContext";
import type { TranslationKey } from "../lib/translations";
import { FaDiscord, FaCrown, FaStar, FaRocket } from "react-icons/fa";
import { HiCheck } from "react-icons/hi";

const plans = [
  {
    nameKey: "premium.bronze",
    price: "$4.99",
    periodKey: "premium.month",
    icon: <FaStar className="text-gold-400" />,
    features: ["premium.feature1", "premium.feature2"],
    popular: false,
  },
  {
    nameKey: "premium.silver",
    price: "$9.99",
    periodKey: "premium.month",
    icon: <FaCrown className="text-gold-400" />,
    features: ["premium.feature1", "premium.feature2", "premium.feature3", "premium.feature4"],
    popular: true,
  },
  {
    nameKey: "premium.gold",
    price: "$19.99",
    periodKey: "premium.month",
    icon: <FaRocket className="text-gold-400" />,
    features: ["premium.feature1", "premium.feature2", "premium.feature3", "premium.feature4", "premium.feature5", "premium.feature6"],
    popular: false,
  },
];

export default function Premium() {
  const { t } = useLanguage();
  return (
    <PageWrapper>
      <div className="page-container">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
            <h1 className="section-title mb-3">{t("premium.title")}</h1>
            <p className="text-dark-400 text-lg">{t("premium.desc")}</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.nameKey}
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className={`glass-card p-8 text-center relative ${plan.popular ? "ring-2 ring-gold-500" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gold-500 text-dark-950 text-xs font-bold rounded-full">
                    {t("premium.popular")}
                  </div>
                )}
                <div className="w-16 h-16 rounded-2xl bg-gold-500/10 flex items-center justify-center text-3xl mx-auto mb-4">
                  {plan.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{t(plan.nameKey as TranslationKey)}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gradient">{plan.price}</span>
                  <span className="text-dark-400 text-sm">/{t(plan.periodKey as TranslationKey)}</span>
                </div>
                <ul className="space-y-3 mb-8 text-start">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-dark-300">
                      <HiCheck className="text-olive-400 shrink-0" size={16} />
                      {t(f as TranslationKey)}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-xl font-semibold transition-all ${plan.popular ? "btn-primary" : "btn-secondary"}`}>
                  {t("premium.subscribe")}
                </button>
              </motion.div>
            ))}
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center mt-12">
            <p className="text-dark-400 text-sm mb-4">{t("premium.discordNote")}</p>
            <a href="https://discord.gg/auccThQpMH" target="_blank" rel="noopener noreferrer" className="btn-secondary inline-flex items-center gap-2 py-3 px-6">
              <FaDiscord size={18} /> {t("premium.joinDiscord")}
            </a>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
