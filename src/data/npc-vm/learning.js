// Learning explanations — "Why does this object exist?" and "Why is this field here?"
//
// Every entry is tagged with its source, and the UI shows the tag:
//   'official'  quoted or closely paraphrased from the Salesforce object reference / Help
//   'course'    from your course documents (TwinForce / University guides)
//   'learning'  an explanation written for this lab (conceptual, not a Salesforce claim)
// Relationship explanations reuse the lookup field's entry (child object + field API name).

const official = (text) => ({ text, source: 'official' })
const course = (text) => ({ text, source: 'course' })
const learning = (text) => ({ text, source: 'learning' })

export const objectLearning = {
  Account: {
    question: 'WHO is the person?',
    why: [
      official('Volunteer Management uses Person Accounts for volunteers: “Create Person Accounts for your volunteers and include their availability and competencies.”'),
      learning('Everything about a volunteer — skills, exams, availability, assignments — hangs off their Person Account.'),
    ],
  },
  Contact: {
    question: 'How do we represent and contact the person?',
    why: [learning('A person account is backed by a contact. The lab creates it for you when you create a Person Account.')],
  },
  ContactProfile: { question: 'What additional profile information exists?', why: [course('Extra profile details (e.g. department, designation) for a contact.')] },
  ConstituentRole: { question: 'What constituent role does the person have?', why: [course('Records that the person is, for example, a Volunteer.')] },
  DonorGiftSummary: { question: 'What is the donor / gift summary?', why: [course('Supporting constituent information — not part of the volunteer assignment chain.')] },
  Competency: {
    question: 'WHAT skill exists?',
    why: [
      official('“Represents a skill, subject matter expertise, or behavior required for a job or role.”'),
      course('Competency = the skill definition. It says nothing about who has it.'),
    ],
  },
  PersonCompetency: {
    question: 'WHO has the skill, and at what level?',
    why: [
      official('“Represents information about a competency that a person has.”'),
      official('A Person Competency needs a Qualification Level (QL) to appear as a match. Matching evaluates the QL, not the Proficiency Level.'),
    ],
  },
  Examination: {
    question: 'WHAT exam or certification exists?',
    why: [official('Examinations that qualify a person for a license or permit needed to volunteer.')],
  },
  PersonExamination: {
    question: 'WHAT is the person’s result?',
    why: [
      official('“Represents the examinations taken by a person.”'),
      official('Volunteer matching only uses competencies, not examinations — exam results are recorded, not matched.'),
    ],
  },
  Location: { question: 'WHERE does volunteering happen?', why: [learning('Job positions and a person’s availability both point to a Location; matching by location compares them.')] },
  OperatingHours: {
    question: 'WHEN — which pattern of hours?',
    why: [
      official('A Person Location Availability can point to Operating Hours; “if you add operating hours, add time slots as well.”'),
      learning('Operating Hours group the Time Slots that describe when someone is available.'),
    ],
  },
  TimeSlot: {
    question: 'WHAT specific time period?',
    why: [official('A period of time on a specified day of the week, belonging to Operating Hours.')],
  },
  PersonLocationAvailability: {
    question: 'WHERE and WHEN can the person volunteer?',
    why: [
      official('“Represents the availability of a person at a specific location.”'),
      course('Availability means the person CAN volunteer — it does not mean they have been assigned.'),
    ],
  },
  Position: {
    question: 'WHAT reusable role exists?',
    why: [
      official('“Positions describe generic-type jobs, and they can be related to more specific Job Positions.” They can be used across multiple volunteer initiatives.'),
    ],
  },
  PositionQualification: {
    question: 'WHAT does the role generally require?',
    why: [
      official('Position qualifications “define the requirements that apply across all related job positions.”'),
      official('The qualification is a Competency or an Examination (Qualification Reference Record).'),
    ],
  },
  Benefit: { question: 'WHAT benefit exists?', why: [course('A benefit such as a volunteer certificate.')] },
  PositionBenefit: { question: 'WHICH position gets the benefit?', why: [official('“Represents how a position and benefit are related.”')] },
  VolunteerInitiative: {
    question: 'WHICH larger initiative?',
    why: [
      official('“Represents all volunteer activities within a single volunteering initiative.”'),
      official('An initiative can be part of a larger initiative (a parent volunteer initiative).'),
    ],
  },
  JobPosition: {
    question: 'WHAT specific role is needed in that initiative?',
    why: [
      official('“Job positions are customized roles for working your initiatives with shifts and qualifications.” They often fall under a more general Position.'),
      learning('Separate job positions let one initiative need different roles — each with its own qualifications, shifts and location.'),
    ],
  },
  JobPositionQualification: {
    question: 'ANY extra requirement for this job?',
    why: [official('“Job Position Qualifications are additive and apply only to the specific job position.”')],
  },
  JobPositionShift: {
    question: 'WHEN does the job happen?',
    why: [
      official('“A specific work shift that’s associated with a job position or a related recurrence schedule.”'),
      official('The number of volunteer assignments is limited to the shift capacity (Maximum Attendees).'),
    ],
  },
  RecurrenceSchedule: {
    question: 'DOES it repeat?',
    why: [official('Shift schedules can be recurring — for example weekly or monthly — until an end date or number of recurrences.')],
  },
  JobPositionAssignment: {
    question: 'WHO actually does it?',
    why: [
      official('“Represents the assignment of a person to a specific JobPositionShift on a specific day.”'),
      official('If no shift is selected, the assignment applies to the job position.'),
    ],
  },
  ApplicationForm: { question: 'WHAT was submitted?', why: [official('“Represents the high level information of a submitted application.”')] },
  IntakeFormSection: { question: 'WHICH part of the form?', why: [official('“Represents a section of an intake form such as a job application.”')] },
  ActionPlan: { question: 'WHAT tasks follow?', why: [official('An action plan is a set of tasks created from an action plan template.')] },
  ActionPlanItem: { question: 'WHICH task?', why: [official('An item (such as a task) in an action plan.')] },
  ActionPlanTemplate: { question: 'WHAT is the reusable plan?', why: [official('A template that action plans are created from.')] },
  ActionPlanTemplateVersion: { question: 'WHICH version of the template?', why: [official('A version of an action plan template; action plans point to a version.')] },
  ActionPlanTemplateItem: { question: 'WHAT does the template contain?', why: [official('An item on an action plan template version.')] },
}

// Keyed "<Object>.<FieldApiName>".
export const fieldLearning = {
  'PersonLocationAvailability.AccountId': learning('WHO is available?'),
  'PersonLocationAvailability.LocationId': learning('WHERE are they available? Compared with the job position’s location when matching by location.'),
  'PersonLocationAvailability.OperatingHoursId': learning('WHEN are they available? Through the Operating Hours’ Time Slots.'),
  'PersonCompetency.PersonId': learning('WHO has the skill.'),
  'PersonCompetency.CompetencyId': learning('WHICH skill — connects a person with a competency they possess.'),
  'PersonCompetency.QualificationLevel': official('The integer that matching compares. A requirement of 2 matches levels 2, 3, 4 and higher.'),
  'PersonCompetency.ProficiencyLevel': official('A dynamic value such as Beginner or Intermediate. Matching doesn’t evaluate it.'),
  'PositionQualification.QualificationReferenceRecordId': official('Select either a Competency or an Examination. Matching only uses competencies.'),
  'PositionQualification.QualificationLevel': official('The required level. Set it on both position and job position qualifications to match volunteers.'),
  'PositionQualification.PositionId': learning('The reusable role this general requirement belongs to (master-detail).'),
  'JobPositionQualification.QualificationReferenceRecordId': official('Select either a Competency or an Examination. Matching only uses competencies.'),
  'JobPositionQualification.QualificationLevel': official('The required level for this specific job — added on top of the Position’s qualifications.'),
  'JobPositionQualification.JobPositionId': learning('The specific job this extra requirement belongs to (master-detail).'),
  'JobPosition.PositionId': official('If the job position is related to a Position, select it to associate the two.'),
  'JobPosition.LocationId': official('Used when matching volunteers “by job position location”.'),
  'JobPosition.VolunteerInitiativeId': learning('WHICH initiative needs this job.'),
  'JobPositionShift.JobPositionId': learning('WHICH job this shift is for.'),
  'JobPositionShift.MaximumAttendeesCount': official('The shift capacity — assignments are limited to this number.'),
  'JobPositionShift.RemainingCapacity': official('Remaining capacity after subtracting the position assignments.'),
  'JobPositionShift.RecurrenceScheduleId': official('A shift can belong to a recurring schedule.'),
  'JobPositionAssignment.AssignedAccountId': learning('WHO is assigned.'),
  'JobPositionAssignment.AssignedPositionShiftId': official('The specific shift. Without one, the assignment applies to the job position.'),
  'JobPositionAssignment.DoesCountTowardShiftCapacity': official('Only assignments with this checked use up the shift’s capacity.'),
  'JobPositionAssignment.RelatedVolunteerInitiativeId': official('The primary volunteer initiative for the assignment.'),
  'VolunteerInitiative.ParentVolunteerInitiativeId': official('For an initiative that is part of a larger initiative (up to 1,000 child initiatives per parent).'),
  'TimeSlot.DayOfWeek': learning('Compared with the shift’s weekday when matching by date and time (learning simplification).'),
}

export function objectWhy(apiName) {
  return objectLearning[apiName] ?? null
}

export function fieldWhy(objectApiName, fieldApiName) {
  return fieldLearning[`${objectApiName}.${fieldApiName}`] ?? null
}
