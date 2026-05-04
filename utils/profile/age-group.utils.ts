export const AGE_GROUP_OPTIONS = ['< 18', '18-22', '23-27', '28-35', '35+'] as const;

export type AgeGroup = (typeof AGE_GROUP_OPTIONS)[number];

export function normalizeAgeGroup(value?: string | number | null): AgeGroup | null {
  if (value == null) return null;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if ((AGE_GROUP_OPTIONS as readonly string[]).includes(trimmed)) {
      return trimmed as AgeGroup;
    }

    const parsed = Number.parseInt(trimmed, 10);
    if (Number.isFinite(parsed)) return ageToAgeGroup(parsed);
    return null;
  }

  return ageToAgeGroup(value);
}

export function ageToAgeGroup(age: number): AgeGroup | null {
  if (!Number.isFinite(age)) return null;
  if (age < 18) return '< 18';
  if (age <= 22) return '18-22';
  if (age <= 27) return '23-27';
  if (age <= 35) return '28-35';
  return '35+';
}
