import { useState } from "react";
import { motion } from "framer-motion";
import PageWrapper from "../components/PageWrapper";
import { useLanguage } from "../contexts/LanguageContext";
import { FaDiscord, FaShoppingCart } from "react-icons/fa";
import { HiCheck } from "react-icons/hi";

const products = [
  { name: "SNAKES T-Shirt", price: "1,500 DHS", desc: "Premium cotton t-shirt with SNAKES logo", image: "👕" },
  { name: "SNAKES Hoodie", price: "2,500 DHS", desc: "Comfortable hoodie for the den", image: "🧥" },
  { name: "SNAKES Cap", price: "800 DHS", desc: "Snapback cap with embroidered logo", image: "🧢" },
  { name: "SNAKES Sticker Pack", price: "300 DHS", desc: "10 stickers for your laptop or phone", image: "🖼️" },
  { name: "SNAKES Mousepad", price: "600 DHS", desc: "Large gaming mousepad", image: "🖱️" },
  { name: "SNAKES Keychain", price: "200 DHS", desc: "Metal keychain with engraved logo", image: "🔑" },
];

export default function Shop() {
  const { t } = useLanguage();
  const [added, setAdded] = useState<number | null>(null);
  const handleBuy = (i: number) => {
    setAdded(i);
    setTimeout(() => setAdded(null), 2000);
  };
  return (
    <PageWrapper>
      <div className="page-container">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
            <h1 className="section-title mb-3">{t("shop.title")}</h1>
            <p className="text-dark-400 text-lg">{t("shop.desc")}</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, i) => (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className="glass-card p-6 text-center group"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{product.image}</div>
                <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                <p className="text-dark-400 text-sm mb-3">{product.desc}</p>
                <p className="text-gold-400 font-bold text-xl mb-4">{product.price}</p>
                <button
                  onClick={() => handleBuy(i)}
                  className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${added === i ? "bg-olive-500/20 text-olive-400 border border-olive-500/30" : "btn-primary"}`}
                >
                  {added === i ? <><HiCheck size={18} /> {t("shop.added")}</> : <><FaShoppingCart size={16} /> {t("shop.buy")}</>}
                </button>
              </motion.div>
            ))}
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-center mt-12">
            <p className="text-dark-400 text-sm">{t("shop.discordNote")}</p>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
