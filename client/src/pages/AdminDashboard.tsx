import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api, { uploadFile } from "../lib/api";
import type {
  ServerStats,
  LeaderboardEntry,
  Event,
  Announcement,
  ActivityLog,
  Tournament,
  Giveaway,
  TeamMember,
  Game,
  AdminUser,
  StaffApplication,
  FAQ,
} from "../lib/types";
import {
  HiUsers,
  HiStatusOnline,
  HiMicrophone,
  HiChat,
  HiLogout,
  HiPlus,
  HiTrash,
  HiPencil,
  HiChartBar,
  HiGift,
  HiSparkles,
  HiSearch,
  HiShieldCheck,
  HiCog,
  HiQuestionMarkCircle,
  HiSave,
  HiRefresh,
} from "react-icons/hi";
import { FaTrophy, FaGamepad } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
type Tab =
  | "dashboard"
  | "leaderboard"
  | "events"
  | "tournaments"
  | "giveaways"
  | "team"
  | "games"
  | "announcements"
  | "logs"
  | "members"
  | "applications"
  | "analytics"
  | "server-settings"
  | "xp-manager"
  | "faq";
interface XpMember {
  id: number;
  username: string;
  voice_xp: number;
  chat_xp: number;
  voice_level: number;
  chat_level: number;
  voice_rank: string;
  chat_rank: string;
}

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [stats, setStats] = useState<ServerStats | null>(null);
  const [chatLeaderboard, setChatLeaderboard] = useState<LeaderboardEntry[]>(
    [],
  );
  const [voiceLeaderboard, setVoiceLeaderboard] = useState<LeaderboardEntry[]>(
    [],
  );
  const [events, setEvents] = useState<Event[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [members, setMembers] = useState<AdminUser[]>([]);
  const [applications, setApplications] = useState<StaffApplication[]>([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [reviewNote, setReviewNote] = useState<Record<number, string>>({});
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [analytics, setAnalytics] = useState<{
    userGrowth: { month: string; count: number }[];
    counts: Record<string, number>;
    recentActivity: {
      user: string;
      action: string;
      details: string;
      timestamp: string;
    }[];
  } | null>(null);
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate(); // Event form
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    date: "",
    image: "",
  });
  const [editingEvent, setEditingEvent] = useState<number | null>(null);
  const [annForm, setAnnForm] = useState({
    title: "",
    content: "",
  });
  const [showAnnForm, setShowAnnForm] = useState(false);
  const [tournamentForm, setTournamentForm] = useState({
    name: "",
    game: "",
    description: "",
    prize_pool: "",
    start_date: "",
    end_date: "",
    max_participants: 32,
    rules: "",
    bracket_image: "",
  });
  const [showTournamentForm, setShowTournamentForm] = useState(false);
  const [giveawayForm, setGiveawayForm] = useState({
    title: "",
    description: "",
    prize: "",
    end_date: "",
    rules: "",
  });
  const [showGiveawayForm, setShowGiveawayForm] = useState(false);
  const [gameForm, setGameForm] = useState({
    name: "",
    description: "",
    icon: "🎮",
    player_count: 0,
    color: "#fbbf24",
    category: "action",
    featured: false,
  });
  const [showGameForm, setShowGameForm] = useState(false); // Server settings
  const [serverSettings, setServerSettings] = useState<any>(null);
  const [settingsForm, setSettingsForm] = useState({
    member_count_override: "",
    online_count: "",
    voice_active: "",
    total_channels: "",
    server_name: "",
    server_description: "",
  });
  const [settingsMsg, setSettingsMsg] = useState(""); // XP Manager
  const [xpMembers, setXpMembers] = useState<XpMember[]>([]);
  const [xpSearch, setXpSearch] = useState("");
  const [showXpForm, setShowXpForm] = useState(false);
  const [editingXp, setEditingXp] = useState<number | null>(null);
  const [xpForm, setXpForm] = useState({
    username: "",
    voice_xp: 0,
    chat_xp: 0,
    voice_level: 1,
    chat_level: 1,
    voice_rank: "None",
    chat_rank: "None",
  });
  const [xpMsg, setXpMsg] = useState(""); // FAQ form
  const [showFaqForm, setShowFaqForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState<number | null>(null);
  const [faqForm, setFaqForm] = useState({
    question: "",
    answer: "",
    category: "general",
    display_order: 0,
  }); // Team form
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState<number | null>(null);
  const [teamForm, setTeamForm] = useState({
    username: "",
    role: "",
    description: "",
    avatar: "",
    socials: "{}",
    category: "moderator",
    display_order: 0,
  });
  useEffect(() => {
    loadData();
  }, []);
  const loadData = async () => {
    try {
      const [
        statsRes,
        chatRes,
        voiceRes,
        eventsRes,
        annRes,
        logsRes,
        tourRes,
        giveRes,
        teamRes,
        gamesRes,
        faqRes,
        analyticsRes,
      ] = await Promise.all([
        api.get("/stats"),
        api.get("/leaderboard?type=chat"),
        api.get("/leaderboard?type=voice"),
        api.get("/events"),
        api.get("/announcements"),
        api.get("/logs"),
        api.get("/tournaments"),
        api.get("/giveaways"),
        api.get("/team"),
        api.get("/games"),
        api.get("/faq"),
        api.get("/analytics"),
      ]);
      setStats(statsRes.data);
      setChatLeaderboard(chatRes.data);
      setVoiceLeaderboard(voiceRes.data);
      setEvents(eventsRes.data);
      setAnnouncements(annRes.data);
      setLogs(logsRes.data);
      setTournaments(tourRes.data);
      setGiveaways(giveRes.data);
      setTeamMembers(teamRes.data);
      setGames(gamesRes.data);
      setFaqs(faqRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error("Failed to load data:", err);
    }
  };
  const loadMembers = async (search?: string) => {
    try {
      const res = await api.get(
        `/auth/users${search ? `?search=${search}` : ""}`,
      );
      setMembers(res.data);
    } catch {}
  };
  const loadApplications = async () => {
    try {
      const res = await api.get("/applications");
      setApplications(res.data);
    } catch {}
  };
  const loadServerSettings = async () => {
    try {
      const res = await api.get("/settings");
      setServerSettings(res.data);
      setSettingsForm({
        member_count_override: res.data.member_count_override ?? "",
        online_count: res.data.online_count ?? "",
        voice_active: res.data.voice_active ?? "",
        total_channels: res.data.total_channels ?? "",
        server_name: res.data.server_name ?? "",
        server_description: res.data.server_description ?? "",
      });
    } catch {}
  };
  const loadXpMembers = async (search?: string) => {
    try {
      const res = await api.get(
        `/leaderboard/admin${search ? `?search=${search}` : ""}`,
      );
      setXpMembers(res.data);
    } catch {}
  };
  useEffect(() => {
    if (tab === "members") loadMembers(memberSearch);
    if (tab === "applications") loadApplications();
    if (tab === "server-settings") loadServerSettings();
    if (tab === "xp-manager") loadXpMembers(xpSearch);
  }, [tab]);
  const handleLogout = () => {
    logout();
    navigate("/login");
  }; // CRUD handlers
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await api.put(`/events/${editingEvent}`, eventForm);
      } else {
        await api.post("/events", eventForm);
      }
      setShowEventForm(false);
      setEventForm({
        title: "",
        description: "",
        date: "",
        image: "",
      });
      setEditingEvent(null);
      loadData();
    } catch {}
  };
  const handleDeleteEvent = async (id: number) => {
    if (!confirm(t("admin.confirmDelete"))) return;
    try {
      await api.delete(`/events/${id}`);
      loadData();
    } catch {}
  };
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/announcements", annForm);
      setShowAnnForm(false);
      setAnnForm({
        title: "",
        content: "",
      });
      loadData();
    } catch {}
  };
  const handleDeleteAnnouncement = async (id: number) => {
    if (!confirm(t("admin.confirmDelete"))) return;
    try {
      await api.delete(`/announcements/${id}`);
      loadData();
    } catch {}
  };
  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/tournaments", tournamentForm);
      setShowTournamentForm(false);
      setTournamentForm({
        name: "",
        game: "",
        description: "",
        prize_pool: "",
        start_date: "",
        end_date: "",
        max_participants: 32,
        rules: "",
        bracket_image: "",
      });
      loadData();
    } catch {}
  };
  const handleDeleteTournament = async (id: number) => {
    if (!confirm(t("admin.confirmDelete"))) return;
    try {
      await api.delete(`/tournaments/${id}`);
      loadData();
    } catch {}
  };
  const handleCreateGiveaway = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/giveaways", giveawayForm);
      setShowGiveawayForm(false);
      setGiveawayForm({
        title: "",
        description: "",
        prize: "",
        end_date: "",
        rules: "",
      });
      loadData();
    } catch {}
  };
  const handleDeleteGiveaway = async (id: number) => {
    if (!confirm(t("admin.confirmDelete"))) return;
    try {
      await api.delete(`/giveaways/${id}`);
      loadData();
    } catch {}
  };
  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/games", gameForm);
      setShowGameForm(false);
      setGameForm({
        name: "",
        description: "",
        icon: "🎮",
        player_count: 0,
        color: "#fbbf24",
        category: "action",
        featured: false,
      });
      loadData();
    } catch {}
  };
  const handleDeleteGame = async (id: number) => {
    if (!confirm(t("admin.confirmDelete"))) return;
    try {
      await api.delete(`/games/${id}`);
      loadData();
    } catch {}
  };
  const handleChangeRole = async (userId: number, role: string) => {
    try {
      await api.put(`/auth/users/${userId}/role`, {
        role,
      });
      loadMembers(memberSearch);
    } catch {}
  };
  const handleBanUser = async (userId: number, banned: boolean) => {
    try {
      await api.put(`/auth/users/${userId}/ban`, {
        banned,
      });
      loadMembers(memberSearch);
    } catch {}
  };
  const handleReviewApp = async (appId: number, status: string) => {
    try {
      await api.put(`/applications/${appId}/review`, {
        status,
        review_note: reviewNote[appId] || "",
      });
      loadApplications();
    } catch {}
  }; // Server settings handlers
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        server_name: settingsForm.server_name || undefined,
        server_description: settingsForm.server_description || undefined,
      };
      if (settingsForm.member_count_override !== "")
        payload.member_count_override = parseInt(
          settingsForm.member_count_override,
        );
      if (settingsForm.online_count !== "")
        payload.online_count = parseInt(settingsForm.online_count);
      if (settingsForm.voice_active !== "")
        payload.voice_active = parseInt(settingsForm.voice_active);
      if (settingsForm.total_channels !== "")
        payload.total_channels = parseInt(settingsForm.total_channels);
      await api.put("/settings", payload);
      setSettingsMsg(t("admin.settingsSaved"));
      loadServerSettings();
      loadData();
      setTimeout(() => setSettingsMsg(""), 3000);
    } catch {}
  };
  const handleResetSettings = async () => {
    if (!confirm(t("admin.confirmDelete"))) return;
    try {
      await api.delete("/settings");
      setSettingsMsg(t("admin.settingsReset"));
      loadServerSettings();
      loadData();
      setTimeout(() => setSettingsMsg(""), 3000);
    } catch {}
  }; // XP manager handlers
  const handleSaveXp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingXp) {
        await api.put(`/leaderboard/${editingXp}`, xpForm);
        setXpMsg(t("admin.memberUpdated"));
      } else {
        await api.post("/leaderboard", xpForm);
        setXpMsg(t("admin.memberAdded"));
      }
      setShowXpForm(false);
      setEditingXp(null);
      loadXpMembers(xpSearch);
      loadData();
      setTimeout(() => setXpMsg(""), 3000);
    } catch {}
  };
  const handleDeleteXpMember = async (id: number) => {
    if (!confirm(t("admin.confirmDelete"))) return;
    try {
      await api.delete(`/leaderboard/${id}`);
      setXpMsg(t("admin.memberDeleted"));
      loadXpMembers(xpSearch);
      loadData();
      setTimeout(() => setXpMsg(""), 3000);
    } catch {}
  }; // FAQ handlers
  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFaq) {
        await api.put(`/faq/${editingFaq}`, faqForm);
      } else {
        await api.post("/faq", faqForm);
      }
      setShowFaqForm(false);
      setEditingFaq(null);
      setFaqForm({
        question: "",
        answer: "",
        category: "general",
        display_order: 0,
      });
      loadData();
    } catch {}
  };
  const handleDeleteFaq = async (id: number) => {
    if (!confirm(t("admin.confirmDelete"))) return;
    try {
      await api.delete(`/faq/${id}`);
      loadData();
    } catch {}
  }; // Team handlers
  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let parsedSocials = {};
      try {
        parsedSocials = JSON.parse(teamForm.socials || "{}");
      } catch {
        parsedSocials = {};
      }

      const payload = { ...teamForm, socials: parsedSocials };
      if (editingTeam) {
        await api.put(`/team/${editingTeam}`, payload);
      } else {
        await api.post("/team", payload);
      }
      setShowTeamForm(false);
      setEditingTeam(null);
      setTeamForm({
        username: "",
        role: "",
        description: "",
        avatar: "",
        socials: "{}",
        category: "moderator",
        display_order: 0,
      });
      loadData();
    } catch {}
  };
  const handleDeleteTeamMember = async (id: number) => {
    if (!confirm(t("admin.confirmDelete"))) return;
    try {
      await api.delete(`/team/${id}`);
      loadData();
    } catch {}
  };
  const adminRoles = ["owner", "developer", "admin"];
  const canManageMembers = user && adminRoles.includes(user.role);
  const pendingAppCount = applications.filter(
    (a) => a.status === "pending",
  ).length;
  const tabs: {
    id: Tab;
    label: string;
    icon: React.ReactNode;
    show: boolean;
  }[] = [
    {
      id: "dashboard",
      label: t("admin.dashboard"),
      icon: <HiChartBar size={14} />,
      show: true,
    },
    {
      id: "server-settings",
      label: t("admin.serverSettings"),
      icon: <HiCog size={14} />,
      show: true,
    },
    {
      id: "xp-manager",
      label: t("admin.xpManager"),
      icon: <HiSparkles size={14} />,
      show: true,
    },
    {
      id: "leaderboard",
      label: t("admin.leaderboard"),
      icon: <HiUsers size={14} />,
      show: true,
    },
    {
      id: "events",
      label: t("admin.events"),
      icon: <HiChat size={14} />,
      show: true,
    },
    {
      id: "tournaments",
      label: t("admin.tournaments"),
      icon: <FaTrophy size={12} />,
      show: true,
    },
    {
      id: "giveaways",
      label: t("admin.giveaways"),
      icon: <HiGift size={14} />,
      show: true,
    },
    {
      id: "games",
      label: t("admin.games"),
      icon: <FaGamepad size={12} />,
      show: true,
    },
    {
      id: "team",
      label: t("admin.team"),
      icon: <HiUsers size={14} />,
      show: true,
    },
    {
      id: "faq",
      label: t("admin.faqManagement"),
      icon: <HiQuestionMarkCircle size={14} />,
      show: true,
    },
    {
      id: "announcements",
      label: t("admin.announcements"),
      icon: <HiSparkles size={14} />,
      show: true,
    },
    {
      id: "members",
      label: t("admin.members"),
      icon: <HiShieldCheck size={14} />,
      show: !!canManageMembers,
    },
    {
      id: "applications",
      label: `${t("admin.applications")}${pendingAppCount > 0 ? ` (${pendingAppCount})` : ""}`,
      icon: <HiChat size={14} />,
      show: !!canManageMembers,
    },
    {
      id: "analytics",
      label: t("admin.analytics"),
      icon: <HiChartBar size={14} />,
      show: !!canManageMembers,
    },
    {
      id: "logs",
      label: t("admin.logs"),
      icon: <HiChat size={14} />,
      show: true,
    },
  ];
  const inputClass =
    "w-full px-4 py-3 bg-dark-800/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:border-gold-500/50 outline-none transition-all";
  const roleOptions = [
    "owner",
    "developer",
    "admin",
    "staff",
    "member",
    "guest",
  ];
  const rankOptions = [
    "None",
    "Novice",
    "Adept",
    "Sentinel",
    "Elite",
    "Expert",
    "Archon",
    "Explorer",
    "Socialite",
    "Enthusiast",
    "Analyste",
  ];
  return (
    <div className="min-h-screen pt-20 bg-dark-950">
      <div className="border-b border-dark-800/50 bg-dark-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.gif" alt="SNAKES" className="w-8 h-8 rounded-lg" />

            <div>
              <h1 className="text-xl font-bold font-gaming text-gradient">
                {t("admin.title")}
              </h1>
              <p className="text-dark-400 text-xs">
                {t("admin.welcome")}, {user?.username || "admin"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn-secondary text-sm py-2 px-4 inline-flex items-center gap-2"
          >
            <HiLogout /> {t("admin.logout")}
          </button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-1 mb-6 overflow-x-auto pb-2 scrollbar-none">
          {" "}
          {tabs
            .filter((tb) => tb.show)
            .map((t2) => (
              <button
                key={t2.id}
                onClick={() => setTab(t2.id)}
                className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${tab === t2.id ? "bg-gold-500/10 text-gold-400 border border-gold-500/20" : "text-dark-400 hover:text-white hover:bg-dark-800/50"}`}
              >
                {t2.icon} {t2.label}
              </button>
            ))}{" "}
        </div>{" "}
        {/* Dashboard Tab */}{" "}
        {tab === "dashboard" && stats && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {" "}
              {[
                {
                  label: t("home.totalMembers"),
                  value: stats.memberCount.toLocaleString(),
                  icon: <HiUsers size={20} />,
                  bgClass: "bg-gold-500/10",
                  textClass: "text-gold-400",
                },
                {
                  label: t("home.onlineNow"),
                  value: stats.onlineCount.toLocaleString(),
                  icon: <HiStatusOnline size={20} />,
                  bgClass: "bg-olive-500/10",
                  textClass: "text-olive-400",
                },
                {
                  label: t("home.inVoice"),
                  value: stats.voiceActive,
                  icon: <HiMicrophone size={20} />,
                  bgClass: "bg-gold-500/10",
                  textClass: "text-gold-400",
                },
                {
                  label: t("home.channels"),
                  value: stats.totalChannels,
                  icon: <HiChat size={20} />,
                  bgClass: "bg-amber-500/10",
                  textClass: "text-amber-400",
                },
              ].map((s, i) => (
                <div key={i} className="glass-card p-5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg ${s.bgClass} flex items-center justify-center ${s.textClass}`}
                    >
                      {s.icon}
                    </div>
                    <div>
                      <div
                        className={`text-2xl font-bold font-mono ${s.textClass}`}
                      >
                        {s.value}
                      </div>
                      <div className="text-dark-400 text-xs">{s.label}</div>
                    </div>
                  </div>
                </div>
              ))}{" "}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="glass-card p-5">
                <div className="flex items-center gap-2 mb-2">
                  <FaTrophy className="text-gold-400" size={14} />
                  <span className="text-sm font-medium">
                    Active Tournaments
                  </span>
                </div>
                <div className="text-3xl font-bold text-gold-400 font-mono">
                  {tournaments.filter((t3) => t3.status !== "completed").length}
                </div>
              </div>
              <div className="glass-card p-5">
                <div className="flex items-center gap-2 mb-2">
                  <HiGift className="text-olive-400" size={14} />
                  <span className="text-sm font-medium">Active Giveaways</span>
                </div>
                <div className="text-3xl font-bold text-olive-400 font-mono">
                  {giveaways.filter((g) => g.status === "active").length}
                </div>
              </div>
              <div className="glass-card p-5">
                <div className="flex items-center gap-2 mb-2">
                  <FaGamepad className="text-amber-400" size={14} />
                  <span className="text-sm font-medium">Games</span>
                </div>
                <div className="text-3xl font-bold text-amber-400 font-mono">
                  {games.length}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h3 className="font-bold mb-4 text-gold-400">Top Voice XP</h3>
                <div className="space-y-3">
                  {voiceLeaderboard.slice(0, 5).map((e2, i) => (
                    <div key={e2.id} className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? "bg-gold-500/20 text-gold-400" : "bg-dark-800 text-dark-400"}`}
                      >
                        {i + 1}
                      </span>
                      <span className="flex-1 text-sm">{e2.username}</span>
                      <span className="text-xs font-mono text-dark-400">
                        Lvl {e2.level}
                      </span>
                      <span className="text-xs font-mono text-gold-400">
                        {e2.xp.toLocaleString()} XP
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-card p-6">
                <h3 className="font-bold mb-4 text-olive-400">Top Chat XP</h3>
                <div className="space-y-3">
                  {chatLeaderboard.slice(0, 5).map((e2, i) => (
                    <div key={e2.id} className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? "bg-olive-500/20 text-olive-400" : "bg-dark-800 text-dark-400"}`}
                      >
                        {i + 1}
                      </span>
                      <span className="flex-1 text-sm">{e2.username}</span>
                      <span className="text-xs font-mono text-dark-400">
                        Lvl {e2.level}
                      </span>
                      <span className="text-xs font-mono text-olive-400">
                        {e2.xp.toLocaleString()} XP
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}{" "}
        {/* Server Settings Tab */}{" "}
        {tab === "server-settings" && (
          <div className="max-w-2xl">
            <h3 className="font-bold text-lg mb-6">
              {t("admin.serverSettingsTitle")}
            </h3>{" "}
            {settingsMsg && (
              <div className="mb-4 p-3 rounded-lg bg-olive-500/10 border border-olive-500/20 text-olive-400 text-sm">
                {settingsMsg}
              </div>
            )}{" "}
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  {t("admin.serverName")}
                </label>
                <input
                  type="text"
                  value={settingsForm.server_name}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      server_name: e.target.value,
                    })
                  }
                  className={inputClass}
                  placeholder="SNAKES"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  {t("admin.serverDescription")}
                </label>
                <textarea
                  value={settingsForm.server_description}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      server_description: e.target.value,
                    })
                  }
                  className={`${inputClass} resize-none`}
                  rows={2}
                />
              </div>
              <p className="text-xs text-dark-500">{t("admin.useComputed")}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    {t("admin.memberCountOverride")}
                  </label>
                  <input
                    type="number"
                    value={settingsForm.member_count_override}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        member_count_override: e.target.value,
                      })
                    }
                    className={inputClass}
                    placeholder={
                      serverSettings?.actualMemberCount?.toString() || "auto"
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    {t("admin.onlineCount")}
                  </label>
                  <input
                    type="number"
                    value={settingsForm.online_count}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        online_count: e.target.value,
                      })
                    }
                    className={inputClass}
                    placeholder="auto"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    {t("admin.voiceActive")}
                  </label>
                  <input
                    type="number"
                    value={settingsForm.voice_active}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        voice_active: e.target.value,
                      })
                    }
                    className={inputClass}
                    placeholder="auto"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    {t("admin.totalChannels")}
                  </label>
                  <input
                    type="number"
                    value={settingsForm.total_channels}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        total_channels: e.target.value,
                      })
                    }
                    className={inputClass}
                    placeholder="28"
                  />
                </div>
              </div>{" "}
              {serverSettings && (
                <p className="text-xs text-dark-500">
                  {t("admin.actualMembers")}: {serverSettings.actualMemberCount}
                </p>
              )}{" "}
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="btn-primary text-sm py-2 px-6 inline-flex items-center gap-2"
                >
                  <HiSave /> {t("admin.saveSettings")}
                </button>
                <button
                  type="button"
                  onClick={handleResetSettings}
                  className="btn-secondary text-sm py-2 px-6 inline-flex items-center gap-2"
                >
                  <HiRefresh /> {t("admin.resetDefaults")}
                </button>
              </div>
            </form>
          </div>
        )}{" "}
        {/* XP Manager Tab */}{" "}
        {tab === "xp-manager" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">{t("admin.xpManagerTitle")}</h3>
              <div className="flex gap-2">
                <div className="relative">
                  <HiSearch
                    className="absolute start-3 top-1/2 -translate-y-1/2 text-dark-500"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder={t("admin.searchXpMembers")}
                    value={xpSearch}
                    onChange={(e) => setXpSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") loadXpMembers(xpSearch);
                    }}
                    className="ps-9 pe-4 py-2 bg-dark-800/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:border-gold-500/50 outline-none text-sm w-48"
                  />
                </div>
                <button
                  onClick={() => {
                    setEditingXp(null);
                    setXpForm({
                      username: "",
                      voice_xp: 0,
                      chat_xp: 0,
                      voice_level: 1,
                      chat_level: 1,
                      voice_rank: "None",
                      chat_rank: "None",
                    });
                    setShowXpForm(true);
                  }}
                  className="btn-primary text-sm py-2 px-4 inline-flex items-center gap-2"
                >
                  <HiPlus /> {t("admin.addMember")}
                </button>
              </div>
            </div>{" "}
            {xpMsg && (
              <div className="mb-4 p-3 rounded-lg bg-olive-500/10 border border-olive-500/20 text-olive-400 text-sm">
                {xpMsg}
              </div>
            )}{" "}
            {showXpForm && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="glass-card p-6 mb-6"
              >
                <h4 className="font-bold mb-4">
                  {editingXp ? t("admin.editMember") : t("admin.addMember")}
                </h4>
                <form onSubmit={handleSaveXp} className="space-y-4">
                  <input
                    type="text"
                    required
                    placeholder="Username"
                    value={xpForm.username}
                    onChange={(e) =>
                      setXpForm({ ...xpForm, username: e.target.value })
                    }
                    className={inputClass}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-dark-400 mb-1">
                        {t("admin.voiceXp")}
                      </label>
                      <input
                        type="number"
                        value={xpForm.voice_xp}
                        onChange={(e) =>
                          setXpForm({
                            ...xpForm,
                            voice_xp: parseInt(e.target.value) || 0,
                          })
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-dark-400 mb-1">
                        {t("admin.chatXp")}
                      </label>
                      <input
                        type="number"
                        value={xpForm.chat_xp}
                        onChange={(e) =>
                          setXpForm({
                            ...xpForm,
                            chat_xp: parseInt(e.target.value) || 0,
                          })
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-dark-400 mb-1">
                        {t("admin.voiceLevel")}
                      </label>
                      <input
                        type="number"
                        value={xpForm.voice_level}
                        onChange={(e) =>
                          setXpForm({
                            ...xpForm,
                            voice_level: parseInt(e.target.value) || 1,
                          })
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-dark-400 mb-1">
                        {t("admin.chatLevel")}
                      </label>
                      <input
                        type="number"
                        value={xpForm.chat_level}
                        onChange={(e) =>
                          setXpForm({
                            ...xpForm,
                            chat_level: parseInt(e.target.value) || 1,
                          })
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-dark-400 mb-1">
                        {t("admin.voiceRank")}
                      </label>
                      <select
                        value={xpForm.voice_rank}
                        onChange={(e) =>
                          setXpForm({ ...xpForm, voice_rank: e.target.value })
                        }
                        className={inputClass}
                      >
                        {rankOptions.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-dark-400 mb-1">
                        {t("admin.chatRank")}
                      </label>
                      <select
                        value={xpForm.chat_rank}
                        onChange={(e) =>
                          setXpForm({ ...xpForm, chat_rank: e.target.value })
                        }
                        className={inputClass}
                      >
                        {rankOptions.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="btn-primary text-sm py-2 px-6"
                    >
                      {editingXp ? "Update" : "Add"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowXpForm(false);
                        setEditingXp(null);
                      }}
                      className="btn-secondary text-sm py-2 px-6"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            )}{" "}
            <div className="space-y-2">
              {xpMembers.map((m) => (
                <div
                  key={m.id}
                  className="glass-card p-4 flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400 font-bold text-sm">
                    {m.username.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-sm">{m.username}</span>
                    <div className="text-xs text-dark-500">
                      Voice: {m.voice_xp} XP (Lvl {m.voice_level},{" "}
                      {m.voice_rank}) | Chat: {m.chat_xp} XP (Lvl {m.chat_level}
                      , {m.chat_rank})
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setEditingXp(m.id);
                      setXpForm({
                        username: m.username,
                        voice_xp: m.voice_xp,
                        chat_xp: m.chat_xp,
                        voice_level: m.voice_level,
                        chat_level: m.chat_level,
                        voice_rank: m.voice_rank,
                        chat_rank: m.chat_rank,
                      });
                      setShowXpForm(true);
                    }}
                    className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-gold-400 transition-colors"
                  >
                    <HiPencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteXpMember(m.id)}
                    className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-red-400 transition-colors"
                  >
                    <HiTrash size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}{" "}
        {/* Leaderboard Tab (read-only) */}{" "}
        {tab === "leaderboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="font-bold mb-4 text-lg text-gold-400">Voice XP</h3>
              <div className="space-y-2">
                {voiceLeaderboard.map((e2, i) => (
                  <motion.div
                    key={e2.id}
                    initial={{
                      opacity: 0,
                      x: -10,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay: i * 0.03,
                    }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-800/50 transition-colors"
                  >
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${i < 3 ? "bg-gold-500/20 text-gold-400" : "bg-dark-800 text-dark-400"}`}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {e2.username}
                      </div>
                      <div className="text-xs text-dark-500">
                        Level {e2.level} | {e2.rank}
                      </div>
                    </div>
                    <span className="text-sm font-mono text-gold-400">
                      {e2.xp.toLocaleString()} XP
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="glass-card p-6">
              <h3 className="font-bold mb-4 text-lg text-olive-400">Chat XP</h3>
              <div className="space-y-2">
                {chatLeaderboard.map((e2, i) => (
                  <motion.div
                    key={e2.id}
                    initial={{
                      opacity: 0,
                      x: -10,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay: i * 0.03,
                    }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-800/50 transition-colors"
                  >
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${i < 3 ? "bg-olive-500/20 text-olive-400" : "bg-dark-800 text-dark-400"}`}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {e2.username}
                      </div>
                      <div className="text-xs text-dark-500">
                        Level {e2.level} | {e2.rank}
                      </div>
                    </div>
                    <span className="text-sm font-mono text-olive-400">
                      {e2.xp.toLocaleString()} XP
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}{" "}
        {/* Events Tab */}{" "}
        {tab === "events" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">Events</h3>
              <button
                onClick={() => {
                  setShowEventForm(true);
                  setEditingEvent(null);
                  setEventForm({
                    title: "",
                    description: "",
                    date: "",
                    image: "",
                  });
                }}
                className="btn-primary text-sm py-2 px-4 inline-flex items-center gap-2"
              >
                <HiPlus /> New
              </button>
            </div>{" "}
            {showEventForm && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="glass-card p-6 mb-6"
              >
                <h4 className="font-bold mb-4">
                  {editingEvent ? "Edit" : "Create"} Event
                </h4>
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <input
                    type="text"
                    required
                    placeholder="Title"
                    value={eventForm.title}
                    onChange={(e2) =>
                      setEventForm({ ...eventForm, title: e2.target.value })
                    }
                    className={inputClass}
                  />
                  <textarea
                    required
                    placeholder="Description"
                    rows={3}
                    value={eventForm.description}
                    onChange={(e2) =>
                      setEventForm({
                        ...eventForm,
                        description: e2.target.value,
                      })
                    }
                    className={`${inputClass} resize-none`}
                  />
                  <input
                    type="datetime-local"
                    required
                    value={eventForm.date}
                    onChange={(e2) =>
                      setEventForm({ ...eventForm, date: e2.target.value })
                    }
                    className={inputClass}
                  />
                  <label className="block">
                    <span className="text-xs text-dark-400 mb-1 block">
                      Image
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e2) => {
                        const file = e2.target.files?.[0];
                        if (file) {
                          const url = await uploadFile(file);
                          setEventForm({ ...eventForm, image: url });
                        }
                      }}
                      className={inputClass}
                    />
                    {eventForm.image && (
                      <img
                        src={eventForm.image}
                        alt=""
                        className="mt-2 h-20 rounded object-cover"
                      />
                    )}
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="btn-primary text-sm py-2 px-6"
                    >
                      {editingEvent ? "Update" : "Create"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEventForm(false);
                        setEditingEvent(null);
                      }}
                      className="btn-secondary text-sm py-2 px-6"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            )}{" "}
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="glass-card p-5 flex items-center gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold">{event.title}</h4>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${event.status === "active" ? "bg-gold-500/20 text-gold-400" : event.status === "upcoming" ? "bg-olive-500/20 text-olive-400" : "bg-dark-700 text-dark-400"}`}
                      >
                        {event.status}
                      </span>
                    </div>
                    {event.image && (
                      <img
                        src={event.image}
                        alt=""
                        className="h-16 rounded object-cover mb-2"
                      />
                    )}
                    <p className="text-dark-400 text-sm">{event.description}</p>
                    <p className="text-dark-500 text-xs font-mono mt-1">
                      {new Date(event.date).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingEvent(event.id);
                        setEventForm({
                          title: event.title,
                          description: event.description,
                          date: event.date.slice(0, 16),
                          image: event.image || "",
                        });
                        setShowEventForm(true);
                      }}
                      className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-gold-400 transition-colors"
                    >
                      <HiPencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-red-400 transition-colors"
                    >
                      <HiTrash size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}{" "}
        {/* Tournaments Tab */}{" "}
        {tab === "tournaments" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">Tournaments</h3>
              <button
                onClick={() => setShowTournamentForm(true)}
                className="btn-primary text-sm py-2 px-4 inline-flex items-center gap-2"
              >
                <HiPlus /> New
              </button>
            </div>{" "}
            {showTournamentForm && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="glass-card p-6 mb-6"
              >
                <h4 className="font-bold mb-4">Create Tournament</h4>
                <form onSubmit={handleCreateTournament} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      required
                      placeholder="Name"
                      value={tournamentForm.name}
                      onChange={(e2) =>
                        setTournamentForm({
                          ...tournamentForm,
                          name: e2.target.value,
                        })
                      }
                      className={inputClass}
                    />
                    <input
                      type="text"
                      required
                      placeholder="Game"
                      value={tournamentForm.game}
                      onChange={(e2) =>
                        setTournamentForm({
                          ...tournamentForm,
                          game: e2.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <textarea
                    required
                    placeholder="Description"
                    rows={2}
                    value={tournamentForm.description}
                    onChange={(e2) =>
                      setTournamentForm({
                        ...tournamentForm,
                        description: e2.target.value,
                      })
                    }
                    className={`${inputClass} resize-none`}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Prize pool"
                      value={tournamentForm.prize_pool}
                      onChange={(e2) =>
                        setTournamentForm({
                          ...tournamentForm,
                          prize_pool: e2.target.value,
                        })
                      }
                      className={inputClass}
                    />
                    <input
                      type="number"
                      placeholder="Max participants"
                      value={tournamentForm.max_participants || ""}
                      onChange={(e2) =>
                        setTournamentForm({
                          ...tournamentForm,
                          max_participants: parseInt(e2.target.value) || 32,
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="datetime-local"
                      required
                      value={tournamentForm.start_date}
                      onChange={(e2) =>
                        setTournamentForm({
                          ...tournamentForm,
                          start_date: e2.target.value,
                        })
                      }
                      className={inputClass}
                    />
                    <input
                      type="datetime-local"
                      required
                      value={tournamentForm.end_date}
                      onChange={(e2) =>
                        setTournamentForm({
                          ...tournamentForm,
                          end_date: e2.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <textarea
                    placeholder="Rules"
                    rows={2}
                    value={tournamentForm.rules}
                    onChange={(e2) =>
                      setTournamentForm({
                        ...tournamentForm,
                        rules: e2.target.value,
                      })
                    }
                    className={`${inputClass} resize-none`}
                  />
                  <label className="block">
                    <span className="text-xs text-dark-400 mb-1 block">
                      Bracket Image
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e2) => {
                        const file = e2.target.files?.[0];
                        if (file) {
                          const url = await uploadFile(file);
                          setTournamentForm({
                            ...tournamentForm,
                            bracket_image: url,
                          });
                        }
                      }}
                      className={inputClass}
                    />
                    {tournamentForm.bracket_image && (
                      <img
                        src={tournamentForm.bracket_image}
                        alt=""
                        className="mt-2 h-20 rounded object-cover"
                      />
                    )}
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="btn-primary text-sm py-2 px-6"
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowTournamentForm(false)}
                      className="btn-secondary text-sm py-2 px-6"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            )}{" "}
            <div className="space-y-3">
              {tournaments.map((tt) => (
                <div
                  key={tt.id}
                  className="glass-card p-5 flex items-center gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold">{tt.name}</h4>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${tt.status === "active" ? "bg-gold-500/20 text-gold-400" : tt.status === "upcoming" ? "bg-olive-500/20 text-olive-400" : "bg-dark-700 text-dark-400"}`}
                      >
                        {tt.status}
                      </span>
                      <span className="text-dark-500 text-xs">{tt.game}</span>
                    </div>
                    {tt.bracket_image && (
                      <img
                        src={tt.bracket_image}
                        alt=""
                        className="h-16 rounded object-cover mb-2"
                      />
                    )}
                    <p className="text-dark-400 text-sm">{tt.prize_pool}</p>
                    <p className="text-dark-500 text-xs font-mono mt-1">
                      {tt.current_participants}/{tt.max_participants}{" "}
                      participants
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteTournament(tt.id)}
                    className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-red-400 transition-colors"
                  >
                    <HiTrash size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}{" "}
        {/* Giveaways Tab */}{" "}
        {tab === "giveaways" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">Giveaways</h3>
              <button
                onClick={() => setShowGiveawayForm(true)}
                className="btn-primary text-sm py-2 px-4 inline-flex items-center gap-2"
              >
                <HiPlus /> New
              </button>
            </div>{" "}
            {showGiveawayForm && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="glass-card p-6 mb-6"
              >
                <h4 className="font-bold mb-4">Create Giveaway</h4>
                <form onSubmit={handleCreateGiveaway} className="space-y-4">
                  <input
                    type="text"
                    required
                    placeholder="Title"
                    value={giveawayForm.title}
                    onChange={(e2) =>
                      setGiveawayForm({
                        ...giveawayForm,
                        title: e2.target.value,
                      })
                    }
                    className={inputClass}
                  />
                  <textarea
                    required
                    placeholder="Description"
                    rows={2}
                    value={giveawayForm.description}
                    onChange={(e2) =>
                      setGiveawayForm({
                        ...giveawayForm,
                        description: e2.target.value,
                      })
                    }
                    className={`${inputClass} resize-none`}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      required
                      placeholder="Prize"
                      value={giveawayForm.prize}
                      onChange={(e2) =>
                        setGiveawayForm({
                          ...giveawayForm,
                          prize: e2.target.value,
                        })
                      }
                      className={inputClass}
                    />
                    <input
                      type="datetime-local"
                      required
                      value={giveawayForm.end_date}
                      onChange={(e2) =>
                        setGiveawayForm({
                          ...giveawayForm,
                          end_date: e2.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <textarea
                    placeholder="Rules"
                    rows={2}
                    value={giveawayForm.rules}
                    onChange={(e2) =>
                      setGiveawayForm({
                        ...giveawayForm,
                        rules: e2.target.value,
                      })
                    }
                    className={`${inputClass} resize-none`}
                  />
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="btn-primary text-sm py-2 px-6"
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowGiveawayForm(false)}
                      className="btn-secondary text-sm py-2 px-6"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            )}{" "}
            <div className="space-y-3">
              {giveaways.map((g) => (
                <div
                  key={g.id}
                  className="glass-card p-5 flex items-center gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold">{g.title}</h4>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${g.status === "active" ? "bg-gold-500/20 text-gold-400" : "bg-dark-700 text-dark-400"}`}
                      >
                        {g.status}
                      </span>
                    </div>
                    <p className="text-dark-400 text-sm">
                      {g.prize} | {g.participants} entries{" "}
                      {g.winner && `| Winner: ${g.winner}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteGiveaway(g.id)}
                    className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-red-400 transition-colors"
                  >
                    <HiTrash size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}{" "}
        {/* Games Tab */}{" "}
        {tab === "games" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">Games</h3>
              <button
                onClick={() => setShowGameForm(true)}
                className="btn-primary text-sm py-2 px-4 inline-flex items-center gap-2"
              >
                <HiPlus /> Add
              </button>
            </div>{" "}
            {showGameForm && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="glass-card p-6 mb-6"
              >
                <h4 className="font-bold mb-4">Add Game</h4>
                <form onSubmit={handleCreateGame} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      required
                      placeholder="Name"
                      value={gameForm.name}
                      onChange={(e2) =>
                        setGameForm({ ...gameForm, name: e2.target.value })
                      }
                      className={inputClass}
                    />
                    <input
                      type="text"
                      placeholder="Icon"
                      value={gameForm.icon}
                      onChange={(e2) =>
                        setGameForm({ ...gameForm, icon: e2.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                  <textarea
                    required
                    placeholder="Description"
                    rows={2}
                    value={gameForm.description}
                    onChange={(e2) =>
                      setGameForm({ ...gameForm, description: e2.target.value })
                    }
                    className={`${inputClass} resize-none`}
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <input
                      type="number"
                      placeholder="Players"
                      value={gameForm.player_count || ""}
                      onChange={(e2) =>
                        setGameForm({
                          ...gameForm,
                          player_count: parseInt(e2.target.value) || 0,
                        })
                      }
                      className={inputClass}
                    />
                    <input
                      type="text"
                      placeholder="Color"
                      value={gameForm.color}
                      onChange={(e2) =>
                        setGameForm({ ...gameForm, color: e2.target.value })
                      }
                      className={inputClass}
                    />
                    <select
                      value={gameForm.category}
                      onChange={(e2) =>
                        setGameForm({ ...gameForm, category: e2.target.value })
                      }
                      className={inputClass}
                    >
                      <option value="fps">FPS</option>
                      <option value="battle-royale">Battle Royale</option>
                      <option value="moba">MOBA</option>
                      <option value="rpg">RPG</option>
                      <option value="sandbox">Sandbox</option>
                      <option value="party">Party</option>
                      <option value="sports">Sports</option>
                      <option value="action">Action</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-dark-300">
                    <input
                      type="checkbox"
                      checked={gameForm.featured}
                      onChange={(e2) =>
                        setGameForm({
                          ...gameForm,
                          featured: e2.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    Featured
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="btn-primary text-sm py-2 px-6"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowGameForm(false)}
                      className="btn-secondary text-sm py-2 px-6"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            )}{" "}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {games.map((game) => (
                <div
                  key={game.id}
                  className="glass-card p-4 flex items-center gap-3"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0"
                    style={{
                      backgroundColor: `${game.color}20`,
                    }}
                  >
                    {game.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4
                        className="font-bold text-sm truncate"
                        style={{
                          color: game.color,
                        }}
                      >
                        {game.name}
                      </h4>
                      {game.featured && (
                        <span className="text-[10px] bg-gold-500/20 text-gold-400 px-1.5 py-0.5 rounded">
                          FEATURED
                        </span>
                      )}
                    </div>
                    <p className="text-dark-500 text-xs">
                      {game.player_count} players | {game.category}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteGame(game.id)}
                    className="p-1.5 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-red-400 transition-colors"
                  >
                    <HiTrash size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}{" "}
        {/* Team Tab with Create/Edit */}{" "}
        {tab === "team" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">Team</h3>
              <button
                onClick={() => {
                  setEditingTeam(null);
                  setTeamForm({
                    username: "",
                    role: "",
                    description: "",
                    avatar: "",
                    socials: "{}",
                    category: "moderator",
                    display_order: 0,
                  });
                  setShowTeamForm(true);
                }}
                className="btn-primary text-sm py-2 px-4 inline-flex items-center gap-2"
              >
                <HiPlus /> {t("admin.addTeamMember")}
              </button>
            </div>{" "}
            {showTeamForm && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="glass-card p-6 mb-6"
              >
                <h4 className="font-bold mb-4">
                  {editingTeam
                    ? t("admin.editTeamMember")
                    : t("admin.addTeamMember")}
                </h4>
                <form onSubmit={handleSaveTeam} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      required
                      placeholder="Username"
                      value={teamForm.username}
                      onChange={(e) =>
                        setTeamForm({ ...teamForm, username: e.target.value })
                      }
                      className={inputClass}
                    />
                    <input
                      type="text"
                      required
                      placeholder={t("admin.teamRole")}
                      value={teamForm.role}
                      onChange={(e) =>
                        setTeamForm({ ...teamForm, role: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                  <textarea
                    placeholder={t("admin.description")}
                    rows={2}
                    value={teamForm.description}
                    onChange={(e) =>
                      setTeamForm({ ...teamForm, description: e.target.value })
                    }
                    className={`${inputClass} resize-none`}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <select
                      value={teamForm.category}
                      onChange={(e) =>
                        setTeamForm({ ...teamForm, category: e.target.value })
                      }
                      className={inputClass}
                    >
                      <option value="founder">Founder</option>
                      <option value="developer">Developer</option>
                      <option value="moderator">Moderator</option>
                      <option value="staff">Staff</option>
                    </select>
                    <input
                      type="number"
                      placeholder={t("admin.displayOrder")}
                      value={teamForm.display_order || ""}
                      onChange={(e) =>
                        setTeamForm({
                          ...teamForm,
                          display_order: parseInt(e.target.value) || 0,
                        })
                      }
                      className={inputClass}
                    />

                    <input
                      type="text"
                      placeholder={t("admin.socials")}
                      value={teamForm.socials}
                      onChange={(e) =>
                        setTeamForm({ ...teamForm, socials: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                  <label className="block">
                    <span className="text-xs text-dark-400 mb-1 block">
                      Avatar
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await uploadFile(file);
                          setTeamForm({ ...teamForm, avatar: url });
                        }
                      }}
                      className={inputClass}
                    />
                    {teamForm.avatar && (
                      <img
                        src={teamForm.avatar}
                        alt=""
                        className="mt-2 h-12 w-12 rounded-full object-cover"
                      />
                    )}
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="btn-primary text-sm py-2 px-6"
                    >
                      {editingTeam ? "Update" : "Add"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowTeamForm(false);
                        setEditingTeam(null);
                      }}
                      className="btn-secondary text-sm py-2 px-6"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            )}{" "}
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="glass-card p-5 flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-gold-400 font-bold font-gaming shrink-0 overflow-hidden">
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gold-500/10 flex items-center justify-center">
                        {member.username.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold">{member.username}</h4>
                      <span className="text-gold-400 text-xs">
                        {member.role}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-dark-700 text-dark-400 capitalize">
                        {member.category}
                      </span>
                    </div>
                    <p className="text-dark-400 text-sm line-clamp-1">
                      {member.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingTeam(member.id);
                        setTeamForm({
                          username: member.username,
                          role: member.role,
                          description: member.description,
                          avatar: member.avatar,
                          socials: JSON.stringify(member.socials),
                          category: member.category,
                          display_order: member.display_order,
                        });
                        setShowTeamForm(true);
                      }}
                      className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-gold-400 transition-colors"
                    >
                      <HiPencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteTeamMember(member.id)}
                      className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-red-400 transition-colors"
                    >
                      <HiTrash size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}{" "}
        {/* FAQ Tab */}{" "}
        {tab === "faq" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">{t("admin.faqTitle")}</h3>
              <button
                onClick={() => {
                  setEditingFaq(null);
                  setFaqForm({
                    question: "",
                    answer: "",
                    category: "general",
                    display_order: 0,
                  });
                  setShowFaqForm(true);
                }}
                className="btn-primary text-sm py-2 px-4 inline-flex items-center gap-2"
              >
                <HiPlus /> {t("admin.addFaq")}
              </button>
            </div>{" "}
            {showFaqForm && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="glass-card p-6 mb-6"
              >
                <h4 className="font-bold mb-4">
                  {editingFaq ? t("admin.editFaq") : t("admin.addFaq")}
                </h4>
                <form onSubmit={handleSaveFaq} className="space-y-4">
                  <input
                    type="text"
                    required
                    placeholder={t("admin.question")}
                    value={faqForm.question}
                    onChange={(e) =>
                      setFaqForm({ ...faqForm, question: e.target.value })
                    }
                    className={inputClass}
                  />

                  <textarea
                    required
                    placeholder={t("admin.answer")}
                    rows={3}
                    value={faqForm.answer}
                    onChange={(e) =>
                      setFaqForm({ ...faqForm, answer: e.target.value })
                    }
                    className={`${inputClass} resize-none`}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={faqForm.category}
                      onChange={(e) =>
                        setFaqForm({ ...faqForm, category: e.target.value })
                      }
                      className={inputClass}
                    >
                      <option value="general">General</option>
                      <option value="ranks">Ranks</option>
                      <option value="tournaments">Tournaments</option>
                    </select>
                    <input
                      type="number"
                      placeholder={t("admin.displayOrder")}
                      value={faqForm.display_order || ""}
                      onChange={(e) =>
                        setFaqForm({
                          ...faqForm,
                          display_order: parseInt(e.target.value) || 0,
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="btn-primary text-sm py-2 px-6"
                    >
                      {editingFaq ? "Update" : "Add"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowFaqForm(false);
                        setEditingFaq(null);
                      }}
                      className="btn-secondary text-sm py-2 px-6"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            )}{" "}
            <div className="space-y-3">
              {faqs.map((f) => (
                <div
                  key={f.id}
                  className="glass-card p-5 flex items-start gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-sm">{f.question}</h4>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-dark-700 text-dark-400">
                        {f.category}
                      </span>
                    </div>
                    <p className="text-dark-400 text-sm">{f.answer}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingFaq(f.id);
                        setFaqForm({
                          question: f.question,
                          answer: f.answer,
                          category: f.category,
                          display_order: f.display_order,
                        });
                        setShowFaqForm(true);
                      }}
                      className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-gold-400 transition-colors"
                    >
                      <HiPencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteFaq(f.id)}
                      className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-red-400 transition-colors"
                    >
                      <HiTrash size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}{" "}
        {/* Announcements Tab */}{" "}
        {tab === "announcements" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">Announcements</h3>
              <button
                onClick={() => setShowAnnForm(true)}
                className="btn-primary text-sm py-2 px-4 inline-flex items-center gap-2"
              >
                <HiPlus /> New
              </button>
            </div>{" "}
            {showAnnForm && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="glass-card p-6 mb-6"
              >
                <h4 className="font-bold mb-4">Create</h4>
                <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                  <input
                    type="text"
                    required
                    placeholder="Title"
                    value={annForm.title}
                    onChange={(e2) =>
                      setAnnForm({ ...annForm, title: e2.target.value })
                    }
                    className={inputClass}
                  />
                  <textarea
                    required
                    placeholder="Content"
                    rows={4}
                    value={annForm.content}
                    onChange={(e2) =>
                      setAnnForm({ ...annForm, content: e2.target.value })
                    }
                    className={`${inputClass} resize-none`}
                  />
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="btn-primary text-sm py-2 px-6"
                    >
                      Publish
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAnnForm(false)}
                      className="btn-secondary text-sm py-2 px-6"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            )}{" "}
            <div className="space-y-3">
              {announcements.map((ann) => (
                <div key={ann.id} className="glass-card p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold">{ann.title}</h4>
                        {ann.pinned && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-gold-500/20 text-gold-400">
                            PINNED
                          </span>
                        )}
                      </div>
                      <p className="text-dark-400 text-sm">{ann.content}</p>
                      <p className="text-dark-600 text-xs mt-2">
                        by {ann.author} |{" "}
                        {new Date(ann.created_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-red-400 transition-colors"
                    >
                      <HiTrash size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}{" "}
        {/* Members Tab */}{" "}
        {tab === "members" && canManageMembers && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">{t("admin.membersTitle")}</h3>
              <div className="relative">
                <HiSearch
                  className="absolute start-3 top-1/2 -translate-y-1/2 text-dark-500"
                  size={16}
                />
                <input
                  type="text"
                  placeholder={t("admin.searchMembers")}
                  value={memberSearch}
                  onChange={(e2) => setMemberSearch(e2.target.value)}
                  onKeyDown={(e2) => {
                    if (e2.key === "Enter") loadMembers(memberSearch);
                  }}
                  className="ps-9 pe-4 py-2 bg-dark-800/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:border-gold-500/50 outline-none text-sm w-64"
                />
              </div>
            </div>
            <div className="space-y-2">
              {members.map((m) => (
                <div
                  key={m.id}
                  className="glass-card p-4 flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400 font-bold text-sm">
                    {m.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm">{m.username}</span>
                      {m.banned ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400">
                          {t("admin.banned")}
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-olive-500/20 text-olive-400">
                          {t("admin.active")}
                        </span>
                      )}
                    </div>
                    <span className="text-dark-500 text-xs">
                      {m.email || "No email"} |{" "}
                      {new Date(m.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <select
                    value={m.role}
                    onChange={(e2) => handleChangeRole(m.id, e2.target.value)}
                    className="px-2 py-1 bg-dark-800 border border-dark-700 rounded-lg text-xs text-dark-300 outline-none capitalize"
                  >
                    {roleOptions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleBanUser(m.id, !m.banned)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${m.banned ? "bg-olive-500/10 text-olive-400 hover:bg-olive-500/20" : "bg-red-500/10 text-red-400 hover:bg-red-500/20"}`}
                  >
                    {m.banned ? t("admin.unban") : t("admin.ban")}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}{" "}
        {/* Applications Tab */}{" "}
        {tab === "applications" && canManageMembers && (
          <div>
            <h3 className="font-bold text-lg mb-6">
              {t("admin.applicationsTitle")}
            </h3>{" "}
            {applications.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <p className="text-dark-500">{t("admin.noApps")}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div key={app.id} className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-bold">{app.username}</span>
                      <span className="text-sm text-gold-400">
                        {app.position}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ms-auto ${app.status === "pending" ? "bg-gold-500/20 text-gold-400" : app.status === "approved" ? "bg-olive-500/20 text-olive-400" : "bg-red-500/20 text-red-400"}`}
                      >
                        {t(`apply.${app.status}` as any)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-dark-500">{t("apply.age")}:</span>
                        <span className="text-dark-300">{app.age}</span>
                      </div>
                      <div>
                        <span className="text-dark-500">
                          {t("apply.availability")}:
                        </span>
                        <span className="text-dark-300">
                          {app.availability || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="mb-2">
                      <span className="text-dark-500 text-xs">
                        {t("apply.experience")}:
                      </span>
                      <p className="text-dark-300 text-sm">{app.experience}</p>
                    </div>
                    <div className="mb-3">
                      <span className="text-dark-500 text-xs">
                        {t("apply.reason")}:
                      </span>
                      <p className="text-dark-300 text-sm">{app.reason}</p>
                    </div>
                    {app.review_note && (
                      <div className="mb-3 p-2 rounded bg-dark-800/50 text-xs text-dark-400">
                        {t("apply.reviewNote")}: {app.review_note}
                      </div>
                    )}
                    {app.status === "pending" && (
                      <div className="border-t border-dark-800/50 pt-3 flex items-center gap-3">
                        <input
                          type="text"
                          placeholder={t("admin.reviewNote")}
                          value={reviewNote[app.id] || ""}
                          onChange={(e2) =>
                            setReviewNote({
                              ...reviewNote,
                              [app.id]: e2.target.value,
                            })
                          }
                          className="flex-1 px-3 py-2 bg-dark-800/50 border border-dark-700 rounded-lg text-white text-sm placeholder-dark-500 outline-none"
                        />
                        <button
                          onClick={() => handleReviewApp(app.id, "approved")}
                          className="px-4 py-2 rounded-lg bg-olive-500/10 text-olive-400 text-sm font-medium hover:bg-olive-500/20 transition-colors"
                        >
                          {t("admin.approve")}
                        </button>
                        <button
                          onClick={() => handleReviewApp(app.id, "rejected")}
                          className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors"
                        >
                          {t("admin.reject")}
                        </button>
                      </div>
                    )}
                    {app.status !== "pending" && (
                      <div className="text-xs text-dark-500 mt-2">
                        Reviewed by {app.reviewed_by} on{" "}
                        {app.reviewed_at
                          ? new Date(app.reviewed_at).toLocaleString()
                          : "N/A"}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}{" "}
          </div>
        )}{" "}
        {/* Analytics Tab */}{" "}
        {tab === "analytics" && canManageMembers && (
          <div>
            <h3 className="font-bold text-lg mb-6">
              {t("admin.analyticsTitle")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h4 className="font-bold mb-4 text-gold-400">
                  {t("admin.memberGrowth")}
                </h4>
                <div className="flex items-end gap-2 h-40">
                  {(analytics?.userGrowth?.length
                    ? analytics.userGrowth
                    : []
                  ).map((item, i) => {
                    const maxCount = Math.max(
                      ...(analytics?.userGrowth?.map((g) => g.count) || [1]),
                      1,
                    );
                    const height =
                      maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                    return (
                      <div
                        key={item.month}
                        className="flex-1 flex flex-col items-center gap-1"
                      >
                        <span className="text-[10px] text-dark-500 font-mono">
                          {item.count}
                        </span>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{
                            duration: 0.5,
                            delay: i * 0.1,
                          }}
                          className="w-full bg-gradient-to-t from-gold-600 to-gold-400 rounded-t-lg"
                        />
                        <span className="text-[10px] text-dark-500">
                          {item.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="glass-card p-6">
                <h4 className="font-bold mb-4 text-olive-400">
                  {t("admin.activityOverview")}
                </h4>
                <div className="space-y-3">
                  {analytics?.counts
                    ? [
                        {
                          label: "Users",
                          key: "users",
                          color: "bg-gold-500",
                          textColor: "text-gold-400",
                        },
                        {
                          label: "Members",
                          key: "members",
                          color: "bg-gold-500",
                          textColor: "text-gold-400",
                        },
                        {
                          label: "Events",
                          key: "events",
                          color: "bg-gold-500",
                          textColor: "text-gold-400",
                        },
                        {
                          label: "Tournaments",
                          key: "tournaments",
                          color: "bg-olive-500",
                          textColor: "text-olive-400",
                        },
                        {
                          label: "Giveaways",
                          key: "giveaways",
                          color: "bg-amber-500",
                          textColor: "text-amber-400",
                        },
                        {
                          label: "Games",
                          key: "games",
                          color: "bg-gold-500",
                          textColor: "text-gold-400",
                        },
                        {
                          label: "FAQs",
                          key: "faqs",
                          color: "bg-olive-500",
                          textColor: "text-olive-400",
                        },
                        {
                          label: "Applications",
                          key: "applications",
                          color: "bg-olive-500",
                          textColor: "text-olive-400",
                        },
                        {
                          label: "Announcements",
                          key: "announcements",
                          color: "bg-amber-500",
                          textColor: "text-amber-400",
                        },
                      ].map((item) => {
                        const maxVal = Math.max(
                          ...Object.values(analytics.counts || {}),
                          1,
                        );
                        const val = analytics.counts[item.key] || 0;
                        return (
                          <div
                            key={item.key}
                            className="flex items-center gap-3"
                          >
                            <span className="text-sm text-dark-400 flex-1">
                              {item.label}
                            </span>
                            <div className="w-32 h-2 bg-dark-800 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${(val / maxVal) * 100}%`,
                                }}
                                transition={{ duration: 0.5 }}
                                className={`h-full rounded-full ${item.color}`}
                              />
                            </div>
                            <span
                              className={`text-sm font-mono ${item.textColor} w-8 text-end`}
                            >
                              {val}
                            </span>
                          </div>
                        );
                      })
                    : null}
                </div>
              </div>
            </div>
          </div>
        )}{" "}
        {/* Logs Tab */}{" "}
        {tab === "logs" && (
          <div className="glass-card p-6">
            <h3 className="font-bold text-lg mb-4">Activity Logs</h3>
            <div className="space-y-2">
              {logs.map((log, i) => (
                <motion.div
                  key={log.id}
                  initial={{
                    opacity: 0,
                    x: -10,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay: i * 0.02,
                  }}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-dark-800/30 transition-colors border-b border-dark-800/30"
                >
                  <div className="w-2 h-2 rounded-full bg-gold-500 shrink-0" />
                  <span className="text-sm font-medium text-dark-200">
                    {log.user}
                  </span>
                  <span className="text-sm text-dark-400">{log.action}</span>
                  <span className="text-xs text-dark-500 flex-1">
                    {log.details}
                  </span>
                  <span className="text-xs text-dark-600 font-mono whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}{" "}
      </div>
    </div>
  );
}
