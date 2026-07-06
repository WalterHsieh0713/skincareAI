import type { RoutinePart } from '@/lib/routine';

/** A user-authored AM/PM routine: the ordered list of step labels for each part. */
export type RoutineConfig = { am: string[]; pm: string[] };

/** The persisted shape: the routine plus whether onboarding has been completed. */
export type RoutineConfigState = { config: RoutineConfig; onboarded: boolean };

export const EMPTY_ROUTINE_CONFIG: RoutineConfig = { am: [], pm: [] };
export const EMPTY_ROUTINE_CONFIG_STATE: RoutineConfigState = {
  config: EMPTY_ROUTINE_CONFIG,
  onboarded: false,
};

/** Strip blank entries and surrounding whitespace from a step list. */
export function sanitizeSteps(steps: string[]): string[] {
  return steps.map((step) => step.trim()).filter((step) => step.length > 0);
}

export function stepsFor(config: RoutineConfig, part: RoutinePart): string[] {
  return config[part];
}
