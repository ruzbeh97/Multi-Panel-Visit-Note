type IconProps = {
  name: string;
  className?: string;
  size?: number;
  filled?: boolean;
};

export default function Icon({ name, className = "", size = 20, filled = false }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined select-none ${className}`}
      style={{
        fontSize: size,
        width: size,
        height: size,
        lineHeight: `${size}px`,
        fontVariationSettings: filled ? "'FILL' 1" : undefined,
      }}
    >
      {name}
    </span>
  );
}
