import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HiMenu, HiX, HiGlobe, HiSun, HiMoon } from "react-icons/hi";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import NotificationBell from "./NotificationBell";
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { t, lang, setLang } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const menuRef = useRef<HTMLDivElement>(null); // Avatar component with optional Discord decoration overlay
  const UserAvatar = ({ size = 32 }: { size?: number }) => {
    const hasAvatar = !!user?.avatar;
    const hasDecoration = !!user?.avatar_decoration;
    return (
      <div
        className="relative"
        style={{
          width: size,
          height: size,
        }}
      >
        {" "}
        {hasAvatar ? (
          <img
            src={user!.avatar}
            alt={user!.username}
            className="rounded-full object-cover"
            style={{
              width: size,
              height: size,
            }}
          />
        ) : (
          <div
            className="rounded-full bg-gradient-to-br from-gold-500/20 to-olive-500/20 flex items-center justify-center font-bold text-gold-400 border border-gold-500/20"
            style={{
              width: size,
              height: size,
              fontSize: size * 0.45,
            }}
          >
            {" "}
            {user!.username.charAt(0).toUpperCase()}{" "}
          </div>
        )}{" "}
        {hasDecoration && (
          <img
            src={user!.avatar_decoration}
            alt=""
            className="absolute pointer-events-none"
            style={{
              width: size * 1.5,
              height: size * 1.5,
              top: -(size * 0.25),
              left: -(size * 0.25),
            }}
          />
        )}{" "}
      </div>
    );
  };
  const navLinks = [
    { path: "/", label: t("nav.home") },
    { path: "/games", label: t("nav.games") },
    { path: "/events", label: t("nav.events") },
    { path: "/tournaments", label: t("nav.tournaments") },
    { path: "/ranks", label: t("nav.ranks") },
    { path: "/giveaways", label: t("nav.giveaways") },
    { path: "/roulette", label: t("nav.roulette") },
    { path: "/team", label: t("nav.team") },
    { path: "/faq", label: t("nav.faq") },
  ];
  const extraLinks = [
    { path: "/premium", label: t("nav.premium") },
    { path: "/shop", label: t("nav.shop") },
    { path: "/clans", label: t("nav.clans") },
  ];
  const adminRoles = ["owner", "developer", "admin"];
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(() => {
    setIsOpen(false);
    setUserMenuOpen(false);
  }, [location]);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-dark-950/90 backdrop-blur-xl border-b border-dark-800/50 shadow-lg shadow-dark-950/50"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {" "}
          {/* Logo */}{" "}
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src="/logo.gif"
              alt="SNAKES"
              className="w-9 h-9 rounded-lg group-hover:scale-110 transition-transform object-cover"
            />

            <span className="text-xl font-bold font-gaming tracking-wider text-gradient">
              {" "}
              SNAKES{" "}
            </span>
          </Link>{" "}
          {/* Desktop nav */}{" "}
          <div className="hidden md:flex items-center gap-1 overflow-x-auto scrollbar-none">
            {" "}
            {[...navLinks, ...extraLinks].map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  location.pathname === link.path
                    ? "text-gold-400"
                    : "text-dark-300 hover:text-white hover:bg-dark-800/50"
                }`}
              >
                {" "}
                {link.label}{" "}
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-gold-500 to-olive-500 rounded-full"
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                  />
                )}{" "}
              </Link>
            ))}{" "}
          </div>{" "}
          {/* Right side: Language + Auth */}{" "}
          <div className="hidden md:flex items-center gap-1">
            {" "}
            {/* Language toggle */}{" "}
            <button
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="p-2 rounded-lg text-dark-400 hover:text-gold-400 hover:bg-dark-800/50 transition-all text-xs font-bold flex items-center gap-1"
              title={t("nav.language")}
            >
              <HiGlobe size={16} /> {lang === "en" ? "عربي" : "EN"}{" "}
            </button>{" "}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-dark-400 hover:text-gold-400 hover:bg-dark-800/50 transition-all"
              title={theme === "dark" ? "Light mode" : "Dark mode"}
            >
              {theme === "dark" ? (
                <HiSun size={16} />
              ) : (
                <HiMoon size={16} />
              )}{" "}
            </button>{" "}
            {isAuthenticated && <NotificationBell />}{" "}
            {isAuthenticated && user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-dark-800/50 transition-all"
                >
                  <UserAvatar size={32} />

                  <span className="text-sm font-medium text-dark-200 max-w-[100px] truncate">
                    {user.username}
                  </span>
                </button>
                <AnimatePresence>
                  {" "}
                  {userMenuOpen && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: -8,
                        scale: 0.95,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        y: -8,
                        scale: 0.95,
                      }}
                      transition={{
                        duration: 0.15,
                      }}
                      className="absolute top-full mt-2 end-0 w-56 glass-card p-2 shadow-xl shadow-dark-950/50 z-50"
                    >
                      <div className="px-3 py-2 border-b border-dark-800/50 mb-1 flex items-center gap-3">
                        <UserAvatar size={36} />

                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate">
                            {user.username}
                          </p>
                          <p className="text-xs text-dark-500 capitalize">
                            {user.role}
                          </p>
                        </div>
                      </div>{" "}
                      {adminRoles.includes(user.role) && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-dark-300 hover:text-gold-400 hover:bg-dark-800/50 transition-all"
                        >
                          {" "}
                          {t("nav.dashboard")}{" "}
                        </Link>
                      )}{" "}
                      <Link
                        to="/apply"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-dark-300 hover:text-gold-400 hover:bg-dark-800/50 transition-all"
                      >
                        {" "}
                        {t("apply.title")}{" "}
                      </Link>
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        {" "}
                        {t("nav.logout")}{" "}
                      </button>
                    </motion.div>
                  )}{" "}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm py-2 px-4">
                  {" "}
                  {t("nav.login")}{" "}
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">
                  {" "}
                  {t("nav.register")}{" "}
                </Link>
              </div>
            )}{" "}
            <a
              href="https://discord.gg/auccThQpMH"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-sm py-2 px-4 inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
              </svg>{" "}
              {t("nav.joinServer")}{" "}
            </a>
          </div>{" "}
          {/* Mobile toggle */}{" "}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="p-2 rounded-lg text-dark-400 hover:text-gold-400 transition-all text-xs font-bold"
            >
              {" "}
              {lang === "en" ? "ع" : "EN"}{" "}
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-dark-400 hover:text-gold-400 transition-all"
            >
              {theme === "dark" ? (
                <HiSun size={16} />
              ) : (
                <HiMoon size={16} />
              )}{" "}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-dark-300 hover:text-white transition-colors"
            >
              {" "}
              {isOpen ? <HiX size={24} /> : <HiMenu size={24} />}{" "}
            </button>
          </div>
        </div>
      </div>{" "}
      {/* Mobile menu */}{" "}
      <AnimatePresence>
        {" "}
        {isOpen && (
          <motion.div
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              height: "auto",
            }}
            exit={{
              opacity: 0,
              height: 0,
            }}
            className="md:hidden bg-dark-900/95 backdrop-blur-xl border-b border-dark-800/50 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2">
              {" "}
              {[...navLinks, ...extraLinks].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    location.pathname === link.path
                      ? "text-gold-400 bg-gold-500/10"
                      : "text-dark-300 hover:text-white hover:bg-dark-800/50"
                  }`}
                >
                  {" "}
                  {link.label}{" "}
                </Link>
              ))}{" "}
              {isAuthenticated && user ? (
                <>
                  <div className="px-4 py-2 border-t border-dark-800/50 mt-2 pt-3 flex items-center gap-3">
                    <UserAvatar size={36} />

                    <div className="min-w-0">
                      <p className="text-sm font-bold">{user.username}</p>
                      <p className="text-xs text-dark-500 capitalize">
                        {user.role}
                      </p>
                    </div>
                  </div>{" "}
                  {adminRoles.includes(user.role) && (
                    <Link
                      to="/admin"
                      className="block px-4 py-3 rounded-lg text-sm text-dark-300 hover:text-gold-400 hover:bg-dark-800/50"
                    >
                      {" "}
                      {t("nav.dashboard")}{" "}
                    </Link>
                  )}{" "}
                  <Link
                    to="/apply"
                    className="block px-4 py-3 rounded-lg text-sm text-dark-300 hover:text-gold-400 hover:bg-dark-800/50"
                  >
                    {" "}
                    {t("apply.title")}{" "}
                  </Link>
                  <button
                    onClick={logout}
                    className="block w-full text-start px-4 py-3 rounded-lg text-sm text-red-400 hover:bg-red-500/10"
                  >
                    {" "}
                    {t("nav.logout")}{" "}
                  </button>
                </>
              ) : (
                <div className="space-y-2 border-t border-dark-800/50 mt-2 pt-3">
                  <Link
                    to="/login"
                    className="block text-center btn-secondary text-sm py-2 px-4"
                  >
                    {" "}
                    {t("nav.login")}{" "}
                  </Link>
                  <Link
                    to="/register"
                    className="block text-center btn-primary text-sm py-2 px-4"
                  >
                    {" "}
                    {t("nav.register")}{" "}
                  </Link>
                </div>
              )}{" "}
              <a
                href="https://discord.gg/auccThQpMH"
                target="_blank"
                rel="noopener noreferrer"
                className="block btn-primary text-sm py-2 px-4 text-center mt-2"
              >
                {" "}
                {t("nav.joinDiscord")}{" "}
              </a>
            </div>
          </motion.div>
        )}{" "}
      </AnimatePresence>
    </nav>
  );
}
