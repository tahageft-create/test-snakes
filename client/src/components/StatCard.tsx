import { motion } from 'framer-motion';
import { useCountUp, useInView } from '../hooks/useAnimations';
interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  icon: React.ReactNode;
  color: string;
}
function StatCard({ label, value, suffix = '', icon, color }: StatCardProps) {
  const { ref, inView } = useInView(0.3);

  const count = useCountUp(inView ? value : 0, 2000);
  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        y: 30,
      }}
      animate={
        inView
          ? {
              opacity: 1,
              y: 0,
            }
          : {}
      }
      transition={{
        duration: 0.5,
      }}
      className="glass-card p-6 hover:border-gold-500/30 transition-all duration-300 group"
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-transform group-hover:scale-110`}
          style={{
            backgroundColor: `${color}20`,
            color,
          }}
        >
          {' '}
          {icon}{' '}
        </div>
        <div>
          <div
            className="text-2xl md:text-3xl font-bold font-mono"
            style={{
              color,
            }}
          >
            {' '}
            {count.toLocaleString()}
            {suffix}{' '}
          </div>
          <div className="text-dark-400 text-sm">{label}</div>
        </div>
      </div>
    </motion.div>
  );
}

export default StatCard;
