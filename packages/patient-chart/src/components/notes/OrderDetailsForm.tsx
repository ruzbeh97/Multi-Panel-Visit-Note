import { useEffect, useRef, useState } from "react";
import Icon from "../Icon";
import { useNoteReadOnly } from "./readOnly";
import type { OrderDetailField, PickedOrder } from "./OrderPickerModal";

const LABEL = "w-[168px] shrink-0 pt-1.5 font-body text-[13px] leading-[18px] text-[#8a8a8a]";
const VALUE = "min-w-0 flex-1 font-body text-[14px] leading-[22px] text-[#1a1a1a] outline-none placeholder:text-[#b3b3b3] bg-transparent disabled:text-[#808080]";
const ROW = "flex w-full items-start gap-6 py-2";

const PROCEDURE_OPTIONS = [
  "J1010 - Injection, methylprednisolone acetate, 1 mg",
  "20610 - Drain/inj joint/bursa w/o us",
];
const CPT_OPTIONS = [
  "75959 - Xray place dist ext thor ao",
  "75956 - Xray endovasc thor ao repr",
  "85027 - Complete cbc, automated",
];
const PRIORITY_OPTIONS = ["No Priority", "Routine", "Urgent", "STAT"];
const UNIT_OPTIONS = ["mg", "mL", "units"];
const ROUTE_OPTIONS = ["IM", "IV", "PO", "Intra-articular"];
const MODIFIER_OPTIONS = ["50", "LT", "RT", "59"];
const HCPCS_OPTIONS = ["L0180 - Cervical, multiple post collar", "L0120 - Cervical, flexible, non-adjustable", "E0114 - Crutches, underarm, pair"];
const ICD10_OPTIONS = ["M25.561", "M25.551", "M25.552", "S83.511A"];
type Recipient = {
  id: string;
  name: string;
  npi: string;
  address: string;
  phone: string;
};

type SelectedRecipient = Recipient & {
  fax: boolean;
  email: boolean;
  text: boolean;
};

const RECIPIENTS: Recipient[] = [
  {
    id: "r-hale",
    name: "Marcus Hale MD",
    npi: "1990010001",
    address: "2100 RIVERSIDE AVE, PORTLAND, OR 97201",
    phone: "555-010-1000",
  },
  {
    id: "r-whitfield",
    name: "Dana Whitfield PA-C",
    npi: "1990010002",
    address: "88 CEDAR LOOP, BEND, OR 97701",
    phone: "555-010-1001",
  },
  {
    id: "r-nunez",
    name: "Alicia Nunez",
    npi: "1990010003",
    address: "412 MARKET ST, SALEM, OR 97301",
    phone: "555-010-1002",
  },
  {
    id: "r-john-hale",
    name: "John Hale",
    npi: "1990010004",
    address: "150 OAK RIDGE RD, EUGENE, OR 97401",
    phone: "555-010-1003",
  },
  {
    id: "r-john-lee",
    name: "John Lee",
    npi: "1990010005",
    address: "74 PINE CREST DR, MEDFORD, OR 97501",
    phone: "555-010-1004",
  },
  {
    id: "r-john-lu",
    name: "John Lu",
    npi: "1990010006",
    address: "901 HARBOR BLVD, ASTORIA, OR 97103",
    phone: "555-010-1005",
  },
  {
    id: "r-john-martin",
    name: "John Martin",
    npi: "1990010007",
    address: "33 WESTERN AVE, ALBANY, OR 97321",
    phone: "555-010-1006",
  },
];

function codedValue(order: PickedOrder) {
  const name = order.title.replace(/ \([^)]+ Order\)$/, "");
  return order.code ? `${order.code} - ${name}` : name;
}

function Dropdown({
  value,
  placeholder,
  options,
  disabled,
  muted = false,
  compact = false,
  onChange,
}: {
  value: string;
  placeholder: string;
  options: string[];
  disabled: boolean;
  muted?: boolean;
  compact?: boolean;
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
    <div ref={rootRef} className={`relative min-w-0 ${compact ? "w-fit max-w-full" : "flex-1"}`}>
      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`flex items-center text-left ${compact ? "max-w-full gap-0.5" : "w-full gap-2"}`}
      >
        <span
          className={`min-w-0 font-body text-[14px] leading-[22px] ${compact ? "truncate" : "flex-1 truncate"} ${
            muted ? "text-[#c4c4c4]" : value ? "text-[#1a1a1a]" : "text-[#b3b3b3]"
          }`}
        >
          {value || placeholder}
        </span>
        <Icon name="arrow_drop_down" size={18} className={`shrink-0 ${muted ? "text-[#c4c4c4]" : "text-[#8a8a8a]"}`} />
      </button>
      {open ? (
        <ul
          className={`absolute left-0 top-[calc(100%+4px)] z-20 min-w-full overflow-hidden rounded-md bg-white py-1 shadow-[0_4px_16px_rgba(0,0,0,0.16)] ${
            compact ? "w-max max-w-[420px]" : "right-0"
          }`}
        >
          {options.map((option) => (
            <li key={option}>
              <button
                type="button"
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className={`flex w-full px-3 py-2 text-left font-body text-[13px] ${
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

function MultiSelectDropdown({
  selectedIds,
  options,
  placeholder,
  disabled,
  muted = false,
  onChange,
}: {
  selectedIds: string[];
  options: { id: string; label: string }[];
  placeholder: string;
  disabled: boolean;
  muted?: boolean;
  onChange: (ids: string[]) => void;
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

  const selected = options.filter((option) => selectedIds.includes(option.id));
  const summary =
    selected.length === 0
      ? placeholder
      : selected.length === 1
        ? selected[0].label
        : `${selected.length} orders selected`;

  function toggle(id: string) {
    onChange(selectedIds.includes(id) ? selectedIds.filter((entry) => entry !== id) : [...selectedIds, id]);
  }

  return (
    <div ref={rootRef} className="relative min-w-0 w-fit max-w-full">
      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((current) => !current)}
        className="flex max-w-full items-center gap-0.5 text-left"
      >
        <span
          className={`min-w-0 truncate font-body text-[14px] leading-[22px] ${
            muted || selected.length === 0 ? (muted ? "text-[#c4c4c4]" : "text-[#b3b3b3]") : "text-[#1a1a1a]"
          }`}
        >
          {summary}
        </span>
        <Icon name="arrow_drop_down" size={18} className={`shrink-0 ${muted ? "text-[#c4c4c4]" : "text-[#8a8a8a]"}`} />
      </button>
      {open ? (
        <ul
          role="listbox"
          aria-multiselectable="true"
          className="absolute left-0 top-[calc(100%+4px)] z-20 w-max min-w-full max-w-[420px] overflow-hidden rounded-md bg-white py-1 shadow-[0_4px_16px_rgba(0,0,0,0.16)]"
        >
          {options.map((option) => {
            const checked = selectedIds.includes(option.id);
            return (
              <li key={option.id} role="option" aria-selected={checked}>
                <button
                  type="button"
                  onClick={() => toggle(option.id)}
                  className={`flex w-full items-start gap-2 px-3 py-2 text-left font-body text-[13px] leading-[18px] ${
                    checked ? "bg-[#eceefe] text-[#1132ee]" : "text-[#303030] hover:bg-[#f5f5f5]"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-[3px] border ${
                      checked ? "border-[#1132ee] bg-[#1132ee]" : "border-[#b3b3b3] bg-white"
                    }`}
                  >
                    {checked ? <Icon name="check" size={12} className="text-white" /> : null}
                  </span>
                  <span className="min-w-0">{option.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function Toggle({ on, onToggle, disabled }: { on: boolean; onToggle: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={onToggle}
      className={`relative h-[18px] w-[32px] shrink-0 rounded-full transition-colors ${on ? "bg-[#1132ee]" : "bg-[#d4d4d4]"}`}
    >
      <span
        className={`absolute top-[2px] size-[14px] rounded-full bg-white transition-transform ${
          on ? "translate-x-[16px]" : "translate-x-[2px]"
        }`}
      />
    </button>
  );
}

function Radio({
  name,
  label,
  checked,
  disabled,
  muted = false,
  onSelect,
}: {
  name: string;
  label: string;
  checked: boolean;
  disabled: boolean;
  muted?: boolean;
  onSelect: () => void;
}) {
  const ring = muted ? "border-[#c4c4c4]" : checked ? "border-[#1132ee]" : "border-[#9a9a9a]";
  return (
    <label className="flex items-center gap-1.5">
      <input type="radio" name={name} className="sr-only" checked={checked} disabled={disabled} onChange={onSelect} />
      <span className={`flex size-[16px] items-center justify-center rounded-full border-[1.5px] ${ring}`}>
        {checked ? <span className={`size-[8px] rounded-full ${muted ? "bg-[#c4c4c4]" : "bg-[#1132ee]"}`} /> : null}
      </span>
      <span className={`font-body text-[14px] ${muted ? "text-[#c4c4c4]" : "text-[#303030]"}`}>{label}</span>
    </label>
  );
}

function ChipSelect({
  values,
  placeholder,
  options,
  disabled,
  onChange,
}: {
  values: string[];
  placeholder: string;
  options: string[];
  disabled: boolean;
  onChange: (values: string[]) => void;
}) {
  const remaining = options.filter((option) => !values.includes(option));
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
        {values.map((value) => (
          <span
            key={value}
            className="flex items-center gap-1 rounded-md bg-[#f1f1f1] px-1.5 py-0.5 font-body text-[13px] text-[#303030]"
          >
            {value}
            {!disabled && (
              <button
                type="button"
                aria-label={`Remove ${value}`}
                onClick={() => onChange(values.filter((entry) => entry !== value))}
                className="flex size-4 items-center justify-center"
              >
                <Icon name="close" size={12} className="text-[#666]" />
              </button>
            )}
          </span>
        ))}
        <Dropdown
          value=""
          placeholder={placeholder}
          options={remaining.length > 0 ? remaining : [placeholder]}
          disabled={disabled || remaining.length === 0}
          onChange={(value) => {
            if (value && value !== placeholder && !values.includes(value)) onChange([...values, value]);
          }}
        />
      </div>
    </div>
  );
}

function ChannelBox({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-1.5">
      <input type="checkbox" className="sr-only" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} />
      <span
        className={`flex size-4 items-center justify-center rounded-[2px] border ${
          checked ? "border-[#1132ee] bg-[#1132ee]" : "border-[#b3b3b3] bg-white"
        }`}
      >
        {checked ? <Icon name="check" size={12} className="text-white" /> : null}
      </span>
      <span className="font-body text-[13px] text-[#303030]">{label}</span>
    </label>
  );
}

function RecipientPicker({
  selected,
  disabled,
  muted,
  onChange,
}: {
  selected: SelectedRecipient[];
  disabled: boolean;
  muted: boolean;
  onChange: (next: SelectedRecipient[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const needle = query.trim().toLowerCase();
  const matches = RECIPIENTS.filter((entry) => {
    if (!needle) return true;
    return (
      entry.name.toLowerCase().includes(needle) ||
      entry.npi.includes(needle) ||
      entry.address.toLowerCase().includes(needle)
    );
  });

  function addRecipient(entry: Recipient) {
    if (!selected.some((item) => item.id === entry.id)) {
      onChange([...selected, { ...entry, fax: true, email: false, text: false }]);
    }
    setQuery("");
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative min-w-0 flex-1">
      <div className="flex items-center gap-2">
        <input
          value={query}
          disabled={disabled}
          placeholder="Search provider by name or NPI"
          onFocus={() => {
            if (!disabled) setOpen(true);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            if (!disabled) setOpen(true);
          }}
          className={`min-w-0 flex-1 bg-transparent font-body text-[14px] leading-[22px] outline-none placeholder:text-[#b3b3b3] ${
            muted ? "text-[#c4c4c4]" : "text-[#1a1a1a]"
          }`}
        />
        <button
          type="button"
          disabled={disabled}
          aria-label={open ? "Close recipients" : "Open recipients"}
          onClick={() => {
            if (disabled) return;
            setOpen((current) => !current);
            if (open) setQuery("");
          }}
        >
          <Icon
            name={open ? "arrow_drop_up" : "arrow_drop_down"}
            size={18}
            className={`shrink-0 ${muted ? "text-[#c4c4c4]" : "text-[#8a8a8a]"}`}
          />
        </button>
      </div>

      {open && !disabled ? (
        <div className="absolute bottom-[calc(100%+6px)] left-0 right-0 z-30 max-h-[280px] overflow-y-auto rounded-md bg-[#f3f3f3] p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.16)]">
          {matches.length === 0 ? (
            <p className="px-2 py-3 font-body text-[13px] text-[#8a8a8a]">No matching providers</p>
          ) : (
            matches.map((entry) => {
              const checked = selected.some((item) => item.id === entry.id);
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => addRecipient(entry)}
                  className="mb-1 flex w-full items-start gap-2.5 rounded-md border border-[#e6e6e6] bg-white px-2.5 py-2 text-left last:mb-0 hover:bg-[#fafbff]"
                >
                  <span
                    className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-[2px] border ${
                      checked ? "border-[#1132ee] bg-[#1132ee]" : "border-[#b3b3b3] bg-white"
                    }`}
                  >
                    {checked ? <Icon name="check" size={12} className="text-white" /> : null}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-body text-[13px] font-bold leading-[18px] text-[#1a1a1a]">{entry.name}</span>
                    <span className="mt-0.5 block font-body text-[11px] uppercase leading-[16px] tracking-[0.01em] text-[#8a8a8a]">
                      {entry.address}
                    </span>
                    <span className="block font-body text-[11px] leading-[16px] text-[#8a8a8a]">Phone: {entry.phone}</span>
                  </span>
                </button>
              );
            })
          )}
        </div>
      ) : null}

      {selected.length > 0 ? (
        <div className="mt-3 flex flex-col">
          {selected.map((entry) => (
            <div key={entry.id} className="flex items-center gap-3 py-2">
              <div className="min-w-0 flex-1">
                <span className="font-body text-[14px] font-medium text-[#1a1a1a]">{entry.name}</span>
                <span className="ml-3 font-body text-[12px] text-[#8a8a8a]">NPI: {entry.npi}</span>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <ChannelBox
                  label="Fax"
                  checked={entry.fax}
                  disabled={disabled}
                  onChange={(fax) => onChange(selected.map((item) => (item.id === entry.id ? { ...item, fax } : item)))}
                />
                <ChannelBox
                  label="Email"
                  checked={entry.email}
                  disabled={disabled}
                  onChange={(email) =>
                    onChange(selected.map((item) => (item.id === entry.id ? { ...item, email } : item)))
                  }
                />
                <ChannelBox
                  label="Text"
                  checked={entry.text}
                  disabled={disabled}
                  onChange={(text) => onChange(selected.map((item) => (item.id === entry.id ? { ...item, text } : item)))}
                />
                <button
                  type="button"
                  disabled={disabled}
                  aria-label={`Remove ${entry.name}`}
                  onClick={() => onChange(selected.filter((item) => item.id !== entry.id))}
                  className="flex size-7 items-center justify-center text-[#1a1a1a] disabled:text-[#c4c4c4]"
                >
                  <Icon name="delete" size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function OrderDetailsForm({
  order,
  relatedOrders,
  onComplete,
  onRequiresAuthorizationChange,
  onAssociateOrder,
  onFieldsChange,
}: {
  order: PickedOrder;
  relatedOrders: PickedOrder[];
  onComplete: () => void;
  onRequiresAuthorizationChange: (value: boolean) => void;
  onAssociateOrder: (orderIds: string[]) => void;
  onFieldsChange: (fields: {
    cptCode: string;
    cptUnits: string;
    authDetailFields: OrderDetailField[];
  }) => void;
}) {
  const readOnly = useNoteReadOnly();
  const coded = codedValue(order);
  const savedValue = (label: string) =>
    order.authDetailFields?.find((field) => field.label === label)?.value ?? "";
  const restoredCode =
    [...PROCEDURE_OPTIONS, ...CPT_OPTIONS, ...HCPCS_OPTIONS].find(
      (option) => option.split(" - ")[0].trim() === order.cptCode,
    ) ?? coded;
  const [procedure, setProcedure] = useState(restoredCode);
  const [orderName, setOrderName] = useState(
    savedValue("Order Name") ||
      (order.type === "Procedure" ? "" : order.title.replace(/ \([^)]+ Order\)$/, "")),
  );
  const [inHouse, setInHouse] = useState(savedValue("Procedure Location") !== "External");
  const [contactSource, setContactSource] = useState<"NPI" | "Contact List">(
    savedValue("Include contacts from") === "Contact List" ? "Contact List" : "NPI",
  );
  const [recipients, setRecipients] = useState<SelectedRecipient[]>(() => {
    const summary = savedValue("Recipients");
    return RECIPIENTS.filter((recipient) => summary.includes(recipient.name)).map((recipient) => ({
      ...recipient,
      fax: summary.includes("Fax"),
      email: summary.includes("Email"),
      text: summary.includes("Text"),
    }));
  });
  const [sig, setSig] = useState(savedValue(order.type === "DME" ? "Prescription SIG" : "SIG"));
  const [expiry, setExpiry] = useState(savedValue("Drug Expiry Date"));
  const [lot, setLot] = useState(savedValue("Lot Number"));
  const [ndc, setNdc] = useState(savedValue("NDC"));
  const [units, setUnits] = useState(savedValue("Units") || (order.code === "J1010" ? "Unit" : ""));
  const [quantity, setQuantity] = useState(
    savedValue(order.type === "Procedure" ? "Quantity of Units" : "Quantity") ||
      order.cptUnits ||
      (order.code === "J1010" ? "40" : order.type === "DME" ? "1" : ""),
  );
  const [refills, setRefills] = useState(savedValue("Refills") || "0");
  const [route, setRoute] = useState(savedValue("Route"));
  const [modifiers, setModifiers] = useState(savedValue("Modifiers"));
  const [notes, setNotes] = useState(savedValue("Notes"));
  const [priority, setPriority] = useState(savedValue("Priority") || (order.type === "Lab" ? "No Priority" : ""));
  const [icd10, setIcd10] = useState(savedValue("ICD-10 Codes"));
  const [icd10Codes, setIcd10Codes] = useState<string[]>(
    savedValue("ICD-10 Codes")
      ? savedValue("ICD-10 Codes").split(", ").filter(Boolean)
      : order.type === "DME"
        ? ["M25.561"]
        : [],
  );
  const [hcpcs, setHcpcs] = useState(order.type === "DME" ? restoredCode : "");
  const [resultMedium, setResultMedium] = useState(savedValue("Result Medium"));
  const [includePdf, setIncludePdf] = useState(savedValue("Include Chart Note PDF") === "Yes");
  const [specimenCollected, setSpecimenCollected] = useState(savedValue("Specimen Collected") === "Yes");
  const [dispenseAsWritten, setDispenseAsWritten] = useState(savedValue("Dispense as written") === "Yes");

  // Keep both the billing data and the visible order form fields in the parent so
  // submitted visit-note authorizations can reproduce this order in the tracker.
  const billingCode = (order.type === "DME" ? hcpcs : procedure).split(" - ")[0].trim();
  const recipientSummary = recipients
    .map((recipient) => {
      const channels = [
        recipient.fax ? "Fax" : "",
        recipient.email ? "Email" : "",
        recipient.text ? "Text" : "",
      ].filter(Boolean);
      return `${recipient.name} (NPI: ${recipient.npi})${channels.length ? ` · ${channels.join(", ")}` : ""}`;
    })
    .join("; ");

  useEffect(() => {
    const fields: OrderDetailField[] = [
      { label: "Order Name", value: orderName },
      { label: "Include contacts from", value: contactSource },
      { label: "Recipients", value: recipientSummary },
    ];

    if (order.type === "DME") {
      fields.push(
        { label: "Quantity", value: quantity },
        { label: "Refills", value: refills },
        { label: "ICD-10 Codes", value: icd10Codes.join(", ") },
        { label: "Prescription SIG", value: sig },
      );
    }
    if (order.type === "Procedure") {
      fields.push(
        { label: "Procedure Location", value: inHouse ? "Procedure administered in-house" : "External" },
        { label: "SIG", value: sig },
        { label: "Drug Expiry Date", value: expiry },
        { label: "Lot Number", value: lot },
        { label: "NDC", value: ndc },
        { label: "Units", value: units },
        { label: "Quantity of Units", value: quantity },
        { label: "Route", value: route },
        { label: "Modifiers", value: modifiers },
      );
    }
    if (order.type === "Imaging") {
      fields.push(
        { label: "ICD-10 Codes", value: icd10 },
        { label: "Priority", value: priority },
        { label: "Result Medium", value: resultMedium },
      );
    }
    if (order.type === "Lab") {
      fields.push(
        { label: "Priority", value: priority },
        { label: "Specimen Collected", value: specimenCollected ? "Yes" : "No" },
      );
    }

    fields.push(
      { label: "Notes", value: notes },
      ...(order.type === "DME"
        ? [{ label: "Dispense as written", value: dispenseAsWritten ? "Yes" : "No" }]
        : []),
      { label: "Include Chart Note PDF", value: includePdf ? "Yes" : "No" },
    );

    onFieldsChange({ cptCode: billingCode, cptUnits: quantity, authDetailFields: fields });
  }, [
    billingCode,
    contactSource,
    dispenseAsWritten,
    expiry,
    icd10,
    icd10Codes,
    inHouse,
    includePdf,
    lot,
    modifiers,
    ndc,
    notes,
    onFieldsChange,
    order.type,
    orderName,
    priority,
    quantity,
    recipientSummary,
    refills,
    resultMedium,
    route,
    sig,
    specimenCollected,
    units,
  ]);

  const radioName = `${order.id}-contacts`;
  // An in-house procedure has no outside recipient, so those fields are inert.
  const contactsDisabled = readOnly || (order.type === "Procedure" && inHouse);
  const associatedIds = order.associatedOrderIds ?? [];

  return (
    <div className="mt-3 flex w-full flex-col items-start">
      {order.type === "Procedure" ? (
        <div className={ROW}>
          <span className={LABEL}>Procedure / Injection</span>
          <Dropdown
            value={procedure}
            placeholder="Select procedure"
            options={PROCEDURE_OPTIONS}
            disabled={readOnly}
            onChange={setProcedure}
          />
        </div>
      ) : order.type === "DME" ? (
        <div className={ROW}>
          <span className={LABEL}>HCPCS Code</span>
          <Dropdown
            value={hcpcs}
            placeholder="Search for HCPCS code..."
            options={HCPCS_OPTIONS}
            disabled={readOnly}
            onChange={setHcpcs}
          />
        </div>
      ) : (
        <div className={ROW}>
          <span className={LABEL}>CPT Code</span>
          <Dropdown
            value={procedure}
            placeholder="Select CPT code"
            options={CPT_OPTIONS}
            disabled={readOnly}
            onChange={setProcedure}
          />
        </div>
      )}

      <div className={ROW}>
        <span className={LABEL}>Order Name</span>
        <input
          value={orderName}
          disabled={readOnly}
          onChange={(event) => setOrderName(event.target.value)}
          placeholder="Enter order name"
          className={VALUE}
        />
      </div>

      <div className={ROW}>
        <span className={LABEL}>Requires Authorization</span>
        <div className="flex min-w-0 flex-1 items-center gap-4 pt-1.5">
          <label className="flex shrink-0 items-center gap-2">
            <input
              type="checkbox"
              checked={order.requiresAuthorization}
              disabled={readOnly}
              onChange={(event) => onRequiresAuthorizationChange(event.target.checked)}
              className="size-4 accent-[#1132ee]"
            />
            <span className="font-body text-[14px] text-[#303030]">Requires Authorization</span>
          </label>
          <MultiSelectDropdown
            selectedIds={associatedIds}
            placeholder={
              relatedOrders.length === 0 ? "No other orders on this visit" : "Associate with another order"
            }
            options={relatedOrders.map((entry) => ({
              id: entry.id,
              label: `${entry.title} · Created on ${entry.createdAt}`,
            }))}
            disabled={readOnly || !order.requiresAuthorization || relatedOrders.length === 0}
            muted={!order.requiresAuthorization || relatedOrders.length === 0}
            onChange={onAssociateOrder}
          />
        </div>
      </div>

      {order.type === "DME" && (
        <div className={ROW}>
          <span className={LABEL}>Quantity</span>
          <div className="flex min-w-0 flex-1 items-center gap-10 pt-0.5">
            <input
              value={quantity}
              disabled={readOnly}
              onChange={(event) => setQuantity(event.target.value)}
              className="w-10 bg-transparent font-body text-[14px] leading-[22px] text-[#1a1a1a] outline-none"
            />
            <span className="font-body text-[13px] leading-[18px] text-[#8a8a8a]">Refills</span>
            <input
              value={refills}
              disabled={readOnly}
              onChange={(event) => setRefills(event.target.value)}
              className="w-10 bg-transparent font-body text-[14px] leading-[22px] text-[#1a1a1a] outline-none"
            />
          </div>
        </div>
      )}

      {order.type === "Procedure" && (
        <div className={ROW}>
          <span className={LABEL}>Procedure Location</span>
          <label className="flex items-center gap-2 pt-1.5">
            <input
              type="checkbox"
              checked={inHouse}
              disabled={readOnly}
              onChange={(event) => setInHouse(event.target.checked)}
              className="size-4 accent-[#1132ee]"
            />
            <span className="font-body text-[14px] text-[#303030]">Procedure administered in-house</span>
          </label>
        </div>
      )}

      <div className={ROW}>
        <span className={`${LABEL} ${contactsDisabled ? "text-[#c4c4c4]" : ""}`}>Include contacts from:</span>
        <div className="flex items-center gap-5 pt-1">
          <Radio
            name={radioName}
            label="NPI"
            checked={contactSource === "NPI"}
            disabled={contactsDisabled}
            muted={contactsDisabled}
            onSelect={() => setContactSource("NPI")}
          />
          <Radio
            name={radioName}
            label="Contact List"
            checked={contactSource === "Contact List"}
            disabled={contactsDisabled}
            muted={contactsDisabled}
            onSelect={() => setContactSource("Contact List")}
          />
        </div>
      </div>

      <div className={`${ROW} items-start`}>
        <span className={`${LABEL} ${contactsDisabled ? "text-[#c4c4c4]" : ""}`}>Recipients</span>
        <RecipientPicker
          selected={recipients}
          disabled={contactsDisabled}
          muted={contactsDisabled}
          onChange={setRecipients}
        />
      </div>

      {order.type === "DME" && (
        <>
          <div className={ROW}>
            <span className={LABEL}>ICD-10 Codes</span>
            <ChipSelect
              values={icd10Codes}
              placeholder="Add here..."
              options={ICD10_OPTIONS}
              disabled={readOnly}
              onChange={setIcd10Codes}
            />
          </div>
          <div className={ROW}>
            <span className={LABEL}>Prescription SIG</span>
            <textarea
              value={sig}
              disabled={readOnly}
              onChange={(event) => setSig(event.target.value)}
              placeholder="Write or select a SIG..."
              rows={2}
              className={`${VALUE} resize-none`}
            />
          </div>
        </>
      )}

      {order.type === "Procedure" && (
        <>
          <div className={ROW}>
            <span className={LABEL}>SIG</span>
            <textarea
              value={sig}
              disabled={readOnly}
              onChange={(event) => setSig(event.target.value)}
              placeholder="Write a SIG..."
              rows={2}
              className={`${VALUE} resize-none`}
            />
          </div>
          <div aria-hidden className="h-6" />
          <div className={ROW}>
            <span className={LABEL}>Drug Expiry Date</span>
            <span className="flex min-w-0 flex-1 items-center gap-2">
              <Icon name="calendar_today" size={16} className="text-[#b3b3b3]" />
              <input
                value={expiry}
                disabled={readOnly}
                onChange={(event) => setExpiry(event.target.value)}
                placeholder="MM/DD/YYYY"
                className={VALUE}
              />
            </span>
          </div>
          <div className={ROW}>
            <span className={LABEL}>Lot Number</span>
            <input
              value={lot}
              disabled={readOnly}
              onChange={(event) => setLot(event.target.value)}
              placeholder="Enter Lot Number"
              className={VALUE}
            />
          </div>
          <div className={ROW}>
            <span className={LABEL}>NDC</span>
            <input
              value={ndc}
              disabled={readOnly}
              onChange={(event) => setNdc(event.target.value)}
              placeholder="XXXX-XXXX-XX"
              className={VALUE}
            />
          </div>
          <div className={ROW}>
            <span className={LABEL}>Units</span>
            <Dropdown
              value={units}
              placeholder={order.code === "J1010" ? "Unit" : "Select Units"}
              options={UNIT_OPTIONS}
              disabled={readOnly}
              onChange={setUnits}
            />
          </div>
          <div className={ROW}>
            <span className={LABEL}>Quantity of Units</span>
            <input
              value={quantity}
              disabled={readOnly}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder="Enter the number of units"
              className={VALUE}
            />
          </div>
          <div className={ROW}>
            <span className={LABEL}>Route</span>
            <Dropdown value={route} placeholder="Select Route" options={ROUTE_OPTIONS} disabled={readOnly} onChange={setRoute} />
          </div>
          <div className={ROW}>
            <span className={LABEL}>Modifiers</span>
            <Dropdown
              value={modifiers}
              placeholder="Add modifiers..."
              options={MODIFIER_OPTIONS}
              disabled={readOnly}
              onChange={setModifiers}
            />
          </div>
        </>
      )}

      {order.type === "Imaging" && (
        <>
          <div className={ROW}>
            <span className={LABEL}>ICD-10 Codes</span>
            <Dropdown value={icd10} placeholder="Add here..." options={ICD10_OPTIONS} disabled={readOnly} onChange={setIcd10} />
          </div>
          <div className={ROW}>
            <span className={LABEL}>Priority</span>
            <Dropdown
              value={priority}
              placeholder="Select priority"
              options={PRIORITY_OPTIONS}
              disabled={readOnly}
              onChange={setPriority}
            />
          </div>
          <div className={ROW}>
            <span className={LABEL}>Result Medium</span>
            <input
              value={resultMedium}
              disabled={readOnly}
              onChange={(event) => setResultMedium(event.target.value)}
              placeholder="Write result medium..."
              className={VALUE}
            />
          </div>
        </>
      )}

      {order.type === "Lab" && (
        <div className={ROW}>
          <span className={LABEL}>Priority</span>
          <Dropdown
            value={priority}
            placeholder="Select priority"
            options={PRIORITY_OPTIONS}
            disabled={readOnly}
            onChange={setPriority}
          />
        </div>
      )}

      <div className={ROW}>
        <span className={LABEL}>Notes</span>
        <textarea
          value={notes}
          disabled={readOnly}
          onChange={(event) => setNotes(event.target.value)}
          placeholder={order.type === "Procedure" ? "Write note" : "Write note."}
          rows={2}
          className={`${VALUE} resize-none`}
        />
      </div>

      <div aria-hidden className="h-6" />

      {order.type === "DME" && (
        <div className={ROW}>
          <span className={LABEL}>Dispense as written</span>
          <div className="flex items-center pt-0.5">
            <Toggle on={dispenseAsWritten} disabled={readOnly} onToggle={() => setDispenseAsWritten((current) => !current)} />
          </div>
        </div>
      )}

      {order.type === "Lab" && (
        <div className={ROW}>
          <span className={LABEL}>Specimen Collected</span>
          <div className="flex items-center pt-0.5">
            <Toggle on={specimenCollected} disabled={readOnly} onToggle={() => setSpecimenCollected((current) => !current)} />
          </div>
        </div>
      )}

      <div className={ROW}>
        <span className={LABEL}>Include Chart Note PDF</span>
        <div className="flex items-center pt-0.5">
          <Toggle on={includePdf} disabled={readOnly} onToggle={() => setIncludePdf((current) => !current)} />
        </div>
      </div>

      <div className="flex w-full items-center gap-4 pt-4">
        <span className="font-body text-[12px] text-[#8a8a8a]">Created by Ruzbeh Irani</span>
        {!readOnly && (
          <button
            type="button"
            onClick={onComplete}
            className="font-body text-[13px] font-medium text-[#1132ee] hover:underline"
          >
            Complete & Send Order
          </button>
        )}
      </div>
    </div>
  );
}
