// Field definitions and record settings per object — everything EXCEPT relationship fields.
// Lookup / Master-Detail fields are generated from relationships.js by index.js.
//
// sourceStatus on each field:
//   'official'          Salesforce object reference or Help article (sourceRef on the object)
//   'assumed-standard'  well-known standard object field, not re-checked for this lab
//   'course'            from your course documents — illustrative demo fields, not official
//   'learning'          simulator-only (clearly labelled in the UI)
// optionsSource: where picklist values come from, when it differs from the field's source.
//
// Record settings:
//   idPrefix   record IDs are <idPrefix><seq>, e.g. JPS003 (prefixes are unique → polymorphic
//              lookups can tell which object an ID belongs to)
//   nameField  field shown as the record's name ('Name' unless noted)
//   listFields fields shown in record list tables (after the name)

const OBJ_REF = 'https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/object_reference/'
const NPC_REF = 'https://developer.salesforce.com/docs/atlas.en-us.nonprofit_cloud.meta/nonprofit_cloud/'
const PSC_REF = 'https://developer.salesforce.com/docs/atlas.en-us.psc_api.meta/psc_api/'
const HELP = 'https://help.salesforce.com/s/articleView?type=5&id='

function f(apiName, label, type, options = {}) {
  return {
    apiName,
    label,
    type,
    required: options.required ?? false,
    options: options.options ?? null,
    optionsSource: options.optionsSource ?? null,
    description: options.description ?? null,
    sourceStatus: options.source ?? 'official',
    defaultValue: options.defaultValue,
    compute: options.compute ?? null, // Computed fields: key resolved by src/lib/vm/capacity.js
  }
}

const autoName = (description = 'Salesforce automatically assigns an alphanumeric name.') =>
  f('Name', 'Name', 'AutoNumber', { description })

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const TIME_ZONES = ['Asia/Dhaka', 'UTC']
const PROFICIENCY = ['Beginner', 'Intermediate', 'Advanced']

export const objectConfig = {
  // ---------- Application ----------
  ApplicationStageDefinition: { idPrefix: 'ASD', fields: [f('Name', 'Name', 'Text', { required: true, source: 'assumed-standard' })] },
  ApplicationRenderMethod: { idPrefix: 'ARM', fields: [f('Name', 'Name', 'Text', { required: true, source: 'assumed-standard' })] },
  IntakeFormSection: {
    idPrefix: 'IFS',
    sourceRef: `${PSC_REF}sforce_api_objects_intakeformsection.htm`,
    listFields: ['Type', 'SequenceNumber', 'IsSubmitted'],
    fields: [
      f('Name', 'Name', 'Text', { required: true }),
      f('Type', 'Type', 'Picklist', { required: true, options: ['Application', 'Complaint', 'Referral'] }),
      f('SequenceNumber', 'Sequence Number', 'Number'),
      f('DueDate', 'Due Date', 'Date'),
      f('IsRequired', 'Required', 'Checkbox'),
      f('IsSubmitted', 'Submitted', 'Checkbox'),
      f('Description', 'Description', 'Text'),
    ],
  },
  ApplicationForm: {
    idPrefix: 'AFM',
    sourceRef: `${PSC_REF}sforce_api_objects_applicationform.htm`,
    listFields: ['SubmissionDate', 'Score'],
    fields: [
      f('Name', 'Name', 'Text', { required: true }),
      f('SubmissionDate', 'Submission Date', 'Date'),
      f('ApplicationSummary', 'Application Summary', 'LongText'),
      f('Score', 'Score', 'Number'),
    ],
  },
  ApplicationFormEvaluation: { idPrefix: 'AFE', fields: [f('Name', 'Name', 'Text', { required: true, source: 'assumed-standard' })] },
  ApplicationFormRelation: { idPrefix: 'AFR', fields: [f('Name', 'Name', 'Text', { required: true, source: 'assumed-standard' })] },

  // ---------- Action Plans ----------
  ActionPlanTemplate: {
    idPrefix: 'APT',
    sourceRef: `${OBJ_REF}sforce_api_objects_actionplantemplate.htm`,
    listFields: ['Status'],
    fields: [
      f('Name', 'Name', 'Text', { required: true }),
      f('UniqueName', 'Unique Name', 'Text', { required: true }),
      f('Description', 'Description', 'LongText'),
      f('Status', 'Status', 'Picklist', { options: ['Draft', 'Final', 'Obsolete'] }),
    ],
  },
  ActionPlanTemplateVersion: {
    idPrefix: 'ATV',
    sourceRef: `${OBJ_REF}sforce_api_objects_actionplantemplateversion.htm`,
    listFields: ['Version'],
    fields: [f('Name', 'Name', 'Text', { required: true }), f('Version', 'Version', 'Number', { required: true })],
  },
  ActionPlanTemplateItem: {
    idPrefix: 'ATI',
    sourceRef: `${OBJ_REF}sforce_api_objects_actionplantemplateitem.htm`,
    listFields: ['ItemEntityType', 'DisplayOrder'],
    fields: [
      f('Name', 'Name', 'Text', { required: true }),
      f('UniqueName', 'Unique Name', 'Text', { required: true }),
      f('ItemEntityType', 'Item Entity Type', 'Picklist', { required: true, options: ['Task', 'Document Checklist Item'] }),
      f('DisplayOrder', 'Display Order', 'Number'),
      f('IsRequired', 'Required', 'Checkbox'),
    ],
  },
  ActionPlanTemplateAssignment: { idPrefix: 'ATA', fields: [f('Name', 'Name', 'Text', { required: true, source: 'assumed-standard' })] },
  ActionPlan: {
    idPrefix: 'APL',
    sourceRef: `${OBJ_REF}sforce_api_objects_actionplan.htm`,
    listFields: ['ActionPlanState', 'StartDate'],
    fields: [
      f('Name', 'Name', 'Text', { required: true }),
      f('StartDate', 'Start Date', 'Date', { required: true }),
      f('ActionPlanState', 'Action Plan State', 'Picklist', {
        required: true,
        options: ['Not Started', 'In Progress', 'Complete', 'Canceled'],
        defaultValue: 'Not Started',
      }),
      f('ActionPlanType', 'Action Plan Type', 'Picklist', { required: true, options: ['Industries', 'Service'] }),
    ],
  },
  ActionPlanItem: {
    idPrefix: 'API',
    sourceRef: `${OBJ_REF}sforce_api_objects_actionplanitem.htm`,
    listFields: ['ItemState', 'IsRequired'],
    fields: [
      f('Name', 'Name', 'Text', { required: true }),
      f('ItemState', 'Item State', 'Picklist', {
        required: true,
        options: ['Pending', 'In Progress', 'Completed', 'Canceled'],
        defaultValue: 'Pending',
      }),
      f('IsRequired', 'Required', 'Checkbox'),
    ],
  },

  // ---------- Program Management ----------
  Benefit: {
    idPrefix: 'BEN',
    fields: [
      f('Name', 'Name', 'Text', { required: true, source: 'assumed-standard' }),
      f('Description', 'Description', 'Text', { source: 'course' }),
    ],
  },

  // ---------- Volunteer ----------
  Account: {
    idPrefix: 'ACC',
    listFields: ['AccountType', 'PersonEmail', 'Phone'],
    fields: [
      f('Name', 'Name', 'Text', {
        required: true,
        source: 'assumed-standard',
        description: 'Simplified: real person accounts store First Name and Last Name.',
      }),
      f('AccountType', 'Account Type', 'Picklist', {
        required: true,
        options: ['Person Account', 'Business Account'],
        defaultValue: 'Person Account',
        source: 'learning',
        description: 'Simplified stand-in for Salesforce’s person-account record type.',
      }),
      f('PersonEmail', 'Email', 'Email', { source: 'assumed-standard' }),
      f('Phone', 'Phone', 'Phone', { source: 'assumed-standard' }),
    ],
  },
  Contact: {
    idPrefix: 'CON',
    nameField: ['FirstName', 'LastName'],
    listFields: ['Email', 'Phone'],
    fields: [
      f('FirstName', 'First Name', 'Text', { source: 'assumed-standard' }),
      f('LastName', 'Last Name', 'Text', { required: true, source: 'assumed-standard' }),
      f('Email', 'Email', 'Email', { source: 'assumed-standard' }),
      f('Phone', 'Phone', 'Phone', { source: 'assumed-standard' }),
    ],
  },
  ContactProfile: {
    idPrefix: 'CPR',
    listFields: ['Department', 'Designation'],
    fields: [
      f('Name', 'Name', 'Text', { required: true, source: 'assumed-standard' }),
      f('Department', 'Department', 'Text', { source: 'course' }),
      f('Designation', 'Designation', 'Text', { source: 'course' }),
    ],
  },
  ConstituentRole: {
    idPrefix: 'CRL',
    listFields: ['Role', 'Status'],
    fields: [
      f('Name', 'Name', 'Text', { required: true, source: 'assumed-standard' }),
      f('Role', 'Role', 'Text', { source: 'course' }),
      f('Status', 'Status', 'Picklist', { options: ['Active', 'Inactive'], source: 'course' }),
      f('StartDate', 'Start Date', 'Date', { source: 'course' }),
    ],
  },
  PersonCompetency: {
    idPrefix: 'PCM',
    sourceRef: `${PSC_REF}sforce_api_objects_personcompetency.htm`,
    listFields: ['QualificationLevel', 'ProficiencyLevel'],
    fields: [
      autoName(),
      f('QualificationLevel', 'Qualification Level', 'Number', {
        description:
          'An integer. Matching evaluates this (not Proficiency Level); a Person Competency needs a QL to appear as a match.',
      }),
      f('ProficiencyLevel', 'Proficiency Level', 'Picklist', {
        required: true,
        options: PROFICIENCY,
        optionsSource: 'learning',
        description: 'A dynamic value such as Beginner or Intermediate. Not evaluated by matching.',
      }),
      f('VerificationDate', 'Verification Date', 'Date'),
      f('EffectiveStartDate', 'Effective Start Date', 'Date'),
      f('EffectiveEndDate', 'Effective End Date', 'Date'),
    ],
  },
  PersonExamination: {
    idPrefix: 'PEX',
    sourceRef: `${PSC_REF}sforce_api_objects_personexamination.htm`,
    listFields: ['Result', 'Score', 'ExaminationDate'],
    fields: [
      f('Name', 'Name', 'Text'),
      f('ExaminationDate', 'Examination Date', 'Date'),
      f('Result', 'Result', 'Picklist', { options: ['Pass', 'Fail'] }),
      f('Score', 'Score', 'Number'),
      f('EffectiveFrom', 'Effective From', 'Date'),
      f('EffectiveTo', 'Effective To', 'Date'),
      f('VerificationStatus', 'Verification Status', 'Picklist', { options: ['Verified', 'Not Verified'] }),
    ],
  },
  DonorGiftSummary: {
    idPrefix: 'DGS',
    listFields: ['TotalGifts', 'GiftCount'],
    fields: [
      f('Name', 'Name', 'Text', { required: true, source: 'assumed-standard' }),
      f('TotalGifts', 'Total Gifts', 'Currency', { source: 'course' }),
      f('GiftCount', 'Gift Count', 'Number', { source: 'course' }),
      f('LastGiftDate', 'Last Gift Date', 'Date', { source: 'course' }),
    ],
  },
  PersonLocationAvailability: {
    idPrefix: 'PLA',
    sourceRef: `${NPC_REF}volunteer_mgmt_api_objects_personlocationavailability.htm`,
    listFields: ['UsageType'],
    fields: [
      autoName(),
      f('UsageType', 'Usage Type', 'Picklist', {
        required: true,
        options: ['VolunteerManagement'],
        defaultValue: 'VolunteerManagement',
      }),
    ],
  },
  OperatingHours: {
    idPrefix: 'OPH',
    sourceRef: `${OBJ_REF}sforce_api_objects_operatinghours.htm`,
    listFields: ['TimeZone'],
    fields: [
      f('Name', 'Name', 'Text', { required: true }),
      f('TimeZone', 'Time Zone', 'Picklist', {
        required: true,
        options: TIME_ZONES,
        optionsSource: 'learning',
        defaultValue: 'Asia/Dhaka',
      }),
      f('Description', 'Description', 'LongText'),
    ],
  },
  TimeSlot: {
    idPrefix: 'TSL',
    sourceRef: `${OBJ_REF}sforce_api_objects_timeslot.htm`,
    nameField: ['DayOfWeek', 'StartTime', 'EndTime'],
    listFields: ['DayOfWeek', 'StartTime', 'EndTime', 'Type'],
    fields: [
      f('DayOfWeek', 'Day of Week', 'Picklist', { required: true, options: DAYS }),
      f('StartTime', 'Start Time', 'Time', { required: true }),
      f('EndTime', 'End Time', 'Time', { required: true }),
      f('Type', 'Type', 'Picklist', { required: true, options: ['Normal', 'Extended'], defaultValue: 'Normal' }),
    ],
  },

  // ---------- Volunteer Management ----------
  Competency: {
    idPrefix: 'CMP',
    sourceRef: `${PSC_REF}sforce_api_objects_competency.htm`,
    listFields: ['Description'],
    fields: [f('Name', 'Name', 'Text', { required: true }), f('Description', 'Description', 'LongText')],
  },
  Examination: {
    idPrefix: 'EXM',
    sourceRef: `${PSC_REF}sforce_api_objects_examination.htm`,
    listFields: ['Status'],
    fields: [
      f('Name', 'Name', 'Text', { required: true }),
      f('Description', 'Description', 'LongText'),
      f('Status', 'Status', 'Picklist', { options: ['Active', 'Inactive'], defaultValue: 'Active' }),
    ],
  },
  Position: {
    idPrefix: 'POS',
    sourceRef: `${PSC_REF}sforce_api_objects_position.htm`,
    listFields: ['Status', 'Code'],
    fields: [
      f('Name', 'Name', 'Text', { required: true }),
      f('Code', 'Code', 'Text'),
      f('Description', 'Description', 'LongText'),
      f('Status', 'Status', 'Picklist', { options: ['Active', 'Inactive'], optionsSource: 'course', defaultValue: 'Active' }),
    ],
  },
  PositionBenefit: { idPrefix: 'PBN', sourceRef: `${NPC_REF}volunteer_mgmt_api_objectspositionbenefit.htm`, fields: [autoName()] },
  PositionQualification: {
    idPrefix: 'PQL',
    sourceRef: `${NPC_REF}volunteer_mgmt_api_objects_positionqualification.htm`,
    listFields: ['QualificationLevel', 'ProficiencyLevel'],
    fields: [
      autoName(),
      f('QualificationLevel', 'Qualification Level', 'Number', {
        description: 'The integer level a volunteer’s Person Competency must equal or exceed.',
      }),
      f('ProficiencyLevel', 'Proficiency Level', 'Picklist', { options: PROFICIENCY }),
      f('Description', 'Description', 'Text'),
    ],
  },
  JobPosition: {
    idPrefix: 'JOB',
    sourceRef: `${PSC_REF}sforce_api_objects_jobposition.htm`,
    listFields: ['Title', 'Status'],
    fields: [
      f('Name', 'Name', 'Text', { required: true }),
      f('Title', 'Title', 'Text', { required: true }),
      f('Code', 'Code', 'Text'),
      f('Description', 'Description', 'LongText'),
      f('StartDate', 'Start Date', 'Date'),
      f('EndDate', 'End Date', 'Date'),
      f('Status', 'Status', 'Picklist', { options: ['Upcoming', 'In Progress', 'Complete', 'Canceled'], defaultValue: 'Upcoming' }),
    ],
  },
  JobPositionQualification: {
    idPrefix: 'JPQ',
    sourceRef: `${NPC_REF}volunteer_mgmt_api_objects_jobpositionqualification.htm`,
    listFields: ['QualificationLevel', 'ProficiencyLevel'],
    fields: [
      autoName(),
      f('QualificationLevel', 'Qualification Level', 'Number', {
        description: 'Additive: applies only to this job position, on top of the Position’s qualifications.',
      }),
      f('ProficiencyLevel', 'Proficiency Level', 'Picklist', { options: PROFICIENCY }),
      f('Description', 'Description', 'Text'),
    ],
  },
  JobPositionAssignment: {
    idPrefix: 'JPA',
    sourceRef: `${NPC_REF}volunteer_mgmt_api_object_jobpositionassignment.htm`,
    listFields: ['Status', 'DoesCountTowardShiftCapacity'],
    fields: [
      autoName(),
      f('Status', 'Status', 'Picklist', {
        required: true,
        options: ['Upcoming', 'Awaiting Approval', 'In Progress', 'Complete', 'Pending Verification', 'Absent', 'Canceled'],
        defaultValue: 'Upcoming',
      }),
      f('DoesCountTowardShiftCapacity', 'Count Toward Shift Capacity', 'Checkbox', {
        defaultValue: false,
        description: 'Only assignments with this checked use up the shift’s capacity.',
      }),
      f('ScheduledStartTime', 'Scheduled Start Time', 'DateTime'),
      f('ScheduledEndTime', 'Scheduled End Time', 'DateTime'),
      f('ActualStartTime', 'Actual Start Time', 'DateTime'),
      f('ActualEndTime', 'Actual End Time', 'DateTime'),
    ],
  },
  JobPositionShift: {
    idPrefix: 'JPS',
    sourceRef: `${NPC_REF}volunteer_mgmt_api_objects_jobpositionshift.htm`,
    listFields: ['StartDate', 'StartTime', 'EndTime', 'MaximumAttendeesCount', 'RemainingCapacity'],
    fields: [
      autoName(),
      f('StartDate', 'Start Date', 'Date'),
      f('StartTime', 'Start Time', 'Time'),
      f('EndDate', 'End Date', 'Date'),
      f('EndTime', 'End Time', 'Time'),
      f('MaximumAttendeesCount', 'Maximum Attendees', 'Number', {
        description: 'The maximum capacity for position assignments on this shift.',
      }),
      f('PositionAssignmentCount', 'Position Assignment Count', 'Computed', {
        compute: 'shift.assigned',
        description: 'Computed by the simulator from related Job Position Assignments.',
      }),
      f('RemainingCapacity', 'Remaining Capacity', 'Computed', {
        compute: 'shift.remaining',
        description: 'Maximum Attendees minus assignments that count toward capacity.',
      }),
      f('Status', 'Status', 'Picklist', { options: ['Upcoming', 'In Progress', 'Complete', 'Canceled'], defaultValue: 'Upcoming' }),
      f('TimeZone', 'Time Zone', 'Picklist', { required: true, options: TIME_ZONES, optionsSource: 'learning', defaultValue: 'Asia/Dhaka' }),
      f('Description', 'Description', 'Text'),
    ],
  },
  VolunteerInitiative: {
    idPrefix: 'VIN',
    sourceRef: `${NPC_REF}volunteer_mgmt_api_objects_volunteer_initiative.htm`,
    listFields: ['Status', 'StartDate', 'EndDate'],
    fields: [
      f('Name', 'Name', 'Text', { required: true }),
      f('Description', 'Description', 'LongText'),
      f('StartDate', 'Start Date', 'Date'),
      f('EndDate', 'End Date', 'Date'),
      f('Status', 'Status', 'Picklist', {
        options: ['Upcoming', 'In Progress', 'Complete', 'Postponed', 'Canceled', 'Archived'],
        defaultValue: 'Upcoming',
      }),
      f('IsPublished', 'Published', 'Checkbox', { description: 'Whether the initiative is available in an Experience Cloud site.' }),
    ],
  },
  RecurrenceSchedule: {
    idPrefix: 'RSC',
    sourceRef: `${PSC_REF}sforce_api_objects_recurrenceschedule.htm`,
    listFields: ['ScheduleFrequency', 'StartDate', 'EndDate'],
    fields: [
      f('Name', 'Name', 'Text', { required: true }),
      f('ScheduleFrequency', 'Schedule Frequency', 'Picklist', {
        options: ['Weekly', 'Biweekly', 'Monthly', 'Quarterly', 'Yearly'],
      }),
      f('StartDate', 'Start Date', 'Date'),
      f('EndDate', 'End Date', 'Date'),
      f('Status', 'Status', 'Picklist', { options: ['Active', 'Inactive'], defaultValue: 'Active' }),
    ],
  },
  Location: {
    idPrefix: 'LOC',
    sourceRef: `${OBJ_REF}sforce_api_objects_location.htm`,
    listFields: ['LocationType'],
    fields: [
      f('Name', 'Name', 'Text', { required: true }),
      f('LocationType', 'Location Type', 'Picklist', {
        options: ['Community Center', 'Office', 'Event Hall', 'Building'],
        optionsSource: 'course',
      }),
    ],
  },
}

export const HELP_LINKS = {
  match: `${HELP}sfdo.volunteer_mgmt_match_to_job_positions_and_shifts.htm`,
  assign: `${HELP}sfdo.volunteer_mgmt_assign_volunteers.htm`,
  positionQualifications: `${HELP}sfdo.volunteer_mgmt_create_position_qualifications.htm`,
  jobPositionQualifications: `${HELP}sfdo.volunteer_mgmt_create_job_position_qualifications.htm`,
  shifts: `${HELP}sfdo.volunteer_mgmt_create_job_position_shifts.htm`,
  volunteerDetails: `${HELP}sfdo.volunteer_mgmt_configure_volunteer_details.htm`,
  positions: `${HELP}sfdo.volunteer_mgmt_create_positions.htm`,
  jobPositions: `${HELP}sfdo.volunteer_mgmt_create_job_positions.htm`,
  initiatives: `${HELP}sfdo.volunteer_mgmt_create_volunteer_initiatives.htm`,
}
