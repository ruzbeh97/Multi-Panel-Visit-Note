import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ASSOCIATE_PROVIDER, PATIENT, PROVIDER } from "../data/chart";
import Icon from "./Icon";

const ORDER_TYPES = [
  "DME",
  "Outbound Referral",
  "Imaging",
  "Lab",
  "Healthgorilla",
  "Internal Lab",
  "Procedures & Injections",
  "Custom",
];

const fieldBoxClass = "rounded-[3px] border border-[#ededed] bg-white px-3 py-1";
const fieldLabelClass = "block font-body text-[11px] leading-[16px] text-[#8a8a8a]";
const controlClass =
  "h-[22px] w-full bg-transparent font-body text-[14px] leading-[22px] text-[#303030] outline-none placeholder:text-[#b8b8b8]";
const sectionTitleClass = "font-body text-[14px] font-bold text-[#1a1a1a]";
const blockTitleClass = "font-body text-[13px] font-bold text-[#1a1a1a]";
const textareaClass =
  "w-full resize-none rounded-[3px] border border-[#ededed] bg-white px-3 py-2.5 font-body text-[14px] leading-[22px] text-[#303030] outline-none placeholder:text-[#b8b8b8]";

function SelectField({
  label,
  value,
  placeholder,
  options,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative min-w-0">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((current) => !current)}
        className={`relative w-full bg-white text-left ${
          open
            ? "rounded-[4px] border border-[#1132ee] px-3 pb-2 pt-3"
            : `${fieldBoxClass}`
        }`}
      >
        {open ? (
          <span className="absolute -top-2 left-2 bg-white px-1 font-body text-[11px] leading-[16px] text-[#1132ee]">
            {label}
          </span>
        ) : (
          <span className={fieldLabelClass}>{label}</span>
        )}
        <span className="flex items-center">
          <span className={`min-w-0 flex-1 truncate font-body text-[14px] leading-[22px] ${value ? "text-[#303030]" : "text-[#b8b8b8]"}`}>
            {value || placeholder}
          </span>
          <Icon name={open ? "arrow_drop_up" : "arrow_drop_down"} size={18} className="shrink-0 text-[#6b6b6b]" />
        </span>
      </button>
      {open ? (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 overflow-hidden rounded-[4px] bg-white py-1 shadow-[0_4px_16px_rgba(0,0,0,0.16)]"
        >
          {options.map((option) => {
            const selected = option === value;
            return (
              <li key={option} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                  className={`flex h-10 w-full items-center px-4 text-left font-body text-[14px] text-[#303030] ${
                    selected ? "bg-[#eceefe]" : "hover:bg-[#f5f5f5]"
                  }`}
                >
                  {option}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function TextField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className={`${fieldBoxClass} block min-w-0`}>
      <span className={fieldLabelClass}>{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={controlClass}
      />
    </label>
  );
}

function DateField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className={`${fieldBoxClass} block min-w-0`}>
      <span className={fieldLabelClass}>{label}</span>
      <span className="flex items-center gap-2">
        <Icon name="calendar_today" size={16} className="text-[#b8b8b8]" />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={controlClass}
        />
      </span>
    </label>
  );
}

function TextAreaField({
  label,
  value,
  placeholder,
  onChange,
  minHeight = "96px",
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  minHeight?: string;
}) {
  return (
    <label className={`${fieldBoxClass} block min-w-0`}>
      <span className={fieldLabelClass}>{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full resize-none bg-transparent font-body text-[14px] leading-[22px] text-[#303030] outline-none placeholder:text-[#b8b8b8]"
        style={{ minHeight }}
      />
    </label>
  );
}

function Toggle({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} className="flex items-center gap-2">
      <span className="font-body text-[13px] text-[#303030]">{label}</span>
      <span
        className={`relative h-[18px] w-[32px] shrink-0 rounded-full transition-colors ${
          on ? "bg-[#1132ee]" : "bg-[#d4d4d4]"
        }`}
      >
        <span
          className={`absolute top-[2px] size-[14px] rounded-full bg-white transition-transform ${
            on ? "translate-x-[16px]" : "translate-x-[2px]"
          }`}
        />
      </span>
    </button>
  );
}

function Radio({ label, checked, onSelect }: { label: string; checked: boolean; onSelect: () => void }) {
  return (
    <label className="flex items-center gap-1.5">
      <input type="radio" name="contact-source" className="sr-only" checked={checked} onChange={onSelect} />
      <span
        className={`flex size-[17px] items-center justify-center rounded-full border-[1.5px] ${
          checked ? "border-[#1132ee]" : "border-[#9a9a9a]"
        }`}
      >
        {checked ? <span className="size-[9px] rounded-full bg-[#1132ee]" /> : null}
      </span>
      <span className="font-body text-[14px] text-[#303030]">{label}</span>
    </label>
  );
}

export default function NewOrderDrawer({ onClose }: { onClose: () => void }) {
  const [orderType, setOrderType] = useState("Outbound Referral");
  const [patient, setPatient] = useState(PATIENT.name);
  const [appointment, setAppointment] = useState("");
  const [facility, setFacility] = useState("");
  const [payer, setPayer] = useState("");
  const [provider, setProvider] = useState("");
  const [requestType, setRequestType] = useState("");
  const [expectsResponse, setExpectsResponse] = useState(false);
  const [requiresAuthorization, setRequiresAuthorization] = useState(false);
  const [specialty, setSpecialty] = useState("");
  const [referringProvider, setReferringProvider] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [procedure, setProcedure] = useState("");
  const [reason, setReason] = useState("");
  const [visits, setVisits] = useState("");
  const [priority, setPriority] = useState("");
  const [notes, setNotes] = useState("");
  const [orderName, setOrderName] = useState("");
  const [icd10, setIcd10] = useState("");
  const [cptCodes, setCptCodes] = useState("");
  const [resultMedium, setResultMedium] = useState("");
  const [hcpcs, setHcpcs] = useState("");
  const [sig, setSig] = useState("");
  const [dispenseAsWritten, setDispenseAsWritten] = useState(true);
  const [specimenCollected, setSpecimenCollected] = useState(false);
  const [procedureInjection, setProcedureInjection] = useState("");
  const [route, setRoute] = useState("");
  const [quantity, setQuantity] = useState("");
  const [units, setUnits] = useState("");
  const [drugExpiry, setDrugExpiry] = useState("");
  const [lotNumber, setLotNumber] = useState("");
  const [ndc, setNdc] = useState("");
  const [modifiers, setModifiers] = useState("");
  const [template, setTemplate] = useState("");
  const [contactSource, setContactSource] = useState<"NPI" | "Contact List">("NPI");
  const [contacts, setContacts] = useState("");
  const [attachments, setAttachments] = useState("");
  const [includePdf, setIncludePdf] = useState(false);
  const [includeLogo, setIncludeLogo] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const drawer = (
    <div className="fixed inset-0 z-[80] flex justify-end">
      <button type="button" aria-label="Close new order" className="absolute inset-0 bg-black/20" onClick={onClose} />
      <aside className="relative flex h-full w-[min(720px,100vw)] flex-col bg-[#f7f7f7] shadow-[-8px_0_32px_rgba(0,0,0,0.12)]">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#ededed] bg-white px-5">
          <h2 className="font-body text-[18px] font-medium text-[#1a1a1a]">New Order</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded text-[#404040] hover:bg-black/5"
          >
            <Icon name="close" size={19} />
          </button>
        </header>

        <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto bg-[#f7f7f7] px-5 pb-6 pt-5">
          <h3 className={`${sectionTitleClass} mb-2`}>Basic Details</h3>
          <div className="flex flex-col gap-1">
            <SelectField
              label="Order Type"
              value={orderType}
              placeholder="Select order type"
              options={ORDER_TYPES}
              onChange={setOrderType}
            />
            <div className="grid grid-cols-2 gap-3">
              <SelectField
                label="Patient"
                value={patient}
                placeholder="Select patient"
                options={[PATIENT.name]}
                onChange={setPatient}
              />
              <SelectField
                label="Select Related Appointment"
                value={appointment}
                placeholder="Select related appointment"
                options={["Follow-up 08/27/2026", "Post-op 07/23/2026"]}
                onChange={setAppointment}
              />
              <SelectField
                label="From Facility"
                value={facility}
                placeholder="Select facility"
                options={["Hale Orthopedics", "MAIN OFFICE"]}
                onChange={setFacility}
              />
              <SelectField
                label="Payer"
                value={payer}
                placeholder="Select payer"
                options={[PATIENT.insurance]}
                onChange={setPayer}
              />
              <SelectField
                label="Provider"
                value={provider}
                placeholder="Select Provider"
                options={[PROVIDER.display, ASSOCIATE_PROVIDER]}
                onChange={setProvider}
              />
              <SelectField
                label="Referral Request Type"
                value={requestType}
                placeholder="Select referral request type"
                options={["Consult", "Transfer of care", "Second opinion"]}
                onChange={setRequestType}
              />
            </div>
          </div>

          <div className="mt-5 flex items-center gap-8">
            <label className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={expectsResponse}
                onChange={(event) => setExpectsResponse(event.target.checked)}
                className="size-[17px] rounded-[2px] border-[#9a9a9a] accent-[#1132ee]"
              />
              <span className="font-body text-[14px] text-[#303030]">Expects Response</span>
            </label>
            <label className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={requiresAuthorization}
                onChange={(event) => setRequiresAuthorization(event.target.checked)}
                className="size-[17px] rounded-[2px] border-[#9a9a9a] accent-[#1132ee]"
              />
              <span className="font-body text-[14px] text-[#303030]">Requires Authorization</span>
            </label>
          </div>

          <h3 className={`${sectionTitleClass} mb-2 mt-5`}>
            {orderType === "Outbound Referral" ? "Referral" : orderType === "Custom" ? "Custom Order" : orderType}
          </h3>
          {orderType === "Imaging" ? (
            <div className="flex flex-col gap-4 rounded-lg border border-[#ededed] bg-white p-3">
              <TextField label="Order Name" value={orderName} placeholder="Enter Order Name" onChange={setOrderName} />

              <div>
                <h4 className={`${blockTitleClass} mb-1.5`}>
                  ICD-10 Codes<span className="text-[#d32f2f]">*</span>
                </h4>
                <SelectField
                  label="ICD-10 Codes"
                  value={icd10}
                  placeholder=""
                  options={["M23.51 — Chronic instability of right knee", "S83.511A — Sprain of ACL, right knee"]}
                  onChange={setIcd10}
                />
              </div>

              <div>
                <h4 className={`${blockTitleClass} mb-1.5`}>CPT Codes & Order Groups</h4>
                <SelectField
                  label="CPT Codes & Order Groups"
                  value={cptCodes}
                  placeholder="Select CPT codes or order groups"
                  options={["73721 — MRI any joint of lower extremity", "73560 — X-ray exam of knee, 1 or 2 views"]}
                  onChange={setCptCodes}
                />
              </div>

              <SelectField
                label="Priority"
                value={priority}
                placeholder="Priority"
                options={["Routine", "Urgent", "STAT"]}
                onChange={setPriority}
              />

              <TextField
                label="Result Medium"
                value={resultMedium}
                placeholder="Write result medium..."
                onChange={setResultMedium}
              />

              <TextAreaField label="Notes" value={notes} placeholder="Write note." onChange={setNotes} />
            </div>
          ) : orderType === "DME" ? (
            <div className="flex flex-col gap-4 rounded-lg border border-[#ededed] bg-white p-3">
              <TextField label="Order Name" value={orderName} placeholder="Enter Order Name" onChange={setOrderName} />

              <div>
                <h4 className={`${blockTitleClass} mb-1.5`}>Diagnosis Codes</h4>
                <SelectField
                  label="Diagnosis codes"
                  value={diagnosis}
                  placeholder=""
                  options={["M23.51 — Chronic instability of right knee", "S83.511A — Sprain of ACL, right knee"]}
                  onChange={setDiagnosis}
                />
              </div>

              <div>
                <h4 className={`${blockTitleClass} mb-1.5`}>HCPCS Level II Codes</h4>
                <SelectField
                  label="HCPCS codes"
                  value={hcpcs}
                  placeholder="Search for HCPCS codes..."
                  options={["L1832 — Knee orthosis, adjustable", "E0114 — Crutches, underarm, pair"]}
                  onChange={setHcpcs}
                />
              </div>

              <div>
                <h4 className={`${blockTitleClass} mb-1.5`}>Prescription SIG</h4>
                <textarea
                  value={sig}
                  onChange={(event) => setSig(event.target.value)}
                  placeholder="Write or select a SIG..."
                  className={`${textareaClass} min-h-[88px]`}
                />
              </div>

              <div>
                <h4 className={`${blockTitleClass} mb-1.5`}>Substitution</h4>
                <label className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={dispenseAsWritten}
                    onChange={(event) => setDispenseAsWritten(event.target.checked)}
                    className="size-[17px] rounded-[2px] border-[#9a9a9a] accent-[#1132ee]"
                  />
                  <span className="font-body text-[14px] text-[#303030]">Dispense as written</span>
                </label>
              </div>

              <div>
                <h4 className={`${blockTitleClass} mb-1.5`}>Notes</h4>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Write note."
                  className={`${textareaClass} min-h-[96px] resize-y`}
                />
              </div>
            </div>
          ) : orderType === "Lab" ? (
            <div className="flex flex-col gap-4 rounded-lg border border-[#ededed] bg-white p-3">
              <TextField label="Order Name" value={orderName} placeholder="Enter Order Name" onChange={setOrderName} />

              <div>
                <h4 className={`${blockTitleClass} mb-1.5`}>
                  ICD-10 Codes<span className="text-[#d32f2f]">*</span>
                </h4>
                <SelectField
                  label="ICD-10 Codes"
                  value={icd10}
                  placeholder=""
                  options={["M23.51 — Chronic instability of right knee", "S83.511A — Sprain of ACL, right knee"]}
                  onChange={setIcd10}
                />
              </div>

              <div>
                <h4 className={`${blockTitleClass} mb-1.5`}>CPT Codes & Order Groups</h4>
                <SelectField
                  label="CPT Codes & Order Groups"
                  value={cptCodes}
                  placeholder="Select CPT codes or order groups"
                  options={["85025 — Complete CBC with auto differential", "80053 — Comprehensive metabolic panel"]}
                  onChange={setCptCodes}
                />
              </div>

              <div>
                <h4 className={`${blockTitleClass} mb-1.5`}>Notes</h4>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Write note."
                  className={`${textareaClass} min-h-[96px] resize-y`}
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="min-w-0 flex-1">
                  <SelectField
                    label="Priority"
                    value={priority}
                    placeholder="Priority"
                    options={["Routine", "Urgent", "STAT"]}
                    onChange={setPriority}
                  />
                </div>
                <label className="flex shrink-0 items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={specimenCollected}
                    onChange={(event) => setSpecimenCollected(event.target.checked)}
                    className="size-[17px] rounded-[2px] border-[#9a9a9a] accent-[#1132ee]"
                  />
                  <span className="w-[88px] font-body text-[14px] leading-[18px] text-[#303030]">Specimen Collected</span>
                </label>
              </div>
            </div>
          ) : orderType === "Procedures & Injections" ? (
            <div className="flex flex-col gap-4 rounded-lg border border-[#ededed] bg-white p-3">
              <TextField label="Order Name" value={orderName} placeholder="Enter Order Name" onChange={setOrderName} />

              <SelectField
                label="Procedure / Injection"
                value={procedureInjection}
                placeholder="Search for a CPT or J-code..."
                options={[
                  "20610 — Arthrocentesis, major joint",
                  "J3301 — Injection, triamcinolone acetonide",
                ]}
                onChange={setProcedureInjection}
              />

              <div>
                <h4 className={`${blockTitleClass} mb-1.5`}>Diagnosis</h4>
                <SelectField
                  label="Diagnosis codes"
                  value={diagnosis}
                  placeholder=""
                  options={["M23.51 — Chronic instability of right knee", "S83.511A — Sprain of ACL, right knee"]}
                  onChange={setDiagnosis}
                />
              </div>

              <SelectField
                label="Route"
                value={route}
                placeholder="Select a route"
                options={["Intra-articular", "Intramuscular", "Subcutaneous", "Oral"]}
                onChange={setRoute}
              />

              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="Quantity of Units"
                  value={quantity}
                  placeholder="Enter quantity"
                  onChange={setQuantity}
                />
                <SelectField
                  label="Units"
                  value={units}
                  placeholder="Select Units"
                  options={["mL", "mg", "units"]}
                  onChange={setUnits}
                />
              </div>

              <div>
                <h4 className={`${blockTitleClass} mb-1.5`}>SIG</h4>
                <textarea
                  value={sig}
                  onChange={(event) => setSig(event.target.value)}
                  placeholder="Write or select a SIG..."
                  className={`${textareaClass} min-h-[88px]`}
                />
              </div>

              <DateField
                label="Drug Expiry Date"
                value={drugExpiry}
                placeholder="MM/DD/YYYY"
                onChange={setDrugExpiry}
              />
              <TextField label="Lot Number" value={lotNumber} placeholder="Enter lot number" onChange={setLotNumber} />
              <TextField label="NDC" value={ndc} placeholder="XXXX-XXXX-XX" onChange={setNdc} />

              <div>
                <h4 className={`${blockTitleClass} mb-1.5`}>Modifiers</h4>
                <SelectField
                  label="Modifiers"
                  value={modifiers}
                  placeholder="Add modifiers..."
                  options={["RT — Right side", "LT — Left side", "59 — Distinct procedural service"]}
                  onChange={setModifiers}
                />
              </div>

              <div>
                <h4 className={`${blockTitleClass} mb-1.5`}>Notes</h4>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Write note."
                  className={`${textareaClass} min-h-[96px] resize-y`}
                />
              </div>
            </div>
          ) : orderType === "Custom" ? (
            <div className="flex flex-col gap-3 rounded-lg border border-[#ededed] bg-white p-3">
              <SelectField
                label="Template"
                value={template}
                placeholder="Select a template..."
                options={[
                  "Surgery Order V3",
                  "Parking Placard Prescription",
                  "Test Prescription",
                  "RFA",
                  "Surgical Order v2",
                  "Surgery Order",
                  "Return to Work / School Form",
                ]}
                onChange={setTemplate}
              />
              <div className="flex min-h-[88px] items-center justify-center rounded-[3px] border border-[#ededed]">
                <p className="font-body text-[13px] text-[#8a8a8a]">Select a template to fill in the order details</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 rounded-lg bg-white p-3">
              <SelectField
                label="Specialty"
                value={specialty}
                placeholder="Select specialty"
                options={["Orthopedics", "Physical Therapy", "Sports Medicine"]}
                onChange={setSpecialty}
              />

              <div>
                <h4 className={`${blockTitleClass} mb-1.5`}>To Provider</h4>
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <SelectField
                      label="Referring Provider"
                      value={referringProvider}
                      placeholder="Select a referring provider"
                      options={[PROVIDER.display, ASSOCIATE_PROVIDER]}
                      onChange={setReferringProvider}
                    />
                  </div>
                  <button type="button" aria-label="Provider details" className="shrink-0 text-[#303030]">
                    <Icon name="contact_page" size={20} />
                  </button>
                </div>
              </div>

              <div>
                <h4 className={`${blockTitleClass} mb-1.5`}>Diagnosis Codes</h4>
                <SelectField
                  label="Diagnosis codes"
                  value={diagnosis}
                  placeholder=""
                  options={["M23.51 — Chronic instability of right knee", "S83.511A — Sprain of ACL, right knee"]}
                  onChange={setDiagnosis}
                />
              </div>

              <div>
                <h4 className={`${blockTitleClass} mb-1.5`}>Procedure Codes</h4>
                <SelectField
                  label="Procedure codes"
                  value={procedure}
                  placeholder="Search for procedure codes..."
                  options={["29888 — ACL reconstruction", "97110 — Therapeutic exercises"]}
                  onChange={setProcedure}
                />
              </div>

              <div>
                <h4 className={`${blockTitleClass} mb-1.5`}>Reason For Referral</h4>
                <textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Write reason for referral..."
                  className={`${textareaClass} min-h-[80px]`}
                />
              </div>

              <div>
                <h4 className={`${blockTitleClass} mb-1.5`}>Requested Visits</h4>
                <div className="grid grid-cols-2 gap-3">
                  <TextField
                    label="Visits"
                    value={visits}
                    placeholder="Enter number of visits"
                    onChange={setVisits}
                  />
                  <SelectField
                    label="Priority"
                    value={priority}
                    placeholder="Select priority"
                    options={["Routine", "Urgent", "STAT"]}
                    onChange={setPriority}
                  />
                </div>
              </div>

              <div>
                <h4 className={`${blockTitleClass} mb-1.5`}>Notes</h4>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Write note."
                  className={`${textareaClass} min-h-[96px]`}
                />
              </div>
            </div>
          )}

          <h3 className={`${sectionTitleClass} mt-6`}>Send To</h3>
          <h4 className={`${blockTitleClass} mt-3`}>Add Recipients</h4>
          <div className="mt-3 flex items-center gap-4">
            <span className="font-body text-[13px] text-[#404040]">Include contacts from:</span>
            <Radio label="NPI" checked={contactSource === "NPI"} onSelect={() => setContactSource("NPI")} />
            <Radio
              label="Contact List"
              checked={contactSource === "Contact List"}
              onSelect={() => setContactSource("Contact List")}
            />
            <button type="button" aria-label="Open contact book" className="text-[#303030]">
              <Icon name="import_contacts" size={19} filled />
            </button>
          </div>
          <div className="mt-2.5">
            <SelectField
              label="Contacts"
              value={contacts}
              placeholder="Search Contacts"
              options={["Northside PT", "Riverside Imaging"]}
              onChange={setContacts}
            />
          </div>

          <h3 className={`${blockTitleClass} mt-6`}>Attachments</h3>
          <div className="mt-1.5">
            <SelectField
              label="Patient Attachments"
              value={attachments}
              placeholder="Search for attachments..."
              options={["Post-op knee series.pdf", "ACL operative report.pdf"]}
              onChange={setAttachments}
            />
          </div>

          <div className="mt-4 flex items-center gap-8">
            <Toggle label="Include chart note PDF" on={includePdf} onToggle={() => setIncludePdf((value) => !value)} />
            <Toggle label="Include site logo" on={includeLogo} onToggle={() => setIncludeLogo((value) => !value)} />
          </div>

          <div className="mt-4 flex flex-col items-center justify-center rounded-[3px] border border-dashed border-[#d9d9d9] bg-white px-4 py-7">
            <div className="flex items-center gap-2">
              <Icon name="cloud_upload" size={20} className="text-[#1132ee]" />
              <span className="font-body text-[14px] font-medium text-[#1a1a1a]">Drop Files Here</span>
              <span className="font-body text-[14px] text-[#404040]">Or</span>
              <button
                type="button"
                className="rounded-full border border-[#c4c4c4] bg-white px-3 py-[3px] font-body text-[13px] text-[#303030]"
              >
                Browse Files
              </button>
            </div>
            <p className="mt-2.5 font-body text-[11px] text-[#8a8a8a]">PDF files only (max. 4.2MB each)</p>
          </div>

          <p className="mt-5 text-center font-body text-[14px] text-[#8a8a8a]">No attachments uploaded yet</p>
        </div>

        <footer className="flex shrink-0 items-center gap-3 bg-[#f7f7f7] px-5 pb-5 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="h-8 rounded-full bg-[#1132ee] px-4 font-body text-[13px] font-medium text-white hover:bg-[#0e28be]"
          >
            Complete Order
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-8 rounded-full bg-[#efefef] px-4 font-body text-[13px] font-medium text-[#a5a5a5]"
          >
            Save Draft
          </button>
          <button
            type="button"
            className="h-8 rounded-full bg-[#efefef] px-4 font-body text-[13px] font-medium text-[#a5a5a5]"
          >
            Order Preview
          </button>
        </footer>
      </aside>
    </div>
  );

  return createPortal(drawer, document.body);
}
