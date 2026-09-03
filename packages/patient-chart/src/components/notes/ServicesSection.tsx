import { useEffect, useRef, useState } from "react";
import Icon from "../Icon";
import { headingId } from "./Section";
import { useNoteReadOnly } from "./readOnly";

type ServiceKind = "procedure" | "hcpcs";

type ServiceRow = {
  id: string;
  kind: ServiceKind;
  code: string;
  description: string;
  modifier: string;
  icd10: string[];
  units: string;
  bookmarked: boolean;
};

type CatalogItem = { id: string; code: string; description: string; kind: ServiceKind };

const ICD10_OPTIONS = ["M19.9", "M25.551", "M25.561", "M25.552", "S83.511A"];

const PROCEDURE_CATALOG: CatalogItem[] = [
  { id: "20610", kind: "procedure", code: "20610", description: "Drain/inj joint/bursa w/o us" },
  { id: "20611", kind: "procedure", code: "20611", description: "Drain/inj joint/bursa w/us" },
  { id: "20552", kind: "procedure", code: "20552", description: "Inj trigger point 1 or 2 musc" },
];

const HCPCS_CATALOG: CatalogItem[] = [
  { id: "J1020", kind: "hcpcs", code: "J1020", description: "Inj methylprednisolone acetate 20mg" },
  { id: "J1030", kind: "hcpcs", code: "J1030", description: "Methylprednisolone 40 mg inj" },
  { id: "J1040", kind: "hcpcs", code: "J1040", description: "Inj methylprednisolone acetate 80mg" },
  { id: "J1010", kind: "hcpcs", code: "J1010", description: "Injection, methylprednisolone acetate, 1 mg" },
];

const PICKER_CATALOG: CatalogItem[] = [
  { id: "97162-mod", kind: "procedure", code: "97162", description: "PT Eval: Mod Complexity" },
  { id: "97162-30", kind: "procedure", code: "97162", description: "Pt eval mod complex 30 min" },
  { id: "97161-test", kind: "procedure", code: "97161", description: "Test" },
  { id: "97161-eval", kind: "procedure", code: "97161", description: "PT eval" },
  { id: "97161-20", kind: "procedure", code: "97161", description: "Pt Eval Low Complex 20 Min" },
  { id: "97161-20b", kind: "procedure", code: "97161", description: "Pt eval low complex 20 min" },
  ...PROCEDURE_CATALOG,
  ...HCPCS_CATALOG,
];

const INITIAL_SERVICES: ServiceRow[] = [
  {
    id: "svc-20610",
    kind: "procedure",
    code: "20610",
    description: "Drain/inj joint/bursa w/o us",
    modifier: "",
    icd10: ["M19.9", "M25.551"],
    units: "1",
    bookmarked: true,
  },
  {
    id: "svc-j1020",
    kind: "hcpcs",
    code: "J1020",
    description: "Inj methylprednisolone acetate 20mg",
    modifier: "",
    icd10: ["M25.551"],
    units: "2",
    bookmarked: false,
  },
  {
    id: "svc-j1040",
    kind: "hcpcs",
    code: "J1040",
    description: "Inj methylprednisolone acetate 80mg",
    modifier: "",
    icd10: ["M25.551", "M19.9"],
    units: "1",
    bookmarked: false,
  },
];

function catalogFor(kind: ServiceKind) {
  const seen = new Set<string>();
  const merged: CatalogItem[] = [];
  for (const item of PICKER_CATALOG.filter((entry) => entry.kind === kind)) {
    if (seen.has(item.code)) continue;
    seen.add(item.code);
    merged.push(item);
  }
  return merged;
}

function CompactSelect({
  value,
  placeholder,
  options,
  disabled,
  muted = false,
  widthClass = "w-[88px]",
  onChange,
}: {
  value: string;
  placeholder: string;
  options: string[];
  disabled: boolean;
  muted?: boolean;
  widthClass?: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className={`relative shrink-0 ${widthClass}`}>
      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`flex h-8 w-full items-center justify-between gap-1 rounded border border-[#d9d9d9] bg-white px-2 ${
          muted || disabled ? "text-[#b3b3b3]" : "text-[#1a1a1a]"
        }`}
      >
        <span className="min-w-0 truncate font-body text-[13px] leading-[18px]">{value || placeholder}</span>
        <Icon name="arrow_drop_down" size={16} className={muted || disabled ? "text-[#c4c4c4]" : "text-[#666666]"} />
      </button>
      {open ? (
        <ul className="absolute left-0 top-[calc(100%+4px)] z-20 max-h-56 min-w-full overflow-auto rounded-md bg-white py-1 shadow-[0_4px_16px_rgba(0,0,0,0.16)]">
          {options.map((option) => (
            <li key={option}>
              <button
                type="button"
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className={`flex w-full px-3 py-1.5 text-left font-body text-[13px] ${
                  option === value ? "bg-[#eceefe] text-[#1132ee]" : "text-[#303030] hover:bg-[#f5f5f5]"
                }`}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function HeaderAction({
  icon,
  label,
  disabled,
  onClick,
}: {
  icon: string;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex items-center gap-1 font-body text-[13px] font-medium leading-[18px] text-[#1132ee] hover:underline disabled:text-[#b3b3b3] disabled:no-underline"
    >
      <Icon name={icon} size={16} className="text-current" />
      {label}
    </button>
  );
}

function AddServicesPicker({
  onAdd,
}: {
  onAdd: (items: CatalogItem[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const filtered = PICKER_CATALOG.filter((item) => {
    const haystack = `${item.code} ${item.description}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });
  const selectedCount = selectedIds.size;

  const toggle = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addSelected = () => {
    if (selectedCount === 0) return;
    onAdd(PICKER_CATALOG.filter((item) => selectedIds.has(item.id)));
    setSelectedIds(new Set());
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <HeaderAction
        icon="add"
        label="Add Services"
        onClick={() => {
          setOpen((current) => {
            const next = !current;
            if (next) {
              setQuery("");
              setSelectedIds(new Set());
            }
            return next;
          });
        }}
      />
      {open ? (
        <div className="absolute right-0 top-[calc(100%+8px)] z-30 flex w-[360px] flex-col overflow-hidden rounded-xl border border-[#e6e6e6] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
          <div className="px-3 pt-3">
            <label className="flex h-10 items-center gap-2 rounded-lg border-2 border-[#1132ee] bg-white px-3">
              <Icon name="search" size={18} className="shrink-0 text-[#b3b3b3]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search services"
                className="min-w-0 flex-1 bg-transparent font-body text-[14px] leading-[20px] text-[#1a1a1a] placeholder:text-[#b3b3b3] outline-none"
              />
            </label>
          </div>
          <ul className="max-h-[280px] overflow-y-auto px-1 py-2">
            {filtered.map((item) => {
              const checked = selectedIds.has(item.id);
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => toggle(item.id)}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left hover:bg-[#f7f7f7]"
                  >
                    <span
                      className={`flex size-[18px] shrink-0 items-center justify-center rounded-[3px] border-2 ${
                        checked ? "border-[#1132ee] bg-[#1132ee]" : "border-[#666666] bg-white"
                      }`}
                    >
                      {checked ? (
                        <Icon name="check" size={14} className="text-white" />
                      ) : null}
                    </span>
                    <span className="min-w-0 font-body text-[14px] leading-[20px] text-[#1a1a1a]">
                      {item.code} • {item.description}
                    </span>
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 ? (
              <li className="px-3 py-4 font-body text-[13px] text-[#808080]">No matching services</li>
            ) : null}
          </ul>
          <div className="relative px-3 pb-3 pt-1">
            <div className="pointer-events-none absolute inset-x-0 -top-6 h-6 bg-gradient-to-b from-transparent to-white" />
            <button
              type="button"
              disabled={selectedCount === 0}
              onClick={addSelected}
              className="flex h-10 w-full items-center justify-center rounded-full bg-[#ececec] font-body text-[14px] font-medium text-[#8a8a8a] disabled:cursor-default enabled:bg-[#1132ee] enabled:text-white"
            >
              Add {selectedCount} Service{selectedCount === 1 ? "" : "s"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ServiceLine({
  service,
  showColumnLabels,
  readOnly,
  onChange,
  onRemove,
}: {
  service: ServiceRow;
  showColumnLabels: boolean;
  readOnly: boolean;
  onChange: (patch: Partial<ServiceRow>) => void;
  onRemove: () => void;
}) {
  const catalog = catalogFor(service.kind);
  const codes = catalog.map((item) => item.code);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const setCode = (code: string) => {
    const match = catalog.find((item) => item.code === code);
    onChange({ code, description: match?.description ?? service.description });
  };

  const setIcd = (index: number, value: string) => {
    const next = [...service.icd10];
    next[index] = value;
    onChange({ icd10: next });
  };

  const removeIcd = (index: number) => {
    const next = service.icd10.filter((_, i) => i !== index);
    onChange({ icd10: next.length > 0 ? next : [""] });
  };

  const addIcd = () => {
    const unused = ICD10_OPTIONS.find((option) => !service.icd10.includes(option)) ?? "";
    onChange({ icd10: [...service.icd10.filter(Boolean), unused || ""] });
  };

  const moveIcd = (from: number, to: number) => {
    if (from === to) return;
    const next = [...service.icd10];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange({ icd10: next });
  };

  return (
    <div className="flex w-full items-start gap-3 py-2">
      <div className="flex min-w-0 flex-1 items-start gap-2 pt-0.5">
        <CompactSelect
          value={service.code}
          placeholder="Code"
          options={codes}
          disabled={readOnly}
          onChange={setCode}
        />
        <CompactSelect
          value={service.modifier}
          placeholder="Mod"
          options={["50", "LT", "RT", "59"]}
          disabled
          muted
          widthClass="w-[64px]"
          onChange={(modifier) => onChange({ modifier })}
        />
        <p className="min-w-0 flex-1 pt-1.5 font-body text-[13px] leading-[18px] text-[#1a1a1a]">
          {service.description}
        </p>
      </div>

      <div className="flex w-[168px] shrink-0 flex-col items-stretch gap-1.5">
        {showColumnLabels ? (
          <span className="font-body text-[11px] font-medium leading-[14px] text-[#666666]">ICD-10</span>
        ) : null}
        {service.icd10.map((code, index) => (
          <div
            key={`${service.id}-icd-${index}`}
            draggable={!readOnly}
            onDragStart={() => setDragIndex(index)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (dragIndex !== null) moveIcd(dragIndex, index);
              setDragIndex(null);
            }}
            className="flex items-center gap-1"
          >
            <span className="grid h-4 w-3 shrink-0 cursor-grab grid-cols-2 gap-px pt-0.5" aria-hidden>
              {Array.from({ length: 6 }).map((_, dot) => (
                <span key={dot} className="size-[3px] rounded-full bg-[#b3b3b3]" />
              ))}
            </span>
            <CompactSelect
              value={code}
              placeholder="ICD-10"
              options={ICD10_OPTIONS}
              disabled={readOnly}
              widthClass="min-w-0 flex-1"
              onChange={(value) => setIcd(index, value)}
            />
            <button
              type="button"
              disabled={readOnly}
              aria-label={`Remove ${code || "ICD-10"}`}
              onClick={() => removeIcd(index)}
              className="flex size-6 items-center justify-center text-[#666666] hover:text-[#1a1a1a] disabled:text-[#c4c4c4]"
            >
              <Icon name="remove" size={16} />
            </button>
          </div>
        ))}
        {!readOnly ? (
          <button
            type="button"
            onClick={addIcd}
            className="self-start pl-4 font-body text-[12px] font-medium text-[#1132ee] hover:underline"
          >
            + ICD
          </button>
        ) : null}
      </div>

      <div className="flex w-[52px] shrink-0 flex-col items-start gap-1.5">
        {showColumnLabels ? (
          <span className="font-body text-[11px] font-medium leading-[14px] text-[#666666]">Units</span>
        ) : (
          <span className="h-[14px]" />
        )}
        <input
          value={service.units}
          disabled={readOnly}
          onChange={(event) => onChange({ units: event.target.value.replace(/[^\d.]/g, "") })}
          className="h-8 w-full rounded border border-[#d9d9d9] bg-white px-2 text-center font-body text-[13px] leading-[18px] text-[#1a1a1a] outline-none disabled:text-[#808080]"
        />
      </div>

      <div className="flex shrink-0 items-center gap-1 pt-[22px]">
        <button
          type="button"
          disabled={readOnly}
          aria-label={service.bookmarked ? "Remove notes" : "Add notes"}
          onClick={() => onChange({ bookmarked: !service.bookmarked })}
          className="flex size-7 items-center justify-center text-[#1132ee] disabled:text-[#c4c4c4]"
        >
          <Icon name="notes" size={18} filled={service.bookmarked} />
        </button>
        <button
          type="button"
          disabled={readOnly}
          aria-label={`Remove ${service.code}`}
          onClick={onRemove}
          className="flex size-7 items-center justify-center text-[#1132ee] disabled:text-[#c4c4c4]"
        >
          <Icon name="delete" size={18} />
        </button>
      </div>
    </div>
  );
}

export default function ServicesSection() {
  const readOnly = useNoteReadOnly();
  const [open, setOpen] = useState(true);
  const [services, setServices] = useState<ServiceRow[]>(INITIAL_SERVICES);

  const procedures = services.filter((service) => service.kind === "procedure");
  const hcpcs = services.filter((service) => service.kind === "hcpcs");

  const patchService = (id: string, patch: Partial<ServiceRow>) => {
    setServices((current) => current.map((service) => (service.id === id ? { ...service, ...patch } : service)));
  };

  const applyAllIcd = () => {
    const combined: string[] = [];
    for (const service of services) {
      for (const code of service.icd10) {
        if (code && !combined.includes(code)) combined.push(code);
      }
    }
    if (combined.length === 0) return;
    setServices((current) => current.map((service) => ({ ...service, icd10: [...combined] })));
  };

  const addServices = (items: CatalogItem[]) => {
    const defaultIcd = services[0]?.icd10[0] || "M25.551";
    setServices((current) => [
      ...current,
      ...items.map((item, index) => ({
        id: `svc-${item.id}-${Date.now()}-${index}`,
        kind: item.kind,
        code: item.code,
        description: item.description,
        modifier: "",
        icd10: [defaultIcd],
        units: "1",
        bookmarked: false,
      })),
    ]);
  };

  return (
    <div className="flex w-full flex-col items-start gap-3">
      <div
        id={headingId("Services", readOnly)}
        data-note-heading="sub"
        data-note-title="Services"
        className="flex w-full scroll-mt-6 items-center justify-between gap-3"
      >
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          className="flex min-w-0 items-center gap-1 text-left"
        >
          <Icon
            name="expand_more"
            size={20}
            className={`text-[#1a1a1a] transition-transform ${open ? "" : "-rotate-90"}`}
          />
          <h2 className="font-body text-[16px] font-bold leading-[22px] text-[#1a1a1a]">Services</h2>
        </button>
        {!readOnly ? (
          <div className="flex shrink-0 items-center gap-4">
            <HeaderAction icon="playlist_remove" label="Clear All" onClick={() => setServices([])} />
            <HeaderAction icon="playlist_add" label="Apply All ICD To All Services" onClick={applyAllIcd} />
            <AddServicesPicker onAdd={addServices} />
          </div>
        ) : null}
      </div>

      {open ? (
        <div className="flex w-full flex-col items-start gap-5">
          {procedures.length > 0 ? (
            <div className="flex w-full flex-col items-start">
              <h3 className="pb-1 font-body text-[13px] font-bold leading-[18px] text-[#454545]">Procedures</h3>
              {procedures.map((service, index) => (
                <ServiceLine
                  key={service.id}
                  service={service}
                  showColumnLabels={index === 0}
                  readOnly={readOnly}
                  onChange={(patch) => patchService(service.id, patch)}
                  onRemove={() => setServices((current) => current.filter((entry) => entry.id !== service.id))}
                />
              ))}
            </div>
          ) : null}

          {hcpcs.length > 0 ? (
            <div className="flex w-full flex-col items-start">
              <h3 className="pb-1 font-body text-[13px] font-bold leading-[18px] text-[#454545]">HCPCS Level II</h3>
              {hcpcs.map((service, index) => (
                <ServiceLine
                  key={service.id}
                  service={service}
                  showColumnLabels={index === 0}
                  readOnly={readOnly}
                  onChange={(patch) => patchService(service.id, patch)}
                  onRemove={() => setServices((current) => current.filter((entry) => entry.id !== service.id))}
                />
              ))}
            </div>
          ) : null}

          {services.length === 0 ? (
            <p className="font-body text-[13px] leading-[18px] text-[#808080]">No services added.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
