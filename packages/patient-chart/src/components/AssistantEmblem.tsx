import { useId } from "react";

// Four overlapping 75px circles, each fading from the emblem's centre outward,
// traced from the Figma asset (Group 1 / Group 2) on a 120px canvas.
const PETALS = [
  { cx: 60, cy: 30, x1: 60, y1: 67.5, x2: 60, y2: -14.6 },
  { cx: 60, cy: 90, x1: 60, y1: 52.5, x2: 60, y2: 134.2 },
  { cx: 30, cy: 60, x1: 67.5, y1: 60, x2: -14.3, y2: 60 },
  { cx: 90, cy: 60, x1: 52.5, y1: 60, x2: 132.2, y2: 60 },
];

export default function AssistantEmblem({ size = 120 }: { size?: number }) {
  const uid = useId();

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden="true" className="shrink-0">
      <defs>
        <filter id={`emblem-blur-${uid}`} x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        {PETALS.map((petal, index) => (
          <linearGradient
            key={index}
            id={`emblem-petal-${uid}-${index}`}
            x1={petal.x1}
            y1={petal.y1}
            x2={petal.x2}
            y2={petal.y2}
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#405bf2" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>

      <g filter={`url(#emblem-blur-${uid})`}>
        {PETALS.map((petal, index) => (
          <circle
            key={index}
            cx={petal.cx}
            cy={petal.cy}
            r="37.5"
            opacity="0.7"
            fill={`url(#emblem-petal-${uid}-${index})`}
          />
        ))}
      </g>
    </svg>
  );
}
