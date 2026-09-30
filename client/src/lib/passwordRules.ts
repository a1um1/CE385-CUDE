export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 20;
export const PASSWORD_SPECIAL_CHARACTERS = "!@#$%^&*?-_";

const SPECIAL_CHARACTER_PATTERN = /[!@#$%^&*?\-_]/;

export interface PasswordRule {
  id: string;
  label: string;
  test: (value: string) => boolean;
}

export const PASSWORD_RULES: readonly PasswordRule[] = [
  {
    id: "minLength",
    label: `At least ${PASSWORD_MIN_LENGTH} characters`,
    test: (value) => value.length >= PASSWORD_MIN_LENGTH,
  },
  {
    id: "maxLength",
    label: `No more than ${PASSWORD_MAX_LENGTH} characters`,
    test: (value) => value.length <= PASSWORD_MAX_LENGTH,
  },
  {
    id: "uppercase",
    label: "One uppercase letter (A-Z)",
    test: (value) => /[A-Z]/.test(value),
  },
  {
    id: "lowercase",
    label: "One lowercase letter (a-z)",
    test: (value) => /[a-z]/.test(value),
  },
  {
    id: "number",
    label: "One number (0-9)",
    test: (value) => /[0-9]/.test(value),
  },
  {
    id: "special",
    label: `One special character (${PASSWORD_SPECIAL_CHARACTERS})`,
    test: (value) => SPECIAL_CHARACTER_PATTERN.test(value),
  },
];

export interface PasswordRuleResult {
  rule: PasswordRule;
  satisfied: boolean;
}

export type PasswordStrengthLevel = "empty" | "weak" | "fair" | "strong";

export interface PasswordStrength {
  level: PasswordStrengthLevel;
  label: string;
  score: number;
}

const STRENGTH_CONFIG: Record<PasswordStrengthLevel, { label: string; maxSatisfied: number }> = {
  empty: { label: "No password", maxSatisfied: -1 },
  weak: { label: "Weak", maxSatisfied: 1 },
  fair: { label: "Fair", maxSatisfied: 3 },
  strong: { label: "Strong", maxSatisfied: PASSWORD_RULES.length },
};

export function getPasswordRuleResults(value: string): PasswordRuleResult[] {
  return PASSWORD_RULES.map((rule) => ({ rule, satisfied: rule.test(value) }));
}

export function isPasswordValid(value: string): boolean {
  return getPasswordRuleResults(value).every((result) => result.satisfied);
}

export function getPasswordStrength(value: string): PasswordStrength {
  const satisfied = PASSWORD_RULES.filter((rule) => rule.test(value)).length;
  const level = value
    ? (Object.keys(STRENGTH_CONFIG) as PasswordStrengthLevel[]).find(
        (candidate) => satisfied <= STRENGTH_CONFIG[candidate].maxSatisfied,
      )
    : "empty";

  return {
    level: level ?? "strong",
    label: STRENGTH_CONFIG[level ?? "strong"].label,
    score: satisfied / PASSWORD_RULES.length,
  };
}

export function getPasswordError(value: string): string | undefined {
  if (!value) return "Password is required";
  const failed = getPasswordRuleResults(value).find((result) => !result.satisfied);
  return failed?.rule.label;
}
