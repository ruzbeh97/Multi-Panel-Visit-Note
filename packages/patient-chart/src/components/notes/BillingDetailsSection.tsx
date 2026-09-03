import { useEffect, useMemo, useRef, useState } from "react";
import Icon from "../Icon";
import Section, { headingId } from "./Section";
import { useNoteReadOnly } from "./readOnly";
import { DIAGNOSIS_CODES } from "../../data/chart";
import ServicesSection from "./ServicesSection";

type DiagnosisOption = {
  code: string;
  description: string;
};

const FEATURED_DIAGNOSES: DiagnosisOption[] = [
  { code: "M25.551", description: "Pain in right hip" },
  { code: "M19.0", description: "Primary osteoarthritis of hip" },
  { code: "M16.4", description: "Bilateral primary osteoarthritis of hip" },
  { code: "M19.9", description: "Osteoarthritis, unspecified" },
  { code: "M25.561", description: "Pain in right knee" },
  { code: "M25.552", description: "Pain in left hip" },
];

const ALL_DIAGNOSES: DiagnosisOption[] = (() => {
  const seen = new Set<string>();
  const list: DiagnosisOption[] = [];
  for (const option of [
    ...FEATURED_DIAGNOSES,
    ...Object.entries(DIAGNOSIS_CODES).map(([code, value]) => ({
      code,
      description: value.description,
    })),
  ]) {
    if (seen.has(option.code)) continue;
    seen.add(option.code);
    list.push(option);
  }
  return list;
})();

function DiagnosisCodes() {
  const readOnly = useNoteReadOnly();
  const [selected, setSelected] = useState<DiagnosisOption[]>([
    FEATURED_DIAGNOSES[0],
    FEATURED_DIAGNOSES[1],
  ]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const selectedCodes = useMemo(() => new Set(selected.map((item) => item.code)), [selected]);
  const results = ALL_DIAGNOSES.filter((item) => {
    if (selectedCodes.has(item.code)) return false;
    const haystack = `${item.code} ${item.description}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });

  const addDiagnosis = (option: DiagnosisOption) => {
    setSelected((current) => [...current, option]);
    setQuery("");
    inputRef.current?.focus();
  };

  const removeDiagnosis = (code: string) => {
    setSelected((current) => current.filter((item) => item.code !== code));
  };

  return (
    <div className="flex w-full flex-col items-start gap-2">
      <div
        id={headingId("Diagnosis", readOnly)}
        data-note-heading="sub"
        data-note-title="Diagnosis"
        className="flex w-full scroll-mt-6 items-center gap-2"
      >
        <h2 className="font-body text-[16px] font-bold leading-[22px] text-[#1a1a1a]">Diagnosis Codes</h2>
        <span className="rounded-md bg-[#efefef] px-2 py-0.5 font-body text-[11px] leading-[16px] text-[#454545]">
          From ICD10-CM / Daily Note
        </span>
      </div>

      <div ref={rootRef} className="flex w-full items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <div className="flex min-h-11 w-full items-center gap-2 rounded-lg border border-[#d9d9d9] bg-white py-1.5 pl-2 pr-1.5">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
              {selected.map((item) => (
                <span
                  key={item.code}
                  className="flex max-w-full items-center gap-1 rounded-full bg-[#ececec] py-0.5 pl-2.5 pr-1"
                >
                  <span className="min-w-0 truncate font-body text-[13px] leading-[18px] text-[#1a1a1a]">
                    {item.code} · {item.description}
                  </span>
                  <button
                    type="button"
                    disabled={readOnly}
                    aria-label={`Remove ${item.code}`}
                    onClick={() => removeDiagnosis(item.code)}
                    className="flex size-5 shrink-0 items-center justify-center rounded-full text-[#666666] hover:bg-black/10 disabled:text-[#c4c4c4]"
                  >
                    <Icon name="close" size={14} />
                  </button>
                </span>
              ))}
              <input
                ref={inputRef}
                value={query}
                disabled={readOnly}
                placeholder="Search for diagnosis codes..."
                onFocus={() => setOpen(true)}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setOpen(true);
                }}
                className="min-w-[140px] flex-1 bg-transparent py-1 font-body text-[14px] leading-[20px] text-[#1a1a1a] placeholder:text-[#b3b3b3] outline-none disabled:text-[#808080]"
              />
            </div>
            <button
              type="button"
              disabled={readOnly}
              aria-label="Toggle diagnosis list"
              onClick={() => {
                setOpen((current) => !current);
                inputRef.current?.focus();
              }}
              className="flex size-7 shrink-0 items-center justify-center text-[#8a8a8a]"
            >
              <Icon name="expand_more" size={20} className={open ? "rotate-180" : ""} />
            </button>
          </div>

          {open && !readOnly ? (
            <ul className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 max-h-[260px] overflow-y-auto rounded-lg border border-[#e6e6e6] bg-white py-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
              {results.map((item) => (
                <li key={item.code}>
                  <button
                    type="button"
                    onClick={() => addDiagnosis(item)}
                    className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-[#f5f5f5]"
                  >
                    <span className="shrink-0 font-body text-[13px] font-medium text-[#1a1a1a]">{item.code}</span>
                    <span className="min-w-0 font-body text-[13px] leading-[18px] text-[#454545]">
                      {item.description}
                    </span>
                  </button>
                </li>
              ))}
              {results.length === 0 ? (
                <li className="px-3 py-3 font-body text-[13px] text-[#808080]">No matching diagnosis codes</li>
              ) : null}
            </ul>
          ) : null}
        </div>
        <button
          type="button"
          disabled={readOnly}
          onClick={() => {
            setOpen(true);
            inputRef.current?.focus();
          }}
          className="flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-[#1132ee] px-3 font-body text-[13px] font-medium text-white hover:bg-[#0e2ad4] disabled:bg-[#c4c4c4]"
        >
          <Icon name="search" size={16} className="text-white" />
          View Result List
        </button>
      </div>
    </div>
  );
}

export default function BillingDetailsSection() {
  return (
    <Section title="Billing Details">
      <div className="flex w-full flex-col items-start gap-8">
        <DiagnosisCodes />
        <ServicesSection />
      </div>
    </Section>
  );
}
