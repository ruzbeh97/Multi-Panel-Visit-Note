import { useCallback, useRef, useState } from "react";
import TextField, { AutoGrowTextarea } from "../fields/TextField";
import { useNoteReadOnly } from "../readOnly";
import { SnippetTriggerDropdown } from "./SnippetTriggerDropdown";
import { useOptionalSnippetEffects } from "./SnippetEffectsContext";
import { snippetToText, type SnippetNoteSection, type TextSnippetRow } from "./types";

type SnippetTextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  noteSection: SnippetNoteSection;
  placeholder?: string;
  labelWidth?: number;
  fullWidth?: boolean;
};

/**
 * Visit-note text field that opens Preferences snippets when "." is typed.
 * Selecting a snippet replaces the trigger "." with procedure documentation and
 * applies configured orders / services through SnippetEffectsProvider.
 */
export default function SnippetTextField({
  label,
  value,
  onChange,
  noteSection,
  placeholder = "Add here",
  labelWidth = 160,
  fullWidth = true,
}: SnippetTextFieldProps) {
  const readOnly = useNoteReadOnly();
  const effects = useOptionalSnippetEffects();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const caretRef = useRef<number | null>(null);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);

  const closeTrigger = useCallback(() => {
    setTriggerRect(null);
    caretRef.current = null;
  }, []);

  const insertSnippet = useCallback(
    (snippet: TextSnippetRow) => {
      const text = snippetToText(snippet);
      const caret = caretRef.current ?? value.length;
      const next =
        caret > 0 && value[caret - 1] === "."
          ? `${value.slice(0, caret - 1)}${text}${value.slice(caret)}`
          : `${value}${text}`;
      onChange(next);
      effects?.applySnippetSideEffects(snippet);
      closeTrigger();
      requestAnimationFrame(() => {
        const el = textareaRef.current;
        if (!el) return;
        const pos = Math.max(0, caret - 1) + text.length;
        el.focus();
        el.setSelectionRange(pos, pos);
      });
    },
    [value, onChange, effects, closeTrigger],
  );

  if (readOnly || !effects) {
    return (
      <TextField
        label={label}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        labelWidth={labelWidth}
        fullWidth={fullWidth}
      />
    );
  }

  return (
    <div className={`flex flex-col items-start gap-1 ${fullWidth ? "w-full" : ""}`}>
      <div className="flex items-start py-0.5" style={{ width: labelWidth }}>
        <span className="font-body text-[16px] font-medium leading-[24px] text-[#0a1e8f]">{label}</span>
      </div>
      <AutoGrowTextarea
          ref={textareaRef}
        value={value}
        onChange={(event) => {
          const next = event.target.value;
          onChange(next);
          const caret = event.target.selectionStart ?? next.length;
          if (caret > 0 && next[caret - 1] === ".") {
            caretRef.current = caret;
            effects.refreshSnippets();
            setTriggerRect(event.target.getBoundingClientRect());
          } else if (triggerRect) {
            closeTrigger();
          }
        }}
        placeholder={placeholder}
        className="min-h-[40px] w-full resize-none rounded-lg bg-white/80 px-1.5 py-0.5 font-body text-[14px] leading-[22px] text-[#1a1a1a] outline-none transition-colors placeholder:text-[#808080] hover:bg-[#f7f7f7] focus:bg-white focus:ring-2 focus:ring-[#1132ee]/30"
      />
      {triggerRect && (
        <SnippetTriggerDropdown
          snippets={effects.snippets}
          noteSection={noteSection}
          anchorRect={triggerRect}
          onSelect={insertSnippet}
          onClose={closeTrigger}
        />
      )}
    </div>
  );
}
