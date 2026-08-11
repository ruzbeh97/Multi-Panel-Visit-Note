import { useNoteReadOnly } from "../readOnly";

type RadioGroupProps = {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  labelWidth?: number;
  hint?: string;
};

export default function RadioGroup({ label, options, value, onChange, labelWidth = 160, hint }: RadioGroupProps) {
  const readOnly = useNoteReadOnly();

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex flex-col items-start py-0.5" style={{ width: labelWidth }}>
        <span
          className={`font-body text-[16px] font-medium leading-[20px] ${readOnly ? "text-[#808080]" : "text-[#0a1e8f]"}`}
        >
          {label}
        </span>
        {hint && <span className="font-body text-[12px] leading-[18px] text-[#666]">{hint}</span>}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {options.map((option) => {
          const selected = option === value;
          const tone = readOnly
            ? selected
              ? "bg-[#e6e6e6] text-black"
              : "bg-[#f7f7f7] text-[#666]"
            : selected
              ? "bg-[rgba(17,50,238,0.08)] text-[#1132ee]"
              : "bg-[#f7f7f7] text-[#666] hover:bg-black/5";
          return (
            <button
              key={option}
              type="button"
              disabled={readOnly}
              onClick={() => onChange(option)}
              className={`flex min-w-[28px] items-center justify-center rounded px-1.5 py-0.5 font-body text-[14px] leading-[24px] transition-colors ${tone}`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
