import type { ReactNode } from "react";
import {
  ALLERGIES,
  CASE,
  ENCOUNTERS,
  MEDICATIONS,
  PAST_ORDERS,
  PATIENT,
  PRIOR_CASE,
  PROVIDER,
  REFERRING_PROVIDER,
  ASSOCIATE_PROVIDER,
} from "../../data/chart";

// Rendered at 2x the on-screen page size and scaled down by the viewer, so a
// PDF page preview stays crisp at any zoom level.
export const DOC_WIDTH = 744;
export const DOC_HEIGHT = 970;

type DocSection = {
  title: string;
  body?: ReactNode;
  items?: string[];
};

type AttachmentDoc = {
  idLabel: string;
  idValue: string;
  date: string;
  title: string;
  subtitle?: string;
  brand: string;
  brandSub: string;
  brandInitials: string;
  infoLeft: [string, string][];
  infoRight: [string, string][];
  sections: DocSection[];
  callout?: { title: string; tone: "blue" | "amber"; body: ReactNode };
  signedBy: string;
  signedRole: string;
  signedAt: string;
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-1.5">
      <span className="font-bold">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Section({ title, body, items }: DocSection) {
  return (
    <div className="flex w-full flex-col">
      <span className="text-[16px] font-bold text-[#1b83e4]">{title}</span>
      <div className="mt-1 border-t border-[#c9c9c9]" />
      {body ? <div className="mt-3 flex flex-col gap-2">{body}</div> : null}
      {items ? (
        <ul className="mt-3 list-disc space-y-1 pl-5">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

const DOCS: Record<string, AttachmentDoc> = {
  "MRI_Right_Knee_04222026.pdf": {
    idLabel: "Imaging Report ID",
    idValue: "MR-2026-0422-1847",
    date: "04/22/2026",
    title: "MRI RIGHT KNEE",
    subtitle: "Without Intravenous Contrast",
    brand: "Athelas Radiology",
    brandSub: "Diagnostic Imaging",
    brandInitials: "AR",
    infoLeft: [
      ["Patient Name", PATIENT.name],
      ["Date of Birth", PATIENT.dob],
      ["Exam", "MRI Right Knee Without Contrast"],
      ["Accession", "MR-2026-0422-1847"],
    ],
    infoRight: [
      ["Exam Date", "04/22/2026"],
      ["Ordering Provider", "Priya Raman, MD"],
      ["Study Status", "Final"],
      ["Clinical Indication", "Right knee injury"],
    ],
    sections: [
      {
        title: "CLINICAL HISTORY",
        body: (
          <p>
            Acute noncontact twisting injury of the right knee while playing soccer on {CASE.dateOfInjury}. Pain,
            swelling, instability, and inability to continue play. Evaluate for internal derangement.
          </p>
        ),
      },
      {
        title: "TECHNIQUE",
        body: <p>Multiplanar, multisequence MRI of the right knee was performed without intravenous contrast.</p>,
      },
      {
        title: "FINDINGS",
        body: (
          <>
            <p>
              <span className="font-bold">Menisci: </span>
              Complex vertical and radial tear involving the posterior horn of the medial meniscus with extension to
              the inferior articular surface. Lateral meniscus is intact.
            </p>
            <p>
              <span className="font-bold">Cruciate ligaments: </span>
              Full-thickness midsubstance tear of the anterior cruciate ligament with fiber discontinuity and abnormal
              horizontal orientation. Posterior cruciate ligament is intact.
            </p>
            <p>
              <span className="font-bold">Collateral ligaments: </span>
              Mild edema along the medial collateral ligament consistent with a grade 1 sprain. Lateral collateral
              ligament complex is intact.
            </p>
            <p>
              <span className="font-bold">Bone / cartilage: </span>
              Pivot-shift marrow contusions of the lateral femoral condyle and posterolateral tibial plateau. No
              displaced fracture.
            </p>
            <p>
              <span className="font-bold">Joint: </span>
              Moderate joint effusion. Small popliteal cyst.
            </p>
          </>
        ),
      },
    ],
    callout: {
      title: "IMPRESSION",
      tone: "blue",
      body: (
        <ol className="mt-2 list-decimal space-y-1 pl-5 font-bold">
          <li>Complete midsubstance tear of the anterior cruciate ligament.</li>
          <li>Complex tear of the posterior horn of the medial meniscus.</li>
          <li>Pivot-shift marrow contusions of the lateral femoral condyle and posterolateral tibial plateau.</li>
          <li>Grade 1 medial collateral ligament sprain and moderate joint effusion.</li>
        </ol>
      ),
    },
    signedBy: "Elena Park, MD",
    signedRole: "Board Certified Diagnostic Radiology",
    signedAt: "Finalized 04/22/2026 at 4:18 PM",
  },

  "MRI_Right_Knee_Addendum_04242026.pdf": {
    idLabel: "Imaging Report ID",
    idValue: "MR-2026-0422-1847-A1",
    date: "04/24/2026",
    title: "MRI RIGHT KNEE — ADDENDUM",
    subtitle: "Clarification of meniscal tear morphology",
    brand: "Athelas Radiology",
    brandSub: "Diagnostic Imaging",
    brandInitials: "AR",
    infoLeft: [
      ["Patient Name", PATIENT.name],
      ["Date of Birth", PATIENT.dob],
      ["Original Exam", "MRI Right Knee 04/22/2026"],
      ["Accession", "MR-2026-0422-1847"],
    ],
    infoRight: [
      ["Addendum Date", "04/24/2026"],
      ["Ordering Provider", "Marcus Hale, MD"],
      ["Study Status", "Final / Addended"],
      ["Reason", "Surgeon request"],
    ],
    sections: [
      {
        title: "ADDENDUM",
        body: (
          <p>
            At the request of Dr. Hale, the medial meniscal tear is further characterized as a complex vertical and
            radial tear of the posterior horn with a displaced flap fragment measuring approximately 6 mm. The tear
            communicates with both the superior and inferior articular surfaces. No bucket-handle fragment is
            identified in the intercondylar notch. The remainder of the original interpretation is unchanged.
          </p>
        ),
      },
      {
        title: "UPDATED IMPRESSION",
        items: [
          "Unchanged complete midsubstance ACL tear.",
          "Complex posterior horn medial meniscus tear with a 6 mm displaced flap fragment.",
          "Remainder of the 04/22/2026 report stands as written.",
        ],
      },
    ],
    signedBy: "Elena Park, MD",
    signedRole: "Board Certified Diagnostic Radiology",
    signedAt: "Addended 04/24/2026 at 9:42 AM",
  },

  "XR_Right_Knee_2_Views_04182026.pdf": {
    idLabel: "Imaging Report ID",
    idValue: "XR-2026-0418-0912",
    date: "04/18/2026",
    title: "X-RAY RIGHT KNEE",
    subtitle: "2 Views — AP and Lateral",
    brand: "Athelas Radiology",
    brandSub: "Diagnostic Imaging",
    brandInitials: "AR",
    infoLeft: [
      ["Patient Name", PATIENT.name],
      ["Date of Birth", PATIENT.dob],
      ["Exam", "XR Right Knee 2 Views"],
      ["Accession", "XR-2026-0418-0912"],
    ],
    infoRight: [
      ["Exam Date", "04/18/2026"],
      ["Ordering Provider", "Priya Raman, MD"],
      ["Study Status", "Final"],
      ["Clinical Indication", "Acute knee injury"],
    ],
    sections: [
      {
        title: "CLINICAL HISTORY",
        body: (
          <p>
            Acute right knee pain and swelling after a noncontact pivoting injury during soccer. Unable to bear weight.
            Rule out fracture.
          </p>
        ),
      },
      {
        title: "FINDINGS",
        body: (
          <>
            <p>
              AP and lateral radiographs of the right knee demonstrate moderate joint effusion. No acute fracture or
              dislocation. Alignment of the tibiofemoral and patellofemoral joints is maintained. Soft tissues are
              edematous. No radiopaque foreign body.
            </p>
            <p>
              A Segond-type cortical irregularity is not clearly identified. MRI is recommended if internal
              derangement is suspected.
            </p>
          </>
        ),
      },
    ],
    callout: {
      title: "IMPRESSION",
      tone: "blue",
      body: (
        <ol className="mt-2 list-decimal space-y-1 pl-5 font-bold">
          <li>Moderate right knee joint effusion without acute fracture or dislocation.</li>
          <li>Clinical correlation and MRI recommended for suspected ligamentous injury.</li>
        </ol>
      ),
    },
    signedBy: "James Okonkwo, MD",
    signedRole: "Emergency Radiology",
    signedAt: "Finalized 04/18/2026 at 8:51 PM",
  },

  "Operative_Report_ACLR_05062026.pdf": {
    idLabel: "Operative Report ID",
    idValue: "OR-2026-0506-ACL",
    date: "05/06/2026",
    title: "OPERATIVE REPORT",
    subtitle: "Right ACL Reconstruction with Hamstring Autograft",
    brand: "Hale Orthopedics",
    brandSub: "Surgical Services",
    brandInitials: "HO",
    infoLeft: [
      ["Patient Name", PATIENT.name],
      ["Date of Birth", PATIENT.dob],
      ["MRN", PATIENT.mrn],
      ["Surgeon", "Marcus Hale, MD"],
    ],
    infoRight: [
      ["Date of Surgery", CASE.surgeryDate],
      ["Facility", "Riverside Surgical Center"],
      ["Anesthesia", "General"],
      ["ASA Class", "I"],
    ],
    sections: [
      {
        title: "PREOPERATIVE DIAGNOSIS",
        body: <p>Complete tear of the right anterior cruciate ligament with medial meniscus tear.</p>,
      },
      {
        title: "POSTOPERATIVE DIAGNOSIS",
        body: <p>Same. Confirmed complete ACL rupture and complex posterior horn medial meniscus tear.</p>,
      },
      {
        title: "PROCEDURES PERFORMED",
        items: [
          "Arthroscopic right ACL reconstruction with semitendinosus autograft",
          "Partial medial meniscectomy",
          "Diagnostic arthroscopy of the right knee",
        ],
      },
      {
        title: "OPERATIVE FINDINGS",
        body: (
          <>
            <p>
              Examination under anesthesia demonstrated a grade 2+ Lachman and a positive pivot shift. Arthroscopy
              confirmed an empty wall sign at the femoral ACL footprint with midsubstance fiber disruption. The
              posterior horn of the medial meniscus had a complex irreparable tear involving approximately 30% of the
              meniscal width; unstable fragments were debrided to a stable rim. Articular cartilage was grade 0–1
              throughout. The lateral meniscus, PCL, and MCL were intact.
            </p>
            <p>
              Semitendinosus was harvested and prepared as a 4-strand graft measuring 8.5 mm. Femoral and tibial
              tunnels were drilled using an anteromedial portal technique. The graft was fixed with a cortical button
              on the femur and an interference screw on the tibia. Final tensioning was performed at 20 degrees of
              flexion. Stability testing showed a negative Lachman and elimination of the pivot shift.
            </p>
          </>
        ),
      },
      {
        title: "COMPLICATIONS / ESTIMATED BLOOD LOSS",
        body: <p>None. Estimated blood loss less than 50 mL. The patient was transferred to recovery in stable condition.</p>,
      },
    ],
    signedBy: "Marcus Hale, MD",
    signedRole: "Orthopedic Surgery — Sports Medicine",
    signedAt: "Electronically signed 05/07/2026 at 7:14 AM",
  },

  "Activity_Restrictions_05132026.pdf": {
    idLabel: "Document ID",
    idValue: "INST-2026-0513-ACLR",
    date: "05/13/2026",
    title: "ACTIVITY RESTRICTIONS",
    subtitle: "Post-Operative ACL Reconstruction",
    brand: "Hale Orthopedics",
    brandSub: "Sports Medicine",
    brandInitials: "HO",
    infoLeft: [
      ["Patient Name", PATIENT.name],
      ["Date of Birth", PATIENT.dob],
      ["Surgeon", PROVIDER.short],
      ["Diagnosis", CASE.diagnosisShort],
    ],
    infoRight: [
      ["Issued", "05/13/2026"],
      ["Surgery Date", CASE.surgeryDate],
      ["Weight Bearing", "As tolerated"],
      ["Brace", "Hinged knee brace"],
    ],
    sections: [
      {
        title: "ACTIVITY GUIDELINES",
        body: (
          <p>
            The following restrictions apply after right ACL reconstruction with semitendinosus autograft and partial
            medial meniscectomy performed on {CASE.surgeryDate}. Follow these guidelines until cleared at a future
            clinic visit.
          </p>
        ),
      },
      {
        title: "PRECAUTIONS",
        items: [
          "Hinged brace locked in extension for ambulation until the 2-week visit, then unlock 0–90°",
          "No open-chain terminal extension against resistance for 12 weeks",
          "Weight bearing as tolerated with crutches until gait is normalized",
          "No running, cutting, or pivoting until cleared by the surgical team",
        ],
      },
      {
        title: "GOALS BEFORE NEXT VISIT",
        items: [
          "Full extension and flexion to 120° by week 6",
          "Independent with daily home strengthening",
          "Progress closed-chain strengthening and neuromuscular control",
          "Prepare for return-to-run testing after week 12",
        ],
      },
    ],
    signedBy: ASSOCIATE_PROVIDER,
    signedRole: "Physician Assistant — Sports Medicine",
    signedAt: "Signed 05/13/2026 at 11:22 AM",
  },

  "Post_Op_Protocol_Weeks_0_12.pdf": {
    idLabel: "Protocol ID",
    idValue: "PROT-ACLR-0-12",
    date: "05/07/2026",
    title: "POST-OP ACL PROTOCOL",
    subtitle: "Weeks 0–12 — Hamstring Autograft",
    brand: "Hale Orthopedics",
    brandSub: "Rehabilitation Guidelines",
    brandInitials: "HO",
    infoLeft: [
      ["Patient Name", PATIENT.name],
      ["Procedure", "Right ACLR + partial medial meniscectomy"],
      ["Graft", "Semitendinosus autograft"],
      ["Surgeon", REFERRING_PROVIDER],
    ],
    infoRight: [
      ["Surgery Date", CASE.surgeryDate],
      ["Protocol Start", "05/07/2026"],
      ["Brace", "Hinged knee brace"],
      ["WB Status", "WBAT with crutches"],
    ],
    sections: [
      {
        title: "PHASE 1 — WEEKS 0–2",
        items: [
          "Goals: control swelling, protect graft, restore full extension",
          "Exercises: quad sets, SLR in brace, heel props, ankle pumps",
          "Brace locked in extension for gait; unlock for seated ROM",
        ],
      },
      {
        title: "PHASE 2 — WEEKS 2–6",
        items: [
          "Goals: 0–120° ROM, normalized gait without crutches",
          "Exercises: mini-squats, step-ups, stationary bike, gentle hamstring curls",
          "Begin closed-chain strengthening as swelling allows",
        ],
      },
      {
        title: "PHASE 3 — WEEKS 6–12",
        items: [
          "Goals: full ROM, progressive strength, single-leg control",
          "Exercises: leg press, lateral stepping, balance board, progressive closed-chain strengthening",
          "No running or cutting until cleared after week 12 testing",
        ],
      },
    ],
    signedBy: "Marcus Hale, MD",
    signedRole: "Protocol authored for Hale Orthopedics Sports Medicine",
    signedAt: "Distributed 05/07/2026",
  },

  "Patient_Intake_Questionnaire_04182026.pdf": {
    idLabel: "Form ID",
    idValue: "INTAKE-2026-0418",
    date: "04/18/2026",
    title: "PATIENT INTAKE QUESTIONNAIRE",
    subtitle: "Walk-In Injury Visit",
    brand: "Hale Orthopedics",
    brandSub: "Walk-In Injury Clinic",
    brandInitials: "HO",
    infoLeft: [
      ["Patient Name", PATIENT.name],
      ["Date of Birth", PATIENT.dob],
      ["MRN", PATIENT.mrn],
      ["Preferred Name", "Jordan"],
    ],
    infoRight: [
      ["Visit Date", CASE.dateOfInjury],
      ["Seen By", "Priya Raman MD"],
      ["Insurance", PATIENT.insurance],
      ["Emergency Contact", "Maya Reyes (spouse)"],
    ],
    sections: [
      {
        title: "CHIEF CONCERN",
        body: (
          <p>
            Right knee injury this afternoon during a recreational soccer match. Felt a pop while planting to change
            direction, could not continue play, and the knee swelled within an hour. Unable to bear full weight.
          </p>
        ),
      },
      {
        title: "CURRENT SYMPTOMS",
        items: [
          "Pain: 7/10 with any weight bearing, 4/10 at rest",
          "Swelling: rapid onset within the first hour",
          "Instability: knee feels like it will buckle when turning",
          "Locking or catching: none reported",
        ],
      },
      {
        title: "MEDICAL HISTORY",
        items: [
          "Allergies: Penicillin (severe), Latex (moderate), Shellfish (mild)",
          "Medications: none daily",
          `Prior care at this clinic: right lateral epicondylitis ${PRIOR_CASE.firstVisit} to ${PRIOR_CASE.dischargeDate}, resolved`,
          "No prior surgery. Hard of hearing — speak facing the patient",
        ],
      },
    ],
    signedBy: PATIENT.name,
    signedRole: "Patient attestation",
    signedAt: "Completed 04/18/2026 at 5:34 PM",
  },

  "Surgical_Consent_ACLR_04292026.pdf": {
    idLabel: "Consent ID",
    idValue: "CONS-2026-0429-ACL",
    date: "04/29/2026",
    title: "SURGICAL CONSENT",
    subtitle: "Right ACL Reconstruction with Hamstring Autograft",
    brand: "Hale Orthopedics",
    brandSub: "Surgical Services",
    brandInitials: "HO",
    infoLeft: [
      ["Patient Name", PATIENT.name],
      ["Date of Birth", PATIENT.dob],
      ["MRN", PATIENT.mrn],
      ["Surgeon", PROVIDER.display],
    ],
    infoRight: [
      ["Consent Date", "04/29/2026"],
      ["Planned Surgery", CASE.surgeryDate],
      ["Facility", "Riverside Surgical Center"],
      ["Laterality Confirmed", "Right"],
    ],
    sections: [
      {
        title: "PLANNED PROCEDURE",
        body: (
          <p>
            Arthroscopic right anterior cruciate ligament reconstruction using a semitendinosus autograft, with
            diagnostic arthroscopy and treatment of the posterior horn medial meniscus tear by repair or partial
            meniscectomy depending on the tear pattern found at the time of surgery.
          </p>
        ),
      },
      {
        title: "RISKS DISCUSSED",
        items: [
          "Bleeding, infection, and reaction to anesthesia",
          "Graft failure or recurrent instability requiring revision",
          "Persistent stiffness, quadriceps weakness, or kneeling discomfort",
          "Deep vein thrombosis, nerve or vessel injury, and hardware irritation",
        ],
      },
      {
        title: "ALTERNATIVES AND EXPECTATIONS",
        items: [
          "Alternative: continued bracing and strengthening without reconstruction",
          "Expected recovery of 9 to 12 months before return to cutting sports",
          "Functional testing criteria must be met before clearance for contact sport",
          "Patient questions answered and understanding confirmed in clinic",
        ],
      },
    ],
    callout: {
      title: "PATIENT ATTESTATION",
      tone: "amber",
      body: (
        <p className="mt-2">
          I have read this consent, discussed the procedure, risks, and alternatives with {PROVIDER.display}, and I
          authorize the operation on my right knee.
        </p>
      ),
    },
    signedBy: PATIENT.name,
    signedRole: `Countersigned by ${PROVIDER.display}`,
    signedAt: "Signed 04/29/2026 at 3:02 PM",
  },

  "PreOp_HP_05042026.pdf": {
    idLabel: "Encounter ID",
    idValue: "HP-2026-0504-ACL",
    date: "05/04/2026",
    title: "PRE-OPERATIVE HISTORY & PHYSICAL",
    subtitle: "Clearance for Right ACL Reconstruction",
    brand: "Hale Orthopedics",
    brandSub: "Sports Medicine",
    brandInitials: "HO",
    infoLeft: [
      ["Patient Name", PATIENT.name],
      ["Date of Birth", PATIENT.dob],
      ["MRN", PATIENT.mrn],
      ["Provider", ASSOCIATE_PROVIDER],
    ],
    infoRight: [
      ["Visit Date", "05/04/2026"],
      ["Surgery Date", CASE.surgeryDate],
      ["ASA Class", "I"],
      ["Clearance", "Cleared"],
    ],
    sections: [
      {
        title: "HISTORY",
        body: (
          <p>
            28-year-old man scheduled for right ACL reconstruction on {CASE.surgeryDate} after a noncontact pivoting
            injury on {CASE.dateOfInjury}. MRI confirmed a complete ACL tear with a posterior horn medial meniscus
            tear. No cardiopulmonary history, no prior anesthesia, and no bleeding disorder. Naproxen was discontinued
            at the surgical consult.
          </p>
        ),
      },
      {
        title: "EXAMINATION",
        body: (
          <>
            <p>
              <span className="font-bold">Vitals: </span>
              BP 118/74, HR 62, RR 14, SpO2 99% on room air, BMI 24.1.
            </p>
            <p>
              <span className="font-bold">Right knee: </span>
              Trace effusion after aspiration, ROM 5-125 degrees, grade 2 Lachman, positive pivot shift, medial joint
              line tenderness.
            </p>
            <p>
              <span className="font-bold">General: </span>
              Heart regular without murmur, lungs clear, airway Mallampati II, distal pulses intact.
            </p>
          </>
        ),
      },
      {
        title: "PRE-OPERATIVE PLAN",
        items: [
          "Laboratory panel drawn today at Athelas Core Lab; results within normal limits",
          "Hinged knee orthosis and crutches dispensed and fitted",
          "Nothing by mouth after midnight; arrive two hours before the scheduled start",
          "Penicillin allergy documented — cefazolin avoided, clindamycin selected for prophylaxis",
        ],
      },
    ],
    callout: {
      title: "ASSESSMENT",
      tone: "blue",
      body: (
        <p className="mt-2">
          Healthy patient cleared for outpatient arthroscopic ACL reconstruction under general anesthesia. No further
          pre-operative testing indicated.
        </p>
      ),
    },
    signedBy: ASSOCIATE_PROVIDER,
    signedRole: "Physician Assistant — Sports Medicine",
    signedAt: "Signed 05/04/2026 at 9:26 AM",
  },

  "Work_Status_Note_05202026.pdf": {
    idLabel: "Document ID",
    idValue: "WORK-2026-0520",
    date: "05/20/2026",
    title: "WORK STATUS NOTE",
    subtitle: "Modified Duty After Knee Surgery",
    brand: "Hale Orthopedics",
    brandSub: "Sports Medicine",
    brandInitials: "HO",
    infoLeft: [
      ["Patient Name", PATIENT.name],
      ["Date of Birth", PATIENT.dob],
      ["Employer", "Cascade Logistics"],
      ["Provider", PROVIDER.display],
    ],
    infoRight: [
      ["Issued", "05/20/2026"],
      ["Surgery Date", CASE.surgeryDate],
      ["Status", "Modified duty"],
      ["Recheck", "06/17/2026"],
    ],
    sections: [
      {
        title: "WORK STATUS",
        body: (
          <p>
            {PATIENT.name} underwent right ACL reconstruction on {CASE.surgeryDate} and is two weeks post-operative.
            He may return to work on modified duty effective 05/26/2026 with the restrictions below until his next
            evaluation.
          </p>
        ),
      },
      {
        title: "RESTRICTIONS",
        items: [
          "Seated work with the leg elevated as needed; stand no more than 15 minutes per hour",
          "No lifting over 20 pounds and no carrying while using crutches",
          "No ladders, uneven ground, kneeling, squatting, or driving a company vehicle",
          "Hinged knee brace to be worn during all work hours",
        ],
      },
      {
        title: "NOTES TO EMPLOYER",
        body: (
          <p>
            These restrictions are expected to ease after the six-week post-operative evaluation. Please contact the
            clinic with questions about accommodation. No further documentation is required for this period.
          </p>
        ),
      },
    ],
    signedBy: PROVIDER.display,
    signedRole: "Orthopedic Surgery — Sports Medicine",
    signedAt: "Signed 05/20/2026 at 10:02 AM",
  },

  "IKDC_Outcome_Survey_06172026.pdf": {
    idLabel: "Outcome ID",
    idValue: "IKDC-2026-0617",
    date: "06/17/2026",
    title: "IKDC SUBJECTIVE KNEE FORM",
    subtitle: "Week 6 Outcome Measure",
    brand: "Hale Orthopedics",
    brandSub: "Sports Medicine Outcomes",
    brandInitials: "HO",
    infoLeft: [
      ["Patient Name", PATIENT.name],
      ["Date of Birth", PATIENT.dob],
      ["Involved Side", "Right"],
      ["Administered By", PROVIDER.short],
    ],
    infoRight: [
      ["Survey Date", "06/17/2026"],
      ["Weeks Post-Op", "6"],
      ["Prior Score", "Not collected"],
      ["Current Score", "48.3"],
    ],
    sections: [
      {
        title: "SUMMARY",
        body: (
          <p>
            {PATIENT.name} completed the IKDC Subjective Knee Evaluation Form at his six-week post-operative visit. The
            raw score of 42 / 87 converts to an IKDC percentage of <span className="font-bold">48.3%</span>, which
            establishes the baseline for this episode of care.
          </p>
        ),
      },
      {
        title: "SELECTED RESPONSES",
        items: [
          "Highest activity without significant pain: Walking on level ground",
          "Pain frequency over the past 4 weeks: Weekly",
          "Knee stiffness / swelling: Moderate, worse in the morning",
          "Giving way: Never since surgery",
          "Difficulty with stairs: Moderate",
          "Difficulty with kneeling: Extreme",
        ],
      },
      {
        title: "CLINICIAN NOTES",
        body: (
          <p>
            Scores are consistent with expected six-week limitations after hamstring autograft reconstruction.
            Extension lag and quadriceps inhibition are the main drivers. Repeat at the twelve-week visit.
          </p>
        ),
      },
    ],
    signedBy: PROVIDER.display,
    signedRole: "Scored and reviewed",
    signedAt: "Documented 06/17/2026 at 11:32 AM",
  },

  "IKDC_Outcome_Survey_07272026.pdf": {
    idLabel: "Outcome ID",
    idValue: "IKDC-2026-0727",
    date: "07/27/2026",
    title: "IKDC SUBJECTIVE KNEE FORM",
    subtitle: "Week 12 Outcome Measure",
    brand: "Hale Orthopedics",
    brandSub: "Sports Medicine Outcomes",
    brandInitials: "HO",
    infoLeft: [
      ["Patient Name", PATIENT.name],
      ["Date of Birth", PATIENT.dob],
      ["Involved Side", "Right"],
      ["Administered By", PROVIDER.short],
    ],
    infoRight: [
      ["Survey Date", "07/27/2026"],
      ["Weeks Post-Op", "12"],
      ["Prior Score", "48.3 (Week 6)"],
      ["Current Score", "71.3"],
    ],
    sections: [
      {
        title: "SUMMARY",
        body: (
          <p>
            {PATIENT.name} completed the IKDC Subjective Knee Evaluation Form at week 12. The raw score of 62 / 87
            converts to an IKDC percentage of <span className="font-bold">71.3%</span>, improved from 48.3% at week 6.
          </p>
        ),
      },
      {
        title: "SELECTED RESPONSES",
        items: [
          "Highest activity without significant pain: Brisk walking and stationary cycling",
          "Pain frequency over the past 4 weeks: Monthly",
          "Knee stiffness / swelling: Mild after activity",
          "Giving way: Never since surgery",
          "Difficulty with stairs: Mild",
          "Difficulty with kneeling: Moderate",
        ],
      },
      {
        title: "CLINICIAN NOTES",
        body: (
          <p>
            The 23-point gain exceeds the minimal clinically important difference and tracks with gains in extension
            and quadriceps strength. Remaining limitations are deceleration confidence and single-leg hop symmetry,
            consistent with the current recovery phase.
          </p>
        ),
      },
    ],
    signedBy: PROVIDER.display,
    signedRole: "Scored and reviewed",
    signedAt: "Documented 07/27/2026 at 10:40 AM",
  },

  "DME_Authorization_Knee_Brace_05182026.pdf": {
    idLabel: "Auth ID",
    idValue: "AUTH-PH-551829",
    date: "05/18/2026",
    title: "PRIOR AUTHORIZATION",
    subtitle: "Knee Orthosis — Hinged Brace",
    brand: "Priority Health",
    brandSub: "Utilization Management",
    brandInitials: "PH",
    infoLeft: [
      ["Member Name", PATIENT.name],
      ["Member ID", "PH-88201473"],
      ["Date of Birth", PATIENT.dob],
      ["Group", "Employer PPO"],
    ],
    infoRight: [
      ["Auth Number", "AUTH-PH-551829"],
      ["Decision Date", "05/18/2026"],
      ["Effective", "05/06/2026 – 08/06/2026"],
      ["Status", "Approved"],
    ],
    sections: [
      {
        title: "AUTHORIZED SERVICES",
        body: (
          <>
            <p>
              Priority Health has approved a <span className="font-bold">hinged knee orthosis</span> for diagnosis{" "}
              {CASE.diagnosisShort} related to right ACL reconstruction.
            </p>
            <p>Rendering facility: Northside DME Supply. Ordering provider: {PROVIDER.display}.</p>
          </>
        ),
      },
      {
        title: "CONDITIONS",
        items: [
          "Brace rental or purchase must occur between 05/06/2026 and 08/06/2026",
          "Additional DME requires a concurrent review with updated clinical notes",
          "Member responsibility applies per plan benefits",
          "This authorization is not a guarantee of payment",
        ],
      },
    ],
    callout: {
      title: "DECISION",
      tone: "amber",
      body: (
        <p className="mt-2 font-bold">
          Approved — hinged knee brace. Reference AUTH-PH-551829 on all claims and DME documentation.
        </p>
      ),
    },
    signedBy: "Priority Health UM Review",
    signedRole: "Automated determination letter",
    signedAt: "Issued 05/18/2026 at 2:06 PM",
  },

  "Activity_Progression_Handout_07272026.pdf": {
    idLabel: "Handout ID",
    idValue: "ACT-W12-2026-0727",
    date: "07/27/2026",
    title: "ACTIVITY PROGRESSION",
    subtitle: "Week 12 — Strength & Control",
    brand: "Hale Orthopedics",
    brandSub: "Patient Handout",
    brandInitials: "HO",
    infoLeft: [
      ["Patient Name", PATIENT.name],
      ["Provider", PROVIDER.short],
      ["Side", "Right knee"],
      ["Phase", "Week 12 post-ACLR"],
    ],
    infoRight: [
      ["Issued", "07/27/2026"],
      ["Frequency", "5 days / week"],
      ["Session Length", "35–45 minutes"],
      ["Next Review", "08/10/2026"],
    ],
    sections: [
      {
        title: "STRENGTH",
        items: [
          "Spanish squat iso holds — 3 x 45 sec",
          "Single-leg press (involved) — 3 x 10",
          "Side-lying hip abduction with band — 3 x 15",
          "Nordic hamstring eccentrics (assisted) — 3 x 6",
        ],
      },
      {
        title: "CONTROL / PLYOMETRIC PREP",
        items: [
          "Single-leg balance on foam — 3 x 45 sec",
          "Step-down from 6-inch box — 3 x 10",
          "Lateral band walks — 3 x 20 steps each way",
          "Wall sit with ball squeeze — 3 x 45 sec",
        ],
      },
      {
        title: "GUIDELINES",
        body: (
          <p>
            Stop any exercise that increases swelling lasting more than 12 hours or that recreates sharp medial joint
            pain. Ice 10–15 minutes after sessions. Bring this sheet to the next clinic visit for progression to light
            jogging drills.
          </p>
        ),
      },
    ],
    signedBy: PROVIDER.display,
    signedRole: "Activity guidelines prescribed",
    signedAt: "Issued 07/27/2026",
  },

  "Plan_of_Care_08102026.pdf": {
    idLabel: "Document ID",
    idValue: "PLAN-2026-0810-4471",
    date: CASE.visitDateLong,
    title: "VISIT PLAN",
    subtitle: "14-Week Post-ACL Follow-Up",
    brand: "Hale Orthopedics",
    brandSub: "Sports Medicine",
    brandInitials: "HO",
    infoLeft: [
      ["Patient Name", PATIENT.name],
      ["Date of Birth", PATIENT.dob],
      ["Provider", PROVIDER.display],
      ["Diagnosis", CASE.diagnosisShort],
    ],
    infoRight: [
      ["Visit Date", CASE.visitDateLong],
      ["Visit #", CASE.visitNumber],
      ["First Visit", CASE.initialEval],
      ["Next Follow-Up", CASE.nextFollowUp],
    ],
    sections: [
      {
        title: "PLAN",
        body: (
          <>
            <p className="font-bold">I have recommended the following plan:</p>
            <p className="font-bold italic">
              {PATIENT.name} will continue home strengthening, begin a supervised return-to-run progression, and return
              to Hale Orthopedics on {CASE.nextFollowUp} for functional return-to-sport testing.
            </p>
          </>
        ),
      },
    ],
    callout: {
      title: "Addendum Information",
      tone: "amber",
      body: (
        <div className="mt-2 flex flex-col gap-1">
          <InfoRow label="Reason For Addendum:" value="Cleared for jogging progression at week 14" />
          <InfoRow label="Created By:" value={`${PROVIDER.short} (08/10/2026 11:50AM)`} />
          <InfoRow label="Finalized By:" value={`${PROVIDER.short} (08/10/2026 12:05PM)`} />
        </div>
      ),
    },
    signedBy: PROVIDER.display,
    signedRole: PROVIDER.license,
    signedAt: "Signed: 2026-08-10 12:57 PM PDT",
  },

  "Ortho_Followup_14wk_08102026.pdf": {
    idLabel: "Office Note ID",
    idValue: "ON-2026-0810-4471",
    date: "08/10/2026",
    title: "ORTHOPEDIC FOLLOW-UP NOTE",
    subtitle: "Right Knee — Post ACL Reconstruction",
    brand: "Hale Orthopedics",
    brandSub: "Sports Medicine",
    brandInitials: "HO",
    infoLeft: [
      ["Patient Name", PATIENT.name],
      ["Date of Birth", PATIENT.dob],
      ["MRN", PATIENT.mrn],
      ["Diagnosis", CASE.diagnosisShort],
    ],
    infoRight: [
      ["Visit Date", "08/10/2026"],
      ["Provider", REFERRING_PROVIDER],
      ["Surgery Date", CASE.surgeryDate],
      ["Side", "Right"],
    ],
    sections: [
      {
        title: "SUBJECTIVE",
        body: (
          <p>
            Patient returns for routine follow-up after right ACL reconstruction with hamstring autograft. He reports a
            3/10 medial joint line ache after walking more than 30 minutes and tightness with stairs. No giving way,
            locking, or new effusion. He is compliant with his home strengthening program and activity guidelines.
          </p>
        ),
      },
      {
        title: "EXAMINATION",
        body: (
          <>
            <p>
              <span className="font-bold">Inspection: </span>
              Incisions well healed. Trace effusion. No warmth or erythema.
            </p>
            <p>
              <span className="font-bold">Range of motion: </span>
              Right knee 3-132 degrees, left knee 0-140 degrees.
            </p>
            <p>
              <span className="font-bold">Stability: </span>
              Lachman firm endpoint, negative pivot shift, negative anterior drawer.
            </p>
            <p>
              <span className="font-bold">Strength: </span>
              Quadriceps index 78 percent by handheld dynamometry. Single-leg hop symmetry 81 percent.
            </p>
          </>
        ),
      },
      {
        title: "PLAN",
        items: [
          "Continue home strengthening with progression to plyometrics",
          "Functional return-to-sport testing ordered for week 20",
          "Continue meloxicam as needed for activity-related soreness",
          "No cutting, pivoting, or contact sport until testing criteria are met",
        ],
      },
    ],
    callout: {
      title: "ASSESSMENT",
      tone: "blue",
      body: (
        <p className="mt-2">
          14 weeks status post right ACL reconstruction, progressing on schedule. Residual quadriceps deficit of 22
          percent is the primary limiting factor for return to sport.
        </p>
      ),
    },
    signedBy: REFERRING_PROVIDER,
    signedRole: "Orthopedic Surgery, Sports Medicine",
    signedAt: "Signed 08/10/2026 09:58 AM",
  },

  "XR_Right_Elbow_2_Views_08252025.pdf": {
    idLabel: "Imaging Report ID",
    idValue: "XR-2025-0825-1140",
    date: "08/25/2025",
    title: "X-RAY RIGHT ELBOW",
    subtitle: "2 Views — AP and Lateral",
    brand: "Athelas Radiology",
    brandSub: "Diagnostic Imaging",
    brandInitials: "AR",
    infoLeft: [
      ["Patient Name", PATIENT.name],
      ["Date of Birth", PATIENT.dob],
      ["Exam", "XR Right Elbow 2 Views"],
      ["Accession", "XR-2025-0825-1140"],
    ],
    infoRight: [
      ["Exam Date", "08/25/2025"],
      ["Ordering Provider", PROVIDER.display],
      ["Study Status", "Final"],
      ["Clinical Indication", "Lateral elbow pain"],
    ],
    sections: [
      {
        title: "CLINICAL HISTORY",
        body: (
          <p>
            Six weeks of right lateral elbow pain worse with gripping and lifting. No acute trauma. Evaluate for bony
            abnormality or calcification.
          </p>
        ),
      },
      {
        title: "FINDINGS",
        body: (
          <>
            <p>
              No acute fracture, dislocation, or joint effusion. Small enthesophyte at the lateral epicondyle at the
              common extensor tendon origin. No loose body within the joint.
            </p>
            <p>
              Radiocapitellar and ulnohumeral alignment is preserved. Joint spaces are maintained without erosive or
              degenerative change. Soft tissues are unremarkable.
            </p>
          </>
        ),
      },
    ],
    callout: {
      title: "IMPRESSION",
      tone: "blue",
      body: (
        <ol className="mt-2 list-decimal space-y-1 pl-5 font-bold">
          <li>No acute osseous abnormality of the right elbow.</li>
          <li>Small lateral epicondylar enthesophyte, compatible with common extensor tendinopathy.</li>
        </ol>
      ),
    },
    signedBy: "Elena Park, MD",
    signedRole: "Board Certified Diagnostic Radiology",
    signedAt: "Finalized 08/25/2025 at 12:06 PM",
  },

  "Patient_Intake_Questionnaire_08252025.pdf": {
    idLabel: "Form ID",
    idValue: "INTAKE-2025-0825",
    date: "08/25/2025",
    title: "PATIENT INTAKE QUESTIONNAIRE",
    subtitle: "New Patient Elbow Consultation",
    brand: "Hale Orthopedics",
    brandSub: "Upper Extremity",
    brandInitials: "HO",
    infoLeft: [
      ["Patient Name", PATIENT.name],
      ["Date of Birth", PATIENT.dob],
      ["MRN", PATIENT.mrn],
      ["Preferred Name", "Jordan"],
    ],
    infoRight: [
      ["Visit Date", PRIOR_CASE.firstVisit],
      ["Seen By", PROVIDER.short],
      ["Insurance", PATIENT.insurance],
      ["Referred By", "Bayview Family Medicine"],
    ],
    sections: [
      {
        title: "CHIEF CONCERN",
        body: (
          <p>
            Right outer elbow pain for about six weeks. Started after a weekend of moving boxes and has not settled
            with rest. Hurts most when gripping tools, carrying groceries, or lifting a coffee cup.
          </p>
        ),
      },
      {
        title: "CURRENT SYMPTOMS",
        items: [
          "Pain: 5/10 with gripping, 2/10 at rest",
          "Location: outer elbow, occasionally radiating into the forearm",
          "Numbness or tingling: none",
          "Aggravating factors: lifting with the palm down, shaking hands, using a screwdriver",
        ],
      },
      {
        title: "MEDICAL HISTORY",
        items: [
          "Allergies: Penicillin (severe), Latex (moderate), Shellfish (mild)",
          "Medications: occasional ibuprofen from the store",
          "Prior injuries or surgery: none",
          "Hard of hearing — speak facing the patient",
        ],
      },
    ],
    signedBy: PATIENT.name,
    signedRole: "Patient attestation",
    signedAt: "Completed 08/25/2025 at 10:18 AM",
  },

  "Elbow_Home_Program_08252025.pdf": {
    idLabel: "Handout ID",
    idValue: "ELB-HOME-2025-0825",
    date: "08/25/2025",
    title: "ELBOW HOME PROGRAM",
    subtitle: "Lateral Epicondylitis — Loading Program",
    brand: "Hale Orthopedics",
    brandSub: "Patient Handout",
    brandInitials: "HO",
    infoLeft: [
      ["Patient Name", PATIENT.name],
      ["Provider", PROVIDER.short],
      ["Side", "Right elbow"],
      ["Diagnosis", PRIOR_CASE.diagnosisShort],
    ],
    infoRight: [
      ["Issued", "08/25/2025"],
      ["Frequency", "Daily"],
      ["Session Length", "10–15 minutes"],
      ["Next Review", "09/22/2025"],
    ],
    sections: [
      {
        title: "LOADING EXERCISES",
        items: [
          "Eccentric wrist extension with a 2 lb weight — 3 x 15, lowering over 3 seconds",
          "Forearm supination and pronation with a hammer — 3 x 15 each direction",
          "Towel wring isometric hold — 3 x 30 sec",
          "Grip squeeze with a soft ball — 3 x 20",
        ],
      },
      {
        title: "MOBILITY AND RECOVERY",
        items: [
          "Wrist flexor and extensor stretch — 3 x 30 sec, elbow straight",
          "Ice massage over the outer elbow for 10 minutes after loading",
          "Wear the counterforce brace during gripping and lifting tasks",
        ],
      },
      {
        title: "GUIDELINES",
        body: (
          <p>
            Discomfort up to 4/10 during loading is expected and acceptable. Stop and call the clinic if pain lingers
            above 5/10 the next morning. Avoid palm-down lifting and heavy tool use for the next four weeks. Expect
            gradual improvement over six to twelve weeks.
          </p>
        ),
      },
    ],
    signedBy: PROVIDER.display,
    signedRole: "Home program prescribed",
    signedAt: "Issued 08/25/2025",
  },

  "Procedure_Note_Elbow_Injection_09222025.pdf": {
    idLabel: "Procedure Note ID",
    idValue: "PROC-2025-0922-ELB",
    date: "09/22/2025",
    title: "PROCEDURE NOTE",
    subtitle: "Right Lateral Elbow Corticosteroid Injection",
    brand: "Hale Orthopedics",
    brandSub: "Upper Extremity",
    brandInitials: "HO",
    infoLeft: [
      ["Patient Name", PATIENT.name],
      ["Date of Birth", PATIENT.dob],
      ["MRN", PATIENT.mrn],
      ["Performed By", ASSOCIATE_PROVIDER],
    ],
    infoRight: [
      ["Procedure Date", "09/22/2025"],
      ["Site", "Right lateral epicondyle"],
      ["Consent", "Verbal, documented"],
      ["Diagnosis", PRIOR_CASE.diagnosisShort],
    ],
    sections: [
      {
        title: "INDICATION",
        body: (
          <p>
            Four weeks of continued right lateral elbow pain despite a counterforce brace, activity modification, a
            daily eccentric loading program, and a completed naproxen course. Pain remains 5/10 with gripping and
            limits work tasks.
          </p>
        ),
      },
      {
        title: "PROCEDURE",
        body: (
          <>
            <p>
              The lateral epicondyle was identified by palpation at the point of maximal tenderness and marked. The
              skin was prepared with chlorhexidine and anesthetized with 1% lidocaine without epinephrine.
            </p>
            <p>
              Using a 25-gauge needle and a peppering technique at the common extensor origin, 1 mL of triamcinolone
              acetonide 40 mg/mL was injected with 1 mL of 1% lidocaine. The patient tolerated the procedure well.
              A bandage was applied. No immediate complications and no bleeding.
            </p>
          </>
        ),
      },
      {
        title: "POST-PROCEDURE INSTRUCTIONS",
        items: [
          "Relative rest from gripping and lifting for 72 hours",
          "Expect a post-injection flare for 24 to 48 hours; ice as needed",
          "Resume the eccentric loading program on day 4 and continue the brace",
          "Return in six weeks, or sooner for fever, spreading redness, or worsening pain",
        ],
      },
    ],
    signedBy: ASSOCIATE_PROVIDER,
    signedRole: "Physician Assistant — Upper Extremity",
    signedAt: "Signed 09/22/2025 at 3:52 PM",
  },

  "QuickDASH_Outcome_11032025.pdf": {
    idLabel: "Outcome ID",
    idValue: "QDASH-2025-1103",
    date: "11/03/2025",
    title: "QUICKDASH OUTCOME MEASURE",
    subtitle: "Post-Injection Follow Up — Right Elbow",
    brand: "Hale Orthopedics",
    brandSub: "Upper Extremity Outcomes",
    brandInitials: "HO",
    infoLeft: [
      ["Patient Name", PATIENT.name],
      ["Date of Birth", PATIENT.dob],
      ["Involved Side", "Right"],
      ["Administered By", PROVIDER.short],
    ],
    infoRight: [
      ["Survey Date", "11/03/2025"],
      ["Weeks Post-Injection", "6"],
      ["Prior Score", "45.5 (08/25/2025)"],
      ["Current Score", "9.1"],
    ],
    sections: [
      {
        title: "SUMMARY",
        body: (
          <p>
            {PATIENT.name} completed the QuickDASH six weeks after the lateral elbow injection. The score improved from{" "}
            <span className="font-bold">45.5</span> at the new patient visit to <span className="font-bold">9.1</span>,
            a change well beyond the minimal clinically important difference.
          </p>
        ),
      },
      {
        title: "SELECTED RESPONSES",
        items: [
          "Opening a tight jar: mild difficulty",
          "Carrying a shopping bag or briefcase: no difficulty",
          "Heavy household chores: mild difficulty",
          "Pain at rest: none",
          "Tingling or numbness: none",
          "Work or hobby limitation: minimal",
        ],
      },
      {
        title: "CLINICIAN NOTES",
        body: (
          <p>
            Reports roughly 80% improvement since the injection with no recurrence during work tasks. Continue the
            eccentric loading program and taper brace use. Return as needed rather than on a fixed interval.
          </p>
        ),
      },
    ],
    signedBy: PROVIDER.display,
    signedRole: "Scored and reviewed",
    signedAt: "Documented 11/03/2025 at 10:04 AM",
  },

  "Discharge_Summary_Elbow_12152025.pdf": {
    idLabel: "Document ID",
    idValue: "DISCH-2025-1215-ELB",
    date: "12/15/2025",
    title: "DISCHARGE SUMMARY",
    subtitle: "Right Lateral Epicondylitis — Episode Closed",
    brand: "Hale Orthopedics",
    brandSub: "Upper Extremity",
    brandInitials: "HO",
    infoLeft: [
      ["Patient Name", PATIENT.name],
      ["Date of Birth", PATIENT.dob],
      ["MRN", PATIENT.mrn],
      ["Provider", ASSOCIATE_PROVIDER],
    ],
    infoRight: [
      ["Discharge Date", PRIOR_CASE.dischargeDate],
      ["Episode Start", PRIOR_CASE.firstVisit],
      ["Visits", "4"],
      ["Diagnosis", PRIOR_CASE.diagnosisShort],
    ],
    sections: [
      {
        title: "COURSE OF CARE",
        body: (
          <p>
            {PATIENT.name} presented on {PRIOR_CASE.firstVisit} with six weeks of right lateral elbow pain and
            examination findings consistent with common extensor tendinopathy. Radiographs showed only a small lateral
            epicondylar enthesophyte. He was managed with a counterforce brace, activity modification, a daily
            eccentric loading program, and a 14-day naproxen course.
          </p>
        ),
      },
      {
        title: "INTERVENTIONS AND RESPONSE",
        items: [
          "08/25/2025 — Brace, home loading program, naproxen 500 mg twice daily for 14 days",
          "09/22/2025 — Lateral epicondyle corticosteroid injection for persistent symptoms",
          "11/03/2025 — QuickDASH improved from 45.5 to 9.1; roughly 80% symptom relief",
          "12/15/2025 — Pain free with gripping and lifting; full strength and motion restored",
        ],
      },
      {
        title: "STATUS AT DISCHARGE",
        items: [
          "No tenderness at the lateral epicondyle, negative resisted wrist extension",
          "Grip strength symmetric with the left side by dynamometry",
          "Returned to unrestricted work and recreational activity",
          "Continue the loading program twice weekly for maintenance",
        ],
      },
    ],
    callout: {
      title: "DISPOSITION",
      tone: "blue",
      body: (
        <p className="mt-2">
          Episode of care closed as resolved. Released from scheduled follow-up with instructions to return as needed
          if symptoms recur.
        </p>
      ),
    },
    signedBy: ASSOCIATE_PROVIDER,
    signedRole: "Physician Assistant — Upper Extremity",
    signedAt: "Signed 12/15/2025 at 4:38 PM",
  },

  "XR_Right_Knee_Post_Op_06172026.pdf": {
    idLabel: "Imaging Report ID",
    idValue: "XR-2026-0617-2290",
    date: "06/17/2026",
    title: "X-RAY RIGHT KNEE",
    subtitle: "Post-Operative — 2 Views",
    brand: "Athelas Radiology",
    brandSub: "Diagnostic Imaging",
    brandInitials: "AR",
    infoLeft: [
      ["Patient Name", PATIENT.name],
      ["Date of Birth", PATIENT.dob],
      ["Exam", "Right Knee, AP and Lateral"],
      ["Accession", "XR-2026-0617-2290"],
    ],
    infoRight: [
      ["Exam Date", "06/17/2026"],
      ["Ordering Provider", REFERRING_PROVIDER],
      ["Study Status", "Final"],
      ["Clinical Indication", "Post-operative surveillance"],
    ],
    sections: [
      {
        title: "CLINICAL HISTORY",
        body: (
          <p>
            Six weeks status post right ACL reconstruction with semitendinosus autograft and partial medial
            meniscectomy. Routine post-operative radiographs.
          </p>
        ),
      },
      {
        title: "FINDINGS",
        body: (
          <>
            <p>
              <span className="font-bold">Hardware: </span>
              Tibial and femoral fixation devices are in expected position without migration or loosening.
            </p>
            <p>
              <span className="font-bold">Tunnels: </span>
              Femoral and tibial tunnels are appropriately positioned with no widening.
            </p>
            <p>
              <span className="font-bold">Alignment / bone: </span>
              Anatomic alignment maintained. No fracture, no periprosthetic lucency, joint spaces preserved.
            </p>
            <p>
              <span className="font-bold">Soft tissue: </span>
              Small residual suprapatellar effusion, decreased from the immediate post-operative study.
            </p>
          </>
        ),
      },
    ],
    callout: {
      title: "IMPRESSION",
      tone: "blue",
      body: (
        <p className="mt-2">
          Expected post-operative appearance six weeks after right ACL reconstruction. Fixation intact and well
          positioned. No acute osseous abnormality.
        </p>
      ),
    },
    signedBy: "Elena Park, MD",
    signedRole: "Diagnostic Radiology",
    signedAt: "Signed 06/17/2026 02:11 PM",
  },
};

const ALLERGY_SUMMARY = ALLERGIES.map((allergy) => allergy.name).join(", ");

type TimelineEntry = { title: string; detail: string; date: string };
type TimelineVisit = { caseName: string; visitType: string; provider: string };

// Orders and prescriptions have no stored file in the chart, so their page is
// generated from the timeline entry that created them.
export function timelineDocKey(item: { type: string; title: string; date: string }) {
  return `${item.type}::${item.title}::${item.date}`;
}

function documentNumber(prefix: string, date: string) {
  const [month, day, year] = date.split("/");
  return `${prefix}-${year}-${month}${day}`;
}

// Requisitions and prescriptions span two episodes of care and, within the knee
// case, both sides of the operation, so the indication has to follow the date.
function clinicalIndication(caseName: string, date: string) {
  if (caseName === PRIOR_CASE.name) {
    return `${PRIOR_CASE.diagnosisShort}. Symptom onset ${PRIOR_CASE.onset} with lateral elbow pain on gripping and resisted wrist extension. Managed conservatively at Hale Orthopedics.`;
  }
  if (new Date(date) < new Date(CASE.surgeryDate)) {
    return `Acute right knee injury sustained ${CASE.dateOfInjury} during a noncontact pivoting event. Evaluate and treat suspected internal derangement of the right knee.`;
  }
  return `${CASE.diagnosisShort}. Date of injury ${CASE.dateOfInjury}, right ACL reconstruction performed ${CASE.surgeryDate}. Ordered as part of the ongoing management of the right knee.`;
}

function orderRequisition(item: TimelineEntry, visit: TimelineVisit): AttachmentDoc {
  return {
    idLabel: "Order ID",
    idValue: documentNumber("ORD", item.date),
    date: item.date,
    title: "ORDER REQUISITION",
    subtitle: item.title,
    brand: "Hale Orthopedics",
    brandSub: "Order Requisition",
    brandInitials: "HO",
    infoLeft: [
      ["Patient Name", PATIENT.name],
      ["Date of Birth", PATIENT.dob],
      ["MRN", PATIENT.mrn],
      ["Insurance", PATIENT.insurance],
    ],
    infoRight: [
      ["Order Date", item.date],
      ["Ordering Provider", visit.provider],
      ["Encounter", `${visit.caseName} - ${visit.visitType}`],
      ["Priority", "Routine"],
    ],
    sections: [
      {
        title: "ORDER DETAILS",
        body: (
          <>
            <InfoRow label="Order:" value={item.title} />
            <InfoRow label="Performing Site:" value={item.detail} />
            <InfoRow label="Status:" value="Submitted" />
            <InfoRow label="Authorization:" value={`${PATIENT.insurance} — on file`} />
          </>
        ),
      },
      {
        title: "CLINICAL INDICATION",
        body: <p>{clinicalIndication(visit.caseName, item.date)}</p>,
      },
      {
        title: "INSTRUCTIONS TO PERFORMING SITE",
        items: [
          "Confirm patient identity and laterality before the service is rendered",
          "Contact the ordering provider with any questions about medical necessity",
          "Return results and documentation to Hale Orthopedics within 48 hours",
        ],
      },
    ],
    callout: {
      title: "ORDER STATUS",
      tone: "blue",
      body: (
        <p className="mt-2">
          Submitted electronically on {item.date}. Completion and results route back to the ordering provider and are
          filed to the patient chart automatically.
        </p>
      ),
    },
    signedBy: visit.provider,
    signedRole: "Ordering provider",
    signedAt: `Ordered ${item.date}`,
  };
}

function prescriptionPage(item: TimelineEntry, visit: TimelineVisit): AttachmentDoc {
  const medication = MEDICATIONS.find((entry) => entry.name === item.title);
  const controlled = item.title.toLowerCase().includes("oxycodone");

  return {
    idLabel: "Prescription ID",
    idValue: documentNumber("RX", item.date),
    date: item.date,
    title: "PRESCRIPTION",
    subtitle: item.title,
    brand: "Hale Orthopedics",
    brandSub: "Prescription",
    brandInitials: "HO",
    infoLeft: [
      ["Patient Name", PATIENT.name],
      ["Date of Birth", PATIENT.dob],
      ["MRN", PATIENT.mrn],
      ["Allergies", ALLERGY_SUMMARY],
    ],
    infoRight: [
      ["Written", item.date],
      ["Prescriber", visit.provider],
      ["Pharmacy", "Northside Pharmacy"],
      ["Encounter", `${visit.caseName} - ${visit.visitType}`],
    ],
    sections: [
      {
        title: "MEDICATION",
        body: (
          <>
            <InfoRow label="Drug:" value={item.title} />
            <InfoRow label="Quantity:" value={item.detail} />
            {medication ? <InfoRow label="Duration:" value={medication.duration} /> : null}
            {medication ? <InfoRow label="Refills:" value={medication.refills} /> : null}
          </>
        ),
      },
      {
        title: "SIG",
        body: <p>{medication?.sig ?? "Take as directed by the prescribing provider."}</p>,
      },
      {
        title: "INDICATION",
        body: <p>{clinicalIndication(visit.caseName, item.date)}</p>,
      },
    ],
    callout: controlled
      ? {
          title: "CONTROLLED SUBSTANCE — SCHEDULE II",
          tone: "amber",
          body: (
            <p className="mt-2">
              No refills authorized. Dispense the written quantity only. Prescription drug monitoring program was
              reviewed before this prescription was issued.
            </p>
          ),
        }
      : {
          title: "SAFETY",
          tone: "blue",
          body: (
            <p className="mt-2">
              Review allergies before dispensing. Advise the patient to contact the prescriber for rash, swelling,
              stomach pain, or black stools.
            </p>
          ),
        },
    signedBy: visit.provider,
    signedRole: "Prescribing provider",
    signedAt: `Written ${item.date}`,
  };
}

for (const visit of ENCOUNTERS) {
  for (const item of visit.items) {
    if (item.type === "order") {
      DOCS[timelineDocKey(item)] = orderRequisition(item, visit);
    } else if (item.type === "medication") {
      DOCS[timelineDocKey(item)] = prescriptionPage(item, visit);
    }
  }
}

// Past orders store their creation stamp as "MM-DD-YYYY h:mm AM".
function orderDate(created: string) {
  return created.split(" ")[0].replaceAll("-", "/");
}

export function pastOrderDocKey(order: { title: string; created: string }) {
  return timelineDocKey({ type: "order", title: order.title, date: orderDate(order.created) });
}

// Past orders are derived from the same encounter items, so their keys already
// resolve to the requisition generated above with the full encounter context.
for (const order of PAST_ORDERS) {
  const key = pastOrderDocKey(order);
  if (DOCS[key]) continue;

  DOCS[key] = orderRequisition(
    { title: order.title, detail: order.recipient, date: orderDate(order.created) },
    { caseName: CASE.name, visitType: order.orderSet, provider: REFERRING_PROVIDER },
  );
}

export default function AttachmentDocument({ fileName }: { fileName: string }) {
  const doc = DOCS[fileName] ?? DOCS["Plan_of_Care_08102026.pdf"];

  return (
    <div
      className="flex flex-col gap-4 bg-white px-6 py-5 font-ui text-[11px] leading-[1.5] text-[#1a1a1a]"
      style={{ width: DOC_WIDTH, height: DOC_HEIGHT }}
    >
      <div className="flex items-start justify-between text-[10px] text-[#555555]">
        <span>
          {doc.idLabel}: {doc.idValue}
        </span>
        <span>
          {PATIENT.name} {doc.date} 1 of 1
        </span>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col">
          <h1 className="text-[26px] font-bold leading-[1.15] text-[#1b83e4]">{doc.title}</h1>
          {doc.subtitle ? <span className="pt-1 text-[13px] font-medium text-[#454545]">{doc.subtitle}</span> : null}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#1b83e4] text-[16px] font-bold text-white">
            {doc.brandInitials}
          </span>
          <span className="flex flex-col">
            <span className="text-[22px] font-medium leading-none tracking-tight">{doc.brand}</span>
            <span className="pt-1 text-[12px] text-[#666666]">{doc.brandSub}</span>
          </span>
        </div>
      </div>

      <div className="grid w-full grid-cols-2 gap-x-8 gap-y-1 bg-[#eef1f7] px-4 py-3">
        <div className="flex flex-col gap-1">
          {doc.infoLeft.map(([label, value]) => (
            <InfoRow key={label} label={label} value={value} />
          ))}
        </div>
        <div className="flex flex-col gap-1">
          {doc.infoRight.map(([label, value]) => (
            <InfoRow key={label} label={label} value={value} />
          ))}
        </div>
      </div>

      {doc.sections.map((section) => (
        <Section key={section.title} {...section} />
      ))}

      {doc.callout ? (
        <div
          className={`w-full border px-4 py-3 ${
            doc.callout.tone === "amber"
              ? "border-[#e8c26a] bg-[#fdf6e3]"
              : "border-[#b9d8f3] bg-[#eef7ff]"
          }`}
        >
          <p
            className={`text-[15px] font-bold ${
              doc.callout.tone === "amber" ? "text-[#c98a1b]" : "text-[#1b83e4]"
            }`}
          >
            {doc.callout.title}
          </p>
          {doc.callout.body}
        </div>
      ) : null}

      <div className="mt-auto flex w-full items-end justify-between border-t border-[#c9c9c9] pt-3">
        <div>
          <p className="font-bold">Electronically signed by {doc.signedBy}</p>
          <p className="text-[#555555]">{doc.signedRole}</p>
          <p className="text-[#555555]">{doc.signedAt}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="block size-3.5 rounded-full bg-[#1b83e4]" />
          <span className="font-medium">{doc.brand}</span>
        </div>
      </div>
    </div>
  );
}
