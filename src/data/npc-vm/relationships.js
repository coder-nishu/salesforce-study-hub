// Relationship definitions for the NPC Volunteer Management data model — the single list.
//
// Read from docs/vm-erd.png, then checked against the official Salesforce object references
// (see docs/vm-model-reconciliation.md). Format: child → parent.
//
//   type: 'Lookup' | 'MasterDetail' | 'StandardLink'
//     MasterDetail = diamond on the parent end of the line.
//   parentCardinality — the glyph at the PARENT end:
//     'one'          single or double bar   (the child must have a parent)
//     'zero-or-one'  circle + bar           (the parent is optional)
//   childCardinality — the glyph at the CHILD end:
//     'many' (circle + crow's foot) | 'one-or-many' (bar + crow's foot)
//     'zero-or-one' (circle + bar)  | 'one' (bar)
//   confidence:
//     'erd'      read clearly from the image
//     'official' ERD reading confirmed by the official Salesforce object reference
//     'verify'   check against the source
//   constraint: null, or { type: 'oneOf', group } — the child references exactly one member
//     of the group (the "OR" arcs on the ERD).
//   fieldApiName: the lookup field on the child. fieldStatus 'official' = name from the
//     Salesforce object reference; 'provisional' = derived from the label (not verified).
//     Relationships that share a child + fieldApiName become ONE polymorphic field.
//   officialRequired: what the official reference says about the field being required.
//     It overrides the ERD cardinality for the required flag; any difference is shown in the UI.
//
// Lookup / Master-Detail fields on each child are generated from this list (see index.js).

function rel(id, child, parent, type, options = {}) {
  return {
    id,
    child,
    parent,
    type,
    fieldLabel: options.fieldLabel ?? null, // null → defaults to the parent's label
    parentCardinality: options.parentCardinality ?? (type === 'MasterDetail' ? 'one' : 'zero-or-one'),
    childCardinality: options.childCardinality ?? 'many',
    confidence: options.confidence ?? 'erd',
    constraint: options.constraint ?? null,
    note: options.note ?? null,
    fieldApiName: options.fieldApiName ?? null,
    fieldStatus: options.fieldApiName ? 'official' : 'provisional',
    officialRequired: options.officialRequired,
    officialNote: options.officialNote ?? null,
  }
}

const ONE = { parentCardinality: 'one' }
const QUALIFICATION = {
  constraint: { type: 'oneOf', group: 'qualification-target' },
  fieldApiName: 'QualificationReferenceRecordId',
  fieldLabel: 'Qualification Reference Record',
  officialRequired: true,
  confidence: 'official',
  officialNote:
    'Officially one polymorphic field, QualificationReferenceRecordId, that points to a Competency OR an Examination — the ERD’s OR arc.',
}

export const relationships = [
  // ---------- Application ----------
  rel('asd-renderMethod', 'ApplicationStageDefinition', 'ApplicationRenderMethod', 'Lookup'),
  rel('ifs-stageDefinition', 'IntakeFormSection', 'ApplicationStageDefinition', 'Lookup', {
    fieldApiName: 'ApplicationStageDefinitionId',
    officialRequired: false,
    confidence: 'official',
  }),
  rel('ifs-applicationForm', 'IntakeFormSection', 'ApplicationForm', 'Lookup', {
    fieldApiName: 'ReferenceRecordId',
    fieldLabel: 'Reference Record',
    officialRequired: false,
    confidence: 'official',
    note: 'Crow’s foot is on the Intake Form Section end, so Intake Form Section is the child.',
    officialNote:
      'Official IntakeFormSection.ReferenceRecordId points to Application Form (also Public Complaint and Referral — not in the ERD), confirming the direction.',
  }),
  rel('af-account', 'ApplicationForm', 'Account', 'Lookup', {
    fieldApiName: 'AccountId',
    fieldLabel: 'Account',
    officialRequired: false,
    confidence: 'official',
  }),
  rel('afe-applicationForm', 'ApplicationFormEvaluation', 'ApplicationForm', 'Lookup', ONE),
  rel('afr-applicationForm', 'ApplicationFormRelation', 'ApplicationForm', 'MasterDetail'),
  rel('afe-applicationFormRelation', 'ApplicationFormEvaluation', 'ApplicationFormRelation', 'Lookup', {
    confidence: 'verify',
    note: 'Crow’s foot is on the Application Form Evaluation end, so Evaluation is the child (an earlier reading had it reversed).',
  }),
  rel('afr-jobPosition', 'ApplicationFormRelation', 'JobPosition', 'Lookup', ONE),

  // ---------- Action Plans ----------
  rel('aptv-template', 'ActionPlanTemplateVersion', 'ActionPlanTemplate', 'Lookup', {
    ...ONE,
    fieldApiName: 'ActionPlanTemplateId',
    officialRequired: true,
    confidence: 'official',
  }),
  rel('apti-templateVersion', 'ActionPlanTemplateItem', 'ActionPlanTemplateVersion', 'Lookup', {
    ...ONE,
    fieldApiName: 'ActionPlanTemplateVersionId',
    officialRequired: true,
    confidence: 'official',
  }),
  rel('ap-templateVersion', 'ActionPlan', 'ActionPlanTemplateVersion', 'Lookup', {
    ...ONE,
    fieldApiName: 'ActionPlanTemplateVersionId',
    officialRequired: true,
    confidence: 'official',
  }),
  rel('api-actionPlan', 'ActionPlanItem', 'ActionPlan', 'MasterDetail', {
    fieldApiName: 'ActionPlanId',
    confidence: 'official',
  }),
  rel('apta-template', 'ActionPlanTemplateAssignment', 'ActionPlanTemplate', 'MasterDetail'),
  rel('apta-position', 'ActionPlanTemplateAssignment', 'Position', 'Lookup', ONE),
  rel('apta-jobPosition', 'ActionPlanTemplateAssignment', 'JobPosition', 'Lookup', ONE),

  // Cross-area links from Application / Action Plans
  rel('api-intakeFormSection', 'ActionPlanItem', 'IntakeFormSection', 'Lookup'),
  rel('ap-applicationFormEvaluation', 'ActionPlan', 'ApplicationFormEvaluation', 'Lookup'),

  // ---------- Program Management ----------
  rel('pb-benefit', 'PositionBenefit', 'Benefit', 'Lookup', {
    ...ONE,
    fieldApiName: 'BenefitId',
    officialRequired: true,
    confidence: 'official',
  }),
  rel('pb-position', 'PositionBenefit', 'Position', 'MasterDetail', {
    fieldApiName: 'PositionId',
    confidence: 'official',
  }),

  // ---------- Volunteer ----------
  rel('cr-account', 'ConstituentRole', 'Account', 'Lookup', { ...ONE, fieldLabel: 'Account' }),
  rel('pc-account', 'PersonCompetency', 'Account', 'Lookup', {
    fieldApiName: 'PersonId',
    fieldLabel: 'Person',
    officialRequired: true,
    officialNote:
      'Officially PersonId is polymorphic (Account, Contact, Employee). The ERD links Person Account, so only Account is modelled.',
  }),
  rel('pc-competency', 'PersonCompetency', 'Competency', 'Lookup', {
    fieldApiName: 'CompetencyId',
    officialRequired: true,
    confidence: 'official',
  }),
  rel('pe-account', 'PersonExamination', 'Account', 'Lookup', {
    fieldLabel: 'Account',
    officialNote:
      'Official reference: Person Examination links to a Contact (ContactId). The ERD draws Person Account — the ERD link is kept.',
  }),
  rel('pe-examination', 'PersonExamination', 'Examination', 'Lookup', {
    fieldApiName: 'ExaminationId',
    officialRequired: false,
    confidence: 'official',
  }),
  rel('dgs-account', 'DonorGiftSummary', 'Account', 'MasterDetail', {
    fieldLabel: 'Account',
    childCardinality: 'zero-or-one',
  }),
  rel('pla-account', 'PersonLocationAvailability', 'Account', 'Lookup', {
    ...ONE,
    fieldApiName: 'AccountId',
    fieldLabel: 'Account',
    officialRequired: true,
    confidence: 'official',
  }),
  rel('pla-operatingHours', 'PersonLocationAvailability', 'OperatingHours', 'Lookup', {
    childCardinality: 'zero-or-one',
    fieldApiName: 'OperatingHoursId',
    officialRequired: false,
    confidence: 'official',
    note: 'Both ends are drawn as zero-or-one (a one-to-one link), so the direction could not be read from the ERD.',
    officialNote: 'Official PersonLocationAvailability.OperatingHoursId confirms the direction.',
  }),
  rel('pla-location', 'PersonLocationAvailability', 'Location', 'Lookup', {
    ...ONE,
    fieldApiName: 'LocationId',
    officialRequired: true,
    confidence: 'official',
  }),
  rel('jpa-account', 'JobPositionAssignment', 'Account', 'Lookup', {
    ...ONE,
    fieldApiName: 'AssignedAccountId',
    fieldLabel: 'Assigned Account',
    officialRequired: false,
    confidence: 'official',
    officialNote: 'The ERD glyph reads required; the official reference marks AssignedAccountId optional. The official flag is used.',
  }),
  rel('account-contact', 'Account', 'Contact', 'StandardLink', {
    parentCardinality: 'one',
    childCardinality: 'one',
    fieldApiName: 'PersonContactId',
    fieldLabel: 'Person Contact',
    note: 'A person account is backed by a contact. Drawn as a one-to-one line between the Person Account box and Contact.',
  }),
  rel('contact-businessAccount', 'Contact', 'Account', 'Lookup', {
    fieldApiName: 'AccountId',
    fieldLabel: 'Account',
    confidence: 'verify',
    note: 'Line from the Business Account inner box (zero-or-one) to Contact. The Contact end has no glyph drawn, so its cardinality is assumed.',
  }),
  rel('cp-contact', 'ContactProfile', 'Contact', 'MasterDetail', { childCardinality: 'zero-or-one' }),
  rel('ts-operatingHours', 'TimeSlot', 'OperatingHours', 'Lookup', {
    ...ONE,
    fieldApiName: 'OperatingHoursId',
    officialRequired: true,
    confidence: 'official',
  }),

  // ---------- Volunteer Management ----------
  rel('pq-position', 'PositionQualification', 'Position', 'MasterDetail', {
    fieldApiName: 'PositionId',
    confidence: 'official',
  }),
  rel('pq-competency', 'PositionQualification', 'Competency', 'Lookup', QUALIFICATION),
  rel('pq-examination', 'PositionQualification', 'Examination', 'Lookup', QUALIFICATION),
  rel('jpq-jobPosition', 'JobPositionQualification', 'JobPosition', 'MasterDetail', {
    fieldApiName: 'JobPositionId',
    confidence: 'official',
  }),
  rel('jpq-competency', 'JobPositionQualification', 'Competency', 'Lookup', QUALIFICATION),
  rel('jpq-examination', 'JobPositionQualification', 'Examination', 'Lookup', QUALIFICATION),
  rel('jp-position', 'JobPosition', 'Position', 'Lookup', {
    fieldApiName: 'PositionId',
    officialRequired: false,
    confidence: 'official',
  }),
  rel('jp-location', 'JobPosition', 'Location', 'Lookup', {
    fieldApiName: 'LocationId',
    officialRequired: false,
    confidence: 'official',
  }),
  rel('jp-volunteerInitiative', 'JobPosition', 'VolunteerInitiative', 'Lookup', {
    officialNote:
      'Salesforce Help relates a job position to an initiative through the “Related Volunteer Initiative” list; the exact field was not in the fetched reference.',
  }),
  rel('jpa-jobPosition', 'JobPositionAssignment', 'JobPosition', 'Lookup', {
    fieldApiName: 'JobPositionId',
    officialRequired: false,
    confidence: 'official',
  }),
  rel('jpa-volunteerInitiative', 'JobPositionAssignment', 'VolunteerInitiative', 'Lookup', {
    fieldApiName: 'RelatedVolunteerInitiativeId',
    fieldLabel: 'Related Volunteer Initiative',
    officialRequired: false,
    confidence: 'official',
  }),
  rel('jps-jobPosition', 'JobPositionShift', 'JobPosition', 'Lookup', {
    fieldApiName: 'JobPositionId',
    officialRequired: true,
    confidence: 'official',
    officialNote: 'The ERD glyph reads optional; the official reference marks JobPositionId required. The official flag is enforced.',
  }),
  rel('jpa-jobPositionShift', 'JobPositionAssignment', 'JobPositionShift', 'Lookup', {
    fieldApiName: 'AssignedPositionShiftId',
    fieldLabel: 'Assigned Position Shift',
    officialRequired: false,
    confidence: 'official',
    note: 'Crow’s foot is on the Job Position Assignment end, so the assignment is the child.',
    officialNote: 'Official JobPositionAssignment.AssignedPositionShiftId confirms the direction.',
  }),
  rel('jps-recurrenceSchedule', 'JobPositionShift', 'RecurrenceSchedule', 'Lookup', {
    childCardinality: 'one-or-many',
    fieldApiName: 'RecurrenceScheduleId',
    officialRequired: false,
    confidence: 'official',
  }),
  rel('rs-jobPosition', 'RecurrenceSchedule', 'JobPosition', 'Lookup', ONE),
  rel('vi-parent', 'VolunteerInitiative', 'VolunteerInitiative', 'Lookup', {
    fieldApiName: 'ParentVolunteerInitiativeId',
    fieldLabel: 'Parent Volunteer Initiative',
    officialRequired: false,
    confidence: 'official',
    note: 'Self-reference: an initiative can have a parent initiative.',
  }),
]
