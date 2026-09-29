// Relationship definitions for the NPC Volunteer Management data model — the single list.
//
// Read from docs/vm-erd.png. Format: child → parent.
//   type: 'Lookup' | 'MasterDetail' | 'StandardLink'
//     MasterDetail = diamond on the parent end of the line.
//   parentCardinality — the glyph at the PARENT end:
//     'one'          single or double bar   (the child must have a parent)
//     'zero-or-one'  circle + bar           (the parent is optional)
//   childCardinality — the glyph at the CHILD end:
//     'many' (circle + crow's foot) | 'one-or-many' (bar + crow's foot)
//     'zero-or-one' (circle + bar)  | 'one' (bar)
//   confidence: 'erd' = read clearly from the image, 'verify' = check against the source.
//   constraint: null, or { type: 'oneOf', group } — the child must reference exactly one
//     member of the group (the "OR" arcs on the ERD).
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
  }
}

const ONE = { parentCardinality: 'one' }
const QUALIFICATION_TARGET = { type: 'oneOf', group: 'qualification-target' }

export const relationships = [
  // ---------- Application ----------
  rel('asd-renderMethod', 'ApplicationStageDefinition', 'ApplicationRenderMethod', 'Lookup'),
  rel('ifs-stageDefinition', 'IntakeFormSection', 'ApplicationStageDefinition', 'Lookup'),
  rel('ifs-applicationForm', 'IntakeFormSection', 'ApplicationForm', 'Lookup', {
    confidence: 'verify',
    note: 'Crow’s foot is on the Intake Form Section end, so Intake Form Section is the child (an earlier reading had it reversed).',
  }),
  rel('af-account', 'ApplicationForm', 'Account', 'Lookup', { fieldLabel: 'Account' }),
  rel('afe-applicationForm', 'ApplicationFormEvaluation', 'ApplicationForm', 'Lookup', ONE),
  rel('afr-applicationForm', 'ApplicationFormRelation', 'ApplicationForm', 'MasterDetail'),
  rel('afe-applicationFormRelation', 'ApplicationFormEvaluation', 'ApplicationFormRelation', 'Lookup', {
    confidence: 'verify',
    note: 'Crow’s foot is on the Application Form Evaluation end, so Evaluation is the child (an earlier reading had it reversed).',
  }),
  rel('afr-jobPosition', 'ApplicationFormRelation', 'JobPosition', 'Lookup', ONE),

  // ---------- Action Plans ----------
  rel('aptv-template', 'ActionPlanTemplateVersion', 'ActionPlanTemplate', 'Lookup', ONE),
  rel('apti-templateVersion', 'ActionPlanTemplateItem', 'ActionPlanTemplateVersion', 'Lookup', ONE),
  rel('ap-templateVersion', 'ActionPlan', 'ActionPlanTemplateVersion', 'Lookup', ONE),
  rel('api-actionPlan', 'ActionPlanItem', 'ActionPlan', 'MasterDetail'),
  rel('apta-template', 'ActionPlanTemplateAssignment', 'ActionPlanTemplate', 'MasterDetail'),
  rel('apta-position', 'ActionPlanTemplateAssignment', 'Position', 'Lookup', ONE),
  rel('apta-jobPosition', 'ActionPlanTemplateAssignment', 'JobPosition', 'Lookup', ONE),

  // Cross-area links from Application / Action Plans
  rel('api-intakeFormSection', 'ActionPlanItem', 'IntakeFormSection', 'Lookup'),
  rel('ap-applicationFormEvaluation', 'ActionPlan', 'ApplicationFormEvaluation', 'Lookup'),

  // ---------- Program Management ----------
  rel('pb-benefit', 'PositionBenefit', 'Benefit', 'Lookup', ONE),
  rel('pb-position', 'PositionBenefit', 'Position', 'MasterDetail'),

  // ---------- Volunteer ----------
  rel('cr-account', 'ConstituentRole', 'Account', 'Lookup', { ...ONE, fieldLabel: 'Account' }),
  rel('pc-account', 'PersonCompetency', 'Account', 'Lookup', { fieldLabel: 'Account' }),
  rel('pc-competency', 'PersonCompetency', 'Competency', 'Lookup'),
  rel('pe-account', 'PersonExamination', 'Account', 'Lookup', { fieldLabel: 'Account' }),
  rel('pe-examination', 'PersonExamination', 'Examination', 'Lookup'),
  rel('dgs-account', 'DonorGiftSummary', 'Account', 'MasterDetail', {
    fieldLabel: 'Account',
    childCardinality: 'zero-or-one',
  }),
  rel('pla-account', 'PersonLocationAvailability', 'Account', 'Lookup', { ...ONE, fieldLabel: 'Account' }),
  rel('pla-operatingHours', 'PersonLocationAvailability', 'OperatingHours', 'Lookup', {
    childCardinality: 'zero-or-one',
    confidence: 'verify',
    note: 'Both ends are drawn as zero-or-one (a one-to-one link), so the direction cannot be read from the ERD.',
  }),
  rel('pla-location', 'PersonLocationAvailability', 'Location', 'Lookup', ONE),
  rel('jpa-account', 'JobPositionAssignment', 'Account', 'Lookup', { ...ONE, fieldLabel: 'Account' }),
  rel('account-contact', 'Account', 'Contact', 'StandardLink', {
    parentCardinality: 'one',
    childCardinality: 'one',
    note: 'A person account is backed by a contact. Drawn as a one-to-one line between the Person Account box and Contact.',
  }),
  rel('contact-businessAccount', 'Contact', 'Account', 'Lookup', {
    fieldLabel: 'Account',
    confidence: 'verify',
    note: 'Line from the Business Account inner box (zero-or-one) to Contact. The Contact end has no glyph drawn, so its cardinality is assumed.',
  }),
  rel('cp-contact', 'ContactProfile', 'Contact', 'MasterDetail', { childCardinality: 'zero-or-one' }),
  rel('ts-operatingHours', 'TimeSlot', 'OperatingHours', 'Lookup', ONE),

  // ---------- Volunteer Management ----------
  rel('pq-position', 'PositionQualification', 'Position', 'MasterDetail'),
  rel('pq-competency', 'PositionQualification', 'Competency', 'Lookup', { constraint: QUALIFICATION_TARGET }),
  rel('pq-examination', 'PositionQualification', 'Examination', 'Lookup', { constraint: QUALIFICATION_TARGET }),
  rel('jpq-jobPosition', 'JobPositionQualification', 'JobPosition', 'MasterDetail'),
  rel('jpq-competency', 'JobPositionQualification', 'Competency', 'Lookup', { constraint: QUALIFICATION_TARGET }),
  rel('jpq-examination', 'JobPositionQualification', 'Examination', 'Lookup', { constraint: QUALIFICATION_TARGET }),
  rel('jp-position', 'JobPosition', 'Position', 'Lookup'),
  rel('jp-location', 'JobPosition', 'Location', 'Lookup'),
  rel('jp-volunteerInitiative', 'JobPosition', 'VolunteerInitiative', 'Lookup'),
  rel('jpa-jobPosition', 'JobPositionAssignment', 'JobPosition', 'Lookup'),
  rel('jpa-volunteerInitiative', 'JobPositionAssignment', 'VolunteerInitiative', 'Lookup'),
  rel('jps-jobPosition', 'JobPositionShift', 'JobPosition', 'Lookup'),
  rel('jpa-jobPositionShift', 'JobPositionAssignment', 'JobPositionShift', 'Lookup', {
    confidence: 'verify',
    note: 'Crow’s foot is on the Job Position Assignment end, so the assignment is the child (an earlier reading had it reversed).',
  }),
  rel('jps-recurrenceSchedule', 'JobPositionShift', 'RecurrenceSchedule', 'Lookup', { childCardinality: 'one-or-many' }),
  rel('rs-jobPosition', 'RecurrenceSchedule', 'JobPosition', 'Lookup', ONE),
  rel('vi-parent', 'VolunteerInitiative', 'VolunteerInitiative', 'Lookup', {
    fieldLabel: 'Parent Volunteer Initiative',
    note: 'Self-reference: an initiative can have a parent initiative.',
  }),
]
