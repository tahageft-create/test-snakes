import { Router } from "express";
import { queryAll } from "../db/index.js";

const router = Router();

router.get("/", (_req, res) => {
  // User registrations per month (last 6 months)
  const userGrowth = queryAll(
    `SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count 
     FROM users 
     WHERE created_at >= date('now', '-6 months')
     GROUP BY month ORDER BY month`,
  ) as { month: string; count: number }[];

  // Content counts
  const counts = {
    events: (queryAll("SELECT COUNT(*) as c FROM events") as any[])[0]?.c || 0,
    tournaments:
      (queryAll("SELECT COUNT(*) as c FROM tournaments") as any[])[0]?.c || 0,
    giveaways:
      (queryAll("SELECT COUNT(*) as c FROM giveaways") as any[])[0]?.c || 0,
    applications:
      (queryAll("SELECT COUNT(*) as c FROM staff_applications") as any[])[0]
        ?.c || 0,
    announcements:
      (queryAll("SELECT COUNT(*) as c FROM announcements") as any[])[0]?.c || 0,
    users: (queryAll("SELECT COUNT(*) as c FROM users") as any[])[0]?.c || 0,
    members:
      (queryAll("SELECT COUNT(*) as c FROM members") as any[])[0]?.c || 0,
    games: (queryAll("SELECT COUNT(*) as c FROM games") as any[])[0]?.c || 0,
    faqs: (queryAll("SELECT COUNT(*) as c FROM faq") as any[])[0]?.c || 0,
  };

  // Recent activity (last 20 logs)
  const recentActivity = queryAll(
    "SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 20",
  ) as { user: string; action: string; details: string; timestamp: string }[];

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Fill in missing months with zero
  const growthMap: Record<string, number> = {};
  for (const g of userGrowth) {
    growthMap[g.month] = g.count;
  }
  const filledGrowth: { month: string; count: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    filledGrowth.push({
      month: monthNames[d.getMonth()],
      count: growthMap[key] || 0,
    });
  }

  res.json({ userGrowth: filledGrowth, counts, recentActivity });
});

export default router;
