// Object definitions for the NPC Volunteer Management data model.
//
// Source: docs/vm-erd.png — objects and relationships only, NO field lists.
// - apiName is provisional (label without spaces) unless the object is a
//   Salesforce standard object.
// - description stays null until a source definition is supplied.
// - Lookup / Master-Detail fields are NOT listed here: index.js generates them
//   from relationships.js.
//
// To add real fields later, add entries to `fields` on the object and set
// `fieldsStatus: 'sourced'` (see docs/vm-schema-notes.md).

const NAME_FIELD = { apiName: 'Name', label: 'Name', type: 'Text', required: null, source: 'assumed-standard' }

function customObject(label, area, extra = {}) {
  return {
    apiName: label.replace(/[^A-Za-z0-9]/g, ''),
    apiNameStatus: 'provisional',
    label,
    area,
    isStandard: false,
    description: null,
    descriptionStatus: 'todo',
    notes: [],
    fields: [NAME_FIELD],
    fieldsStatus: 'todo',
    ...extra,
  }
}

function standardObject(apiName, label, area, extra = {}) {
  return {
    ...customObject(label, area, extra),
    apiName,
    // Standard Salesforce object API names are well known (Account, Contact, Location).
    apiNameStatus: 'standard',
    isStandard: true,
  }
}

export const objects = [
  // ---------- Application ----------
  customObject('Application Stage Definition', 'application'),
  customObject('Application Render Method', 'application'),
  customObject('Intake Form Section', 'application'),
  customObject('Application Form', 'application'),
  customObject('Application Form Evaluation', 'application'),
  customObject('Application Form Relation', 'application'),

  // ---------- Action Plans ----------
  customObject('Action Plan Template', 'action-plans'),
  customObject('Action Plan Template Version', 'action-plans'),
  customObject('Action Plan Template Item', 'action-plans'),
  customObject('Action Plan Template Assignment', 'action-plans'),
  customObject('Action Plan', 'action-plans'),
  customObject('Action Plan Item', 'action-plans'),

  // ---------- Program Management ----------
  customObject('Benefit', 'program-management'),

  // ---------- Volunteer ----------
  standardObject('Account', 'Person Account', 'volunteer', {
    accountTypes: ['Person Account', 'Business Account'],
    notes: [
      'Drawn on the ERD as one "Person Account" box containing two dotted inner boxes: Person Account and Business Account. Modelled here as the single standard Account object with two account types.',
      'The ERD connects most volunteer objects to the Person Account side. The Business Account inner box connects to Contact.',
    ],
  }),
  standardObject('Contact', 'Contact', 'volunteer', {
    notes: [
      'A person account is backed by a contact — drawn on the ERD as a one-to-one link between Person Account and Contact.',
    ],
  }),
  customObject('Contact Profile', 'volunteer'),
  customObject('Constituent Role', 'volunteer'),
  customObject('Person Competency', 'volunteer'),
  customObject('Person Examination', 'volunteer'),
  customObject('Donor Gift Summary', 'volunteer'),
  customObject('Person Location Availability', 'volunteer'),
  customObject('Operating Hours', 'volunteer'),
  customObject('Time Slot', 'volunteer'),

  // ---------- Volunteer Management ----------
  customObject('Competency', 'volunteer-management'),
  customObject('Examination', 'volunteer-management'),
  customObject('Position', 'volunteer-management'),
  customObject('Position Benefit', 'volunteer-management'),
  customObject('Position Qualification', 'volunteer-management'),
  customObject('Job Position', 'volunteer-management'),
  customObject('Job Position Qualification', 'volunteer-management'),
  customObject('Job Position Assignment', 'volunteer-management'),
  customObject('Job Position Shift', 'volunteer-management'),
  customObject('Volunteer Initiative', 'volunteer-management'),
  customObject('Recurrence Schedule', 'volunteer-management'),
  standardObject('Location', 'Location', 'volunteer-management', {
    notes: ['A Salesforce standard object, drawn inside the Volunteer Management area of the ERD.'],
  }),
]
