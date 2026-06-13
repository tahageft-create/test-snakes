import { Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Ranks from "./pages/Ranks";
import ServerInfo from "./pages/ServerInfo";
import Games from "./pages/Games";
import Events from "./pages/Events";
import Tournaments from "./pages/Tournaments";
import Giveaways from "./pages/Giveaways";
import Team from "./pages/Team";
import FAQ from "./pages/FAQ";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import StaffApplication from "./pages/StaffApplication";
import AdminDashboard from "./pages/AdminDashboard";
import DiscordCallback from "./pages/DiscordCallback";
import NotFound from "./pages/NotFound";
import Roulette from "./pages/Roulette";
import Premium from "./pages/Premium";
import Shop from "./pages/Shop";
import Clans from "./pages/Clans";
import ProtectedRoute from "./components/ProtectedRoute";
import { useLanguage } from "./contexts/LanguageContext";
export default function App() {
  const { isRTL } = useLanguage();
  return (
    <div
      className={`min-h-screen bg-dark-950 flex flex-col ${isRTL ? "rtl" : "ltr"}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {" "}
      <Navbar />{" "}
      <main className="flex-1">
        {" "}
        <AnimatePresence mode="wait">
          {" "}
          <Routes>
            {" "}
            <Route path="/" element={<Home />} />{" "}
            <Route path="/games" element={<Games />} />{" "}
            <Route path="/events" element={<Events />} />{" "}
            <Route path="/tournaments" element={<Tournaments />} />{" "}
            <Route path="/ranks" element={<Ranks />} />{" "}
            <Route path="/giveaways" element={<Giveaways />} />{" "}
            <Route path="/team" element={<Team />} />{" "}
            <Route path="/faq" element={<FAQ />} />{" "}
            <Route path="/info" element={<ServerInfo />} />{" "}
            <Route path="/login" element={<Login />} />{" "}
            <Route path="/register" element={<Register />} />{" "}
            <Route path="/forgot-password" element={<ForgotPassword />} />{" "}
            <Route path="/reset-password" element={<ResetPassword />} />{" "}
            <Route path="/apply" element={<StaffApplication />} />{" "}
            <Route path="/roulette" element={<Roulette />} />{" "}
            <Route path="/premium" element={<Premium />} />{" "}
            <Route path="/shop" element={<Shop />} />{" "}
            <Route path="/clans" element={<Clans />} />{" "}
            <Route path="/discord/callback" element={<DiscordCallback />} />{" "}
            <Route path="/admin/login" element={<Login />} />{" "}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRoles={["owner", "developer", "admin"]}>
                  {" "}
                  <AdminDashboard />{" "}
                </ProtectedRoute>
              }
            />{" "}
            <Route path="*" element={<NotFound />} />{" "}
          </Routes>{" "}
        </AnimatePresence>{" "}
      </main>{" "}
      <Footer />{" "}
    </div>
  );
}
