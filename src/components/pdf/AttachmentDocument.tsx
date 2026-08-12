import type { ReactNode } from "react";
import {
  ALLERGIES,
  CASE,
  CHART_TIMELINE,
  MEDICATIONS,
  PAST_ORDERS,
  PATIENT,
  PROVIDER,
  REFERRING_PROVIDER,
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
      ["Ordering Provider", "Marcus Hale, MD"],
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

  "Ortho_PT_Referral_05132026.pdf": {
    idLabel: "Referral ID",
    idValue: "REF-2026-0513-PT",
    date: "05/13/2026",
    title: "PHYSICAL THERAPY REFERRAL",
    subtitle: "Post-Operative ACL Reconstruction",
    brand: "Hale Orthopedics",
    brandSub: "Sports Medicine",
    brandInitials: "HO",
    infoLeft: [
      ["Patient Name", PATIENT.name],
      ["Date of Birth", PATIENT.dob],
      ["Referring Provider", REFERRING_PROVIDER],
      ["Diagnosis", CASE.diagnosisShort],
    ],
    infoRight: [
      ["Referral Date", "05/13/2026"],
      ["Surgery Date", CASE.surgeryDate],
      ["Frequency", "2–3x / week"],
      ["Duration", "12 weeks"],
    ],
    sections: [
      {
        title: "REASON FOR REFERRAL",
        body: (
          <p>
            Please evaluate and treat {PATIENT.name} following right ACL reconstruction with semitendinosus autograft
            and partial medial meniscectomy performed on {CASE.surgeryDate}. Begin outpatient physical therapy when
            cleared for weight bearing as tolerated.
          </p>
        ),
      },
      {
        title: "PRECAUTIONS / PROTOCOL",
        items: [
          "Hinged brace locked in extension for ambulation for 2 weeks, then unlock 0–90°",
          "No open-chain terminal extension against resistance for 12 weeks",
          "Weight bearing as tolerated with crutches until gait is normalized",
          "Follow the attached Weeks 0–12 post-op ACL protocol",
        ],
      },
      {
        title: "GOALS",
        items: [
          "Full extension and flexion to 120° by week 6",
          "Independent with home exercise program",
          "Progress to closed-chain strengthening and neuromuscular control",
          "Prepare for return-to-run testing after week 12",
        ],
      },
    ],
    signedBy: "Marcus Hale, MD",
    signedRole: "Orthopedic Surgery — Sports Medicine",
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
          "Exercises: leg press, lateral stepping, balance board, blood flow restriction as indicated",
          "No running or cutting until cleared after week 12 testing",
        ],
      },
    ],
    signedBy: "Marcus Hale, MD",
    signedRole: "Protocol authored for Hale Orthopedics Sports Medicine",
    signedAt: "Distributed 05/07/2026",
  },

  "Patient_Intake_Questionnaire_05202026.pdf": {
    idLabel: "Form ID",
    idValue: "INTAKE-2026-0520",
    date: "05/20/2026",
    title: "PATIENT INTAKE QUESTIONNAIRE",
    subtitle: "Initial Physical Therapy Evaluation",
    brand: "Athelas Physical Therapy",
    brandSub: "Outpatient Rehabilitation",
    brandInitials: "AP",
    infoLeft: [
      ["Patient Name", PATIENT.name],
      ["Date of Birth", PATIENT.dob],
      ["MRN", PATIENT.mrn],
      ["Preferred Name", "Jordan"],
    ],
    infoRight: [
      ["Visit Date", CASE.initialEval],
      ["Referring MD", REFERRING_PROVIDER],
      ["Insurance", PATIENT.insurance],
      ["Emergency Contact", "Alex Reyes"],
    ],
    sections: [
      {
        title: "CHIEF CONCERN",
        body: (
          <p>
            Right knee recovery after ACL surgery. Difficulty walking without a limp, limited bending, and weakness
            with stairs. Goal is to return to recreational soccer.
          </p>
        ),
      },
      {
        title: "CURRENT SYMPTOMS",
        items: [
          "Pain: 4/10 aching at rest, 7/10 after activity",
          "Swelling: mild after being on feet for more than 1 hour",
          "Instability: none in brace; mild apprehension without brace",
          "Sleep: interrupted by stiffness when changing positions",
        ],
      },
      {
        title: "MEDICAL HISTORY",
        items: [
          "Allergies: Penicillin (severe), Latex (moderate), Shellfish (mild)",
          "Medications: Meloxicam, Acetaminophen PRN, completed post-op aspirin course",
          "Prior injuries: Left ankle sprain 11/2025, resolved",
          "Hard of hearing — speak facing the patient",
        ],
      },
    ],
    signedBy: PATIENT.name,
    signedRole: "Patient attestation",
    signedAt: "Completed 05/20/2026 at 10:05 AM",
  },

  "IKDC_Outcome_Survey_08032026.pdf": {
    idLabel: "Outcome ID",
    idValue: "IKDC-2026-0803",
    date: "08/03/2026",
    title: "IKDC SUBJECTIVE KNEE FORM",
    subtitle: "Week 12 Outcome Measure",
    brand: "Athelas Physical Therapy",
    brandSub: "Outcomes",
    brandInitials: "AP",
    infoLeft: [
      ["Patient Name", PATIENT.name],
      ["Date of Birth", PATIENT.dob],
      ["Involved Side", "Right"],
      ["Administered By", PROVIDER.short],
    ],
    infoRight: [
      ["Survey Date", "08/03/2026"],
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
          "Highest activity without significant pain: Light running / jogging",
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
            Score improvement tracks with gains in extension and quadriceps strength. Remaining limitations are
            deceleration confidence and single-leg hop symmetry, consistent with the current rehab phase.
          </p>
        ),
      },
    ],
    signedBy: PROVIDER.display,
    signedRole: "Scored and reviewed",
    signedAt: "Documented 08/03/2026 at 3:40 PM",
  },

  "PT_Authorization_24_Visits_05182026.pdf": {
    idLabel: "Auth ID",
    idValue: "AUTH-PH-551829",
    date: "05/18/2026",
    title: "PRIOR AUTHORIZATION",
    subtitle: "Outpatient Physical Therapy — 24 Visits",
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
      ["Effective", "05/20/2026 – 11/20/2026"],
      ["Status", "Approved"],
    ],
    sections: [
      {
        title: "AUTHORIZED SERVICES",
        body: (
          <>
            <p>
              Priority Health has approved <span className="font-bold">24 outpatient physical therapy visits</span> for
              diagnosis {CASE.diagnosisShort} related to right ACL reconstruction.
            </p>
            <p>Rendering facility: Athelas Physical Therapy. Rendering provider: {PROVIDER.display}.</p>
          </>
        ),
      },
      {
        title: "CONDITIONS",
        items: [
          "Visits must occur between 05/20/2026 and 11/20/2026",
          "Additional visits require a concurrent review with updated clinical notes",
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
          Approved — 24 visits. Reference AUTH-PH-551829 on all claims and progress note submissions.
        </p>
      ),
    },
    signedBy: "Priority Health UM Review",
    signedRole: "Automated determination letter",
    signedAt: "Issued 05/18/2026 at 2:06 PM",
  },

  "Home_Exercise_Program_Week_12.pdf": {
    idLabel: "HEP ID",
    idValue: "HEP-W12-2026-0727",
    date: "07/27/2026",
    title: "HOME EXERCISE PROGRAM",
    subtitle: "Week 12 — Strength & Control",
    brand: "Athelas Physical Therapy",
    brandSub: "Patient Handout",
    brandInitials: "AP",
    infoLeft: [
      ["Patient Name", PATIENT.name],
      ["Therapist", PROVIDER.short],
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
            pain. Ice 10–15 minutes after sessions. Bring this sheet to the next visit for progression to light jogging
            drills.
          </p>
        ),
      },
    ],
    signedBy: PROVIDER.display,
    signedRole: "Home program prescribed",
    signedAt: "Issued 07/27/2026",
  },

  "Plan_of_Care_08102026.pdf": {
    idLabel: "Athelas Document ID",
    idValue: "00000000-0000-4000-8000-000000000000",
    date: CASE.visitDateLong,
    title: "PLAN OF CARE",
    subtitle: "Addended — Visit Frequency Update",
    brand: "Athelas",
    brandSub: "Powered by Commure",
    brandInitials: "A",
    infoLeft: [
      ["Patient Name", PATIENT.name],
      ["Date of Birth", PATIENT.dob],
      ["Rendering Provider", PROVIDER.display],
      ["Referring Provider", REFERRING_PROVIDER],
    ],
    infoRight: [
      ["Plan of Care Begins", CASE.visitDateLong],
      ["Visit #", CASE.visitNumber],
      ["Date of Original Visit", CASE.initialEval],
      ["Diagnosis Code", CASE.diagnosisShort],
    ],
    sections: [
      {
        title: "PLAN",
        body: (
          <>
            <p className="font-bold">I have recommended the following therapy plan:</p>
            <p className="font-bold italic">
              {PATIENT.name} will be seen 2 times per week for 6 weeks starting 08/12/2026 and ending 09/23/2026 for
              post-operative ACL rehabilitation, progressing to plyometrics and return-to-sport testing.
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
          <InfoRow label="Reason For Addendum:" value="Visit frequency updated after week 12 progression" />
          <InfoRow label="Created By:" value={`${PROVIDER.short} (08/03/2026 07:18AM)`} />
          <InfoRow label="Finalized By:" value={`${PROVIDER.short} (08/03/2026 09:42AM)`} />
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
            locking, or new effusion. He is compliant with supervised therapy twice weekly and a daily home program.
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
          "Continue supervised therapy twice weekly with progression to plyometrics",
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
    signedBy: "Priya Raman, MD",
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
        body: (
          <p>
            {CASE.diagnosisShort}. Date of injury {CASE.dateOfInjury}, right ACL reconstruction performed{" "}
            {CASE.surgeryDate}. Ordered as part of the ongoing management of the right knee.
          </p>
        ),
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
        body: (
          <p>
            {CASE.diagnosisShort}. Prescribed in connection with the right ACL reconstruction performed{" "}
            {CASE.surgeryDate}.
          </p>
        ),
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

for (const visit of CHART_TIMELINE) {
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

for (const order of PAST_ORDERS) {
  DOCS[pastOrderDocKey(order)] = orderRequisition(
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
