import Icon from "./Icon";
import { CASE, PATIENT, PHARMACY, PROVIDER } from "../data/chart";

type Column = { key: string; label: string; className?: string };
type Row = Record<string, string>;

const sectionIconClass =
  "flex size-6 shrink-0 items-center justify-center rounded bg-[#edf8ef] text-[#45a958]";

function SectionHeader({
  icon,
  title,
  action,
}: {
  icon: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex h-10 w-full items-center border-b border-[#ededed]">
      <div className="flex items-center gap-2">
        <span className={sectionIconClass}>
          <Icon name={icon} size={15} />
        </span>
        <h2 className="font-body text-[14px] font-medium leading-[22px] text-[#202020]">{title}</h2>
        <button type="button" aria-label={`Edit ${title}`} className="flex size-6 items-center justify-center rounded hover:bg-black/5">
          <Icon name="edit" size={16} className="text-[#1f1f1f]" />
        </button>
      </div>
      {action && <div className="ml-auto">{action}</div>}
    </div>
  );
}

function BlueAction({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="flex h-7 items-center gap-1 rounded-full bg-[#1132ee] px-3 font-body text-[12px] font-medium text-white hover:bg-[#0e28be]"
    >
      <Icon name="add" size={14} />
      {children}
    </button>
  );
}

function Field({ label, value, chip = false }: { label: string; value: string; chip?: boolean }) {
  return (
    <div className="min-h-[46px]">
      <p className="font-body text-[11px] leading-[16px] text-[#8a8a8a]">{label}</p>
      {chip ? (
        <span className="mt-0.5 inline-flex rounded-md bg-[#f1f1f1] px-1.5 py-0.5 font-body text-[12px] text-[#303030]">
          {value}
        </span>
      ) : (
        <p className="font-body text-[13px] leading-[20px] text-[#303030]">{value}</p>
      )}
    </div>
  );
}

function EmptyTable({
  columns,
  message,
  rowsPerPage = "5",
}: {
  columns: Column[];
  message: string;
  rowsPerPage?: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#dedede]">
      <div className="grid h-8 items-center bg-[#f1f2f2] px-4" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
        {columns.map((column) => (
          <span key={column.key} className="font-body text-[12px] font-medium text-[#303030]">
            {column.label}
          </span>
        ))}
      </div>
      <div className="flex h-20 items-center justify-center font-body text-[13px] text-[#404040]">{message}</div>
      <Pagination rowsPerPage={rowsPerPage} range="0–0 of 0" />
    </div>
  );
}

function DataTable({
  columns,
  rows,
  actions = false,
  rowsPerPage = "5",
}: {
  columns: Column[];
  rows: Row[];
  actions?: boolean;
  rowsPerPage?: string;
}) {
  const template = `${actions ? "92px " : ""}${columns
    .map((column) => column.className ?? "minmax(120px, 1fr)")
    .join(" ")}`;

  return (
    <div className="overflow-hidden rounded-lg border border-[#dedede]">
      <div className="min-w-[980px]">
        <div className="grid h-8 items-center bg-[#f1f2f2] px-3" style={{ gridTemplateColumns: template }}>
          {actions && <span />}
          {columns.map((column) => (
            <span key={column.key} className="truncate px-2 font-body text-[12px] font-medium text-[#303030]">
              {column.label}
            </span>
          ))}
        </div>
        {rows.map((row, rowIndex) => (
          <div
            key={`${rowIndex}-${columns[0]?.key}`}
            className="grid min-h-10 items-center border-t border-[#ededed] px-3 hover:bg-[#fafafa]"
            style={{ gridTemplateColumns: template }}
          >
            {actions && (
              <div className="flex items-center gap-2 px-1 text-[#202020]">
                <Icon name="edit" size={16} />
                <Icon name="delete" size={16} />
                <Icon name="history" size={16} />
              </div>
            )}
            {columns.map((column) => (
              <span key={column.key} className="truncate px-2 font-body text-[12px] leading-[18px] text-[#303030]">
                {row[column.key] || "–"}
              </span>
            ))}
          </div>
        ))}
      </div>
      <Pagination rowsPerPage={rowsPerPage} range={`1–${Math.min(rows.length, Number(rowsPerPage))} of ${rows.length}`} />
    </div>
  );
}

function Pagination({ rowsPerPage, range }: { rowsPerPage: string; range: string }) {
  return (
    <div className="flex h-10 items-center justify-end gap-5 border-t border-[#ededed] px-4">
      <div className="flex items-center gap-2 font-body text-[11px] text-[#555]">
        <span>Rows per page:</span>
        <button type="button" className="flex h-7 items-center gap-2 rounded border border-[#dedede] px-2">
          {rowsPerPage}
          <Icon name="arrow_drop_down" size={15} />
        </button>
      </div>
      <span className="font-body text-[11px] text-[#555]">{range}</span>
      <div className="flex gap-3 text-[#c4c4c4]">
        <Icon name="chevron_left" size={17} />
        <Icon name="chevron_right" size={17} />
      </div>
    </div>
  );
}

function Tabs({ labels, active }: { labels: string[]; active: string }) {
  return (
    <div className="flex h-9 items-end gap-6">
      {labels.map((label) => (
        <button
          key={label}
          type="button"
          className={`h-9 border-b-2 px-1 font-body text-[12px] font-medium ${
            label === active ? "border-[#1132ee] text-[#1132ee]" : "border-transparent text-[#555]"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

const EPISODE_COLUMNS: Column[] = [
  { key: "id", label: "Case ID", className: "90px" },
  { key: "name", label: "Case Name", className: "120px" },
  { key: "tags", label: "Tags", className: "90px" },
  { key: "notes", label: "Case Notes", className: "minmax(180px, 1.4fr)" },
  { key: "endDate", label: "Plan of Care End Date", className: "140px" },
  { key: "visits", label: "Pending Plan of Care Visits", className: "170px" },
  { key: "accident", label: "Accident Date", className: "100px" },
  { key: "provider", label: "Case Rendering Provider", className: "160px" },
];

const EPISODES: Row[] = [
  { id: "1004821", name: CASE.name, tags: "No tags", notes: "Active post-operative rehabilitation", endDate: "11/21/2026", visits: "22", accident: CASE.dateOfInjury, provider: PROVIDER.name },
  { id: "1003754", name: "Right elbow care", tags: "No tags", notes: "Discharged to home program", endDate: "12/15/2025", visits: "–", accident: "–", provider: PROVIDER.name },
  { id: "1002918", name: "Sports physical", tags: "No tags", notes: "Completed", endDate: "08/16/2025", visits: "–", accident: "–", provider: "Dana Whitfield" },
];

const INSURANCE_COLUMNS: Column[] = [
  { key: "uid", label: "UID", className: "95px" },
  { key: "provider", label: "Insurance Provider", className: "minmax(210px, 1.4fr)" },
  { key: "status", label: "Status", className: "105px" },
  { key: "effective", label: "Effective Date", className: "105px" },
  { key: "expiry", label: "Expiry Date", className: "105px" },
  { key: "policy", label: "Policy Number", className: "125px" },
  { key: "group", label: "Group Number", className: "110px" },
  { key: "type", label: "Plan Type", className: "150px" },
];

const INSURANCES: Row[] = [
  { uid: "24002620", provider: "Priority Health", status: "Active", effective: "01/01/2026", expiry: "12/31/2026", policy: "PR-104820", group: "GR-2201", type: "PPO" },
  { uid: "9085629", provider: "California Blue Shield", status: "Active", effective: "10/30/2025", expiry: "10/30/2026", policy: "BS-21839", group: "CA-3411", type: "Blue Cross Blue Shield" },
  { uid: "11930318", provider: "Self-pay", status: "No Expiry Date", effective: "–", expiry: "–", policy: "SELF-PAY", group: "–", type: "Self Pay" },
];

const AUTH_COLUMNS: Column[] = [
  { key: "number", label: "Auth Number", className: "140px" },
  { key: "status", label: "Status", className: "100px" },
  { key: "tracking", label: "Tracking Type", className: "110px" },
  { key: "insurance", label: "Patient Insurance Information", className: "minmax(230px, 1.5fr)" },
  { key: "total", label: "Total Visits/Units", className: "120px" },
  { key: "effective", label: "Effective Date", className: "110px" },
  { key: "expiration", label: "Expiration Date", className: "115px" },
  { key: "tags", label: "Tags", className: "100px" },
];

const AUTHORIZATIONS: Row[] = [
  { number: "AUTH-10482", status: "Active", tracking: "Visits", insurance: "Priority Health (PR-104820)", total: "20", effective: "08/01/2026", expiration: "12/31/2026", tags: "No tags" },
  { number: "AUTH-09371", status: "Active", tracking: "Visits", insurance: "California Blue Shield (BS-21839)", total: "10", effective: "05/01/2026", expiration: "08/24/2026", tags: "Post-op" },
];

export default function DemographicsPage() {
  return (
    // The chart body row aligns items to the start, so without self-stretch this
    // column sizes to its content and never becomes a scroll container.
    <div className="scrollbar-thin min-h-0 min-w-0 flex-1 self-stretch overflow-y-auto bg-white">
      <main className="mx-auto flex w-full max-w-[1480px] flex-col gap-5 px-6 py-6">
        <section>
          <SectionHeader icon="badge" title="General Information" />
          <div className="grid grid-cols-2 gap-x-20 px-2 py-4">
            <div>
              <Field label="Patient Name" value={PATIENT.name} />
              <Field label="Date of Death" value="N/A" />
              <Field label="Preferred Last Name" value="N/A" />
              <Field label="Age" value={PATIENT.age} />
              <Field label="Height" value="Unknown" />
              <Field label="Primary Care Provider" value={PROVIDER.name} />
              <Field label="Social Security Number" value="N/A" />
              <Field label="Ethnicity" value="N/A" chip />
              <Field label="Tribal Affiliations" value="N/A" chip />
              <Field label="Race" value="N/A" chip />
            </div>
            <div>
              <Field label="Date of Birth" value={PATIENT.dob} />
              <Field label="Preferred First Name" value="N/A" />
              <Field label="Previous Name" value="N/A" />
              <Field label="Gender" value={PATIENT.gender} />
              <Field label="Weight" value="184 lbs" />
              <Field label="Referral Source" value="Sports medicine clinic" />
              <Field label="Preferred Language" value="English" chip />
              <Field label="Sexual Orientation" value="N/A" chip />
              <Field label="Gender Identity" value="N/A" chip />
            </div>
          </div>
        </section>

        <section>
          <SectionHeader icon="call" title="Contact Information" />
          <div className="grid grid-cols-2 gap-x-20 px-2 py-4">
            <div>
              <Field label="Phone number" value="(415) 555-0142" />
              <Field label="Home Address" value="100 Example Avenue, Oakland, CA 94612" />
            </div>
            <div>
              <Field label="Email Address" value="jordan.reyes@example.test" />
              <Field label="Previous Address" value="N/A" />
            </div>
          </div>
        </section>

        <section>
          <SectionHeader icon="local_pharmacy" title="Preferred Pharmacy" />
          <div className="grid grid-cols-2 gap-x-20 px-2 py-4">
            <div>
              <Field label="Preferred Pharmacy" value={PHARMACY.name} />
              <Field label="Preferred Pharmacy Phone" value="(312) 555-0190" />
            </div>
            <Field label="Preferred Pharmacy Address" value={PHARMACY.address} />
          </div>
        </section>

        <section>
          <SectionHeader icon="note_alt" title="Patient Notes" />
          <p className="px-2 py-4 font-body text-[13px] text-[#404040]">No patient notes.</p>
        </section>

        <section>
          <SectionHeader icon="emergency" title="Emergency Contact" />
          <div className="grid grid-cols-2 gap-x-20 px-2 py-4">
            <div>
              <Field label="First Name" value="Maya" />
              <Field label="Phone number" value="(503) 555-0121" />
              <Field label="Relationship" value="Spouse" />
            </div>
            <div>
              <Field label="Last Name" value="Reyes" />
              <Field label="Email Address" value="maya.reyes@example.test" />
            </div>
          </div>
        </section>

        <section>
          <SectionHeader icon="business_center" title="Patient Occupations" action={<BlueAction>Add Occupation</BlueAction>} />
          <EmptyTable
            columns={[
              { key: "job", label: "Job Title" },
              { key: "industry", label: "Industry" },
              { key: "dates", label: "Dates" },
            ]}
            message="No occupation history present for this patient"
          />
        </section>

        <section>
          <SectionHeader icon="person" title="Responsible Parties" action={<BlueAction>Add FRP</BlueAction>} />
          <Tabs labels={["0 Financially Responsible Parties", "Related Persons"]} active="0 Financially Responsible Parties" />
          <EmptyTable
            columns={[
              { key: "name", label: "Name" },
              { key: "gender", label: "Gender" },
              { key: "dob", label: "Date of Birth" },
              { key: "phone", label: "Phone Number" },
              { key: "email", label: "Email" },
              { key: "address", label: "Address" },
            ]}
            message="No financially responsible parties present for this patient"
          />
        </section>

        <section>
          <SectionHeader icon="folder" title="Episodes of Care" action={<BlueAction>New Case</BlueAction>} />
          <Tabs labels={["3 Active Cases", "1 Discharged Case", "0 Hospice Cases"]} active="3 Active Cases" />
          <div className="overflow-x-auto">
            <DataTable columns={EPISODE_COLUMNS} rows={EPISODES} actions />
          </div>
        </section>

        <section>
          <SectionHeader icon="shield" title="Insurance Providers" action={<BlueAction>New Insurance</BlueAction>} />
          <Tabs labels={["3 Active Insurances", "0 Archived Insurances"]} active="3 Active Insurances" />
          <div className="overflow-x-auto">
            <DataTable columns={INSURANCE_COLUMNS} rows={INSURANCES} actions />
          </div>
        </section>

        <section className="pb-8">
          <SectionHeader icon="tag" title="Prior Authorization" action={<BlueAction>New Prior Auth</BlueAction>} />
          <Tabs labels={["Pre-Certified", "Referral"]} active="Pre-Certified" />
          <div className="overflow-x-auto">
            <DataTable columns={AUTH_COLUMNS} rows={AUTHORIZATIONS} actions />
          </div>
        </section>
      </main>
    </div>
  );
}
