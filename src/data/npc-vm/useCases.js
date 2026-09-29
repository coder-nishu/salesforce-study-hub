// Use cases — interactive scenarios that run against the live record store.
//
// A use case is data. The generic ScenarioRunner (pages/vm/VmUseCase.jsx) renders each step
// by its `kind` and keeps a small context (ctx) of the records chosen or created so far.
//
// Step kinds:
//   create       Create a record (form prefilled from ctx) — or choose an existing one.
//                { objectApiName, saveAs, prefill(ctx), filter(ctx)(record), optional }
//   pick         Choose an existing record.  { objectApiName, saveAs, filter(ctx)(record) }
//   match        Run Find Volunteers for ctx.jobPositionId / ctx.shiftId. { saveAs } stores the chosen volunteer.
//   assign       Create a Job Position Assignment for ctx.accountId on ctx.shiftId.
//   inspect      Explain one volunteer's match result for ctx.accountId on ctx.jobPositionId / ctx.shiftId.
//   coverage     Capacity of ctx.shiftId.
//   requirements Position vs Job Position qualifications for ctx.jobPositionId.
//   initiative   All job positions of ctx.initiativeId, with their requirements and shifts.
//   review       Record graph for ctx[recordKey].
//
// filter(ctx) returns a predicate over records; it only reads record.values.

const byJob = (ctx) => (r) => r.values.JobPositionId === ctx.jobPositionId
const byInitiative = (ctx) => (r) => r.values.VolunteerInitiativeId === ctx.initiativeId
const personAccounts = () => (r) => r.values.AccountType === 'Person Account'

export const useCases = [
  {
    id: 'volunteer-profile',
    number: 1,
    title: 'Build a Volunteer Profile',
    description: 'I want to prepare a volunteer for volunteer work.',
    learningObjective: 'See which records describe WHO a volunteer is, WHAT they can do and WHEN/WHERE they can help.',
    requiredObjects: ['Account', 'Contact', 'PersonCompetency', 'PersonExamination', 'PersonLocationAvailability'],
    whatYouUsed: ['Account', 'Contact', 'PersonCompetency', 'Competency', 'PersonExamination', 'PersonLocationAvailability', 'Location', 'OperatingHours'],
    steps: [
      {
        kind: 'create',
        objectApiName: 'Account',
        saveAs: 'accountId',
        title: 'Create the Person Account',
        text: 'The Person Account is WHO the volunteer is. Creating one also creates its Contact (the standard link).',
        prefill: () => ({ AccountType: 'Person Account' }),
        filter: personAccounts,
      },
      {
        kind: 'create',
        objectApiName: 'PersonCompetency',
        saveAs: 'personCompetencyId',
        title: 'Add a Person Competency',
        text: 'Connect the person to a Competency they possess. Set a Qualification Level — matching compares it.',
        prefill: (ctx) => ({ PersonId: ctx.accountId }),
        filter: (ctx) => (r) => r.values.PersonId === ctx.accountId,
      },
      {
        kind: 'create',
        objectApiName: 'PersonExamination',
        saveAs: 'personExaminationId',
        optional: true,
        title: 'Add an Examination result (if required)',
        text: 'Exam results are recorded on Person Examination. Note: volunteer matching only uses competencies, not examinations.',
        prefill: (ctx) => ({ AccountId: ctx.accountId }),
        filter: (ctx) => (r) => r.values.AccountId === ctx.accountId,
      },
      {
        kind: 'create',
        objectApiName: 'PersonLocationAvailability',
        saveAs: 'availabilityId',
        title: 'Add Location Availability',
        text: 'WHERE (Location) and WHEN (Operating Hours → Time Slots) the person can volunteer.',
        prefill: (ctx) => ({ AccountId: ctx.accountId }),
        filter: (ctx) => (r) => r.values.AccountId === ctx.accountId,
      },
      { kind: 'review', recordKey: 'accountId', title: 'Review the volunteer profile', text: 'Every node below is a real record connected by IDs.' },
    ],
    resultExplanation:
      'A volunteer profile is not one record — it is a Person Account with related Person Competency, Person Examination and Person Location Availability records. Matching reads those related records.',
  },
  {
    id: 'volunteer-program',
    number: 2,
    title: 'Create a Volunteer Program',
    description: 'Our nonprofit is organizing a community health camp.',
    learningObjective: 'Build the chain Initiative → Job Position → Qualification → Shift, and see where Position fits.',
    requiredObjects: ['VolunteerInitiative', 'Position', 'PositionQualification', 'JobPosition', 'JobPositionQualification', 'JobPositionShift', 'Location'],
    whatYouUsed: ['VolunteerInitiative', 'Position', 'PositionQualification', 'Competency', 'JobPosition', 'JobPositionQualification', 'Location', 'JobPositionShift'],
    steps: [
      { kind: 'create', objectApiName: 'VolunteerInitiative', saveAs: 'initiativeId', title: 'Create the Volunteer Initiative', text: 'The program itself — with start and end dates.' },
      { kind: 'create', objectApiName: 'Position', saveAs: 'positionId', title: 'Create a Position', text: 'A reusable role that many initiatives can use.' },
      {
        kind: 'create',
        objectApiName: 'PositionQualification',
        saveAs: 'positionQualificationId',
        title: 'Define a Position Qualification',
        text: 'The general requirement — it applies across all job positions of this Position.',
        prefill: (ctx) => ({ PositionId: ctx.positionId }),
        filter: (ctx) => (r) => r.values.PositionId === ctx.positionId,
      },
      { kind: 'create', objectApiName: 'Location', saveAs: 'locationId', title: 'Choose or create the Location', text: 'Where the job happens. Matching by location compares this with volunteers’ availability.' },
      {
        kind: 'create',
        objectApiName: 'JobPosition',
        saveAs: 'jobPositionId',
        title: 'Create the Job Position',
        text: 'The specific role inside this initiative — linked to the Position, the Initiative and the Location.',
        prefill: (ctx) => ({ PositionId: ctx.positionId, VolunteerInitiativeId: ctx.initiativeId, LocationId: ctx.locationId }),
        filter: byInitiative,
      },
      {
        kind: 'create',
        objectApiName: 'JobPositionQualification',
        saveAs: 'jobPositionQualificationId',
        optional: true,
        title: 'Add a Job Position Qualification',
        text: 'An additional requirement for this job only.',
        prefill: (ctx) => ({ JobPositionId: ctx.jobPositionId }),
        filter: byJob,
      },
      {
        kind: 'create',
        objectApiName: 'JobPositionShift',
        saveAs: 'shiftId',
        title: 'Create a Job Position Shift',
        text: 'WHEN the work happens, and how many volunteers can be assigned (Maximum Attendees).',
        prefill: (ctx) => ({ JobPositionId: ctx.jobPositionId }),
        filter: byJob,
      },
      { kind: 'review', recordKey: 'initiativeId', title: 'Review the program', text: 'Initiative → Job Position → Qualification and Shift.' },
    ],
    resultExplanation:
      'The initiative doesn’t hold requirements or times itself. Job Positions carry qualifications and shifts, so one initiative can need many different roles.',
  },
  {
    id: 'match-volunteers',
    number: 3,
    title: 'Match Volunteers',
    description: 'Find a qualified volunteer for Saturday’s Health Camp shift.',
    learningObjective: 'Match by qualification, date/time and location, and read WHY each volunteer does or doesn’t match.',
    requiredObjects: ['VolunteerInitiative', 'JobPosition', 'JobPositionShift', 'PersonCompetency', 'PersonLocationAvailability'],
    whatYouUsed: ['VolunteerInitiative', 'JobPosition', 'PositionQualification', 'JobPositionQualification', 'JobPositionShift', 'Account', 'PersonCompetency', 'PersonLocationAvailability', 'TimeSlot'],
    defaults: { initiativeId: 'VIN002', jobPositionId: 'JOB001', shiftId: 'JPS001' },
    steps: [
      { kind: 'pick', objectApiName: 'VolunteerInitiative', saveAs: 'initiativeId', title: 'Choose the initiative' },
      { kind: 'pick', objectApiName: 'JobPosition', saveAs: 'jobPositionId', title: 'Choose the job position', filter: byInitiative },
      { kind: 'pick', objectApiName: 'JobPositionShift', saveAs: 'shiftId', title: 'Choose the shift', filter: byJob },
      { kind: 'match', saveAs: 'accountId', title: 'Select criteria and run matching', text: 'Try switching criteria off to see how the results change.' },
    ],
    resultExplanation:
      'A match needs every selected criterion: each required Qualification Level met (inclusive), availability covering the shift, and availability at the job’s location.',
  },
  {
    id: 'assign-volunteer',
    number: 4,
    title: 'Assign a Volunteer',
    description: 'A volunteer has been selected for the Health Camp shift.',
    learningObjective: 'Create a Job Position Assignment and see it appear on the Person Account, Job Position and Shift.',
    requiredObjects: ['JobPositionShift', 'JobPositionAssignment', 'Account'],
    whatYouUsed: ['JobPositionShift', 'Account', 'JobPositionAssignment', 'JobPosition', 'VolunteerInitiative'],
    defaults: { jobPositionId: 'JOB001', shiftId: 'JPS001' },
    steps: [
      { kind: 'pick', objectApiName: 'JobPositionShift', saveAs: 'shiftId', title: 'Choose the shift' },
      { kind: 'match', saveAs: 'accountId', title: 'Find and select a volunteer' },
      { kind: 'assign', saveAs: 'assignmentId', title: 'Create the Job Position Assignment', text: 'The assignment stores IDs: the person, the job position, the shift and the initiative.' },
      { kind: 'coverage', title: 'See the shift capacity update' },
      { kind: 'review', recordKey: 'assignmentId', title: 'Follow the assignment’s relationships' },
    ],
    resultExplanation: 'Availability ≠ assignment. Only the Job Position Assignment says who actually works the shift — and it uses up capacity when “Count Toward Shift Capacity” is checked.',
  },
  {
    id: 'shift-coverage',
    number: 5,
    title: 'Shift Coverage',
    description: 'How many seats are left on a shift, and who could fill them?',
    learningObjective: 'Read capacity, assigned, remaining and coverage from real assignments.',
    requiredObjects: ['JobPositionShift', 'JobPositionAssignment'],
    whatYouUsed: ['JobPositionShift', 'JobPositionAssignment', 'Account', 'PersonCompetency', 'PersonLocationAvailability'],
    defaults: { shiftId: 'JPS001' },
    steps: [
      { kind: 'pick', objectApiName: 'JobPositionShift', saveAs: 'shiftId', title: 'Choose a shift' },
      { kind: 'coverage', title: 'Coverage' },
      { kind: 'match', saveAs: 'accountId', title: 'Find volunteers for the remaining seats' },
      { kind: 'assign', saveAs: 'assignmentId', optional: true, title: 'Assign one (optional)' },
      { kind: 'coverage', title: 'Coverage now' },
    ],
    resultExplanation: 'Remaining capacity = Maximum Attendees − assignments that count toward capacity.',
  },
  {
    id: 'qualified-unavailable',
    number: 6,
    title: 'Qualified but Unavailable',
    description: 'The volunteer has the required competency — but not at that date and time.',
    learningObjective: 'See why Person Location Availability matters.',
    requiredObjects: ['PersonCompetency', 'PersonLocationAvailability', 'JobPositionShift'],
    whatYouUsed: ['PersonCompetency', 'PersonLocationAvailability', 'OperatingHours', 'TimeSlot', 'JobPositionShift'],
    defaults: { jobPositionId: 'JOB001', shiftId: 'JPS001', accountId: 'ACC003' },
    steps: [
      { kind: 'pick', objectApiName: 'JobPositionShift', saveAs: 'shiftId', title: 'The shift' },
      { kind: 'pick', objectApiName: 'Account', saveAs: 'accountId', title: 'The volunteer', filter: personAccounts, text: 'Demo data: Maria Khan (First Aid QL 5, weekday evenings only).' },
      { kind: 'inspect', title: 'Why doesn’t this volunteer match?' },
    ],
    resultExplanation: 'Qualification ✓ but Availability ✗ → not a match for this shift. A Person Competency alone doesn’t make someone available.',
  },
  {
    id: 'available-not-qualified',
    number: 7,
    title: 'Available but Not Qualified',
    description: 'The volunteer is free at the right place and time — but their level is too low.',
    learningObjective: 'See inclusive Qualification Level matching fail when the level is below the requirement.',
    requiredObjects: ['PersonCompetency', 'JobPositionQualification', 'PositionQualification'],
    whatYouUsed: ['PersonCompetency', 'PositionQualification', 'JobPositionQualification', 'PersonLocationAvailability'],
    defaults: { jobPositionId: 'JOB001', shiftId: 'JPS001', accountId: 'ACC002' },
    steps: [
      { kind: 'pick', objectApiName: 'JobPositionShift', saveAs: 'shiftId', title: 'The shift' },
      { kind: 'pick', objectApiName: 'Account', saveAs: 'accountId', title: 'The volunteer', filter: personAccounts, text: 'Demo data: John Rahman (First Aid QL 2, Saturday mornings in Dhaka).' },
      { kind: 'inspect', title: 'Why doesn’t this volunteer match?' },
    ],
    resultExplanation: 'Availability ✓ and Location ✓ but Qualification ✗ → not matched. A requirement of 3 matches levels 3, 4, 5 … — not 2.',
  },
  {
    id: 'position-vs-job-position',
    number: 8,
    title: 'Position vs Job Position',
    description: 'Why are there two kinds of role and two kinds of qualification?',
    learningObjective: 'Distinguish the general role (Position) from the specific job (Job Position), and PQs from JPQs.',
    requiredObjects: ['Position', 'PositionQualification', 'JobPosition', 'JobPositionQualification'],
    whatYouUsed: ['Position', 'PositionQualification', 'JobPosition', 'JobPositionQualification', 'Competency'],
    defaults: { jobPositionId: 'JOB001' },
    steps: [
      { kind: 'pick', objectApiName: 'JobPosition', saveAs: 'jobPositionId', title: 'Choose a job position' },
      { kind: 'requirements', title: 'Compare the two levels of requirement' },
    ],
    resultExplanation:
      'Salesforce Help: position qualifications “apply across all related job positions”; job position qualifications “are additive and apply only to the specific job position.”',
  },
  {
    id: 'multiple-job-positions',
    number: 9,
    title: 'Multiple Job Positions',
    description: 'One initiative needs several different roles.',
    learningObjective: 'See why Job Position exists instead of putting everything on the Initiative.',
    requiredObjects: ['VolunteerInitiative', 'JobPosition', 'JobPositionShift'],
    whatYouUsed: ['VolunteerInitiative', 'JobPosition', 'JobPositionQualification', 'JobPositionShift', 'Location'],
    defaults: { initiativeId: 'VIN002' },
    steps: [
      { kind: 'pick', objectApiName: 'VolunteerInitiative', saveAs: 'initiativeId', title: 'Choose an initiative' },
      { kind: 'initiative', title: 'Its job positions' },
    ],
    resultExplanation: 'Each Job Position has its own qualifications, shifts and location — an initiative can’t hold those differences itself.',
  },
  {
    id: 'application-onboarding',
    number: 10,
    title: 'Application / Onboarding',
    label: 'Example application/onboarding learning scenario',
    description: 'Follow an application through evaluation to an action plan.',
    learningObjective: 'See how the Application and Action Plan objects on the ERD connect — without claiming a mandatory lifecycle.',
    requiredObjects: ['ApplicationForm', 'ApplicationFormEvaluation', 'ActionPlan', 'ActionPlanItem'],
    whatYouUsed: ['ApplicationForm', 'IntakeFormSection', 'ApplicationFormRelation', 'ApplicationFormEvaluation', 'ActionPlan', 'ActionPlanItem', 'ActionPlanTemplateVersion'],
    defaults: { applicationFormId: 'AFM001', actionPlanId: 'APL001' },
    steps: [
      { kind: 'pick', objectApiName: 'ApplicationForm', saveAs: 'applicationFormId', title: 'Choose an application form' },
      { kind: 'review', recordKey: 'applicationFormId', depth: 3, title: 'The application’s related records', text: 'Intake form sections, the application form relation (to a Job Position) and the evaluation.' },
      { kind: 'pick', objectApiName: 'ActionPlan', saveAs: 'actionPlanId', title: 'Choose the action plan' },
      { kind: 'review', recordKey: 'actionPlanId', title: 'The action plan and its items' },
    ],
    resultExplanation:
      'This is an example built only from relationships on your ERD. Volunteer Management does not require this lifecycle.',
  },
  {
    id: 'fill-unstaffed-shift',
    number: 11,
    title: 'Fill an Unstaffed Shift',
    description: 'A shift has no volunteers yet.',
    learningObjective: 'Use coverage and matching together to staff a shift.',
    requiredObjects: ['JobPositionShift', 'JobPositionAssignment'],
    whatYouUsed: ['JobPositionShift', 'Account', 'JobPositionAssignment'],
    defaults: { shiftId: 'JPS002' },
    steps: [
      { kind: 'pick', objectApiName: 'JobPositionShift', saveAs: 'shiftId', title: 'Choose an unstaffed shift', text: 'Demo data: the Saturday-afternoon First Aid shift has no qualified volunteer available.' },
      { kind: 'coverage', title: 'Coverage' },
      { kind: 'match', saveAs: 'accountId', title: 'Find volunteers', text: 'If nobody matches, switch a criterion off — or add availability to a qualified volunteer and try again.' },
      { kind: 'assign', saveAs: 'assignmentId', title: 'Assign' },
      { kind: 'coverage', title: 'Coverage now' },
    ],
    resultExplanation: 'When nobody matches, the fix is data: a qualified volunteer needs availability at that time and place.',
  },
  {
    id: 'why-not-match',
    number: 12,
    title: 'Investigate Why a Volunteer Doesn’t Match',
    description: 'Pick any volunteer and any shift.',
    learningObjective: 'Read the per-criterion explanation for one volunteer.',
    requiredObjects: ['Account', 'JobPositionShift'],
    whatYouUsed: ['Account', 'PersonCompetency', 'PersonLocationAvailability', 'JobPositionShift', 'JobPosition'],
    defaults: { shiftId: 'JPS001', accountId: 'ACC004' },
    steps: [
      { kind: 'pick', objectApiName: 'JobPositionShift', saveAs: 'shiftId', title: 'Choose a shift' },
      { kind: 'pick', objectApiName: 'Account', saveAs: 'accountId', title: 'Choose a volunteer', filter: personAccounts },
      { kind: 'inspect', title: 'Explanation' },
    ],
    resultExplanation: 'Every ✗ points at the record to change: a Person Competency level, a Person Location Availability, or its Location / Operating Hours.',
  },
]

export const useCasesById = new Map(useCases.map((u) => [u.id, u]))

export function scenariosForObject(objectApiName) {
  return useCases.filter((u) => u.requiredObjects.includes(objectApiName) || u.whatYouUsed.includes(objectApiName))
}
