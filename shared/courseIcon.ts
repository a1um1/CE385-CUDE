export const PROGRAMMING_LANGUAGE_ICONS = ["python", "c"] as const;

export type ProgrammingLanguageIcon = (typeof PROGRAMMING_LANGUAGE_ICONS)[number];
