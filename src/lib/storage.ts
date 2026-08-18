import type { Profile, Session } from "./types";

const PROFILE_KEY = "liftlog:profile:v1";
const SESSIONS_KEY = "liftlog:sessions:v1";
const WELCOME_KEY = "liftlog:welcomed:v1";

export interface LiftStore {
  loadProfile(): Promise<Profile | null>;
  saveProfile(profile: Profile): Promise<void>;
  loadSessions(): Promise<Session[] | null>;
  saveSessions(sessions: Session[]): Promise<void>;
}

/**
 * Browser-local persistence. Swapping in a server or a wearable sync later
 * means implementing this interface, not touching any component.
 */
export const localStore: LiftStore = {
  async loadProfile() {
    return read<Profile>(PROFILE_KEY);
  },
  async saveProfile(profile) {
    write(PROFILE_KEY, profile);
  },
  async loadSessions() {
    return read<Session[]>(SESSIONS_KEY);
  },
  async saveSessions(sessions) {
    write(SESSIONS_KEY, sessions);
  },
};

/**
 * Not part of `LiftStore` on purpose — this is a client-only UI dismissal
 * flag, not domain data. It would never make sense to sync to a server.
 */
export function hasSeenWelcome(): boolean {
  return read<boolean>(WELCOME_KEY) === true;
}

export function markWelcomeSeen(): void {
  write(WELCOME_KEY, true);
}

/** In-memory store for tests and for environments without localStorage. */
export function createMemoryStore(): LiftStore {
  let profile: Profile | null = null;
  let sessions: Session[] | null = null;
  return {
    async loadProfile() {
      return profile;
    },
    async saveProfile(next) {
      profile = next;
    },
    async loadSessions() {
      return sessions;
    },
    async saveSessions(next) {
      sessions = next;
    },
  };
}

function read<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private browsing or a full quota. Non-fatal: the session stays in memory.
  }
}
