import { useEffect, useMemo, useState } from "react";
import Icon from "./Icon";
import { CASE, PATIENT, PROVIDER } from "../data/chart";

const PATIENT_AUTH_NUMBERS_KEY = "prior-auth:patient-auth-numbers";
const PATIENT_AUTH_NUMBERS_EVENT = "prior-auth:patient-auth-numbers";
const ORDER_AUTH_STATE_EVENT = "patient-chart:order-auth-state";
const ORDER_AUTH_STORAGE_KEY = "prior-auth:order-records";
const NOTE_ORDERS_KEY_PREFIX = "patient-chart:note-orders";

function uniqueNumbers(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function samePatient(name: string | undefined, patientName: string) {
  return (name ?? "").trim().toLowerCase() === patientName.trim().toLowerCase();
}

function readJson(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function authNumbersFromSnapshot(snapshot: unknown, patientName: string): string[] {
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) return [];
  const entry = Object.entries(snapshot as Record<string, unknown>).find(([name]) =>
    samePatient(name, patientName),
  );
  const numbers = entry?.[1];
  return Array.isArray(numbers)
    ? uniqueNumbers(numbers.filter((value): value is string => typeof value === "string"))
    : [];
}

// Order-created authorizations live on the order records, and an order that has an
// authorization number typed into it keeps that number in its own note storage.
function authNumbersFromOrderRecords(patientName: string): string[] {
  const records = readJson(ORDER_AUTH_STORAGE_KEY);
  if (!Array.isArray(records)) return [];
  return uniqueNumbers(
    records
      .filter((record: { patient?: { name?: string } }) => samePatient(record.patient?.name, patientName))
      .map((record: { authNumber?: string }) => record.authNumber ?? ""),
  );
}

function authNumbersFromNoteOrders(): string[] {
  const numbers: string[] = [];
  try {
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (!key || !key.startsWith(NOTE_ORDERS_KEY_PREFIX)) continue;
      const orders = readJson(key);
      if (!Array.isArray(orders)) continue;
      for (const order of orders as Array<{ authNumber?: string }>) {
        if (typeof order.authNumber === "string") numbers.push(order.authNumber);
      }
    }
  } catch {
    return uniqueNumbers(numbers);
  }
  return uniqueNumbers(numbers);
}

function loadPatientAuthNumbers(patientName: string): string[] {
  return uniqueNumbers([
    ...authNumbersFromSnapshot(readJson(PATIENT_AUTH_NUMBERS_KEY), patientName),
    ...authNumbersFromOrderRecords(patientName),
    ...authNumbersFromNoteOrders(),
  ]);
}

export type NewAppointmentValues = {
  date: Date;
  time: string;
  provider: string;
  appointmentType: string;
  facility: string;
  caseName: string;
  insurance: string;
  preCertification: string;
};

type NewAppointmentDrawerProps = {
  onClose: () => void;
  onCreate: (values: NewAppointmentValues) => void;
};

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function SelectField({
  label,
  value,
  placeholder,
  options,
  required = false,
  disabled = false,
  className = "",
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: string[];
  required?: boolean;
  disabled?: boolean;
  className?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className={`min-w-0 ${className}`}>
      <span className="mb-1 block font-body text-[9px] leading-3 text-[#656565]">
        {label}{required ? " *" : ""}
      </span>
      <span className="relative block">
        <select
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-full appearance-none rounded-[3px] border border-[#e1e1e1] bg-white px-2.5 pr-7 font-body text-[11px] text-[#303030] outline-none focus:border-[#1132ee] disabled:bg-[#f7f7f7] disabled:text-[#c2c2c2]"
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <Icon
          name="arrow_drop_down"
          size={15}
          className="pointer-events-none absolute right-2 top-2.5 text-[#777]"
        />
      </span>
    </label>
  );
}

function monthDays(month: Date) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const count = new Date(year, monthIndex + 1, 0).getDate();
  return [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: count }, (_, index) => index + 1),
  ];
}

function sameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export default function NewAppointmentDrawer({ onClose, onCreate }: NewAppointmentDrawerProps) {
  const today = useMemo(() => new Date(), []);
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState(today);
  const [provider, setProvider] = useState("");
  const [appointmentType, setAppointmentType] = useState("");
  const [facility, setFacility] = useState("");
  const [caseName, setCaseName] = useState("");
  const [time, setTime] = useState("");
  const [syncToCase, setSyncToCase] = useState(true);
  const [primaryInsurance, setPrimaryInsurance] = useState("");
  const [preCertification, setPreCertification] = useState("");
  const [authNumbers, setAuthNumbers] = useState<string[]>(() => loadPatientAuthNumbers(PATIENT.name));
  const [secondaryInsurance, setSecondaryInsurance] = useState(false);
  const [format, setFormat] = useState("");
  const [placeOfService, setPlaceOfService] = useState("");
  const [referringProvider, setReferringProvider] = useState("");
  const [referral, setReferral] = useState("");
  const [supervisingProvider, setSupervisingProvider] = useState("");
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");
  const [overrideCredentialing, setOverrideCredentialing] = useState(false);
  const days = monthDays(visibleMonth);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    function applyAuthNumbers(event?: Event) {
      const detail = event ? (event as CustomEvent<Record<string, string[]> | undefined>).detail : null;
      const fromEvent = detail ? authNumbersFromSnapshot(detail, PATIENT.name) : [];
      setAuthNumbers(uniqueNumbers([...fromEvent, ...loadPatientAuthNumbers(PATIENT.name)]));
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(PATIENT_AUTH_NUMBERS_EVENT, applyAuthNumbers);
    window.addEventListener(ORDER_AUTH_STATE_EVENT, applyAuthNumbers);
    applyAuthNumbers();
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(PATIENT_AUTH_NUMBERS_EVENT, applyAuthNumbers);
      window.removeEventListener(ORDER_AUTH_STATE_EVENT, applyAuthNumbers);
    };
  }, [onClose]);

  function moveMonth(offset: number) {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  }

  // Create stays inert until every starred field plus a time has a value.
  const canCreate = Boolean(
    provider && appointmentType && facility && caseName && primaryInsurance && time.trim(),
  );

  function createAppointment() {
    if (!canCreate) return;
    onCreate({
      date: selectedDate,
      time: time.trim(),
      provider,
      appointmentType,
      facility,
      caseName,
      insurance: primaryInsurance,
      preCertification,
    });
  }

  return (
    <div className="fixed inset-0 z-90 flex justify-end bg-black/10">
      <button
        type="button"
        aria-label="Close new appointment"
        className="absolute inset-0"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-appointment-title"
        className="relative flex h-full w-[min(450px,100vw)] flex-col bg-[#f8f8f8] shadow-[-8px_0_28px_rgba(0,0,0,0.12)]"
      >
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-[#e3e3e3] bg-white px-3.5">
          <h2 id="new-appointment-title" className="font-body text-[13px] font-medium text-[#171717]">
            New Appointment
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-7 items-center justify-center rounded-full border border-[#dedede] text-[#777] hover:bg-[#f5f5f5]"
          >
            <Icon name="close" size={17} />
          </button>
        </header>

        <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-3.5 py-3">
          <div className="grid grid-cols-2 gap-x-3 gap-y-2">
            <SelectField
              label="Rendering Provider"
              required
              value={provider}
              placeholder="Select a rendering provider"
              options={[PROVIDER.display, "Dana Whitfield PA-C"]}
              onChange={setProvider}
            />
            <div className="flex min-w-0 items-end gap-1.5">
              <SelectField
                className="flex-1"
                label="Patient"
                required
                value={PATIENT.name}
                placeholder="Select a patient"
                options={[PATIENT.name]}
                onChange={() => {}}
              />
              <Icon name="push_pin" size={17} className="mb-2.5 text-[#1132ee]" />
              <span className="mb-5 size-1.5 rounded-full bg-[#e5262e]" />
            </div>
            <SelectField
              label="Appointment Type"
              required
              value={appointmentType}
              placeholder="Select appointment type"
              options={["Injection Visit", "New Patient", "Follow Up"]}
              onChange={setAppointmentType}
            />
            <SelectField
              label="Facility"
              required
              value={facility}
              placeholder="Select a facility"
              options={["MAIN OFFICE", "Riverside Surgical Center"]}
              onChange={setFacility}
            />
            <SelectField
              className="col-span-2"
              label="Case"
              required
              value={caseName}
              placeholder="Select a case"
              options={[CASE.name]}
              onChange={setCaseName}
            />
          </div>

          <section className="mt-3 rounded-md border border-[#dedede] bg-white p-3.5">
            <div className="grid grid-cols-[210px_1fr] gap-5">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <button
                    type="button"
                    className="flex items-center gap-1 font-body text-[11px] font-medium text-[#303030]"
                  >
                    {MONTHS[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
                    <Icon name="arrow_drop_down" size={14} />
                  </button>
                  <div className="flex items-center gap-2">
                    <button type="button" aria-label="Previous month" onClick={() => moveMonth(-1)}>
                      <Icon name="chevron_left" size={17} />
                    </button>
                    <button type="button" aria-label="Next month" onClick={() => moveMonth(1)}>
                      <Icon name="chevron_right" size={17} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-y-2 text-center">
                  {WEEKDAYS.map((day, index) => (
                    <span key={`${day}-${index}`} className="font-body text-[8px] text-[#777]">{day}</span>
                  ))}
                  {days.map((day, index) =>
                    day == null ? (
                      <span key={`empty-${index}`} />
                    ) : (
                      <button
                        key={day}
                        type="button"
                        onClick={() =>
                          setSelectedDate(
                            new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day),
                          )
                        }
                        className={`mx-auto flex size-6 items-center justify-center rounded-full font-body text-[9px] ${
                          sameDay(
                            selectedDate,
                            new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day),
                          )
                            ? "border border-[#8fa0ff] bg-[#eef0ff] text-[#1132ee]"
                            : "text-[#303030] hover:bg-[#f2f2f2]"
                        }`}
                      >
                        {day}
                      </button>
                    ),
                  )}
                </div>
              </div>
              <p className="pt-2 font-body text-[9px] font-medium leading-4 text-[#202020]">
                Select a provider, facility, appointment type, and date to see available times.
              </p>
            </div>
          </section>

          <label className="mt-1 block">
            <span className="mb-1 block font-body text-[9px] text-[#656565]">Time</span>
            <input
              value={time}
              onChange={(event) => setTime(event.target.value)}
              placeholder="hh:mm aa – hh:mm aa"
              className="h-9 w-full rounded-[3px] border border-[#e1e1e1] bg-white px-2.5 font-body text-[11px] text-[#303030] outline-none placeholder:text-[#bdbdbd] focus:border-[#1132ee]"
            />
          </label>

          <section className="mt-4">
            <div className="mb-2 flex items-center gap-2">
              <h3 className="font-body text-[13px] font-medium text-[#202020]">Insurance</h3>
              <label className="flex items-center gap-1.5 font-body text-[10px] text-[#303030]">
                <input
                  type="checkbox"
                  checked={syncToCase}
                  onChange={(event) => setSyncToCase(event.target.checked)}
                  className="size-3 accent-[#1132ee]"
                />
                Sync to case
              </label>
              <Icon name="info" size={13} className="text-[#555]" />
              <button
                type="button"
                className="ml-1 flex h-6 items-center gap-1 rounded-full border border-[#1132ee] px-2.5 font-body text-[9px] text-[#1132ee]"
              >
                <Icon name="add" size={12} />
                Add Insurance
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SelectField
                label="Primary Insurance"
                required
                value={primaryInsurance}
                placeholder="Select primary insurance"
                options={[PATIENT.insurance, "Aetna", "UnitedHealthcare"]}
                onChange={(value) => {
                  setPrimaryInsurance(value);
                  if (!value) setPreCertification("");
                }}
              />
              <SelectField
                label="Pre-Certification"
                value={preCertification}
                placeholder={
                  !primaryInsurance
                    ? "Select a pre-certification"
                    : authNumbers.length === 0
                      ? "No authorizations for this patient"
                      : "Select a pre-certification"
                }
                options={authNumbers}
                disabled={!primaryInsurance}
                onChange={setPreCertification}
              />
            </div>
            <label className="mt-2 flex items-center gap-1.5 font-body text-[10px] text-[#8a8a8a]">
              <input
                type="checkbox"
                checked={secondaryInsurance}
                onChange={(event) => setSecondaryInsurance(event.target.checked)}
                className="size-3 accent-[#1132ee]"
              />
              Secondary Insurance
            </label>
          </section>

          <section className="mt-5">
            <h3 className="mb-2 font-body text-[13px] font-medium text-[#202020]">Additional Details</h3>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              <SelectField
                label="Format"
                value={format}
                placeholder="Select format"
                options={["In Person", "Telehealth"]}
                onChange={setFormat}
              />
              <SelectField
                label="Place Of Service"
                value={placeOfService}
                placeholder="Select place of service"
                options={["Office", "Outpatient Hospital"]}
                onChange={setPlaceOfService}
              />
              <SelectField
                className="col-span-2"
                label="Referring Provider"
                value={referringProvider}
                placeholder="Select a referring provider"
                options={[PROVIDER.display, "Dana Whitfield PA-C"]}
                onChange={setReferringProvider}
              />
              <SelectField
                className="col-span-2"
                label="Referral"
                value={referral}
                placeholder="Select a referral"
                options={["Orthopedic Referral"]}
                disabled
                onChange={setReferral}
              />
              <SelectField
                className="col-span-2"
                label="Supervising Provider"
                value={supervisingProvider}
                placeholder="Select a supervising provider"
                options={[PROVIDER.display]}
                onChange={setSupervisingProvider}
              />
              <SelectField
                className="col-span-2"
                label="Tags"
                value={tags}
                placeholder=""
                options={["Injection", "Follow Up"]}
                onChange={setTags}
              />
              <label className="col-span-2">
                <span className="mb-1 block font-body text-[9px] text-[#656565]">Notes</span>
                <span className="relative block">
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-[3px] border border-[#e1e1e1] bg-white px-2.5 py-2 font-body text-[11px] outline-none focus:border-[#1132ee]"
                  />
                  <Icon name="content_copy" size={14} className="absolute bottom-2 right-2 text-[#303030]" />
                </span>
              </label>
            </div>
          </section>
        </div>

        <footer className="flex h-16 shrink-0 items-center justify-between border-t border-[#e1e1e1] bg-white px-3.5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={createAppointment}
              disabled={!canCreate}
              title={canCreate ? undefined : "Fill in the required fields and a time to create this appointment."}
              className="h-7 rounded-full bg-[#1132ee] px-4 font-body text-[10px] font-medium text-white disabled:bg-[#c3c9e8]"
            >
              Create
            </button>
            <button type="button" onClick={onClose} className="font-body text-[10px] text-[#1132ee]">
              Cancel
            </button>
          </div>
          <label className="flex items-center gap-1.5 font-body text-[9px] text-[#303030]">
            <input
              type="checkbox"
              checked={overrideCredentialing}
              onChange={(event) => setOverrideCredentialing(event.target.checked)}
              className="size-3 accent-[#1132ee]"
            />
            Override Provider Credentialing Validation
            <Icon name="info" size={13} />
          </label>
        </footer>
      </aside>
    </div>
  );
}
