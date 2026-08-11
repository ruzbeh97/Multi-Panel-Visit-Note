import { CASE, PATIENT, PROVIDER, REFERRING_PROVIDER } from "../../data/chart";

// Rendered at 2x the on-screen page size and scaled down by the viewer, so a
// PDF page preview stays crisp at any zoom level.
export const DOC_WIDTH = 744;
export const DOC_HEIGHT = 970;

const INFO_LEFT = [
  ["Patient Name", PATIENT.name],
  ["Date of Birth", PATIENT.dob],
  ["Rendering Provider", PROVIDER.display],
  ["Referring Provider", REFERRING_PROVIDER],
];

const INFO_RIGHT = [
  ["Plan of Care Begins", CASE.visitDateLong],
  ["Visit #", CASE.visitNumber],
  ["Date of Original Visit", CASE.initialEval],
  ["Diagnosis Code", CASE.diagnosisShort],
];

const SIGNATURE_ROWS = [
  ["Provider Name (Printed)", "Credentials"],
  ["Provider's Signature", "Date"],
];

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-1.5">
      <span className="font-bold">{label}</span>
      <span>{value}</span>
    </div>
  );
}

export default function PlanOfCareDocument() {
  return (
    <div
      className="flex flex-col gap-5 bg-white px-6 py-5 font-ui text-[11px] leading-[1.5] text-[#1a1a1a]"
      style={{ width: DOC_WIDTH, height: DOC_HEIGHT }}
    >
      <div className="flex items-start justify-between text-[10px] text-[#555555]">
        <span>Athelas Document ID: 00000000-0000-4000-8000-000000000000</span>
        <span>
          {PATIENT.name} {CASE.visitDateLong} 1 of 1
        </span>
      </div>

      <div className="flex items-start justify-between">
        <h1 className="w-[200px] text-[30px] font-bold leading-[1.15] text-[#1b83e4]">Plan of Care - Addended</h1>
        <div className="flex items-center gap-3">
          <span className="block size-[44px] shrink-0 rounded-full border-[7px] border-[#e8165c]" />
          <span className="flex flex-col">
            <span className="text-[30px] font-medium leading-none tracking-tight">Athelas</span>
            <span className="pt-1 text-[12px] text-[#666666]">Powered by Commure</span>
          </span>
        </div>
      </div>

      <div className="grid w-full grid-cols-2 gap-x-8 gap-y-1 bg-[#eef1f7] px-4 py-3">
        <div className="flex flex-col gap-1">
          {INFO_LEFT.map(([label, value]) => (
            <InfoRow key={label} label={label} value={value} />
          ))}
        </div>
        <div className="flex flex-col gap-1">
          {INFO_RIGHT.map(([label, value]) => (
            <InfoRow key={label} label={label} value={value} />
          ))}
        </div>
      </div>

      <div className="flex w-full flex-col">
        <span className="text-[16px] font-bold text-[#1b83e4]">PLAN</span>
        <div className="mt-1 border-t border-[#c9c9c9]" />
        <p className="mt-3 font-bold">I have recommended the following therapy plan:</p>
        <p className="mt-2 font-bold italic">
          {PATIENT.name} will be seen 2 times per week for 6 weeks starting 08/12/2026 and ending 09/23/2026 for
          post-operative ACL rehabilitation, progressing to plyometrics and return-to-sport testing.
        </p>
        <p className="mt-4 font-bold">Signature</p>
        <p className="font-serif text-[22px] italic leading-snug">{PROVIDER.name}</p>
        <p className="mt-1">
          {PROVIDER.name}, {PROVIDER.license}
        </p>
        <p>Signed: 2026-08-10 12:57 PM PDT</p>
      </div>

      <div className="w-full border border-[#e8c26a] bg-[#fdf6e3] px-4 py-3">
        <p className="text-[14px] font-bold text-[#c98a1b]">Addendum Information</p>
        <div className="mt-2 flex flex-col gap-1">
          <InfoRow label="Reason For Addendum:" value="Visit frequency updated after week 12 progression" />
          <InfoRow label="Created By:" value={`${PROVIDER.short} (08/03/2026 07:18AM)`} />
          <InfoRow label="Finalized By:" value={`${PROVIDER.short} (08/03/2026 09:42AM)`} />
        </div>
      </div>

      <div className="flex w-full flex-col gap-2">
        <p className="font-bold">Plan of Care Approval for {PATIENT.name}</p>
        <p className="font-bold">Electronically signed by: {PROVIDER.display}</p>
        <p className="text-[#1b83e4]">Thank you for this referral.</p>
        <p className="text-[#1b83e4]">
          We are required to obtain an approval for this plan of care. You may approve the plan of care and make any
          changes to the plan of care by commenting below.
        </p>
      </div>

      <div className="w-full border-2 border-[#1a2b5e] px-4 py-3">
        <p className="text-[#1b83e4]">
          Please sign below stating you have reviewed this Plan of Care and agree with our assessment. Please do not
          hesitate to contact the treating therapist if you have any questions, concerns, or would like to make any
          changes to this Plan of Care. Thank you for this referral and trusting us with your patient.
        </p>
        <div className="mt-6 flex flex-col gap-5">
          {SIGNATURE_ROWS.map(([left, right]) => (
            <div key={left} className="flex flex-col gap-1">
              <div className="border-t border-[#1a2b5e]" />
              <div className="grid grid-cols-2">
                <span className="font-bold">{left}</span>
                <span className="font-bold">{right}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex w-full items-center justify-end gap-1.5">
        <span className="block size-[14px] rounded-full border-2 border-[#1a1a1a]" />
        <span>Athelas</span>
      </div>
    </div>
  );
}
