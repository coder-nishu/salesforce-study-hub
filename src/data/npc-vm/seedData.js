// Demo data — a small, connected Dhaka volunteer organization.
//
// Every record is here to teach something (see `learningNote`). Relationship fields hold
// record IDs only. "Reset Demo Data" restores exactly this set.
//
// The people are designed so matching the Health Camp First Aid Saturday-morning shift
// (First Aid QL ≥ 3, Dhaka Community Center, Sat 09:00–13:00) gives every outcome:
//   Sarah  ✓ qualified ✓ available ✓ location  → MATCH
//   John   ✗ QL 2 too low, available, right place
//   Maria  ✓ qualified, ✗ only available weekday evenings
//   Nadia  ✓ qualified, available Sat morning, ✗ at Mirpur, not Dhaka
//   David  ✗ no First Aid competency (he fits the Food Drive instead)

const CREATED = '2026-09-01T09:00:00.000Z'

function rec(id, objectApiName, values, learningNote = null) {
  return { id, objectApiName, values, origin: 'demo', createdAt: CREATED, updatedAt: CREATED, learningNote }
}

function person(n, name, email, phone, note) {
  const accountId = `ACC00${n}`
  const contactId = `CON00${n}`
  const [first, ...rest] = name.split(' ')
  return [
    rec(accountId, 'Account', { Name: name, AccountType: 'Person Account', PersonEmail: email, Phone: phone, PersonContactId: contactId }, note),
    rec(contactId, 'Contact', { FirstName: first, LastName: rest.join(' '), Email: email, Phone: phone },
      'Created with the person account — a person account is backed by a contact.'),
  ]
}

const list = [
  // ---------- Where and when ----------
  rec('LOC001', 'Location', { Name: 'Dhaka Community Center', LocationType: 'Community Center' }, 'Where the Health Camp jobs happen.'),
  rec('LOC002', 'Location', { Name: 'Mirpur Volunteer Center', LocationType: 'Community Center' }, 'Where the Food Drive happens — and where Nadia is available.'),

  rec('OPH001', 'OperatingHours', { Name: 'Saturday Mornings', TimeZone: 'Asia/Dhaka' }, 'Availability pattern: Saturday 09:00–13:00.'),
  rec('OPH002', 'OperatingHours', { Name: 'Saturday Afternoons', TimeZone: 'Asia/Dhaka' }, 'Availability pattern: Saturday 13:00–17:00.'),
  rec('OPH003', 'OperatingHours', { Name: 'Weekday Evenings', TimeZone: 'Asia/Dhaka' }, 'Availability pattern: Monday–Thursday 17:00–20:00.'),
  rec('TSL001', 'TimeSlot', { OperatingHoursId: 'OPH001', DayOfWeek: 'Saturday', StartTime: '09:00', EndTime: '13:00', Type: 'Normal' }),
  rec('TSL002', 'TimeSlot', { OperatingHoursId: 'OPH002', DayOfWeek: 'Saturday', StartTime: '13:00', EndTime: '17:00', Type: 'Normal' }),
  ...['Monday', 'Tuesday', 'Wednesday', 'Thursday'].map((day, i) =>
    rec(`TSL00${i + 3}`, 'TimeSlot', { OperatingHoursId: 'OPH003', DayOfWeek: day, StartTime: '17:00', EndTime: '20:00', Type: 'Normal' }),
  ),

  // ---------- Skills and exams (definitions) ----------
  rec('CMP001', 'Competency', { Name: 'First Aid', Description: 'Providing basic emergency care.' }, 'Reusable skill definition — it says nothing about who has it.'),
  rec('CMP002', 'Competency', { Name: 'Communication', Description: 'Talking with participants and guests.' }),
  rec('CMP003', 'Competency', { Name: 'Food Safety', Description: 'Handling and distributing food safely.' }),
  rec('CMP004', 'Competency', { Name: 'Event Coordination', Description: 'Organizing people and activities at an event.' }),
  rec('CMP005', 'Competency', { Name: 'Project Management', Description: 'Planning and tracking work.' }, 'Not used by any job yet — create a position that needs it.'),
  rec('EXM001', 'Examination', { Name: 'First Aid Certification', Status: 'Active' }),
  rec('EXM002', 'Examination', { Name: 'Food Safety Examination', Status: 'Active' }, 'Used as a Position Qualification to show that matching does not evaluate examinations.'),

  // ---------- People ----------
  ...person(1, 'Sarah Ahmed', 'sarah@example.org', '+8801700000001', 'Qualified, available and in the right place for the Health Camp First Aid shift.'),
  ...person(2, 'John Rahman', 'john@example.org', '+8801700000002', 'Available at the right time and place — but his First Aid level (2) is too low.'),
  ...person(3, 'Maria Khan', 'maria@example.org', '+8801700000003', 'Highly qualified (First Aid 5) — but only available on weekday evenings.'),
  ...person(4, 'Nadia Chowdhury', 'nadia@example.org', '+8801700000004', 'Qualified and free on Saturday mornings — but at Mirpur, not Dhaka.'),
  ...person(5, 'David Islam', 'david@example.org', '+8801700000005', 'A Food Safety volunteer: matches the Food Drive, not the Health Camp.'),

  ...[1, 2, 3, 4, 5].map((n) =>
    rec(`CRL00${n}`, 'ConstituentRole', { Name: 'Volunteer', AccountId: `ACC00${n}`, Role: 'Volunteer', Status: 'Active', StartDate: '2026-01-01' }),
  ),
  rec('CPR001', 'ContactProfile', { Name: 'Sarah Ahmed — Profile', ContactId: 'CON001', Department: 'Community Health', Designation: 'Nurse' }, 'Extra profile details hang off the Contact, not the Account.'),
  rec('DGS001', 'DonorGiftSummary', { Name: 'David Islam — Giving', AccountId: 'ACC005', TotalGifts: 5000, GiftCount: 2, LastGiftDate: '2026-07-10' }, 'Supporting donor information — not part of volunteer matching.'),

  // ---------- What each person can do (Person Competency = person has the skill) ----------
  rec('PCM001', 'PersonCompetency', { Name: 'PCM-0001', PersonId: 'ACC001', CompetencyId: 'CMP001', QualificationLevel: 4, ProficiencyLevel: 'Advanced', VerificationDate: '2026-06-01' }, 'Sarah → First Aid, QL 4 (meets a QL 3 requirement).'),
  rec('PCM002', 'PersonCompetency', { Name: 'PCM-0002', PersonId: 'ACC001', CompetencyId: 'CMP002', QualificationLevel: 3, ProficiencyLevel: 'Intermediate' }),
  rec('PCM003', 'PersonCompetency', { Name: 'PCM-0003', PersonId: 'ACC002', CompetencyId: 'CMP001', QualificationLevel: 2, ProficiencyLevel: 'Beginner' }, 'John → First Aid, QL 2 (below a QL 3 requirement).'),
  rec('PCM004', 'PersonCompetency', { Name: 'PCM-0004', PersonId: 'ACC003', CompetencyId: 'CMP001', QualificationLevel: 5, ProficiencyLevel: 'Advanced' }, 'Maria → First Aid, QL 5.'),
  rec('PCM005', 'PersonCompetency', { Name: 'PCM-0005', PersonId: 'ACC004', CompetencyId: 'CMP001', QualificationLevel: 3, ProficiencyLevel: 'Intermediate' }, 'Nadia → First Aid, QL 3 (exactly meets QL 3 — matching is inclusive).'),
  rec('PCM006', 'PersonCompetency', { Name: 'PCM-0006', PersonId: 'ACC004', CompetencyId: 'CMP002', QualificationLevel: 4, ProficiencyLevel: 'Advanced' }),
  rec('PCM007', 'PersonCompetency', { Name: 'PCM-0007', PersonId: 'ACC004', CompetencyId: 'CMP004', QualificationLevel: 4, ProficiencyLevel: 'Advanced' }),
  rec('PCM008', 'PersonCompetency', { Name: 'PCM-0008', PersonId: 'ACC005', CompetencyId: 'CMP003', QualificationLevel: 3, ProficiencyLevel: 'Intermediate' }),
  rec('PCM009', 'PersonCompetency', { Name: 'PCM-0009', PersonId: 'ACC005', CompetencyId: 'CMP004', QualificationLevel: 2, ProficiencyLevel: 'Beginner' }),

  rec('PEX001', 'PersonExamination', { Name: 'Sarah — First Aid Certification', AccountId: 'ACC001', ExaminationId: 'EXM001', ExaminationDate: '2026-03-15', Result: 'Pass', Score: 88, VerificationStatus: 'Verified' }, 'Recorded, but volunteer matching only uses competencies — not examinations.'),
  rec('PEX002', 'PersonExamination', { Name: 'David — Food Safety Examination', AccountId: 'ACC005', ExaminationId: 'EXM002', ExaminationDate: '2026-05-02', Result: 'Pass', Score: 91, VerificationStatus: 'Verified' }),

  // ---------- Where and when each person can help ----------
  rec('PLA001', 'PersonLocationAvailability', { Name: 'PLA-0001', AccountId: 'ACC001', LocationId: 'LOC001', OperatingHoursId: 'OPH001', UsageType: 'VolunteerManagement' }, 'Sarah: Dhaka Community Center, Saturday mornings.'),
  rec('PLA002', 'PersonLocationAvailability', { Name: 'PLA-0002', AccountId: 'ACC002', LocationId: 'LOC001', OperatingHoursId: 'OPH001', UsageType: 'VolunteerManagement' }, 'John: same place and time as Sarah.'),
  rec('PLA003', 'PersonLocationAvailability', { Name: 'PLA-0003', AccountId: 'ACC003', LocationId: 'LOC001', OperatingHoursId: 'OPH003', UsageType: 'VolunteerManagement' }, 'Maria: right place, weekday evenings only.'),
  rec('PLA004', 'PersonLocationAvailability', { Name: 'PLA-0004', AccountId: 'ACC004', LocationId: 'LOC002', OperatingHoursId: 'OPH001', UsageType: 'VolunteerManagement' }, 'Nadia: Saturday mornings, but at Mirpur.'),
  rec('PLA005', 'PersonLocationAvailability', { Name: 'PLA-0005', AccountId: 'ACC005', LocationId: 'LOC002', OperatingHoursId: 'OPH002', UsageType: 'VolunteerManagement' }, 'David: Mirpur, Saturday afternoons — the Food Drive shift.'),

  // ---------- Reusable roles (Position) and their general requirements ----------
  rec('POS001', 'Position', { Name: 'First Aid Volunteer', Status: 'Active' }, 'A reusable role — can be used by many initiatives.'),
  rec('POS002', 'Position', { Name: 'Event Coordinator', Status: 'Active' }),
  rec('POS003', 'Position', { Name: 'Food Distribution Volunteer', Status: 'Active' }),
  rec('PQL001', 'PositionQualification', { Name: 'PQL-0001', PositionId: 'POS001', QualificationReferenceRecordId: 'CMP001', QualificationLevel: 2, ProficiencyLevel: 'Beginner' }, 'General requirement for every First Aid job: First Aid QL 2.'),
  rec('PQL002', 'PositionQualification', { Name: 'PQL-0002', PositionId: 'POS002', QualificationReferenceRecordId: 'CMP004', QualificationLevel: 3, ProficiencyLevel: 'Intermediate' }),
  rec('PQL003', 'PositionQualification', { Name: 'PQL-0003', PositionId: 'POS003', QualificationReferenceRecordId: 'CMP003', QualificationLevel: 2, ProficiencyLevel: 'Beginner' }),
  rec('PQL004', 'PositionQualification', { Name: 'PQL-0004', PositionId: 'POS003', QualificationReferenceRecordId: 'EXM002', Description: 'Pass the Food Safety Examination' }, 'An examination qualification — shown, but not evaluated by matching.'),
  rec('BEN001', 'Benefit', { Name: 'Volunteer Certificate', Description: 'Certificate for completed service.' }),
  rec('PBN001', 'PositionBenefit', { Name: 'PBN-0001', PositionId: 'POS001', BenefitId: 'BEN001' }),
  rec('PBN002', 'PositionBenefit', { Name: 'PBN-0002', PositionId: 'POS003', BenefitId: 'BEN001' }),

  // ---------- Programs (Volunteer Initiatives) ----------
  rec('VIN001', 'VolunteerInitiative', { Name: 'Dhaka Community Programs 2026', Status: 'In Progress', StartDate: '2026-01-01', EndDate: '2026-12-31', IsPublished: false }, 'A parent initiative — shows the self-reference.'),
  rec('VIN002', 'VolunteerInitiative', { Name: 'Dhaka Community Health Camp', ParentVolunteerInitiativeId: 'VIN001', Status: 'Upcoming', StartDate: '2026-11-14', EndDate: '2026-11-14', IsPublished: true }, 'One initiative, three job positions with different requirements.'),
  rec('VIN003', 'VolunteerInitiative', { Name: 'Winter Food Drive', ParentVolunteerInitiativeId: 'VIN001', Status: 'Upcoming', StartDate: '2026-12-01', EndDate: '2026-12-31', IsPublished: true }),

  // ---------- Specific jobs (Job Position) and their extra requirements ----------
  rec('JOB001', 'JobPosition', { Name: 'Health Camp First Aid Volunteer', Title: 'First Aid Volunteer — Health Camp', PositionId: 'POS001', VolunteerInitiativeId: 'VIN002', LocationId: 'LOC001', Status: 'Upcoming' }, 'Position requires First Aid QL 2; this job adds QL 3 (Position vs Job Position).'),
  rec('JOB002', 'JobPosition', { Name: 'Health Camp Registration Volunteer', Title: 'Registration Desk — Health Camp', VolunteerInitiativeId: 'VIN002', LocationId: 'LOC001', Status: 'Upcoming' }, 'A job position without a Position — the link is optional.'),
  rec('JOB003', 'JobPosition', { Name: 'Health Camp Event Coordinator', Title: 'Event Coordinator — Health Camp', PositionId: 'POS002', VolunteerInitiativeId: 'VIN002', LocationId: 'LOC001', Status: 'Upcoming' }),
  rec('JOB004', 'JobPosition', { Name: 'Food Drive Distribution Volunteer', Title: 'Distribution Volunteer — Food Drive', PositionId: 'POS003', VolunteerInitiativeId: 'VIN003', LocationId: 'LOC002', Status: 'Upcoming' }),
  rec('JPQ001', 'JobPositionQualification', { Name: 'JPQ-0001', JobPositionId: 'JOB001', QualificationReferenceRecordId: 'CMP001', QualificationLevel: 3, ProficiencyLevel: 'Intermediate' }, 'Additive: applies only to this job, on top of the Position’s QL 2.'),
  rec('JPQ002', 'JobPositionQualification', { Name: 'JPQ-0002', JobPositionId: 'JOB002', QualificationReferenceRecordId: 'CMP002', QualificationLevel: 3, ProficiencyLevel: 'Intermediate' }),
  rec('JPQ003', 'JobPositionQualification', { Name: 'JPQ-0003', JobPositionId: 'JOB004', QualificationReferenceRecordId: 'CMP003', QualificationLevel: 3, ProficiencyLevel: 'Intermediate' }),

  // ---------- When the work happens (Job Position Shift) ----------
  rec('RSC001', 'RecurrenceSchedule', { Name: 'Weekly Food Drive Saturdays', JobPositionId: 'JOB004', ScheduleFrequency: 'Weekly', StartDate: '2026-12-05', EndDate: '2026-12-26', Status: 'Active' }, 'A repeating pattern that shifts can belong to.'),
  rec('JPS001', 'JobPositionShift', { Name: 'JPS-0001', JobPositionId: 'JOB001', StartDate: '2026-11-14', StartTime: '09:00', EndDate: '2026-11-14', EndTime: '13:00', MaximumAttendeesCount: 5, Status: 'Upcoming', TimeZone: 'Asia/Dhaka' }, 'Saturday morning First Aid — 5 seats, none filled. Try Find Volunteers here.'),
  rec('JPS002', 'JobPositionShift', { Name: 'JPS-0002', JobPositionId: 'JOB001', StartDate: '2026-11-14', StartTime: '13:00', EndDate: '2026-11-14', EndTime: '17:00', MaximumAttendeesCount: 3, Status: 'Upcoming', TimeZone: 'Asia/Dhaka' }, 'Saturday afternoon First Aid — no qualified volunteer is free. An unstaffed shift.'),
  rec('JPS003', 'JobPositionShift', { Name: 'JPS-0003', JobPositionId: 'JOB002', StartDate: '2026-11-14', StartTime: '09:00', EndDate: '2026-11-14', EndTime: '13:00', MaximumAttendeesCount: 2, Status: 'Upcoming', TimeZone: 'Asia/Dhaka' }),
  rec('JPS004', 'JobPositionShift', { Name: 'JPS-0004', JobPositionId: 'JOB004', RecurrenceScheduleId: 'RSC001', StartDate: '2026-12-12', StartTime: '13:00', EndDate: '2026-12-12', EndTime: '17:00', MaximumAttendeesCount: 4, Status: 'Upcoming', TimeZone: 'Asia/Dhaka' }, 'Belongs to the weekly recurrence schedule.'),

  // ---------- Who actually does it (Job Position Assignment) ----------
  rec('JPA001', 'JobPositionAssignment', { Name: 'JPA-0001', AssignedAccountId: 'ACC005', JobPositionId: 'JOB004', AssignedPositionShiftId: 'JPS004', RelatedVolunteerInitiativeId: 'VIN003', Status: 'Upcoming', DoesCountTowardShiftCapacity: true, ScheduledStartTime: '2026-12-12T13:00', ScheduledEndTime: '2026-12-12T17:00' }, 'David on the Food Drive shift — counts toward its capacity (1 of 4).'),
  rec('JPA002', 'JobPositionAssignment', { Name: 'JPA-0002', AssignedAccountId: 'ACC004', JobPositionId: 'JOB003', RelatedVolunteerInitiativeId: 'VIN002', Status: 'Upcoming', DoesCountTowardShiftCapacity: false }, 'No shift selected: the assignment applies to the job position itself.'),

  // ---------- Example application / onboarding (ERD relationships only) ----------
  rec('ARM001', 'ApplicationRenderMethod', { Name: 'Online Form' }),
  rec('ASD001', 'ApplicationStageDefinition', { Name: 'Screening', ApplicationRenderMethodId: 'ARM001' }),
  rec('AFM001', 'ApplicationForm', { Name: 'Sarah Ahmed — Volunteer Application', AccountId: 'ACC001', SubmissionDate: '2026-09-10', ApplicationSummary: 'Registered nurse; wants to help at health events.' }, 'Example application/onboarding learning scenario — not a mandatory VM lifecycle.'),
  rec('IFS001', 'IntakeFormSection', { Name: 'Personal Details', ReferenceRecordId: 'AFM001', ApplicationStageDefinitionId: 'ASD001', Type: 'Application', SequenceNumber: 1, IsRequired: true, IsSubmitted: true }),
  rec('AFR001', 'ApplicationFormRelation', { Name: 'Sarah → Health Camp First Aid', ApplicationFormId: 'AFM001', JobPositionId: 'JOB001' }),
  rec('AFE001', 'ApplicationFormEvaluation', { Name: 'Screening Evaluation', ApplicationFormId: 'AFM001', ApplicationFormRelationId: 'AFR001' }),
  rec('APT001', 'ActionPlanTemplate', { Name: 'Volunteer Onboarding', UniqueName: 'Volunteer_Onboarding', Status: 'Final' }),
  rec('ATV001', 'ActionPlanTemplateVersion', { Name: 'Volunteer Onboarding v1', ActionPlanTemplateId: 'APT001', Version: 1 }),
  rec('ATI001', 'ActionPlanTemplateItem', { Name: 'Attend safety briefing', UniqueName: 'Safety_Briefing', ActionPlanTemplateVersionId: 'ATV001', ItemEntityType: 'Task', DisplayOrder: 1, IsRequired: true }),
  rec('ATA001', 'ActionPlanTemplateAssignment', { Name: 'Onboarding for Health Camp First Aid', ActionPlanTemplateId: 'APT001', PositionId: 'POS001', JobPositionId: 'JOB001' }),
  rec('APL001', 'ActionPlan', { Name: 'Sarah Ahmed — Onboarding', ActionPlanTemplateVersionId: 'ATV001', ApplicationFormEvaluationId: 'AFE001', StartDate: '2026-09-15', ActionPlanState: 'In Progress', ActionPlanType: 'Industries' }),
  rec('API001', 'ActionPlanItem', { Name: 'Attend safety briefing', ActionPlanId: 'APL001', ItemState: 'Completed', IsRequired: true }),
  rec('API002', 'ActionPlanItem', { Name: 'Complete personal details', ActionPlanId: 'APL001', IntakeFormSectionId: 'IFS001', ItemState: 'Completed', IsRequired: true }),
]

export const seedRecords = Object.fromEntries(list.map((r) => [r.id, r]))
