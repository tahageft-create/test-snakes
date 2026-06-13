import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
export default function NotFound() {
  return (
    <PageWrapper>
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="text-8xl font-gaming font-bold text-gold-500/30 mb-4 select-none"
          >
            404
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-gaming font-bold text-white mb-3"
          >
            Page Not Found
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-dark-400 mb-8"
          >
            The page you're looking for doesn't exist or has been moved.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gold-500 hover:bg-gold-600 text-dark-950 font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-gold-500/25"
            >
              Back to Home
            </Link>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
