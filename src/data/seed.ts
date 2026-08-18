import { todayLocal } from "../lib/date";
import type { Profile, Session } from "../lib/types";

/**
 * Intentionally empty. This is a template, not a personal log — there's no
 * baseline history to seed. The first real session you log becomes the
 * starting point the e1RM model builds from.
 */
export const SEED_SESSIONS: Session[] = [];

/**
 * blockStart defaults to today so week 1 of the block starts the moment
 * someone actually opens the app, not on a date baked into the template.
 */
export const DEFAULT_PROFILE: Profile = {
  bodyweight: 180,
  blockStart: todayLocal(),
};
