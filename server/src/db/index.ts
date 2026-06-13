import initSqlJs, { Database } from "sql.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import bcrypt from "bcryptjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "../../data");
const dbPath = path.join(dataDir, "snakes.db");

let db: Database;

async function initDatabase() {
  const SQL = await initSqlJs();

  // Load existing database or create new one
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Enable foreign keys
  db.run("PRAGMA foreign_keys = ON");

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT DEFAULT '',
      role TEXT NOT NULL DEFAULT 'member',
      language TEXT DEFAULT 'en',
      reset_token TEXT DEFAULT '',
      reset_expires TEXT DEFAULT '',
      banned INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Migration: add new columns to existing users table if missing
  try {
    db.run("ALTER TABLE users ADD COLUMN email TEXT DEFAULT ''");
  } catch {}
  try {
    db.run("ALTER TABLE users ADD COLUMN language TEXT DEFAULT 'en'");
  } catch {}
  try {
    db.run("ALTER TABLE users ADD COLUMN reset_token TEXT DEFAULT ''");
  } catch {}
  try {
    db.run("ALTER TABLE users ADD COLUMN reset_expires TEXT DEFAULT ''");
  } catch {}
  try {
    db.run("ALTER TABLE users ADD COLUMN banned INTEGER DEFAULT 0");
  } catch {}
  try {
    db.run("ALTER TABLE users ADD COLUMN avatar TEXT DEFAULT ''");
  } catch {}
  try {
    db.run("ALTER TABLE users ADD COLUMN avatar_decoration TEXT DEFAULT ''");
  } catch {}

  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT NOT NULL,
      refresh_token TEXT DEFAULT '',
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Migrations
  try {
    db.run("ALTER TABLE sessions ADD COLUMN refresh_token TEXT DEFAULT ''");
  } catch {}

  // Clean expired sessions
  db.run("DELETE FROM sessions WHERE expires_at < datetime('now')");

  db.run(`
    CREATE TABLE IF NOT EXISTS staff_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      username TEXT NOT NULL,
      position TEXT NOT NULL,
      age INTEGER NOT NULL,
      experience TEXT NOT NULL,
      reason TEXT NOT NULL,
      availability TEXT DEFAULT '',
      status TEXT DEFAULT 'pending',
      reviewed_by TEXT DEFAULT '',
      review_note TEXT DEFAULT '',
      reviewed_at TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      discord_id TEXT UNIQUE,
      username TEXT NOT NULL,
      avatar TEXT DEFAULT '',
      voice_xp INTEGER DEFAULT 0,
      chat_xp INTEGER DEFAULT 0,
      voice_level INTEGER DEFAULT 1,
      chat_level INTEGER DEFAULT 1,
      voice_rank TEXT DEFAULT 'None',
      chat_rank TEXT DEFAULT 'None',
      joined_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      image TEXT DEFAULT '',
      status TEXT DEFAULT 'upcoming',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      author TEXT NOT NULL,
      pinned INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user TEXT NOT NULL,
      action TEXT NOT NULL,
      details TEXT DEFAULT '',
      timestamp TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      age INTEGER NOT NULL,
      experience TEXT NOT NULL,
      reason TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT DEFAULT '',
      player_count INTEGER DEFAULT 0,
      color TEXT DEFAULT '#fbbf24',
      category TEXT DEFAULT 'action',
      featured INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tournaments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      game TEXT NOT NULL,
      description TEXT NOT NULL,
      prize_pool TEXT DEFAULT '',
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      status TEXT DEFAULT 'upcoming',
      max_participants INTEGER DEFAULT 32,
      current_participants INTEGER DEFAULT 0,
      rules TEXT DEFAULT '',
      bracket_image TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS giveaways (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      prize TEXT NOT NULL,
      end_date TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      participants INTEGER DEFAULT 0,
      winner TEXT DEFAULT '',
      rules TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS team_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      role TEXT NOT NULL,
      description TEXT DEFAULT '',
      avatar TEXT DEFAULT '',
      socials TEXT DEFAULT '{}',
      category TEXT DEFAULT 'moderator',
      display_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS faq (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      display_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS server_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      member_count_override INTEGER DEFAULT NULL,
      online_count INTEGER DEFAULT NULL,
      voice_active INTEGER DEFAULT NULL,
      total_channels INTEGER DEFAULT NULL,
      server_name TEXT DEFAULT 'SNAKES',
      server_description TEXT DEFAULT '',
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Insert default server settings if not exists
  db.run(`INSERT OR IGNORE INTO server_settings (id) VALUES (1)`);

  // Discord OAuth2 linked accounts
  db.run(`
    CREATE TABLE IF NOT EXISTS discord_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      discord_id TEXT NOT NULL UNIQUE,
      username TEXT NOT NULL,
      discriminator TEXT DEFAULT '0',
      avatar TEXT DEFAULT '',
      email TEXT DEFAULT '',
      verified INTEGER DEFAULT 0,
      access_token TEXT DEFAULT '',
      refresh_token TEXT DEFAULT '',
      token_expires TEXT DEFAULT '',
      guilds TEXT DEFAULT '[]',
      last_login TEXT DEFAULT (datetime('now')),
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Discord OAuth2 state tokens (CSRF protection)
  db.run(`
    CREATE TABLE IF NOT EXISTS oauth_states (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      state TEXT NOT NULL UNIQUE,
      user_id INTEGER DEFAULT NULL,
      redirect_after TEXT DEFAULT '/admin',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS event_registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      username TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (event_id) REFERENCES events(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tournament_registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_id INTEGER NOT NULL,
      username TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS giveaway_participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      giveaway_id INTEGER NOT NULL,
      username TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (giveaway_id) REFERENCES giveaways(id)
    )
  `);

  // Seed default admin if not exists
  const adminResult = queryOne("SELECT id FROM users WHERE username = ?", [
    "admin",
  ]);
  if (!adminResult) {
    const hashedPassword = bcrypt.hashSync("snakes2024", 10);
    run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", [
      "admin",
      hashedPassword,
      "owner",
    ]);

    // Seed sample members
    const sampleMembers = [
      {
        username: "SnakeKing",
        voice_xp: 45000,
        chat_xp: 38000,
        voice_level: 85,
        chat_level: 72,
        voice_rank: "Expert",
        chat_rank: "Enthusiast",
      },
      {
        username: "ViperStrike",
        voice_xp: 38000,
        chat_xp: 42000,
        voice_level: 72,
        chat_level: 80,
        voice_rank: "Expert",
        chat_rank: "Analyste",
      },
      {
        username: "CobraKai",
        voice_xp: 52000,
        chat_xp: 29000,
        voice_level: 100,
        chat_level: 55,
        voice_rank: "Archon",
        chat_rank: "Enthusiast",
      },
      {
        username: "PythonDev",
        voice_xp: 28000,
        chat_xp: 35000,
        voice_level: 50,
        chat_level: 65,
        voice_rank: "Elite",
        chat_rank: "Enthusiast",
      },
      {
        username: "MambaRush",
        voice_xp: 32000,
        chat_xp: 22000,
        voice_level: 60,
        chat_level: 42,
        voice_rank: "Elite",
        chat_rank: "Socialite",
      },
      {
        username: "AnacondaX",
        voice_xp: 15000,
        chat_xp: 18000,
        voice_level: 30,
        chat_level: 35,
        voice_rank: "Sentinel",
        chat_rank: "Socialite",
      },
      {
        username: "RattleOps",
        voice_xp: 12000,
        chat_xp: 14000,
        voice_level: 22,
        chat_level: 28,
        voice_rank: "Adept",
        chat_rank: "Socialite",
      },
      {
        username: "Sidewinder",
        voice_xp: 8000,
        chat_xp: 11000,
        voice_level: 15,
        chat_level: 20,
        voice_rank: "Novice",
        chat_rank: "Explorer",
      },
      {
        username: "Basilisk",
        voice_xp: 22000,
        chat_xp: 31000,
        voice_level: 42,
        chat_level: 60,
        voice_rank: "Elite",
        chat_rank: "Enthusiast",
      },
      {
        username: "TaipanZ",
        voice_xp: 18000,
        chat_xp: 16000,
        voice_level: 35,
        chat_level: 30,
        voice_rank: "Sentinel",
        chat_rank: "Socialite",
      },
    ];

    for (const m of sampleMembers) {
      run(
        "INSERT INTO members (username, voice_xp, chat_xp, voice_level, chat_level, voice_rank, chat_rank) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          m.username,
          m.voice_xp,
          m.chat_xp,
          m.voice_level,
          m.chat_level,
          m.voice_rank,
          m.chat_rank,
        ],
      );
    }

    // Seed games
    const sampleGames = [
      {
        name: "Valorant",
        description:
          "5v5 tactical shooter. Strategize with your team and dominate the battlefield.",
        icon: "🎯",
        player_count: 156,
        color: "#f84565",
        category: "fps",
        featured: 1,
      },
      {
        name: "Minecraft",
        description:
          "Build, explore, and survive together. The ultimate sandbox experience.",
        icon: "⛏️",
        player_count: 203,
        color: "#5b8731",
        category: "sandbox",
        featured: 1,
      },
      {
        name: "Free Fire",
        description:
          "Fast-paced battle royale. Be the last one standing in intense 50-player matches.",
        icon: "🔥",
        player_count: 189,
        color: "#ff6b00",
        category: "battle-royale",
        featured: 1,
      },
      {
        name: "GTA RP",
        description:
          "Live your second life in Los Santos. Roleplay, business, and adventure await.",
        icon: "🚗",
        player_count: 134,
        color: "#8b5cf6",
        category: "rpg",
        featured: 1,
      },
      {
        name: "Among Us",
        description:
          "Find the imposter among your crew. Deception and deduction at its finest.",
        icon: "🚀",
        player_count: 98,
        color: "#ef4444",
        category: "party",
        featured: 0,
      },
      {
        name: "PES / eFootball",
        description:
          "Compete in the world's most realistic football simulation.",
        icon: "⚽",
        player_count: 76,
        color: "#3b82f6",
        category: "sports",
        featured: 0,
      },
      {
        name: "Fortnite",
        description: "Build, battle, and dance your way to Victory Royale.",
        icon: "🏗️",
        player_count: 145,
        color: "#a855f7",
        category: "battle-royale",
        featured: 1,
      },
      {
        name: "League of Legends",
        description:
          "Master the Rift. Team strategy and skill in the world's biggest MOBA.",
        icon: "⚔️",
        player_count: 112,
        color: "#06b6d4",
        category: "moba",
        featured: 0,
      },
      {
        name: "Apex Legends",
        description:
          "Squad-based battle royale with unique legends and abilities.",
        icon: "🦅",
        player_count: 67,
        color: "#dc2626",
        category: "battle-royale",
        featured: 0,
      },
      {
        name: "Call of Duty",
        description: "Iconic FPS action. Dominate in multiplayer and warzone.",
        icon: "🎖️",
        player_count: 89,
        color: "#16a34a",
        category: "fps",
        featured: 0,
      },
    ];
    for (const g of sampleGames) {
      run(
        "INSERT INTO games (name, description, icon, player_count, color, category, featured) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          g.name,
          g.description,
          g.icon,
          g.player_count,
          g.color,
          g.category,
          g.featured,
        ],
      );
    }

    // Seed tournaments
    const sampleTournaments = [
      {
        name: "Valorant Champions Cup",
        game: "Valorant",
        description:
          "Compete in our biggest Valorant tournament yet! Teams of 5 battle for glory and prizes.",
        prize_pool: "50,000 XP + Custom Role",
        start_date: "2026-06-20T18:00:00",
        end_date: "2026-06-20T22:00:00",
        status: "upcoming",
        max_participants: 32,
        current_participants: 18,
        rules:
          "5v5 teams, double elimination, standard competitive ruleset. All agents unlocked.",
      },
      {
        name: "Minecraft Build Masters",
        game: "Minecraft",
        description:
          "Show off your creativity in this solo building competition. Theme revealed at start!",
        prize_pool: "25,000 XP + Builder Role",
        start_date: "2026-06-15T16:00:00",
        end_date: "2026-06-15T19:00:00",
        status: "active",
        max_participants: 16,
        current_participants: 14,
        rules:
          "Solo entry, 2-hour time limit, creative mode, judging by community vote.",
      },
      {
        name: "Free Fire Frenzy",
        game: "Free Fire",
        description:
          "Battle royale tournament with squads. Last team standing wins big!",
        prize_pool: "30,000 XP + Elite Role",
        start_date: "2026-06-25T20:00:00",
        end_date: "2026-06-25T23:00:00",
        status: "upcoming",
        max_participants: 50,
        current_participants: 22,
        rules: "Squads of 4, 3 rounds, points-based scoring.",
      },
      {
        name: "Among Us Suspect Showdown",
        game: "Among Us",
        description:
          "Who is the imposter? Find out in this fun community tournament!",
        prize_pool: "10,000 XP",
        start_date: "2026-05-28T21:00:00",
        end_date: "2026-05-28T23:00:00",
        status: "completed",
        max_participants: 10,
        current_participants: 10,
        rules: "10 players per lobby, 5 rounds, most imposter wins advances.",
      },
    ];
    for (const t of sampleTournaments) {
      run(
        "INSERT INTO tournaments (name, game, description, prize_pool, start_date, end_date, status, max_participants, current_participants, rules) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          t.name,
          t.game,
          t.description,
          t.prize_pool,
          t.start_date,
          t.end_date,
          t.status,
          t.max_participants,
          t.current_participants,
          t.rules,
        ],
      );
    }

    // Seed giveaways
    const sampleGiveaways = [
      {
        title: "Nitro Giveaway",
        description: "Win a month of Discord Nitro! Active members only.",
        prize: "1 Month Discord Nitro",
        end_date: "2026-06-10T23:59:00",
        status: "active",
        participants: 67,
        winner: "",
        rules:
          "Must be a member for 7+ days. One entry per person. Winner chosen randomly.",
      },
      {
        title: "Game Key: Valorant VP",
        description: "Get 1000 Valorant Points on us!",
        prize: "1000 VP Code",
        end_date: "2026-06-18T23:59:00",
        status: "active",
        participants: 43,
        winner: "",
        rules: "Level 10+ required. Must be in the server during draw.",
      },
      {
        title: "Custom Role Giveaway",
        description:
          "Win a permanent custom role with your choice of name and color!",
        prize: "Custom Discord Role",
        end_date: "2026-05-25T23:59:00",
        status: "ended",
        participants: 89,
        winner: "CobraKai",
        rules: "Open to all members. One entry per person.",
      },
    ];
    for (const g of sampleGiveaways) {
      run(
        "INSERT INTO giveaways (title, description, prize, end_date, status, participants, winner, rules) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          g.title,
          g.description,
          g.prize,
          g.end_date,
          g.status,
          g.participants,
          g.winner,
          g.rules,
        ],
      );
    }

    // Seed team members
    const sampleTeam = [
      {
        username: "SnakeKing",
        role: "Founder & Owner",
        description:
          "Created SNAKES with a vision to build the best gaming community. Leads all operations and development.",
        avatar: "",
        socials: JSON.stringify({
          discord: "SnakeKing#0001",
          twitch: "snakeking_tv",
        }),
        category: "founder",
        display_order: 1,
      },
      {
        username: "ViperStrike",
        role: "Co-Founder",
        description:
          "Co-built SNAKES from day one. Manages partnerships and community growth strategies.",
        avatar: "",
        socials: JSON.stringify({
          discord: "ViperStrike#1234",
          youtube: "@viperstrike",
        }),
        category: "founder",
        display_order: 2,
      },
      {
        username: "PythonDev",
        role: "Lead Developer",
        description:
          "Builds and maintains the SNAKES bot, website, and all technical infrastructure.",
        avatar: "",
        socials: JSON.stringify({
          discord: "PythonDev#5678",
          github: "pythondev",
        }),
        category: "developer",
        display_order: 3,
      },
      {
        username: "CobraKai",
        role: "Head Moderator",
        description:
          "Keeps the community safe and welcoming. Leads the moderation team with dedication.",
        avatar: "",
        socials: JSON.stringify({ discord: "CobraKai#9012" }),
        category: "moderator",
        display_order: 4,
      },
      {
        username: "MambaRush",
        role: "Senior Moderator",
        description:
          "Experienced moderator ensuring fair play and positive vibes across all channels.",
        avatar: "",
        socials: JSON.stringify({ discord: "MambaRush#3456" }),
        category: "moderator",
        display_order: 5,
      },
      {
        username: "Basilisk",
        role: "Event Manager",
        description:
          "Organizes tournaments, game nights, and special events to keep the community engaged.",
        avatar: "",
        socials: JSON.stringify({
          discord: "Basilisk#7890",
          twitch: "basiliskgg",
        }),
        category: "staff",
        display_order: 6,
      },
      {
        username: "TaipanZ",
        role: "Community Manager",
        description:
          "Engages with members, gathers feedback, and fosters a positive community spirit.",
        avatar: "",
        socials: JSON.stringify({ discord: "TaipanZ#2345" }),
        category: "staff",
        display_order: 7,
      },
      {
        username: "AnacondaX",
        role: "Content Creator",
        description:
          "Creates amazing content for SNAKES. Streams, videos, and community highlights.",
        avatar: "",
        socials: JSON.stringify({
          discord: "AnacondaX#6789",
          youtube: "@anacondax",
          twitch: "anacondax",
        }),
        category: "staff",
        display_order: 8,
      },
    ];
    for (const t of sampleTeam) {
      run(
        "INSERT INTO team_members (username, role, description, avatar, socials, category, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          t.username,
          t.role,
          t.description,
          t.avatar,
          t.socials,
          t.category,
          t.display_order,
        ],
      );
    }

    // Seed sample member-role users
    const sampleUsers = [
      {
        username: "testuser",
        password: "test1234",
        email: "test@snakes.gg",
        role: "member",
      },
      {
        username: "staffuser",
        password: "staff1234",
        email: "staff@snakes.gg",
        role: "staff",
      },
      {
        username: "devuser",
        password: "dev12345",
        email: "dev@snakes.gg",
        role: "developer",
      },
    ];
    for (const u of sampleUsers) {
      const existing = queryOne("SELECT id FROM users WHERE username = ?", [
        u.username,
      ]);
      if (!existing) {
        const hp = bcrypt.hashSync(u.password, 10);
        run(
          "INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)",
          [u.username, hp, u.email, u.role],
        );
      }
    }

    // Seed FAQ
    const sampleFaq = [
      {
        question: "How do I join the SNAKES Discord server?",
        answer:
          'Click the "Join the Den" button on our website or use the invite link discord.gg/snakes. You\'ll be welcomed automatically!',
        category: "general",
        display_order: 1,
      },
      {
        question: "How does the XP system work?",
        answer:
          "You earn Voice XP by spending time in voice channels and Chat XP by messaging in text channels. The longer you're active, the more XP you earn. Bonus XP is given during events!",
        category: "ranks",
        display_order: 2,
      },
      {
        question: "How do I level up and get new ranks?",
        answer:
          "You automatically level up when you reach the required XP threshold. Each level unlocks new ranks with exclusive permissions. Check the Ranks page for details.",
        category: "ranks",
        display_order: 3,
      },
      {
        question: "How can I participate in tournaments?",
        answer:
          'Visit the Tournaments page and click "Register" on any upcoming tournament. You\'ll need to meet the minimum level requirement and be in the Discord server.',
        category: "tournaments",
        display_order: 4,
      },
      {
        question: "How do giveaways work?",
        answer:
          'Active giveaways are listed on the Giveaways page. Click "Enter" to participate. Winners are chosen randomly when the giveaway ends. Some giveaways have level requirements.',
        category: "general",
        display_order: 5,
      },
      {
        question: "How can I apply for staff?",
        answer:
          "Go to the Server Info page and fill out the Staff Application form. We review applications monthly and reach out to qualified candidates.",
        category: "general",
        display_order: 6,
      },
      {
        question: "What games does SNAKES support?",
        answer:
          "We support a wide variety of games including Valorant, Minecraft, Free Fire, GTA RP, Among Us, PES, Fortnite, League of Legends, and many more. Check our Games page!",
        category: "general",
        display_order: 7,
      },
      {
        question: "Can I host my own events?",
        answer:
          "Expert rank and above members can host community events. Contact an Event Manager or Admin to get started.",
        category: "tournaments",
        display_order: 8,
      },
      {
        question: "What are the server rules?",
        answer:
          "Our core rules include respecting all members, no spam, using correct channels, no NSFW content, fair play, and listening to staff. Full rules are on the Server Info page.",
        category: "general",
        display_order: 9,
      },
      {
        question: "How do I report a member?",
        answer:
          "Use the #reports channel in Discord or DM any moderator. Include screenshots if possible. All reports are handled confidentially.",
        category: "general",
        display_order: 10,
      },
    ];
    for (const f of sampleFaq) {
      run(
        "INSERT INTO faq (question, answer, category, display_order) VALUES (?, ?, ?, ?)",
        [f.question, f.answer, f.category, f.display_order],
      );
    }

    // Seed events with more data
    run(
      "INSERT INTO events (title, description, date, status) VALUES (?, ?, ?, ?)",
      [
        "Valorant Tournament",
        "5v5 competitive Valorant tournament. Prizes for top 3 teams!",
        "2026-06-15T20:00:00",
        "upcoming",
      ],
    );
    run(
      "INSERT INTO events (title, description, date, status) VALUES (?, ?, ?, ?)",
      [
        "Game Night Friday",
        "Casual game night - play whatever you want with the community!",
        "2026-06-06T21:00:00",
        "active",
      ],
    );
    run(
      "INSERT INTO events (title, description, date, status) VALUES (?, ?, ?, ?)",
      [
        "Minecraft Build Challenge",
        "Build the best snake-themed creation in 2 hours!",
        "2026-06-20T18:00:00",
        "upcoming",
      ],
    );
    run(
      "INSERT INTO events (title, description, date, status) VALUES (?, ?, ?, ?)",
      [
        "PES League Finals",
        "Watch the top PES players compete in the grand finals!",
        "2026-06-12T19:00:00",
        "upcoming",
      ],
    );
    run(
      "INSERT INTO events (title, description, date, status) VALUES (?, ?, ?, ?)",
      [
        "Movie Night",
        "Chill with the community and watch a movie together in voice chat.",
        "2026-06-08T20:00:00",
        "active",
      ],
    );
    run(
      "INSERT INTO announcements (title, content, author, pinned) VALUES (?, ?, ?, ?)",
      [
        "Welcome to SNAKES!",
        "The den is live! Check out our rank system and start earning XP today.",
        "SnakeKing",
        1,
      ],
    );
    run(
      "INSERT INTO announcements (title, content, author, pinned) VALUES (?, ?, ?, ?)",
      [
        "New Voice XP Ranks",
        "We have updated the voice XP ranking system. Check the ranks page for new levels and rewards!",
        "ViperStrike",
        1,
      ],
    );

    // Seed activity logs
    run("INSERT INTO activity_logs (user, action, details) VALUES (?, ?, ?)", [
      "SnakeKing",
      "Created event",
      "Valorant Tournament",
    ]);
    run("INSERT INTO activity_logs (user, action, details) VALUES (?, ?, ?)", [
      "ViperStrike",
      "Pinned announcement",
      "New Voice XP Ranks",
    ]);
    run("INSERT INTO activity_logs (user, action, details) VALUES (?, ?, ?)", [
      "SnakeKing",
      "Updated rank config",
      "Added Archon rank at Level 100",
    ]);
    run("INSERT INTO activity_logs (user, action, details) VALUES (?, ?, ?)", [
      "CobraKai",
      "Banned user",
      "SpamBot - excessive messaging",
    ]);
    run("INSERT INTO activity_logs (user, action, details) VALUES (?, ?, ?)", [
      "SnakeKing",
      "Promoted member",
      "Basilisk to Moderator",
    ]);
  }

  save();
  console.log("Database initialized");
}

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

function debouncedSave() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => save(), 2000);
}

// Helper: run a statement
function run(sql: string, params: any[] = []) {
  db.run(sql, params);
  debouncedSave();
  return { lastInsertRowid: getInsertId() };
}

function getInsertId() {
  const result = queryOne("SELECT last_insert_rowid() as id");
  return result?.id ?? 0;
}

// Helper: get one row
function queryOne(sql: string, params: any[] = []): any {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return null;
}

// Helper: get all rows
function queryAll(sql: string, params: any[] = []): any[] {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows: any[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

// Save database to disk
function save() {
  if (!db) return;
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (err) {
    console.error("Failed to save database:", err);
  }
}

export { initDatabase, db, run, queryOne, queryAll, save };
