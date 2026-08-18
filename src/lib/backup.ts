import type { Profile, Session } from "./types";

export const BACKUP_VERSION = 1;

export interface Backup {
  version: number;
  exportedAt: string;
  profile: Profile;
  sessions: Session[];
}

export function buildBackup(profile: Profile, sessions: Session[]): Backup {
  return { version: BACKUP_VERSION, exportedAt: new Date().toISOString(), profile, sessions };
}

/**
 * Throws with a message meant to be shown directly to the user — a
 * failed import needs to say what's wrong, not fail silently or with
 * a raw parse error.
 */
export function parseBackup(json: string): Backup {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    throw new Error("That file isn't valid JSON.");
  }

  if (typeof data !== "object" || data === null) {
    throw new Error("That file doesn't look like a lift-log backup.");
  }
  const candidate = data as Partial<Backup>;

  if (candidate.version !== BACKUP_VERSION) {
    throw new Error(`Unrecognized backup version (expected ${BACKUP_VERSION}).`);
  }
  if (typeof candidate.profile !== "object" || candidate.profile === null) {
    throw new Error("Backup is missing profile data.");
  }
  if (!Array.isArray(candidate.sessions)) {
    throw new Error("Backup is missing session data.");
  }

  return candidate as Backup;
}
