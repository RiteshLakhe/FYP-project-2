import { useState, KeyboardEvent } from "react";
import { FiX, FiTag } from "react-icons/fi";

interface TagInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  max?: number;
  suggestions?: string[];
  placeholder?: string;
}

const TagInput = ({
  value,
  onChange,
  max = 12,
  suggestions = [
    "pet-friendly",
    "newly-renovated",
    "near transit",
    "parking",
    "furnished",
    "balcony",
    "wifi",
    "rooftop",
    "students",
    "family",
    "elevator",
    "natural light",
  ],
  placeholder = "Add a tag and press Enter",
}: TagInputProps) => {
  const [draft, setDraft] = useState("");

  const addTag = (raw: string) => {
    const t = raw.trim().toLowerCase();
    if (!t) return;
    if (value.includes(t)) return;
    if (value.length >= max) return;
    onChange([...value, t]);
  };

  const removeTag = (t: string) => {
    onChange(value.filter((x) => x !== t));
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(draft);
      setDraft("");
    } else if (e.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  const remaining = max - value.length;
  const filteredSuggestions = suggestions
    .filter((s) => !value.includes(s))
    .filter((s) => !draft || s.includes(draft.toLowerCase()))
    .slice(0, 6);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-2.5 py-2 min-h-[46px] focus-within:border-cyan-500 focus-within:ring-4 focus-within:ring-cyan-500/10">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 text-cyan-400 px-2.5 py-1 text-xs font-semibold">
            <FiTag size={11} />
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-0.5 grid h-4 w-4 place-items-center rounded-full bg-cyan-400/20 hover:bg-cyan-400 hover:text-neutral-900">
              <FiX size={11} />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          onBlur={() => {
            if (draft.trim()) {
              addTag(draft);
              setDraft("");
            }
          }}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] text-sm outline-none bg-transparent"
        />
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        {filteredSuggestions.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] uppercase tracking-widest text-neutral-400 font-bold">Suggestions:</span>
            {filteredSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addTag(s)}
                className="rounded-full border border-neutral-200 px-2.5 py-0.5 text-xs text-neutral-600 hover:border-cyan-500 hover:text-cyan-700 hover:bg-cyan-50 transition">
                + {s}
              </button>
            ))}
          </div>
        )}
        <span className="text-[11px] text-neutral-400 ml-auto">
          {remaining} left
        </span>
      </div>
    </div>
  );
};

export default TagInput;
