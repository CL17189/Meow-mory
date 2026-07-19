export const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "zh", name: "中文" },
  { code: "sv", name: "Svenska" },
  { code: "ja", name: "日本語" },
  { code: "ko", name: "한국어" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "es", name: "Español" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];
