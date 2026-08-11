// Synthetic demo chart: a 28-year-old recreational soccer player in outpatient
// physical therapy 14 weeks after a right ACL reconstruction. No real patient
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
  name: "Dana Whitfield",
  credentials: "PT, DPT",
  display: "Dana Whitfield PT, DPT",
  short: "Dana Whitfield PT",
  license: "PT License 41-0982314",
};

export const REFERRING_PROVIDER = "Marcus Hale MD";

export const CASE = {
  name: "ACL Tear",
  dateOfInjury: "04/18/2026",
  surgeryDate: "05/06/2026",
  surgery: "Right ACL reconstruction with semitendinosus autograft and partial medial meniscectomy",
  initialEval: "05/20/2026",
  visitDate: "08/10/26 - 11:50am",
  visitDateLong: "08/10/2026",
  previousVisitDate: "07/27/2026",
  planOfCareEnd: "11/06/2026",
  pendingVisits: "6",
  visitNumber: "18",
  diagnosisCode: "S83.511D",
  diagnosisShort: "S83.511D - Sprain of ACL, right knee",
};

// Prior signed visit notes available in the past-note panel picker. Ordered
// newest-first so the most recent visit is selected by default.
export const PAST_NOTES = [
  { id: "visit-17", caseName: "ACL Tear", provider: "Dana Whitfield PT", date: "07/27/2026" },
  { id: "visit-16", caseName: "ACL Tear", provider: "Dana Whitfield PT", date: "07/13/2026" },
  { id: "visit-15", caseName: "ACL Tear", provider: "Alicia Nunez PTA", date: "06/29/2026" },
  { id: "visit-12", caseName: "ACL Tear", provider: "Dana Whitfield PT", date: "06/08/2026" },
  { id: "visit-08", caseName: "ACL Tear", provider: "Dana Whitfield PT", date: "05/20/2026" },
  { id: "eval-ankle", caseName: "Left Ankle Sprain", provider: "Marcus Hale MD", date: "11/02/2025" },
];

const HIP_MOVEMENTS = ["Hip Flexion", "Hip Extension", "Hip Abduction", "Hip Adduction", "Hip IR", "Hip ER"];
const KNEE_MOVEMENTS = ["Knee Flexion", "Knee Extension"];

export const EDUCATION_OPTIONS = [
  "Graft Healing Timeline",
  "Return-to-Sport Criteria",
  "Activity Modifications",
  "Ice & Heat Application",
];

export const GOAL_OPTIONS = [
  "Full Knee Extension",
  "Restore Quad Strength >90%",
  "Return to Running",
  "Return to Cutting Sports",
];

export const TREATMENT_OPTIONS = [
  "Manual Therapy",
  "Therapeutic Exercise",
  "Neuromuscular Re-education",
  "Gait & Running Retraining",
  "Blood Flow Restriction Training",
  "Cryotherapy",
  "Home Exercise Program",
  "Patient Education",
];

export const PLAN_FORWARD_OPTIONS = [
  "Continue 2x/week for 6 Weeks",
  "Progress to Plyometric Phase",
  "Return-to-Sport Testing at Week 20",
  "Follow Up Orthopedic Specialist 09/14/2026",
];

const SURGICAL_HISTORY = {
  previousSurgery: "Yes",
  surgeryName: CASE.surgery,
  surgeryDate: CASE.surgeryDate,
  dateOfOnset: CASE.dateOfInjury,
  stateOfCondition: "New",
  sideOfIssue: "Right",
};

export const CURRENT_VISIT = {
  subjective: {
    ...SURGICAL_HISTORY,
    chiefComplaint:
      "Right knee pain and stiffness 14 weeks after ACL reconstruction. Reports a 3/10 ache along the medial joint line after walking more than 30 minutes and tightness with stairs. Denies giving way, locking, or new swelling, and wants to return to recreational soccer this fall.",
    historyOfCondition:
      "Non-contact pivoting injury during a recreational soccer match on 04/18/2026 with immediate swelling and inability to bear weight. MRI on 04/22/2026 showed a complete ACL tear with a posterior horn medial meniscus tear. Reconstruction was performed 05/06/2026 and physical therapy began 05/20/2026. He has progressed through range of motion and closed-chain strengthening without complication and was cleared for straight-line jogging at week 12.",
  },
  objective: {
    currentPain: "3",
    worstPain: "6",
    bestPain: "1",
    painDescription:
      "Intermittent aching along the medial joint line and at the hamstring graft site, 3/10 at rest and up to 6/10 after stairs or 30 or more minutes of walking. Relieved by rest, ice, and elevation. No night pain and no catching or locking.",
    hip: { rows: HIP_MOVEMENTS, left: ["5/5", "5/5", "5/5", "5/5", "5/5", "5/5"], right: ["4+/5", "4/5", "4/5", "4+/5", "4+/5", "4/5"] },
    knee: { rows: KNEE_MOVEMENTS, left: ["5/5", "5/5"], right: ["4+/5", "4/5"] },
  },
  assessment: {
    primaryDiagnosis:
      "S83.511D - Sprain of anterior cruciate ligament of right knee, subsequent encounter. Status post ACL reconstruction 05/06/2026 with residual quadriceps weakness (M62.561) and stiffness of the right knee (M25.661).",
    dateOfOnset: CASE.dateOfInjury,
    rehabPotential:
      "Good to excellent. He is 28 years old with no comorbidities, is compliant with a five-day-per-week home program, and is progressing on schedule for a hamstring autograft. Limiting factors are a 22% quadriceps strength deficit on the involved side and apprehension with deceleration and cutting.",
    keyFindings:
      "Right knee AROM 3-132 degrees versus 0-140 degrees on the left. Quadriceps index 78% by handheld dynamometry and single-leg hop symmetry 81%. Trace effusion, negative Lachman and pivot shift, non-tender graft site.",
    goals: [
      {
        title: "Restore right knee active extension to 0 degrees to normalize gait",
        description: "0 degrees extension",
        initialValue: "12 degree extension lag",
        previousVisit: "75%",
        initialProgress: "90%",
        goalTarget: "09/07/2026",
      },
      {
        title: "Quadriceps strength within 90% of the uninvolved limb",
        description: "Quad index >90%",
        initialValue: "42% quad index",
        previousVisit: "50%",
        initialProgress: "75%",
        goalTarget: "10/05/2026",
      },
      {
        title: "Independent with a progressive return-to-run program, 2 miles pain free",
        description: "2 miles pain free",
        initialValue: "Unable to jog",
        previousVisit: "25%",
        initialProgress: "50%",
        goalTarget: "10/19/2026",
      },
    ],
  },
  plan: {
    patientGoal:
      "Return to recreational 7v7 soccer without a brace by December and be able to run three miles pain free.",
    educationTopics: ["Graft Healing Timeline", "Return-to-Sport Criteria"],
    goals: ["Full Knee Extension", "Restore Quad Strength >90%", "Return to Running"],
    treatments: [
      "Therapeutic Exercise",
      "Neuromuscular Re-education",
      "Blood Flow Restriction Training",
      "Home Exercise Program",
    ],
    planForward: ["Continue 2x/week for 6 Weeks", "Progress to Plyometric Phase"],
    careAgreement: "Yes",
  },
};

export const PREVIOUS_VISIT = {
  subjective: {
    ...SURGICAL_HISTORY,
    chiefComplaint:
      "Right knee soreness and stiffness 12 weeks after ACL reconstruction. Reports 4/10 pain with stairs and after 15 minutes of walking, along with tightness behind the knee each morning. Asking when he can begin jogging.",
    historyOfCondition:
      "Non-contact pivoting injury during a recreational soccer match on 04/18/2026 with immediate swelling and inability to bear weight. MRI on 04/22/2026 showed a complete ACL tear with a posterior horn medial meniscus tear. Reconstruction was performed 05/06/2026 and physical therapy began 05/20/2026. He weaned off crutches at week 4 and tolerated bilateral leg press and stationary cycling by week 8.",
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
      "Good. He is compliant with the home program and progressing as expected at 12 weeks, though a 29% quadriceps deficit and a 6 degree extension lag continue to limit gait symmetry and readiness for impact.",
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
    treatments: ["Therapeutic Exercise", "Neuromuscular Re-education", "Home Exercise Program"],
    planForward: ["Continue 2x/week for 6 Weeks"],
    careAgreement: "Yes",
  },
};

export const PAST_DIAGNOSES = [
  {
    type: "Post-Op Follow Up",
    provider: PROVIDER.short,
    date: "07/27/2026",
    diagnosis: "Sprain of anterior cruciate ligament of right knee, subsequent encounter (S83.511D)",
  },
  {
    type: "Initial PT Evaluation",
    provider: PROVIDER.short,
    date: "05/20/2026",
    diagnosis: "Aftercare following surgery on the musculoskeletal system (Z47.89)",
  },
  {
    type: "Surgical Consult",
    provider: REFERRING_PROVIDER,
    date: "04/29/2026",
    diagnosis: "Complete tear of anterior cruciate ligament of right knee, initial encounter (S83.511A)",
  },
  {
    type: "Urgent Care Visit",
    provider: "Priya Raman MD",
    date: "04/18/2026",
    diagnosis: "Acute pain and effusion of right knee following a pivoting injury (M25.561)",
  },
];

export const MEDICATIONS = [
  {
    name: "Meloxicam 15mg tablet",
    date: "08/03/2026",
    status: "Active" as const,
    sig: "Take 1 tablet by mouth once daily with food for pain and swelling.",
    duration: "30 days",
    dispense: "30 tablets",
    refills: "1",
  },
  {
    name: "Acetaminophen 500mg tablet",
    date: "08/03/2026",
    status: "Active" as const,
    sig: "Take 1 to 2 tablets by mouth every 6 hours as needed for pain. Do not exceed 3,000mg in 24 hours.",
    duration: "As needed",
    dispense: "60 tablets",
    refills: "0",
  },
  {
    name: "Oxycodone-Acetaminophen 5-325mg",
    date: "05/06/2026",
    status: "Expired" as const,
    sig: "Take 1 tablet by mouth every 6 hours as needed for severe pain for up to 5 days after surgery.",
    duration: "5 days",
    dispense: "20 tablets",
    refills: "0",
  },
  {
    name: "Aspirin 81mg tablet",
    date: "05/06/2026",
    status: "Expired" as const,
    sig: "Take 1 tablet by mouth twice daily for 4 weeks after surgery for clot prevention.",
    duration: "28 days",
    dispense: "56 tablets",
    refills: "0",
  },
];

export const ALLERGIES = [
  { name: "Penicillin", status: "Active", severity: "Severe" as const, date: "05/02/2026" },
  { name: "Latex", status: "Active", severity: "Moderate" as const, date: "05/02/2026" },
  { name: "Shellfish", status: "Active", severity: "Mild" as const, date: "05/02/2026" },
];

export const PATIENT_CONTACTS = [
  {
    type: "Referring Provider",
    name: "Hale Orthopedics",
    description: "Surgical follow-up",
    primaryPhone: "+1 (415) 342-9305",
    secondaryPhone: "-",
    email: "scheduling@haleortho.example",
    fax: "+1 (415) 342-9310",
    patient: "Jordan Reyes",
    notes: "Send progress notes before the 09/14 post-op visit",
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
    notes: "Hinged brace returned 07/13",
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
    title: "Treatment Session Completed",
    performedBy: PROVIDER.name,
    description: "Visit 18 of 24. Manual therapy, closed-chain strengthening, and blood flow restriction training.",
  },
  {
    date: "Aug 4, 2026",
    time: "4:00 PM",
    title: "Home Exercise Program Updated",
    performedBy: "Alicia Nunez",
    description: "Week 12 program sent to the patient portal and reviewed by phone.",
  },
  {
    date: "Aug 3, 2026",
    time: "3:40 PM",
    title: "Outcome Measure Collected",
    performedBy: PROVIDER.name,
    description: "IKDC Subjective Knee Form scored 71.3%, improved from 48.3% at week 6.",
  },
  {
    date: "Jul 27, 2026",
    time: "9:15 AM",
    title: "Hinged Brace Returned",
    performedBy: "Alicia Nunez",
    description: "Brace returned to Northside DME Supply and removed from the rental list.",
  },
];

export const AUDIT_LOG = [
  {
    label: "Today",
    entries: [
      { user: PROVIDER.name, resource: "Appointments", when: "22 minutes ago" },
      { user: PROVIDER.name, resource: "Pinned Notes", when: "35 minutes ago" },
      { user: "Alicia Nunez", resource: "Attachments", when: "2 hours ago" },
    ],
  },
  {
    label: "Yesterday",
    entries: [
      { user: PROVIDER.name, resource: "Orders", when: "11 hours ago" },
      { user: PROVIDER.name, resource: "Orders", when: "11 hours ago" },
      { user: PROVIDER.name, resource: "Appointments", when: "11 hours ago" },
      { user: "Alicia Nunez", resource: "Appointments", when: "12 hours ago" },
      { user: "Alicia Nunez", resource: "Pinned Notes", when: "12 hours ago" },
      { user: REFERRING_PROVIDER, resource: "Demographics", when: "14 hours ago" },
      { user: REFERRING_PROVIDER, resource: "Attachments", when: "14 hours ago" },
      { user: PROVIDER.name, resource: "Medications", when: "16 hours ago" },
      { user: PROVIDER.name, resource: "Orders", when: "16 hours ago" },
      { user: "Alicia Nunez", resource: "Demographics", when: "18 hours ago" },
    ],
  },
];

export const PINNED_NOTE = {
  body: "Jordan is 14 weeks post-op right ACL reconstruction. He is hard of hearing.",
  editedBy: PROVIDER.name,
  editedAt: "08/10/2026 08:59 PM",
};

export const MESSAGE_AUTHOR = { author: PROVIDER.short, initials: "DW", tone: "blue" as const };

export const CARE_TEAM_THREAD = [
  {
    author: "Alicia Nunez",
    initials: "AN",
    tone: "pink" as const,
    date: "08/10/2026",
    time: "03:33 PM",
    mention: "@Dana Whitfield",
    body: "Priority Health approved 6 more visits through 09/23. Want me to book the return-to-sport testing slot?",
  },
];

export const PAST_ORDERS = [
  {
    title: "Radiologic examination, knee; 3 views",
    icon: "radiology",
    tone: "blue" as const,
    status: "Submitted",
    orderSet: "Knee Injury Workup",
    created: "04-18-2026 6:12 PM",
    recipient: "Riverside Imaging Center",
  },
  {
    title: "Arthrocentesis, aspiration and/or injection; major joint (knee)",
    icon: "syringe",
    tone: "orange" as const,
    status: "Submitted",
    orderSet: "Ortho Consult Orders",
    created: "04-29-2026 2:30 PM",
    recipient: "Hale Orthopedics",
  },
  {
    title: "Knee orthosis, elastic with joints, prefabricated",
    icon: "personal_injury",
    tone: "orange" as const,
    status: "Submitted",
    orderSet: "Post-Op DME",
    created: "05-06-2026 9:15 AM",
    recipient: "Northside DME Supply",
  },
  {
    title: "Physical Therapy, 2x per week for 12 weeks",
    icon: "group",
    tone: "blue" as const,
    status: "Submitted",
    orderSet: "Post-Op Rehab Referral",
    created: "05-13-2026 11:20 AM",
    recipient: "Athelas Physical Therapy",
  },
];

const CASE_TAG = "ACL Tear - DOI 04/18/2026";

export const ATTACHMENT_GROUPS = [
  {
    label: "Imaging",
    files: [
      { name: "MRI_Right_Knee_04222026.pdf", date: "04/22/2026", tag: "MRI Report", case: CASE_TAG },
      { name: "XR_Right_Knee_2_Views_04182026.pdf", date: "04/18/2026", tag: "X-Ray", case: CASE_TAG },
      { name: "MRI_Right_Knee_Addendum_04242026.pdf", date: "04/24/2026", tag: "MRI Report", case: CASE_TAG },
    ],
  },
  {
    label: "Fax",
    files: [
      { name: "Operative_Report_ACLR_05062026.pdf", date: "05/07/2026", tag: "Operative Report", case: CASE_TAG },
      { name: "Ortho_PT_Referral_05132026.pdf", date: "05/13/2026", tag: "Referral", case: CASE_TAG },
      { name: "Post_Op_Protocol_Weeks_0_12.pdf", date: "05/07/2026", tag: "Protocol", case: CASE_TAG },
    ],
  },
  {
    label: "Patient",
    files: [
      { name: "Patient_Intake_Questionnaire_05202026.pdf", date: "05/20/2026", tag: "Intake Form", case: CASE_TAG },
      { name: "IKDC_Outcome_Survey_08032026.pdf", date: "08/03/2026", tag: "Outcome Measure", case: CASE_TAG },
    ],
  },
  {
    label: "Other",
    files: [
      {
        name: "PT_Authorization_24_Visits_05182026.pdf",
        date: "05/18/2026",
        tag: "Prior Auth",
        case: "Priority Health - 24 visits",
      },
      { name: "Home_Exercise_Program_Week_12.pdf", date: "07/27/2026", tag: "HEP", case: CASE_TAG },
      { name: "Plan_of_Care_08102026.pdf", date: "08/10/2026", tag: "Plan of Care", case: CASE_TAG },
    ],
  },
];

// Orthopedic care pathway for the ACL case: each appointment is a timeline
// anchor, with the orders, prescriptions, and documents it generated beneath it.
export const CHART_TIMELINE = [
  {
    id: "ortho-followup-14wk",
    date: "08/10/2026",
    time: "9:20 AM",
    title: "ACL Tear Follow-up",
    provider: REFERRING_PROVIDER,
    status: "Completed",
    items: [
      {
        type: "order",
        title: "Functional return-to-sport testing",
        detail: "Hale Orthopedics Sports Medicine",
        date: "08/10/2026",
      },
      {
        type: "attachment",
        title: "Knee examination summary",
        detail: "Ortho_Followup_14wk_08102026.pdf",
        file: "Ortho_Followup_14wk_08102026.pdf",
        date: "08/10/2026",
      },
    ],
  },
  {
    id: "ortho-followup-12wk",
    date: "08/03/2026",
    time: "10:15 AM",
    title: "ACL Tear Follow-up",
    provider: REFERRING_PROVIDER,
    status: "Completed",
    items: [
      { type: "medication", title: "Meloxicam 15mg tablet", detail: "30 tablets · 1 refill", date: "08/03/2026" },
      {
        type: "medication",
        title: "Acetaminophen 500mg tablet",
        detail: "60 tablets · No refills",
        date: "08/03/2026",
      },
      {
        type: "attachment",
        title: "IKDC outcome survey",
        detail: "IKDC_Outcome_Survey_08032026.pdf",
        file: "IKDC_Outcome_Survey_08032026.pdf",
        date: "08/03/2026",
      },
    ],
  },
  {
    id: "ortho-followup-6wk",
    date: "06/17/2026",
    time: "11:00 AM",
    title: "ACL Tear Follow-up",
    provider: REFERRING_PROVIDER,
    status: "Completed",
    items: [
      {
        type: "order",
        title: "Hinged brace unlocked to 0-90 degrees",
        detail: "Northside DME Supply",
        date: "06/17/2026",
      },
      {
        type: "attachment",
        title: "Post-op knee radiograph report",
        detail: "XR_Right_Knee_Post_Op_06172026.pdf",
        file: "XR_Right_Knee_Post_Op_06172026.pdf",
        date: "06/17/2026",
      },
    ],
  },
  {
    id: "postop-wound-check",
    date: "05/13/2026",
    time: "8:45 AM",
    title: "ACL Tear Wound Check",
    provider: REFERRING_PROVIDER,
    status: "Completed",
    items: [
      { type: "order", title: "Suture removal", detail: "Hale Orthopedics", date: "05/13/2026" },
      {
        type: "order",
        title: "Physical therapy referral",
        detail: "2 visits per week for 12 weeks · Athelas Physical Therapy",
        date: "05/13/2026",
      },
      {
        type: "attachment",
        title: "PT referral",
        detail: "Ortho_PT_Referral_05132026.pdf",
        file: "Ortho_PT_Referral_05132026.pdf",
        date: "05/13/2026",
      },
      {
        type: "attachment",
        title: "PT authorization",
        detail: "Priority Health · 24 visits",
        file: "PT_Authorization_24_Visits_05182026.pdf",
        date: "05/18/2026",
      },
    ],
  },
  {
    id: "acl-reconstruction",
    date: "05/06/2026",
    time: "7:30 AM",
    title: "Right ACL Reconstruction - Outpatient Surgery",
    provider: REFERRING_PROVIDER,
    status: "Completed",
    items: [
      {
        type: "medication",
        title: "Oxycodone-Acetaminophen 5-325mg",
        detail: "20 tablets · No refills",
        date: "05/06/2026",
      },
      { type: "medication", title: "Aspirin 81mg tablet", detail: "56 tablets · No refills", date: "05/06/2026" },
      {
        type: "order",
        title: "Knee orthosis, elastic with joints",
        detail: "Northside DME Supply",
        date: "05/06/2026",
      },
      {
        type: "attachment",
        title: "Operative report",
        detail: "Operative_Report_ACLR_05062026.pdf",
        file: "Operative_Report_ACLR_05062026.pdf",
        date: "05/07/2026",
      },
      {
        type: "attachment",
        title: "Post-op protocol",
        detail: "Post_Op_Protocol_Weeks_0_12.pdf",
        file: "Post_Op_Protocol_Weeks_0_12.pdf",
        date: "05/07/2026",
      },
    ],
  },
  {
    id: "pre-op-visit",
    date: "04/29/2026",
    time: "2:00 PM",
    title: "ACL Tear Surgery Consultation",
    provider: REFERRING_PROVIDER,
    status: "Completed",
    items: [
      { type: "order", title: "Right knee arthrocentesis", detail: "Hale Orthopedics", date: "04/29/2026" },
      { type: "order", title: "Pre-operative laboratory panel", detail: "Athelas Core Lab", date: "04/29/2026" },
      {
        type: "attachment",
        title: "MRI addendum",
        detail: "MRI_Right_Knee_Addendum_04242026.pdf",
        file: "MRI_Right_Knee_Addendum_04242026.pdf",
        date: "04/24/2026",
      },
    ],
  },
  {
    id: "injury-evaluation",
    date: "04/18/2026",
    time: "5:30 PM",
    title: "Acute Knee Injury Evaluation",
    provider: REFERRING_PROVIDER,
    status: "Completed",
    items: [
      {
        type: "order",
        title: "Right knee radiographs",
        detail: "3 views · Riverside Imaging Center",
        date: "04/18/2026",
      },
      {
        type: "attachment",
        title: "Right knee X-ray",
        detail: "XR_Right_Knee_2_Views_04182026.pdf",
        file: "XR_Right_Knee_2_Views_04182026.pdf",
        date: "04/18/2026",
      },
      {
        type: "order",
        title: "MRI right knee without contrast",
        detail: "Riverside Imaging Center",
        date: "04/19/2026",
      },
      {
        type: "attachment",
        title: "Right knee MRI",
        detail: "MRI_Right_Knee_04222026.pdf",
        file: "MRI_Right_Knee_04222026.pdf",
        date: "04/22/2026",
      },
    ],
  },
] as const;
