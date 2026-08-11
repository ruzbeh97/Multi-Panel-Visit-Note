import { useNoteReadOnly } from "../readOnly";

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  labelWidth?: number;
  fullWidth?: boolean;
};

export default function TextField({
  label,
  value,
  onChange,
  placeholder = "Add here",
  labelWidth = 160,
  fullWidth = true,
}: TextFieldProps) {
  const readOnly = useNoteReadOnly();

  return (
    <div className={`flex flex-col items-start gap-1 ${fullWidth ? "w-full" : ""}`}>
      <div className="flex items-start py-0.5" style={{ width: labelWidth }}>
        <span
          className={`font-body text-[16px] font-medium leading-[24px] ${readOnly ? "text-[#808080]" : "text-[#0a1e8f]"}`}
        >
          {label}
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        readOnly={readOnly}
        className={`min-h-[40px] w-full resize-none rounded-lg px-1.5 py-0.5 font-body text-[14px] leading-[22px] outline-none transition-colors placeholder:text-[#808080] ${
          readOnly
            ? "bg-transparent text-[#666]"
            : "bg-white/80 text-[#1a1a1a] hover:bg-[#f7f7f7] focus:bg-white focus:ring-2 focus:ring-[#1132ee]/30"
        }`}
      />
    </div>
  );
}
