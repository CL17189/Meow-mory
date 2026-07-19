import type { LanguageCode } from "../constants/languages";
import { LANGUAGES } from "../constants/languages";

export default function LanguageSelect({ value, onChange, label = "Language" }: { value: string; onChange: (value: LanguageCode) => void; label?: string }) {
  return (
    <label className="language-select">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as LanguageCode)} aria-label={label}>
        {LANGUAGES.map((language) => <option key={language.code} value={language.code}>{language.name}</option>)}
      </select>
    </label>
  );
}
