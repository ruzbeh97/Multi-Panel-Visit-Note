// Synthetic demo chart: a 28-year-old recreational soccer player followed at
// Hale Orthopedics 14 weeks after a right ACL reconstruction. No real patient
// data appears anywhere in this file.

export const PATIENT = {
  name: "Jordan Reyes",
  initial: "J",
  mrn: "004821735",
  dob: "03/14/1998",
  age: "28",
  gender: "M",
  insurance: "Priority Health",
};

export const PROVIDER = {
  name: "Marcus Hale",
  credentials: "MD",
  display: "Marcus Hale MD",
  short: "Marcus Hale MD",
  license: "CA Medical License A-1284739",
};

export const REFERRING_PROVIDER = PROVIDER.short;

export const CLINIC_ASSISTANT = "Alicia Nunez";
export const ASSOCIATE_PROVIDER = "Dana Whitfield PA-C";

export const CASE = {
  name: "ACL Tear",
  dateOfInjury: "04/18/2026",
  surgeryDate: "05/06/2026",
  surgery: "Right ACL reconstruction with semitendinosus autograft and partial medial meniscectomy",
  initialEval: "04/18/2026",
  visitDate: "08/10/26 - 11:50am",
  visitDateLong: "08/10/2026",
  previousVisitDate: "07/27/2026",
  nextFollowUp: "09/21/2026",
  pendingVisits: "2",
  visitNumber: "8",
  diagnosisCode: "S83.511D",
  diagnosisShort: "S83.511D - Sprain of ACL, right knee",
  diagnosisCodes: ["S83.511D", "M25.661", "M62.561"],
};

// The patient's earlier episode of care, closed out before the knee injury.
export const PRIOR_CASE = {
  name: "Right Elbow Pain",
  onset: "07/14/2025",
  firstVisit: "08/25/2025",
  dischargeDate: "12/15/2025",
  diagnosisShort: "M77.11 - Lateral epicondylitis, right elbow",
};

const HIP_MOVEMENTS = ["Hip Flexion", "Hip Extension", "Hip Abduction", "Hip Adduction", "Hip IR", "Hip ER"];
const KNEE_MOVEMENTS = ["Knee Flexion", "Knee Extension"];

export const EDUCATION_OPTIONS = [
  "Graft Healing Timeline",
  "Return-to-Sport Criteria",
  "Activity Modifications",
  "When to Call the Clinic",
];

export const GOAL_OPTIONS = [
  "Full Knee Extension",
  "Restore Quad Strength >90%",
  "Return to Running",
  "Return to Cutting Sports",
];

export const TREATMENT_OPTIONS = [
  "Clinical Examination",
  "Imaging Review",
  "Medication Management",
  "Brace Fitting / Adjustment",
  "Activity Progression Counseling",
  "Injection Therapy",
  "Patient Education",
];

export const PLAN_FORWARD_OPTIONS = [
  "Follow Up in 2 Weeks",
  "Follow Up in 6 Weeks",
  "Clear for Jogging Progression",
  "Return-to-Sport Testing at Week 20",
  "Repeat MRI if Symptoms Persist",
];

const SURGICAL_HISTORY = {
  previousSurgery: "Yes",
  surgeryName: CASE.surgery,
  surgeryDate: CASE.surgeryDate,
  dateOfOnset: CASE.dateOfInjury,
  stateOfCondition: "New",
  sideOfIssue: "Right",
};

const blank = (rows: string[]) => rows.map(() => "");

// Today's note opens blank and is documented during the visit. The only values
// present are chart context the clinician cannot type: the onset date, which the
// form renders disabled, and the plan-of-care goals carried forward from the
// last visit awaiting today's progress score.
export const CURRENT_VISIT = {
  subjective: {
    previousSurgery: "",
    surgeryName: "",
    surgeryDate: "",
    dateOfOnset: "",
    stateOfCondition: "",
    sideOfIssue: "",
    chiefComplaint: "",
    historyOfCondition: "",
  },
  objective: {
    currentPain: "",
    worstPain: "",
    bestPain: "",
    painDescription: "",
    hip: { rows: HIP_MOVEMENTS, left: blank(HIP_MOVEMENTS), right: blank(HIP_MOVEMENTS) },
    knee: { rows: KNEE_MOVEMENTS, left: blank(KNEE_MOVEMENTS), right: blank(KNEE_MOVEMENTS) },
  },
  assessment: {
    primaryDiagnosis: "",
    dateOfOnset: CASE.dateOfInjury,
    rehabPotential: "",
    keyFindings: "",
    goals: [
      {
        title: "Restore right knee active extension to 0 degrees to normalize gait",
        description: "0 degrees extension",
        initialValue: "12 degree extension lag",
        previousVisit: "75%",
        initialProgress: "",
        goalTarget: "09/07/2026",
      },
      {
        title: "Quadriceps strength within 90% of the uninvolved limb",
        description: "Quad index >90%",
        initialValue: "42% quad index",
        previousVisit: "50%",
        initialProgress: "",
        goalTarget: "10/05/2026",
      },
      {
        title: "Independent with a progressive return-to-run program, 2 miles pain free",
        description: "2 miles pain free",
        initialValue: "Unable to jog",
        previousVisit: "25%",
        initialProgress: "",
        goalTarget: "10/19/2026",
      },
    ],
  },
  plan: {
    patientGoal: "",
    educationTopics: [] as string[],
    goals: [] as string[],
    treatments: [] as string[],
    planForward: [] as string[],
    careAgreement: "",
  },
};

export const PREVIOUS_VISIT = {
  subjective: {
    ...SURGICAL_HISTORY,
    chiefComplaint:
      "Right knee soreness and stiffness 12 weeks after ACL reconstruction. Reports 4/10 pain with stairs and after 15 minutes of walking, along with tightness behind the knee each morning. Asking when he can begin jogging.",
    historyOfCondition:
      "Non-contact pivoting injury during a recreational soccer match on 04/18/2026 with immediate swelling and inability to bear weight. MRI on 04/22/2026 showed a complete ACL tear with a posterior horn medial meniscus tear. Reconstruction was performed 05/06/2026 at Hale Orthopedics. The brace was unlocked to 0-90 degrees at two weeks, he weaned off crutches at week 4, and he tolerated bilateral leg press and stationary cycling by week 8.",
  },
  objective: {
    currentPain: "4",
    worstPain: "7",
    bestPain: "2",
    painDescription:
      "Aching along the medial joint line and hamstring graft site, 4/10 with stairs and after 15 minutes of walking, reaching 7/10 at the end of a long day. Mild swelling after exercise that resolves overnight.",
    hip: { rows: HIP_MOVEMENTS, left: ["5/5", "5/5", "5/5", "5/5", "5/5", "5/5"], right: ["4/5", "4-/5", "4-/5", "4/5", "4/5", "4-/5"] },
    knee: { rows: KNEE_MOVEMENTS, left: ["5/5", "5/5"], right: ["4/5", "3+/5"] },
  },
  assessment: {
    primaryDiagnosis:
      "S83.511D - Sprain of anterior cruciate ligament of right knee, subsequent encounter. Status post ACL reconstruction 05/06/2026 with quadriceps weakness (M62.561) and an extension lag limiting gait symmetry.",
    dateOfOnset: CASE.dateOfInjury,
    rehabPotential:
      "Good. He is compliant with his home strengthening program and progressing as expected at 12 weeks, though a 29% quadriceps deficit and a 6 degree extension lag continue to limit gait symmetry and readiness for impact.",
    keyFindings:
      "Right knee AROM 6-126 degrees versus 0-140 degrees on the left. Quadriceps index 71% by handheld dynamometry, single-leg hop not yet tested. 1+ effusion after activity, negative Lachman.",
    goals: [
      {
        title: "Restore right knee active extension to 0 degrees to normalize gait",
        description: "0 degrees extension",
        initialValue: "12 degree extension lag",
        previousVisit: "50%",
        initialProgress: "75%",
        goalTarget: "09/07/2026",
      },
      {
        title: "Quadriceps strength within 90% of the uninvolved limb",
        description: "Quad index >90%",
        initialValue: "42% quad index",
        previousVisit: "25%",
        initialProgress: "50%",
        goalTarget: "10/05/2026",
      },
      {
        title: "Independent with a progressive return-to-run program, 2 miles pain free",
        description: "2 miles pain free",
        initialValue: "Unable to jog",
        previousVisit: "0%",
        initialProgress: "25%",
        goalTarget: "10/19/2026",
      },
    ],
  },
  plan: {
    patientGoal: "Get back to jogging and be ready for fall soccer with his club team.",
    educationTopics: ["Graft Healing Timeline"],
    goals: ["Full Knee Extension", "Restore Quad Strength >90%"],
    treatments: ["Clinical Examination", "Medication Management", "Activity Progression Counseling"],
    planForward: ["Follow Up in 2 Weeks"],
    careAgreement: "Yes",
  },
};

// Generated summary of the last signed note, shown above Subjective so the
// provider can orient without opening the past-note panel.
export const PREVIOUS_VISIT_SUMMARY = {
  heading: "Previous Visit",
  rows: [
    {
      label: "Reason for the visit",
      body: `The patient presented for a 12-week post-operative follow-up after right ACL reconstruction with residual knee stiffness and quadriceps weakness (diagnoses include S83.511D, M25.661, M62.561).`,
    },
    {
      label: "Subjective",
      body: `The patient reported 4/10 right knee pain with stairs and after 15 minutes of walking, with morning tightness behind the knee and no giving way. The goal "Restore right knee active extension to 0 degrees" was in progress at 75% with a target date of 09/07/2026.`,
    },
    {
      label: "Progress",
      body: `Examination showed right knee active motion of 6-126 degrees versus 0-140 degrees on the left, a quadriceps index of 71%, and a 1+ effusion after activity with a negative Lachman. Clinical examination, medication management, and activity progression counseling were performed, and the IKDC score improved from 48.3% at week 6 to 71.3%.`,
    },
    {
      label: "Care plan",
      body: `Continue the daily home strengthening program with meloxicam and acetaminophen as needed for activity-related soreness, hold jogging until quadriceps strength improves, and return in 2 weeks to reassess extension and readiness for a return-to-run progression.`,
    },
  ],
};

// Diagnoses are stored once per ICD-10 code and referenced by each encounter
// that addressed them, so the same code is never described twice. There is no
// clinician-maintained active/resolved flag; relevance is derived below from
// coding history alone.
export const DIAGNOSIS_CODES: Record<string, { description: string; caseName: string }> = {
  "S83.511D": {
    description: "Sprain of anterior cruciate ligament of right knee, subsequent encounter",
    caseName: CASE.name,
  },
  "M25.661": {
    description: "Stiffness of right knee, not elsewhere classified",
    caseName: CASE.name,
  },
  "M62.561": {
    description: "Muscle wasting and atrophy of right lower leg",
    caseName: CASE.name,
  },
  "Z47.89": {
    description: "Encounter for other orthopedic aftercare",
    caseName: CASE.name,
  },
  "G89.18": {
    description: "Other acute postprocedural pain",
    caseName: CASE.name,
  },
  "S83.511A": {
    description: "Sprain of anterior cruciate ligament of right knee, initial encounter",
    caseName: CASE.name,
  },
  "S83.241A": {
    description: "Other tear of medial meniscus, current injury, right knee, initial encounter",
    caseName: CASE.name,
  },
  "Z01.818": {
    description: "Encounter for other preprocedural examination",
    caseName: CASE.name,
  },
  "M25.561": {
    description: "Pain in right knee",
    caseName: CASE.name,
  },
  "M25.461": {
    description: "Effusion, right knee",
    caseName: CASE.name,
  },
  "M77.11": {
    description: "Lateral epicondylitis, right elbow",
    caseName: PRIOR_CASE.name,
  },
  "M25.521": {
    description: "Pain in right elbow",
    caseName: PRIOR_CASE.name,
  },
};

function chartDateValue(date: string) {
  const [month, day, year] = date.split("/").map(Number);
  return new Date(year, month - 1, day).getTime();
}

const ACL_TAG = `${CASE.name} - DOI ${CASE.dateOfInjury}`;
const ELBOW_TAG = `${PRIOR_CASE.name} - Onset ${PRIOR_CASE.onset}`;

type OrderItem = {
  type: "order";
  title: string;
  detail: string;
  date: string;
  time: string;
  icon: string;
  tone: "blue" | "orange";
  orderSet: string;
};

type MedicationItem = {
  type: "medication";
  title: string;
  detail: string;
  date: string;
};

type AttachmentItem = {
  type: "attachment";
  title: string;
  file: string;
  date: string;
  source: "Imaging" | "Fax" | "Patient" | "Other";
  tag: string;
  caseTag: string;
};

export type EncounterItem = OrderItem | MedicationItem | AttachmentItem;

export type Encounter = {
  id: string;
  date: string;
  time: string;
  caseName: string;
  visitType: string;
  title: string;
  provider: string;
  codes: string[];
  items: EncounterItem[];
};

// The single source of truth for this patient's history. Every panel that shows
// past activity — the care timeline, past diagnoses, past orders, attachments,
// and the past-note picker — is derived from this list, so the story cannot
// drift between them. Newest encounter first.
export const ENCOUNTERS: Encounter[] = [
  {
    id: "acl-followup-14wk",
    date: "08/10/2026",
    time: "11:50am",
    caseName: CASE.name,
    visitType: "Established Patient",
    title: "14-Week Post-Op Follow Up",
    provider: PROVIDER.short,
    codes: CASE.diagnosisCodes,
    items: [
      {
        type: "order",
        title: "Functional return-to-sport testing",
        detail: "Hale Orthopedics Sports Medicine",
        date: "08/10/2026",
        time: "11:55 AM",
        icon: "assignment",
        tone: "blue",
        orderSet: "Sports Medicine Follow-Up",
      },
      {
        type: "attachment",
        title: "Office note",
        file: "Ortho_Followup_14wk_08102026.pdf",
        date: "08/10/2026",
        source: "Fax",
        tag: "Office Note",
        caseTag: ACL_TAG,
      },
      {
        type: "attachment",
        title: "Visit plan",
        file: "Plan_of_Care_08102026.pdf",
        date: "08/10/2026",
        source: "Other",
        tag: "Visit Plan",
        caseTag: ACL_TAG,
      },
    ],
  },
  {
    id: "acl-followup-12wk",
    date: "07/27/2026",
    time: "10:15am",
    caseName: CASE.name,
    visitType: "Post Operation",
    title: "12-Week Post-Op Follow Up",
    provider: PROVIDER.short,
    codes: ["S83.511D", "M25.661", "M62.561"],
    items: [
      { type: "medication", title: "Meloxicam 15mg tablet", detail: "30 tablets · 1 refill", date: "07/27/2026" },
      {
        type: "medication",
        title: "Acetaminophen 500mg tablet",
        detail: "60 tablets · No refills",
        date: "07/27/2026",
      },
      {
        type: "order",
        title: "Discontinue hinged knee brace and return DME",
        detail: "Northside DME Supply",
        date: "07/27/2026",
        time: "10:40 AM",
        icon: "personal_injury",
        tone: "orange",
        orderSet: "Post-Op DME",
      },
      {
        type: "attachment",
        title: "IKDC outcome survey",
        file: "IKDC_Outcome_Survey_07272026.pdf",
        date: "07/27/2026",
        source: "Patient",
        tag: "Outcome Measure",
        caseTag: ACL_TAG,
      },
      {
        type: "attachment",
        title: "Activity progression handout",
        file: "Activity_Progression_Handout_07272026.pdf",
        date: "07/27/2026",
        source: "Other",
        tag: "Handout",
        caseTag: ACL_TAG,
      },
    ],
  },
  {
    id: "acl-followup-6wk",
    date: "06/17/2026",
    time: "11:00am",
    caseName: CASE.name,
    visitType: "Post Operation",
    title: "6-Week Post-Op Follow Up",
    provider: PROVIDER.short,
    codes: ["S83.511D", "M25.661", "Z47.89"],
    items: [
      {
        type: "order",
        title: "Radiologic examination, knee; 2 views, post-operative",
        detail: "Riverside Imaging Center",
        date: "06/17/2026",
        time: "11:20 AM",
        icon: "radiology",
        tone: "blue",
        orderSet: "Post-Op Surveillance",
      },
      {
        type: "attachment",
        title: "Post-op knee radiograph report",
        file: "XR_Right_Knee_Post_Op_06172026.pdf",
        date: "06/17/2026",
        source: "Imaging",
        tag: "X-Ray",
        caseTag: ACL_TAG,
      },
      {
        type: "attachment",
        title: "IKDC outcome survey",
        file: "IKDC_Outcome_Survey_06172026.pdf",
        date: "06/17/2026",
        source: "Patient",
        tag: "Outcome Measure",
        caseTag: ACL_TAG,
      },
    ],
  },
  {
    id: "acl-followup-2wk",
    date: "05/20/2026",
    time: "9:30am",
    caseName: CASE.name,
    visitType: "Post Operation",
    title: "2-Week Post-Op Follow Up",
    provider: PROVIDER.short,
    codes: ["Z47.89", "S83.511D"],
    items: [
      {
        type: "order",
        title: "Suture removal",
        detail: "Hale Orthopedics",
        date: "05/20/2026",
        time: "9:45 AM",
        icon: "healing",
        tone: "orange",
        orderSet: "Post-Op Care",
      },
      {
        type: "order",
        title: "Unlock hinged knee brace to 0-90 degrees",
        detail: "Northside DME Supply",
        date: "05/20/2026",
        time: "9:50 AM",
        icon: "personal_injury",
        tone: "orange",
        orderSet: "Post-Op DME",
      },
      {
        type: "attachment",
        title: "Work status note",
        file: "Work_Status_Note_05202026.pdf",
        date: "05/20/2026",
        source: "Fax",
        tag: "Work Note",
        caseTag: ACL_TAG,
      },
    ],
  },
  {
    id: "acl-wound-check",
    date: "05/13/2026",
    time: "8:45am",
    caseName: CASE.name,
    visitType: "Post Operation",
    title: "1-Week Post-Op Wound Check",
    provider: ASSOCIATE_PROVIDER,
    codes: ["Z47.89", "G89.18"],
    items: [
      {
        type: "order",
        title: "Continuous passive motion unit rental",
        detail: "Northside DME Supply",
        date: "05/13/2026",
        time: "9:05 AM",
        icon: "personal_injury",
        tone: "orange",
        orderSet: "Post-Op DME",
      },
      {
        type: "attachment",
        title: "Activity restrictions",
        file: "Activity_Restrictions_05132026.pdf",
        date: "05/13/2026",
        source: "Fax",
        tag: "Instructions",
        caseTag: ACL_TAG,
      },
      {
        type: "attachment",
        title: "DME authorization",
        file: "DME_Authorization_Knee_Brace_05182026.pdf",
        date: "05/18/2026",
        source: "Other",
        tag: "Prior Auth",
        caseTag: "Priority Health - Knee brace",
      },
    ],
  },
  {
    id: "acl-reconstruction",
    date: "05/06/2026",
    time: "7:30am",
    caseName: CASE.name,
    visitType: "Surgery",
    title: "Right ACL Reconstruction",
    provider: PROVIDER.short,
    codes: ["S83.511A", "S83.241A"],
    items: [
      {
        type: "medication",
        title: "Oxycodone-Acetaminophen 5-325mg",
        detail: "20 tablets · No refills",
        date: "05/06/2026",
      },
      { type: "medication", title: "Aspirin 81mg tablet", detail: "56 tablets · No refills", date: "05/06/2026" },
      {
        type: "attachment",
        title: "Operative report",
        file: "Operative_Report_ACLR_05062026.pdf",
        date: "05/07/2026",
        source: "Fax",
        tag: "Operative Report",
        caseTag: ACL_TAG,
      },
      {
        type: "attachment",
        title: "Post-op protocol",
        file: "Post_Op_Protocol_Weeks_0_12.pdf",
        date: "05/07/2026",
        source: "Fax",
        tag: "Protocol",
        caseTag: ACL_TAG,
      },
    ],
  },
  {
    id: "acl-pre-op",
    date: "05/04/2026",
    time: "8:30am",
    caseName: CASE.name,
    visitType: "Pre-Operative",
    title: "Pre-Operative Visit",
    provider: ASSOCIATE_PROVIDER,
    codes: ["Z01.818", "S83.511A"],
    items: [
      {
        type: "order",
        title: "Pre-operative laboratory panel",
        detail: "Athelas Core Lab",
        date: "05/04/2026",
        time: "8:50 AM",
        icon: "science",
        tone: "blue",
        orderSet: "Pre-Op Clearance",
      },
      {
        type: "order",
        title: "Knee orthosis, elastic with joints, prefabricated",
        detail: "Northside DME Supply",
        date: "05/04/2026",
        time: "9:05 AM",
        icon: "personal_injury",
        tone: "orange",
        orderSet: "Post-Op DME",
      },
      {
        type: "attachment",
        title: "Pre-operative history and physical",
        file: "PreOp_HP_05042026.pdf",
        date: "05/04/2026",
        source: "Fax",
        tag: "Pre-Op H&P",
        caseTag: ACL_TAG,
      },
    ],
  },
  {
    id: "acl-surgical-consult",
    date: "04/29/2026",
    time: "2:00pm",
    caseName: CASE.name,
    visitType: "Surgical Consultation",
    title: "Surgical Consultation",
    provider: PROVIDER.short,
    codes: ["S83.511A", "S83.241A", "M25.561"],
    items: [
      {
        type: "order",
        title: "Arthrocentesis, aspiration and/or injection; major joint (knee)",
        detail: "Hale Orthopedics",
        date: "04/29/2026",
        time: "2:30 PM",
        icon: "syringe",
        tone: "orange",
        orderSet: "Ortho Consult Orders",
      },
      {
        type: "order",
        title: "Surgical scheduling - right ACL reconstruction",
        detail: "Riverside Surgical Center",
        date: "04/29/2026",
        time: "3:10 PM",
        icon: "assignment",
        tone: "blue",
        orderSet: "Ortho Consult Orders",
      },
      {
        type: "attachment",
        title: "MRI addendum",
        file: "MRI_Right_Knee_Addendum_04242026.pdf",
        date: "04/24/2026",
        source: "Imaging",
        tag: "MRI Report",
        caseTag: ACL_TAG,
      },
      {
        type: "attachment",
        title: "Surgical consent",
        file: "Surgical_Consent_ACLR_04292026.pdf",
        date: "04/29/2026",
        source: "Patient",
        tag: "Consent",
        caseTag: ACL_TAG,
      },
    ],
  },
  {
    id: "acl-injury-visit",
    date: "04/18/2026",
    time: "5:30pm",
    caseName: CASE.name,
    visitType: "Walk-In Injury",
    title: "Acute Knee Injury Visit",
    provider: "Priya Raman MD",
    codes: ["M25.561", "M25.461"],
    items: [
      {
        type: "order",
        title: "Radiologic examination, knee; 2 views",
        detail: "Riverside Imaging Center",
        date: "04/18/2026",
        time: "6:12 PM",
        icon: "radiology",
        tone: "blue",
        orderSet: "Knee Injury Workup",
      },
      {
        type: "attachment",
        title: "Right knee X-ray",
        file: "XR_Right_Knee_2_Views_04182026.pdf",
        date: "04/18/2026",
        source: "Imaging",
        tag: "X-Ray",
        caseTag: ACL_TAG,
      },
      {
        type: "order",
        title: "Knee immobilizer and axillary crutches",
        detail: "Northside DME Supply",
        date: "04/18/2026",
        time: "6:20 PM",
        icon: "personal_injury",
        tone: "orange",
        orderSet: "Walk-In Injury",
      },
      {
        type: "medication",
        title: "Naproxen Sodium 550mg tablet",
        detail: "20 tablets · No refills",
        date: "04/18/2026",
      },
      {
        type: "order",
        title: "MRI right knee without contrast",
        detail: "Riverside Imaging Center",
        date: "04/19/2026",
        time: "9:05 AM",
        icon: "radiology",
        tone: "blue",
        orderSet: "Knee Injury Workup",
      },
      {
        type: "attachment",
        title: "Right knee MRI",
        file: "MRI_Right_Knee_04222026.pdf",
        date: "04/22/2026",
        source: "Imaging",
        tag: "MRI Report",
        caseTag: ACL_TAG,
      },
      {
        type: "attachment",
        title: "Intake questionnaire",
        file: "Patient_Intake_Questionnaire_04182026.pdf",
        date: "04/18/2026",
        source: "Patient",
        tag: "Intake Form",
        caseTag: ACL_TAG,
      },
    ],
  },
  {
    id: "elbow-discharge",
    date: "12/15/2025",
    time: "4:15pm",
    caseName: PRIOR_CASE.name,
    visitType: "Established Patient",
    title: "Elbow Discharge Visit",
    provider: ASSOCIATE_PROVIDER,
    codes: ["M77.11"],
    items: [
      {
        type: "attachment",
        title: "Discharge summary",
        file: "Discharge_Summary_Elbow_12152025.pdf",
        date: "12/15/2025",
        source: "Other",
        tag: "Discharge Summary",
        caseTag: ELBOW_TAG,
      },
    ],
  },
  {
    id: "elbow-injection-followup",
    date: "11/03/2025",
    time: "9:45am",
    caseName: PRIOR_CASE.name,
    visitType: "Established Patient",
    title: "Post-Injection Follow Up",
    provider: PROVIDER.short,
    codes: ["M77.11"],
    items: [
      {
        type: "attachment",
        title: "QuickDASH outcome survey",
        file: "QuickDASH_Outcome_11032025.pdf",
        date: "11/03/2025",
        source: "Patient",
        tag: "Outcome Measure",
        caseTag: ELBOW_TAG,
      },
    ],
  },
  {
    id: "elbow-injection",
    date: "09/22/2025",
    time: "3:20pm",
    caseName: PRIOR_CASE.name,
    visitType: "Established Patient",
    title: "Elbow Follow Up with Injection",
    provider: ASSOCIATE_PROVIDER,
    codes: ["M77.11", "M25.521"],
    items: [
      {
        type: "order",
        title: "Injection, single tendon origin/insertion; lateral elbow",
        detail: "Hale Orthopedics",
        date: "09/22/2025",
        time: "3:40 PM",
        icon: "syringe",
        tone: "orange",
        orderSet: "Elbow Injection",
      },
      {
        type: "attachment",
        title: "Injection procedure note",
        file: "Procedure_Note_Elbow_Injection_09222025.pdf",
        date: "09/22/2025",
        source: "Fax",
        tag: "Procedure Note",
        caseTag: ELBOW_TAG,
      },
    ],
  },
  {
    id: "elbow-new-patient",
    date: "08/25/2025",
    time: "10:30am",
    caseName: PRIOR_CASE.name,
    visitType: "New Patient",
    title: "New Patient Elbow Consultation",
    provider: PROVIDER.short,
    codes: ["M77.11", "M25.521"],
    items: [
      {
        type: "order",
        title: "Radiologic examination, elbow; 2 views",
        detail: "Riverside Imaging Center",
        date: "08/25/2025",
        time: "10:55 AM",
        icon: "radiology",
        tone: "blue",
        orderSet: "Elbow Pain Workup",
      },
      {
        type: "attachment",
        title: "Right elbow X-ray",
        file: "XR_Right_Elbow_2_Views_08252025.pdf",
        date: "08/25/2025",
        source: "Imaging",
        tag: "X-Ray",
        caseTag: ELBOW_TAG,
      },
      {
        type: "order",
        title: "Counterforce elbow brace",
        detail: "Northside DME Supply",
        date: "08/25/2025",
        time: "11:05 AM",
        icon: "personal_injury",
        tone: "orange",
        orderSet: "Elbow Pain Workup",
      },
      {
        type: "medication",
        title: "Naproxen 500mg tablet",
        detail: "28 tablets · No refills",
        date: "08/25/2025",
      },
      {
        type: "attachment",
        title: "Intake questionnaire",
        file: "Patient_Intake_Questionnaire_08252025.pdf",
        date: "08/25/2025",
        source: "Patient",
        tag: "Intake Form",
        caseTag: ELBOW_TAG,
      },
      {
        type: "attachment",
        title: "Elbow home program",
        file: "Elbow_Home_Program_08252025.pdf",
        date: "08/25/2025",
        source: "Other",
        tag: "Handout",
        caseTag: ELBOW_TAG,
      },
    ],
  },
];

// Chart events created between visits — portal uploads, called-in refills,
// and orders placed from the inbox rather than from an appointment.
export type OutsideVisitActivity = {
  provider: string;
  time: string;
  item: EncounterItem;
};

export const OUTSIDE_VISIT_ACTIVITY: OutsideVisitActivity[] = [
  {
    provider: "Patient",
    time: "7:22pm",
    item: {
      type: "attachment",
      title: "Knee swelling photos",
      file: "Patient_Knee_Photos_08142026.pdf",
      date: "08/14/2026",
      source: "Patient",
      tag: "Photo",
      caseTag: ACL_TAG,
    },
  },
  {
    provider: ASSOCIATE_PROVIDER,
    time: "4:05pm",
    item: {
      type: "medication",
      title: "Ibuprofen 800mg tablet",
      detail: "30 tablets · 1 refill",
      date: "08/08/2026",
    },
  },
  {
    provider: CLINIC_ASSISTANT,
    time: "10:41am",
    item: {
      type: "attachment",
      title: "Outside PT progress note",
      file: "PT_Progress_Note_Northside_08062026.pdf",
      date: "08/06/2026",
      source: "Fax",
      tag: "PT Note",
      caseTag: ACL_TAG,
    },
  },
  {
    provider: PROVIDER.short,
    time: "2:18pm",
    item: {
      type: "order",
      title: "CBC with automated differential",
      detail: "Hale Orthopedics Lab",
      date: "08/04/2026",
      time: "2:18 PM",
      icon: "science",
      tone: "blue",
      orderSet: "Pre-Activity Labs",
    },
  },
];

const isOrderItem = (item: EncounterItem): item is OrderItem => item.type === "order";
const isAttachmentItem = (item: EncounterItem): item is AttachmentItem => item.type === "attachment";

const ALL_CHART_ITEMS: EncounterItem[] = [
  ...ENCOUNTERS.flatMap((visit) => visit.items),
  ...OUTSIDE_VISIT_ACTIVITY.map((entry) => entry.item),
];

const PAST_ENCOUNTERS = ENCOUNTERS.filter((visit) => visit.date !== CASE.visitDateLong);

function formatAppointmentTime(time: string) {
  return time.replace(/\s*(am|pm)$/i, (_, period: string) => ` ${period.toUpperCase()}`);
}

// Signed notes available in the past-note picker. The operating room encounter
// produces an operative report rather than an office note, so it is excluded.
export const PAST_NOTES = PAST_ENCOUNTERS.filter((visit) => visit.visitType !== "Surgery").map((visit) => ({
  id: visit.id,
  caseName: visit.caseName,
  title: visit.title,
  provider: visit.provider,
  visitType: visit.visitType,
  date: visit.date,
  time: formatAppointmentTime(visit.time),
}));

// Categories shown in the Orders panel summary and group headers.
export const ORDER_CATEGORIES = ["Imaging", "Procedures", "Referrals", "Labs", "DME"] as const;
export type OrderCategory = (typeof ORDER_CATEGORIES)[number];

function orderCategory(item: OrderItem): OrderCategory {
  if (item.icon === "radiology" || /MRI|Radiologic|x-?ray/i.test(item.title)) return "Imaging";
  if (item.icon === "science" || /laborator|lab panel|blood/i.test(item.title)) return "Labs";
  if (
    item.icon === "personal_injury" ||
    /brace|orthosis|crutches|DME|CPM|passive motion|immobilizer/i.test(item.title)
  ) {
    return "DME";
  }
  if (/referral|refer to/i.test(item.title)) return "Referrals";
  return "Procedures";
}

export const ORDER_CATEGORY_LABELS: Record<OrderCategory, string> = {
  Imaging: "Imaging",
  Procedures: "Procedures & Injections",
  Referrals: "Referrals",
  Labs: "Labs",
  DME: "DME",
};

export const PAST_ORDERS = ALL_CHART_ITEMS.filter(isOrderItem)
  .map((item) => ({
    title: item.title,
    icon: item.icon,
    tone: item.tone,
    status: "Submitted",
    orderSet: item.orderSet,
    created: `${item.date.replaceAll("/", "-")} ${item.time}`,
    recipient: item.detail,
    category: orderCategory(item),
  }))
  .sort((a, b) => chartDateValue(orderCreatedDate(b)) - chartDateValue(orderCreatedDate(a)));

function orderCreatedDate(order: { created: string }) {
  return order.created.split(" ")[0].replaceAll("-", "/");
}

// Draft orders shown in the visit note Orders section (below Plan).
export const NOTE_ORDERS = [
  {
    id: "note-order-dme-neck",
    title: "CUSTOM NECK BRACE (Dme Order)",
    icon: "personal_injury",
    tone: "orange" as const,
    meta: "Created on 08/18/2026 09:44 AM | -",
    status: "Draft",
  },
  {
    id: "note-order-referral-pt",
    title: "Outbound Referral Order",
    icon: "group",
    tone: "blue" as const,
    meta: "Physical Therapy Referral · Created on 08/18/2026 09:44 AM | -",
    status: "Draft",
  },
  {
    id: "note-order-mri-brain",
    title: "Mri brain stem w/o dye (Imaging Order)",
    icon: "radiology",
    tone: "blue" as const,
    meta: "Meds and Non Meds · Created on 08/18/2026 09:44 AM | -",
    status: "Draft",
  },
];

const ATTACHMENT_SOURCES = ["Imaging", "Fax", "Patient", "Other"] as const;

export const ATTACHMENT_GROUPS = ATTACHMENT_SOURCES.map((label) => ({
  label,
  files: ALL_CHART_ITEMS.filter(isAttachmentItem)
    .filter((item) => item.source === label)
    .map((item) => ({ name: item.file, date: item.date, tag: item.tag, case: item.caseTag }))
    .sort((a, b) => chartDateValue(b.date) - chartDateValue(a.date)),
}));

// Past encounters as the diagnosis panel needs them: the clinical visit name
// plus every code billed that day.
export const DIAGNOSIS_ENCOUNTERS = PAST_ENCOUNTERS.map(({ title, provider, date, codes, caseName }) => ({
  type: title,
  provider,
  date,
  codes,
  caseName,
}));

const diagnosisDateValue = chartDateValue;

const DAY_MS = 86400000;

// Codes last addressed in any of these prior visits surface under
// "Used In Latest Notes"; everything older falls under "Older Diagnosis".
export const LATEST_DIAGNOSIS_VISIT_COUNT = 3;

export type DiagnosisRelevance = "latest" | "older";

const RELEVANCE_ORDER: Record<DiagnosisRelevance, number> = { latest: 0, older: 1 };

function diagnosisAgeLabel(days: number) {
  if (days <= 0) return "Today";
  if (days < 14) return `${days} d ago`;
  if (days < 60) return `${Math.round(days / 7)} wk ago`;
  if (days < 365) return `${Math.round(days / 30.44)} mo ago`;
  return `${Math.round((days / 365) * 10) / 10} yr ago`;
}

export type DiagnosisEncounter = { type: string; provider: string; date: string };

export type DiagnosisRecord = {
  code: string;
  description: string;
  caseName: string;
  encounters: DiagnosisEncounter[];
  firstNoted: string;
  lastAddressed: string;
  daysSinceLastAddressed: number;
  relevance: DiagnosisRelevance;
  recencyLabel: string;
};

const visitDateValue = diagnosisDateValue(CASE.visitDateLong);

// Newest first — DIAGNOSIS_ENCOUNTERS is already ordered that way.
export const LATEST_DIAGNOSIS_VISITS = DIAGNOSIS_ENCOUNTERS.slice(0, LATEST_DIAGNOSIS_VISIT_COUNT);

const latestDiagnosisDates = new Set(LATEST_DIAGNOSIS_VISITS.map((visit) => visit.date));
const lastVisitDate = LATEST_DIAGNOSIS_VISITS[0]?.date;

// One row per unique code. A code belongs in "Used In Latest Notes" when its
// most recent coding falls on one of the last three prior appointments —
// first-noted date does not matter.
export const DIAGNOSIS_HISTORY: DiagnosisRecord[] = Object.entries(DIAGNOSIS_CODES)
  .map(([code, detail]) => {
    const encounters = DIAGNOSIS_ENCOUNTERS.filter((visit) => visit.codes.includes(code))
      .map(({ type, provider, date }) => ({ type, provider, date }))
      .sort((a, b) => diagnosisDateValue(b.date) - diagnosisDateValue(a.date));

    const lastAddressed = encounters[0]?.date ?? CASE.visitDateLong;
    const daysSinceLastAddressed = Math.round((visitDateValue - diagnosisDateValue(lastAddressed)) / DAY_MS);
    const relevance: DiagnosisRelevance = latestDiagnosisDates.has(lastAddressed) ? "latest" : "older";

    return {
      code,
      ...detail,
      encounters,
      firstNoted: encounters[encounters.length - 1]?.date ?? CASE.visitDateLong,
      lastAddressed,
      daysSinceLastAddressed,
      relevance,
      recencyLabel:
        encounters.length === 0
          ? "New this visit"
          : lastAddressed === lastVisitDate
            ? "At last visit"
            : diagnosisAgeLabel(daysSinceLastAddressed),
    };
  })
  .sort((a, b) => {
    if (a.relevance !== b.relevance) return RELEVANCE_ORDER[a.relevance] - RELEVANCE_ORDER[b.relevance];
    return diagnosisDateValue(b.lastAddressed) - diagnosisDateValue(a.lastAddressed);
  });

export const PHARMACY = {
  name: "Northside Pharmacy",
  address: "1420 W Belmont Ave Unit 3, Chicago, 60657, Illinois, USA",
};

export const MEDICATIONS = [
  {
    name: "Meloxicam 15mg tablet",
    date: "07/27/2026",
    status: "Active" as const,
    sig: "Take 1 tablet by mouth once daily with food for pain and swelling.",
    duration: "30 days",
    dispense: "30 tablets",
    refills: "1",
    appointment: "07/27/2026 – 10:15 AM",
    prescriber: REFERRING_PROVIDER,
    pharmacy: PHARMACY,
    unitCode: "68180-521-06",
    fillStatus: "Received",
    dose: "15mg",
    route: "Oral",
    frequency: "1 x Daily",
    pendingApproval: true,
    externalNotes:
      "Take with food. Hold the dose and call the clinic if stomach pain, dark stools, or new knee swelling develop.",
    pharmacyNotes: "Patient counseled on GI precautions. No interactions found with the current medication list.",
    log: [
      {
        date: "07/27/2026",
        title: "Prescribed",
        detail: `${REFERRING_PROVIDER} prescribed meloxicam 15mg at the 12-week post-op visit for activity-related knee pain and swelling.`,
        status: "completed" as const,
      },
      {
        date: "07/27/2026",
        title: "Submitted",
        detail: "e-Prescription transmitted to Northside Pharmacy.",
        status: "completed" as const,
      },
      {
        date: "07/28/2026",
        title: "Dispensed",
        detail: "Pharmacy filled 30 tablets and notified the patient for pickup.",
        status: "completed" as const,
      },
      {
        date: "08/06/2026",
        title: "Refill request",
        detail: "Patient requested the remaining refill through the portal.",
        status: "completed" as const,
      },
      {
        date: "08/10/2026",
        title: "Pending approval",
        detail: `Awaiting approval from ${REFERRING_PROVIDER}.`,
        status: "pending" as const,
      },
    ],
  },
  {
    name: "Acetaminophen 500mg tablet",
    date: "07/27/2026",
    status: "Active" as const,
    sig: "Take 1 to 2 tablets by mouth every 6 hours as needed for pain. Do not exceed 3,000mg in 24 hours.",
    duration: "As needed",
    dispense: "60 tablets",
    refills: "0",
    appointment: "07/27/2026 – 10:15 AM",
    prescriber: REFERRING_PROVIDER,
    pharmacy: PHARMACY,
    unitCode: "50580-449-73",
    fillStatus: "Received",
    dose: "500mg",
    route: "Oral",
    frequency: "Every 6 hours PRN",
    pendingApproval: true,
    externalNotes:
      "Do not combine with other acetaminophen-containing products. Keep the total daily dose under 3,000mg.",
    pharmacyNotes: "Reviewed the total daily acetaminophen load with the patient at pickup.",
    log: [
      {
        date: "07/27/2026",
        title: "Prescribed",
        detail: `${REFERRING_PROVIDER} prescribed acetaminophen 500mg for breakthrough pain between meloxicam doses.`,
        status: "completed" as const,
      },
      {
        date: "07/27/2026",
        title: "Submitted",
        detail: "e-Prescription transmitted to Northside Pharmacy.",
        status: "completed" as const,
      },
      {
        date: "07/28/2026",
        title: "Dispensed",
        detail: "Pharmacy filled 60 tablets and counseled the patient on the 24-hour maximum.",
        status: "completed" as const,
      },
      {
        date: "08/07/2026",
        title: "Pharmacy request",
        detail: "Northside Pharmacy requested authorization for an additional 60-tablet fill.",
        status: "completed" as const,
      },
      {
        date: "08/07/2026",
        title: "Pending approval",
        detail: `Awaiting approval from ${REFERRING_PROVIDER}.`,
        status: "pending" as const,
      },
    ],
  },
  {
    name: "Oxycodone-Acetaminophen 5-325mg",
    date: "05/06/2026",
    status: "Expired" as const,
    sig: "Take 1 tablet by mouth every 6 hours as needed for severe pain for up to 5 days after surgery.",
    duration: "5 days",
    dispense: "20 tablets",
    refills: "0",
    appointment: "05/06/2026 – 7:30 AM",
    prescriber: REFERRING_PROVIDER,
    pharmacy: PHARMACY,
    unitCode: "00406-0512-01",
    fillStatus: "Received",
    dose: "5-325mg",
    route: "Oral",
    frequency: "Every 6 hours PRN",
    pendingApproval: false,
    externalNotes:
      "Do not drive or operate machinery while taking this medication. Step down to acetaminophen as soon as pain allows.",
    pharmacyNotes: "PDMP reviewed before dispensing. Patient counseled on safe storage and take-back disposal.",
    log: [
      {
        date: "05/06/2026",
        title: "Prescribed",
        detail: `${REFERRING_PROVIDER} prescribed oxycodone-acetaminophen for acute pain after ACL reconstruction.`,
        status: "completed" as const,
      },
      {
        date: "05/06/2026",
        title: "Submitted",
        detail: "Controlled substance e-prescription transmitted after a PDMP check.",
        status: "completed" as const,
      },
      {
        date: "05/07/2026",
        title: "Dispensed",
        detail: "Pharmacy filled 20 tablets with no refills authorized.",
        status: "completed" as const,
      },
      {
        date: "05/11/2026",
        title: "Course completed",
        detail: "Patient reported stopping after 4 days and transitioning to acetaminophen alone.",
        status: "completed" as const,
      },
    ],
  },
  {
    name: "Aspirin 81mg tablet",
    date: "05/06/2026",
    status: "Expired" as const,
    sig: "Take 1 tablet by mouth twice daily for 4 weeks after surgery for clot prevention.",
    duration: "28 days",
    dispense: "56 tablets",
    refills: "0",
    appointment: "05/06/2026 – 7:30 AM",
    prescriber: REFERRING_PROVIDER,
    pharmacy: PHARMACY,
    unitCode: "00904-6288-60",
    fillStatus: "Denied",
    dose: "81mg",
    route: "Oral",
    frequency: "2 x Daily",
    pendingApproval: false,
    externalNotes:
      "Continue for four weeks after surgery for clot prevention unless the surgical team directs otherwise.",
    pharmacyNotes: "Confirmed no NSAID duplication at the time of dispensing.",
    log: [
      {
        date: "05/06/2026",
        title: "Prescribed",
        detail: `${REFERRING_PROVIDER} prescribed aspirin 81mg for venous thromboembolism prophylaxis.`,
        status: "completed" as const,
      },
      {
        date: "05/06/2026",
        title: "Submitted",
        detail: "e-Prescription transmitted to Northside Pharmacy.",
        status: "completed" as const,
      },
      {
        date: "05/07/2026",
        title: "Dispensed",
        detail: "Pharmacy filled 56 tablets for the 28-day course.",
        status: "completed" as const,
      },
      {
        date: "06/03/2026",
        title: "Course completed",
        detail: "Prophylaxis course finished with no bleeding complications reported.",
        status: "completed" as const,
      },
    ],
  },
  {
    name: "Naproxen Sodium 550mg tablet",
    date: "04/18/2026",
    status: "Discontinued" as const,
    sig: "Take 1 tablet by mouth twice daily with food for pain and swelling for up to 10 days.",
    duration: "10 days",
    dispense: "20 tablets",
    refills: "0",
    appointment: "04/18/2026 – 5:30 PM",
    prescriber: "Priya Raman MD",
    pharmacy: PHARMACY,
    unitCode: "00093-0148-01",
    fillStatus: "Received",
    dose: "550mg",
    route: "Oral",
    frequency: "2 x Daily",
    pendingApproval: false,
    externalNotes:
      "Started at the walk-in injury visit. Stop 7 days before surgery if an operation is scheduled and switch to acetaminophen.",
    pharmacyNotes: "Counseled on GI precautions and the pre-operative hold instruction.",
    log: [
      {
        date: "04/18/2026",
        title: "Prescribed",
        detail: "Priya Raman MD prescribed naproxen sodium at the walk-in visit for acute right knee pain and effusion.",
        status: "completed" as const,
      },
      {
        date: "04/18/2026",
        title: "Dispensed",
        detail: "Pharmacy filled 20 tablets the same evening.",
        status: "completed" as const,
      },
      {
        date: "04/29/2026",
        title: "Held for surgery",
        detail: `Discontinued at the surgical consult in preparation for reconstruction on ${CASE.surgeryDate}.`,
        status: "completed" as const,
      },
    ],
  },
  {
    name: "Naproxen 500mg tablet",
    date: "08/25/2025",
    status: "Discontinued" as const,
    sig: "Take 1 tablet by mouth twice daily with food for 14 days for elbow pain.",
    duration: "14 days",
    dispense: "28 tablets",
    refills: "0",
    appointment: "08/25/2025 – 10:30 AM",
    prescriber: REFERRING_PROVIDER,
    pharmacy: PHARMACY,
    unitCode: "00093-0147-01",
    fillStatus: "Denied",
    dose: "500mg",
    route: "Oral",
    frequency: "2 x Daily",
    pendingApproval: false,
    externalNotes:
      "Taken with the counterforce brace and the home loading program for lateral elbow tendinopathy. Take with food.",
    pharmacyNotes: "First NSAID course for this patient. No interactions identified.",
    log: [
      {
        date: "08/25/2025",
        title: "Prescribed",
        detail: `${REFERRING_PROVIDER} prescribed naproxen at the new patient elbow consultation.`,
        status: "completed" as const,
      },
      {
        date: "08/26/2025",
        title: "Dispensed",
        detail: "Pharmacy filled 28 tablets for the 14-day course.",
        status: "completed" as const,
      },
      {
        date: "09/22/2025",
        title: "Discontinued",
        detail: "Limited relief reported, so the NSAID was stopped and a lateral elbow injection was performed at the follow-up visit.",
        status: "completed" as const,
      },
    ],
  },
];

export const ALLERGIES = [
  { name: "Latex", status: "Active" as const, severity: "Severe" as const, date: PRIOR_CASE.firstVisit },
  { name: "Penicillin", status: "Active" as const, severity: "Severe" as const, date: PRIOR_CASE.firstVisit },
  { name: "Shellfish", status: "Active" as const, severity: "Mild" as const, date: PRIOR_CASE.firstVisit },
  { name: "Peanuts", status: "Inactive" as const, severity: "Severe" as const, date: "03/12/2019" },
];

export const PATIENT_CONTACTS = [
  {
    type: "Primary Care",
    name: "Bayview Family Medicine",
    description: "Primary care physician",
    primaryPhone: "+1 (415) 555-0142",
    secondaryPhone: "-",
    email: "records@bayviewfm.example",
    fax: "+1 (415) 555-0143",
    patient: "Jordan Reyes",
    notes: "Copy operative report and 09/21 follow-up summary",
  },
  {
    type: "Imaging",
    name: "Riverside Imaging Center",
    description: "MRI and X-ray",
    primaryPhone: "+1 (949) 293-2605",
    secondaryPhone: "-",
    email: "records@riversideimaging.example",
    fax: "-",
    patient: "Jordan Reyes",
    notes: "Request disc copies of the 04/22 knee MRI",
  },
  {
    type: "DME",
    name: "Northside DME Supply",
    description: "Brace and CPM rental",
    primaryPhone: "+1 (312) 555-0148",
    secondaryPhone: "+1 (312) 555-0172",
    email: "orders@northsidedme.example",
    fax: "+1 (312) 555-0149",
    patient: "Jordan Reyes + 1 other",
    notes: "Hinged brace returned 07/27",
  },
  {
    type: "Other",
    name: "Maya Reyes",
    description: "Spouse",
    primaryPhone: "+1 (503) 555-0121",
    secondaryPhone: "-",
    email: "-",
    fax: "-",
    patient: "Jordan Reyes",
    notes: "Emergency contact, call for scheduling changes",
  },
];

export const SITE_CONTACTS = [
  {
    type: "Lab",
    name: "Athelas Core Lab",
    description: "Routine and STAT panels",
    primaryPhone: "+1 (206) 555-0110",
    secondaryPhone: "-",
    email: "results@athelascorelab.example",
    fax: "+1 (206) 555-0111",
    patient: "-",
    notes: "STAT results paged to the on-call provider",
  },
  {
    type: "Pharmacy",
    name: "Northside Pharmacy",
    description: "Preferred retail pharmacy",
    primaryPhone: "+1 (312) 555-0190",
    secondaryPhone: "-",
    email: "rx@northsidepharmacy.example",
    fax: "+1 (312) 555-0191",
    patient: "-",
    notes: "-",
  },
  {
    type: "Other",
    name: "Bridge Language Services",
    description: "Interpreter scheduling",
    primaryPhone: "+1 (888) 555-0164",
    secondaryPhone: "-",
    email: "requests@bridgelanguage.example",
    fax: "-",
    patient: "-",
    notes: "Request ASL and Spanish 24 hours ahead",
  },
];

// Activity Tracker entries, newest first.
export const ACTIVITY_EVENTS = [
  {
    date: "Aug 10, 2026",
    time: "11:50 AM",
    title: "Clinic Visit Completed",
    performedBy: PROVIDER.name,
    description: "14-week post-ACL follow-up. Exam, outcome review, and return-to-run clearance counseling.",
  },
  {
    date: "Aug 6, 2026",
    time: "9:20 AM",
    title: "Refill Requested",
    performedBy: CLINIC_ASSISTANT,
    description: "Patient requested the remaining meloxicam refill through the portal. Routed for approval.",
  },
  {
    date: "Jul 27, 2026",
    time: "10:15 AM",
    title: "Clinic Visit Completed",
    performedBy: PROVIDER.name,
    description: "12-week post-op visit. Cleared for straight-line jogging and given the week 12 activity handout.",
  },
  {
    date: "Jul 27, 2026",
    time: "10:40 AM",
    title: "Outcome Measure Collected",
    performedBy: PROVIDER.name,
    description: "IKDC Subjective Knee Form scored 71.3%, improved from 48.3% at week 6.",
  },
  {
    date: "Jul 27, 2026",
    time: "11:05 AM",
    title: "Hinged Brace Returned",
    performedBy: CLINIC_ASSISTANT,
    description: "Brace discontinued and returned to Northside DME Supply, then removed from the rental list.",
  },
  {
    date: "Jun 17, 2026",
    time: "11:00 AM",
    title: "Clinic Visit Completed",
    performedBy: PROVIDER.name,
    description: "6-week post-op visit. Post-op radiographs reviewed and the brace was unlocked to 0-90 degrees.",
  },
  {
    date: "May 20, 2026",
    time: "9:45 AM",
    title: "Sutures Removed",
    performedBy: ASSOCIATE_PROVIDER,
    description: "Portal incisions fully healed at 2 weeks. Work status note issued for modified duty.",
  },
  {
    date: "May 6, 2026",
    time: "7:30 AM",
    title: "Surgery Completed",
    performedBy: PROVIDER.name,
    description: `${CASE.surgery} at Riverside Surgical Center without complication.`,
  },
  {
    date: "Dec 15, 2025",
    time: "4:15 PM",
    title: "Case Closed",
    performedBy: ASSOCIATE_PROVIDER,
    description: "Right elbow lateral epicondylitis resolved. Patient released from care with a home program.",
  },
];

export const AUDIT_LOG = [
  {
    label: "Today",
    entries: [
      { user: PROVIDER.name, resource: "Appointments", when: "22 minutes ago" },
      { user: PROVIDER.name, resource: "Pinned Notes", when: "35 minutes ago" },
      { user: CLINIC_ASSISTANT, resource: "Attachments", when: "2 hours ago" },
    ],
  },
  {
    label: "Yesterday",
    entries: [
      { user: PROVIDER.name, resource: "Orders", when: "11 hours ago" },
      { user: PROVIDER.name, resource: "Orders", when: "11 hours ago" },
      { user: PROVIDER.name, resource: "Appointments", when: "11 hours ago" },
      { user: CLINIC_ASSISTANT, resource: "Appointments", when: "12 hours ago" },
      { user: CLINIC_ASSISTANT, resource: "Pinned Notes", when: "12 hours ago" },
      { user: ASSOCIATE_PROVIDER, resource: "Demographics", when: "14 hours ago" },
      { user: ASSOCIATE_PROVIDER, resource: "Attachments", when: "14 hours ago" },
      { user: PROVIDER.name, resource: "Medications", when: "16 hours ago" },
      { user: PROVIDER.name, resource: "Orders", when: "16 hours ago" },
      { user: CLINIC_ASSISTANT, resource: "Demographics", when: "18 hours ago" },
    ],
  },
];

export const PINNED_NOTE = {
  body: "Jordan is 14 weeks post-op right ACL reconstruction. Prior right elbow epicondylitis resolved in 2025 after a single injection. He is hard of hearing.",
  editedBy: PROVIDER.name,
  editedAt: "08/10/2026 08:59 PM",
};

export const MESSAGE_AUTHOR = { author: PROVIDER.short, initials: "MH", tone: "blue" as const };

export const CARE_TEAM_THREAD = [
  {
    author: CLINIC_ASSISTANT,
    initials: "AN",
    tone: "pink" as const,
    date: "08/10/2026",
    time: "03:33 PM",
    mention: "@Marcus Hale",
    body: `Priority Health approved the functional testing order. Want me to book the return-to-sport testing slot for ${CASE.nextFollowUp}?`,
  },
];

