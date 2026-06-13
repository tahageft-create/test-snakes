export interface ServerStats {
  memberCount: number;
  onlineCount: number;
  voiceActive: number;
  totalChannels: number;
}

export interface Rank {
  id: number;
  name: string;
  type: 'voice' | 'chat';
  level: number;
  color: string;
  icon: string;
  permissions: string[];
}

export interface LeaderboardEntry {
  id: number;
  username: string;
  avatar: string;
  xp: number;
  level: number;
  rank: string;
  rankColor: string;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  image?: string;
  status: 'upcoming' | 'active' | 'ended';
  created_at: string;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at: string;
  pinned: boolean;
}

export interface ActivityLog {
  id: number;
  user: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: 'owner' | 'developer' | 'admin' | 'staff' | 'member' | 'guest';
  language: string;
  banned: number;
  created_at: string;
}

export interface StaffApplication {
  id: number;
  user_id: number;
  username: string;
  position: string;
  age: number;
  experience: string;
  reason: string;
  availability: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by: string;
  review_note: string;
  reviewed_at: string;
  created_at: string;
}

export interface Game {
  id: number;
  name: string;
  description: string;
  icon: string;
  player_count: number;
  color: string;
  category: string;
  featured: boolean | number;
  created_at: string;
}

export interface Tournament {
  id: number;
  name: string;
  game: string;
  description: string;
  prize_pool: string;
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'active' | 'completed';
  max_participants: number;
  current_participants: number;
  rules: string;
  bracket_image: string;
  created_at: string;
  participants?: {
    username: string;
    created_at: string;
  }[];
}

export interface Giveaway {
  id: number;
  title: string;
  description: string;
  prize: string;
  end_date: string;
  status: 'active' | 'ended';
  participants: number;
  winner: string;
  rules: string;
  created_at: string;
  participantList?: {
    username: string;
    created_at: string;
  }[];
}

export interface TeamMember {
  id: number;
  username: string;
  role: string;
  description: string;
  avatar: string;
  socials: Record<string, string>;
  category: 'founder' | 'developer' | 'moderator' | 'staff';
  display_order: number;
  created_at: string;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  display_order: number;
  created_at: string;
}
