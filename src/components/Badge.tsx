import Icon from "./Icon";

export type Tone = "grey" | "blue" | "red" | "green" | "yellow";

export const TONES: Record<Tone, string> = {
  grey: "bg-[rgba(128,128,128,0.12)]",
  blue: "bg-[rgba(27,131,228,0.12)]",
  red: "bg-[rgba(230,25,42,0.12)]",
  green: "bg-[rgba(79,176,115,0.12)]",
  yellow: "bg-[rgba(255,204,0,0.16)]",
};

export default function Badge({ tone, label, icon }: { tone: Tone; label: string; icon?: string }) {
  return (
    <span
      className={`flex shrink-0 items-center gap-1 rounded-full py-[5px] font-body text-[12px] font-medium leading-[18px] text-[#0f0f0f] ${
        icon ? "pl-2 pr-[14px]" : "px-3"
      } ${TONES[tone]}`}
    >
      {icon && <Icon name={icon} size={16} filled className="text-[#454545]" />}
      {label}
    </span>
  );
}
