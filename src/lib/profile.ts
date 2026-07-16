/** The user's login + onboarding-questionnaire state, persisted on-device (no backend in this build). */

export type Gender = 'female' | 'male' | 'nonbinary' | 'prefer-not-to-say';

/**
 * Which onboarding branch the user picked:
 * - 'fixed': already has a fixed routine and fixed products
 * - 'building': building a routine and still finding products
 * - 'new': never done skincare before
 */
export type SkincareHobby = 'fixed' | 'building' | 'new';

export type Profile = {
  /** Whether the user has signed in (mock — no real session/backend). */
  authenticated: boolean;
  email: string;
  gender: Gender | null;
  birthday: string | null;
  hobby: SkincareHobby | null;
  /** Whether the post-login questionnaire (gender/birthday/hobby + its branch) is complete. */
  onboarded: boolean;
};

export const EMPTY_PROFILE: Profile = {
  authenticated: false,
  email: '',
  gender: null,
  birthday: null,
  hobby: null,
  onboarded: false,
};

/** Merge a persisted (possibly partial/old) blob onto the current defaults. */
export function normalizeProfile(raw: unknown): Profile {
  if (!raw || typeof raw !== 'object') {
    return { ...EMPTY_PROFILE };
  }
  return { ...EMPTY_PROFILE, ...(raw as Partial<Profile>) };
}
