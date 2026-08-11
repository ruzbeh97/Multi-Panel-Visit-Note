import { useNoteReadOnly } from "../readOnly";

type MultiSelectGroupProps = {
  label: string;
  options: string[];
  values: string[];
  onChange: (values: string[]) => void;
  hint?: string;
};

export default function MultiSelectGroup({ label, options, values, onChange, hint = "(Select all that apply)" }: MultiSelectGroupProps) {
  const readOnly = useNoteReadOnly();

  function toggle(option: string) {
    if (values.includes(option)) {
      onChange(values.filter((v) => v !== option));
    } else {
      onChange([...values, option]);
    }
  }

  return (
    <div className="flex w-full flex-col items-start gap-4">
      <div className="flex items-center gap-2 py-0.5">
        <span
          className={`whitespace-nowrap font-body text-[16px] font-medium leading-[20px] ${
            readOnly ? "text-[#808080]" : "text-[#0a1e8f]"
          }`}
        >
          {label}
        </span>
        <span className="whitespace-nowrap font-body text-[12px] leading-[18px] text-[#666]">{hint}</span>
      </div>
      <div className="flex w-full flex-wrap items-center gap-1.5">
        {options.map((option) => {
          const selected = values.includes(option);
          const tone = readOnly
            ? selected
              ? "border-[#e6e6e6] bg-[#e6e6e6] text-black"
              : "border-[#ccc] text-[#666]"
            : selected
              ? "border-[#1132ee] bg-[rgba(17,50,238,0.08)] text-[#1132ee]"
              : "border-[#ccc] text-[#666] hover:bg-black/5";
          return (
            <button
              key={option}
              type="button"
              disabled={readOnly}
              onClick={() => toggle(option)}
              className={`flex min-w-[40px] items-center justify-center rounded-lg border px-2 py-0.5 font-body text-[14px] leading-[24px] transition-colors ${tone}`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
