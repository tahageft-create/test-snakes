import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../lib/api';
import type { FAQ as FAQType } from '../lib/types';
import { HiSearch, HiChevronDown } from 'react-icons/hi';
const categoryColors: Record<string, string> = {
  general: 'bg-gold-500/10 text-gold-400',
  ranks: 'bg-olive-500/10 text-olive-400',
  tournaments: 'bg-amber-500/10 text-amber-400',
};
export default function FAQ() {
  const { t } = useLanguage();
  const [faqs, setFaqs] = useState<FAQType[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expanded, setExpanded] = useState<number | null>(null);
  useEffect(() => {
    api
      .get('/faq')
      .then((r) => setFaqs(r.data))
      .catch(() => {});
  }, []);
  const categories = [
    'all',
    ...Array.from(new Set(faqs.map((f) => f.category))),
  ];
  const filtered = faqs.filter((f) => {
    const matchesCategory =
      activeCategory === 'all' || f.category === activeCategory;
    const matchesSearch =
      !search ||
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  return (
    <PageWrapper>
      {' '}
      <div className="max-w-4xl mx-auto px-4">
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
          <h1 className="section-title mb-4">
            {' '}
            <span className="text-gradient">{t('faq.title')}</span>{' '}
          </h1>{' '}
          <p className="text-dark-400 text-lg max-w-2xl mx-auto">
            {' '}
            {t('faq.desc')}{' '}
          </p>{' '}
        </motion.div>{' '}
        {/* Search bar */}{' '}
        <div className="relative mb-8">
          {' '}
          <HiSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500"
            size={20}
          />{' '}
          <input
            type="text"
            placeholder={t('faq.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-dark-800/50 border border-dark-700 rounded-2xl text-white placeholder-dark-500 focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/25 outline-none transition-all text-base"
          />{' '}
        </div>{' '}
        {/* Category filters */}{' '}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {' '}
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                activeCategory === cat
                  ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20'
                  : 'text-dark-400 hover:text-white hover:bg-dark-800/50 border border-transparent'
              }`}
            >
              {' '}
              {cat}{' '}
            </button>
          ))}{' '}
        </div>{' '}
        {/* FAQ items */}{' '}
        <div className="space-y-3">
          {' '}
          <AnimatePresence>
            {' '}
            {filtered.map((faq, i) => (
              <motion.div
                key={faq.id}
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -10,
                }}
                transition={{
                  delay: i * 0.03,
                }}
                className="glass-card overflow-hidden"
              >
                {' '}
                <button
                  onClick={() =>
                    setExpanded(expanded === faq.id ? null : faq.id)
                  }
                  className="w-full p-5 flex items-center gap-4 text-left hover:bg-dark-800/30 transition-colors"
                >
                  {' '}
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${categoryColors[faq.category] || 'bg-dark-700 text-dark-400'}`}
                  >
                    {' '}
                    {faq.category.toUpperCase()}{' '}
                  </span>{' '}
                  <span className="flex-1 font-medium text-sm md:text-base">
                    {faq.question}
                  </span>{' '}
                  <motion.div
                    animate={{
                      rotate: expanded === faq.id ? 180 : 0,
                    }}
                    transition={{
                      duration: 0.2,
                    }}
                    className="text-dark-500 shrink-0"
                  >
                    {' '}
                    <HiChevronDown size={20} />{' '}
                  </motion.div>{' '}
                </button>{' '}
                <AnimatePresence>
                  {' '}
                  {expanded === faq.id && (
                    <motion.div
                      initial={{
                        height: 0,
                        opacity: 0,
                      }}
                      animate={{
                        height: 'auto',
                        opacity: 1,
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                      }}
                      transition={{
                        duration: 0.2,
                      }}
                      className="overflow-hidden"
                    >
                      {' '}
                      <div className="px-5 pb-5 pt-0">
                        {' '}
                        <div className="border-t border-dark-800/50 pt-4">
                          {' '}
                          <p className="text-dark-300 text-sm leading-relaxed">
                            {' '}
                            {faq.answer}{' '}
                          </p>{' '}
                        </div>{' '}
                      </div>{' '}
                    </motion.div>
                  )}{' '}
                </AnimatePresence>{' '}
              </motion.div>
            ))}{' '}
          </AnimatePresence>{' '}
        </div>{' '}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            {' '}
            <p className="text-dark-500 text-lg">{t('faq.noResults')}</p>{' '}
          </div>
        )}{' '}
        {/* Still have questions CTA */}{' '}
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
          className="glass-card p-8 text-center mt-16"
        >
          {' '}
          <h3 className="text-xl font-bold mb-2">{t('faq.stillHave')}</h3>{' '}
          <p className="text-dark-400 text-sm mb-6">
            {' '}
            {t('faq.stillHaveDesc')}{' '}
          </p>{' '}
          <a
            href="https://discord.gg/auccThQpMH"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-sm py-2.5 px-6 inline-flex items-center gap-2"
          >
            {' '}
            {t('faq.askDiscord')}{' '}
          </a>{' '}
        </motion.div>{' '}
      </div>{' '}
    </PageWrapper>
  );
}
