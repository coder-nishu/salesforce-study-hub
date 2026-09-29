// Learning processes — how groups of objects work together.
// These are learning views, NOT a single official Salesforce pipeline, and not every object
// takes part (e.g. Donor Gift Summary is supporting information).

export const processes = [
  {
    id: 'volunteer-preparation',
    title: 'Volunteer preparation',
    question: 'Who is the volunteer, what can they do, and when / where can they help?',
    steps: [
      { objectApiName: 'Account', note: 'WHO — the person (Person Account)' },
      { objectApiName: 'PersonCompetency', note: 'WHAT they can do — links to a Competency, with a Qualification Level' },
      { objectApiName: 'PersonExamination', note: 'WHAT they have passed — recorded, not used by matching' },
      { objectApiName: 'PersonLocationAvailability', note: 'WHERE and WHEN — a Location and Operating Hours (→ Time Slots)' },
    ],
    useCaseId: 'volunteer-profile',
  },
  {
    id: 'volunteer-staffing',
    title: 'Volunteer staffing',
    question: 'What work is needed, and who actually does it?',
    steps: [
      { objectApiName: 'VolunteerInitiative', note: 'The program' },
      { objectApiName: 'JobPosition', note: 'A specific role in the program (often under a reusable Position)' },
      { objectApiName: 'JobPositionQualification', note: 'Extra requirements — plus the Position’s qualifications' },
      { objectApiName: 'JobPositionShift', note: 'When the work happens, with a capacity' },
      { label: 'Matching', note: 'Qualification, date/time and location compared with volunteers’ records', to: '/vm/find-volunteers' },
      { objectApiName: 'JobPositionAssignment', note: 'Who is actually assigned' },
    ],
    useCaseId: 'match-volunteers',
  },
  {
    id: 'application-example',
    title: 'Application example',
    label: 'Example application/onboarding learning scenario',
    question: 'How do the Application and Action Plan objects on the ERD connect?',
    steps: [
      { objectApiName: 'ApplicationForm', note: 'The submitted application' },
      { objectApiName: 'IntakeFormSection', note: 'Sections of the form' },
      { objectApiName: 'ApplicationFormEvaluation', note: 'The evaluation' },
      { objectApiName: 'ActionPlan', note: 'Follow-up tasks, created from an Action Plan Template Version' },
      { objectApiName: 'ActionPlanItem', note: 'The individual tasks' },
    ],
    useCaseId: 'application-onboarding',
  },
]

// Objects that support other roles rather than a process.
export const supportingRoles = [
  { role: 'Identity', objects: ['Contact', 'ContactProfile', 'ConstituentRole'] },
  { role: 'Qualification definitions', objects: ['Competency', 'Examination', 'Position', 'PositionQualification'] },
  { role: 'Scheduling building blocks', objects: ['Location', 'OperatingHours', 'TimeSlot', 'RecurrenceSchedule'] },
  { role: 'Program management', objects: ['Benefit', 'PositionBenefit'] },
  { role: 'Supporting information', objects: ['DonorGiftSummary'] },
  { role: 'Action plan templates', objects: ['ActionPlanTemplate', 'ActionPlanTemplateVersion', 'ActionPlanTemplateItem', 'ActionPlanTemplateAssignment'] },
]

// The staffing chain from a person to their assignment, as relationship IDs in order.
// The Data Model page walks these real relationships — if one is removed, the chain shows it.
export const staffingChain = [
  'pc-account', // Person Competency → Person Account
  'pc-competency', // Person Competency → Competency
  'jpq-competency', // Job Position Qualification → Competency
  'jpq-jobPosition', // Job Position Qualification → Job Position
  'jps-jobPosition', // Job Position Shift → Job Position
  'jpa-jobPositionShift', // Job Position Assignment → Job Position Shift
  'jpa-account', // Job Position Assignment → Person Account
]
