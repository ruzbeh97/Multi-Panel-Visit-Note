import Icon from "../../Icon";
import { useNoteReadOnly } from "../readOnly";

type DateFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  labelWidth?: number;
  inline?: boolean;
  disabled?: boolean;
};

export default function DateField({ label, value, onChange, labelWidth = 160, inline = true, disabled = false }: DateFieldProps) {
  const readOnly = useNoteReadOnly();
  const muted = disabled || readOnly;

  return (
    <div className={`flex items-start gap-4 ${inline ? "" : "flex-col gap-1"}`}>
      <div className="flex items-start py-0.5" style={{ width: labelWidth }}>
        <span
          className={`font-body text-[16px] font-medium leading-[20px] ${
            disabled ? "text-[#b3b3b3]" : readOnly ? "text-[#808080]" : "text-[#0a1e8f]"
          }`}
        >
          {label}
        </span>
      </div>
      <div className="flex min-w-[120px] items-center gap-2 rounded-lg px-1.5 py-0.5">
        <input
          type="text"
          value={value}
          disabled={disabled}
          readOnly={readOnly}
          onChange={(e) => onChange(e.target.value)}
          placeholder="mm/dd/yyyy"
          className={`w-[92px] bg-transparent font-body text-[14px] leading-[24px] outline-none ${
            disabled ? "text-[#b3b3b3]" : readOnly ? "text-[#666]" : "text-[#1a1a1a]"
          }`}
        />
        <Icon name="calendar_today" size={20} className={muted ? "text-[#b3b3b3]" : "text-[#666]"} />
      </div>
    </div>
  );
}
