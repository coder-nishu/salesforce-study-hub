# NPC Volunteer Management Lab — Model reconciliation

How the lab's model was built from three kinds of source, and every place they differ.

| Source | Used for |
|---|---|
| **Your ERD** — [`docs/vm-erd.png`](vm-erd.png) (Nonprofit Cloud · Volunteer Management, last modified 4/29/2025) | The **object set** and **relationships**. Primary source. |
| **Official Salesforce documentation** — object references on developer.salesforce.com, articles on help.salesforce.com (links at the end) | **Fields**, **behaviour** (matching, capacity) and **verification** of relationship directions |
| **Your course documents** — *TwinForce Volunteer Management Explanation*, *University Event VM Guide* | **Explanations** ("why does this object exist?") and scenario ideas. Both say their field values are illustrative. |

Rule: when these differ, the difference stays visible — in this file and in the UI (source badges, "differs from ERD" and "verify" markers). Nothing is silently merged.

Check the model at any time with `npm run vm:validate`.

---

## 1. Totals

- **35 objects**: 3 standard, 32 included in the license, across 5 areas.
- **49 relationships**: 40 lookup, 8 master-detail, 1 standard link.
- **Fields**: 180, including 47 relationship fields generated from the 49 ERD relationships. Each OR pair shares one polymorphic field.
- **Relationship verification**: **30** directions confirmed by an official reference; **2** still marked `verify`.

## 2. ERD reading vs the original prompt (Phase 1)

| Topic | Prompt | ERD | Status |
|---|---|---|---|
| Object count | 33 | **35** — the prompt's own table lists 35 | 35 used |
| Areas | 4 | **5** — Program Management is a separate panel | 5 used |
| Intake Form Section ↔ Application Form | AF → IFS | **IFS → AF** (crow's foot at IFS) | ✅ Confirmed officially: `IntakeFormSection.ReferenceRecordId → ApplicationForm` |
| Application Form Evaluation ↔ Relation | AFR → AFE | **AFE → AFR** (crow's foot at AFE) | ⚠ Still `verify` — not in the fetched references |
| Job Position Assignment ↔ Shift | JPS → JPA | **JPA → JPS** (crow's foot at JPA) | ✅ Confirmed: `JobPositionAssignment.AssignedPositionShiftId` |
| Contact → Business Account | not listed | line from the Business Account inner box to Contact; no glyph at the Contact end | ⚠ Still `verify` |
| Person Location Availability ↔ Operating Hours | direction unknown | drawn one-to-one | ✅ Confirmed: `PersonLocationAvailability.OperatingHoursId` |

## 3. Official documentation vs the ERD

### 3.1 Confirmed and adopted

- **Qualification OR arc.** The ERD draws two lines (to Competency and to Examination) with an OR arc. Officially this is **one polymorphic field**, `QualificationReferenceRecordId`, on both Position Qualification and Job Position Qualification.
  - The lab keeps both ERD relationships for the diagrams.
  - It generates a single field, whose form has a **Competency / Examination** selector.
- **Official API names.** These are used wherever the reference documents them and are marked `official` in the Fields tab. Examples: `AssignedAccountId`, `RelatedVolunteerInitiativeId`, `MaximumAttendeesCount`, `ParentVolunteerInitiativeId`, `PersonId`, `CompetencyId`.
- **Object API names.** Objects with an official reference page are marked verified. The others (e.g. Application Form Evaluation, Constituent Role, Donor Gift Summary) stay provisional.

### 3.2 Differences kept visible

| Topic | ERD / your source | Official | What the lab does |
|---|---|---|---|
| Person Examination → person | Person Account | `ContactId` (→ Contact) | Keeps the ERD link; the relationship shows an official note |
| Person Competency → person | Person Account | `PersonId`, polymorphic (Account / Contact / Employee) | Account only; noted |
| Job Position Shift → Job Position required? | glyph reads optional | `JobPositionId` required | **Official required flag enforced**; "differs from ERD" badge |
| Job Position Assignment → Account required? | glyph reads required | `AssignedAccountId` optional | Official flag used; badge |
| Qualification Reference Record required? | lines read optional | required | Official flag used; badge |
| Person Competency → Competency / Person required? | optional | required | Official flag used; badge |
| Availability → Time Slot | Course docs link Person Location Availability straight to Time Slot | PLA → Operating Hours → Time Slots (the ERD agrees) | Follows the ERD and the official model |
| "Qualification Level: Advanced" | Course docs | That value is the **Proficiency Level**; Qualification Level is an **integer** | Demo data uses an integer QL plus a Proficiency picklist |
| Location on a shift | Course docs | No location field on JobPositionShift | Location comes from the Job Position (official "search by job position location") |
| Job Position → Volunteer Initiative field | ERD line | Help mentions a "Related Volunteer Initiative" list; the field wasn't in the fetched Public Sector reference | Provisional field `VolunteerInitiativeId` |
| Recurrence Schedule → Job Position | ERD line | The fetched reference is the Program Management version (`ReferenceRecordId` → Action Plan / Benefit Schedule) | Provisional field `JobPositionId` |

### 3.3 In the current Salesforce model, not included

| Object / field | Source | Status | Why not included |
|---|---|---|---|
| Benefit Schedule, Board Certification, Certification | Data Model Gallery — seen in a search result; the page itself couldn't be fetched | Current Salesforce model — not yet included (**unverified**) | Not on your ERD |
| `PersonLocationAvailability.ContactId` | Official reference | Not yet included | Not on your ERD |
| `JobPositionAssignment.AssignedContactId` | Official reference | Not yet included | Not on your ERD |
| `JobPosition.ManagerId`, `InternalOrganizationUnitId`; `Position.OccupationId`; `TimeSlot.WorkTypeGroupId` | Official references | Not yet included | Point to objects outside the ERD |
| Roll-ups on Volunteer Initiative (`FilledAssignmentCount`, `TotalVolunteerHours`…) | Official reference | Listed, **not simulated** | Formulas not documented |

### 3.4 Not the same product

The Trailhead unit "Improve Volunteer Coordination" describes **Volunteers for Salesforce** (Campaign / Volunteer Job / Volunteer Shift). That is a different product from Nonprofit Cloud Volunteer Management, and it is not used.

## 4. Behaviour: official vs learning simplification

These rules are **official** (Salesforce Help) and implemented as written:
- **Inclusive matching:** a Qualification Level equal to or greater than the requirement matches.
- **Qualification sources:** matching considers both Position Qualifications and Job Position Qualifications. It uses only competencies, not examinations, and compares the Qualification Level, not the Proficiency Level.
- **Criteria:** qualifications, shift or date-and-time range, and job-position location. Each can be switched off; with none selected, nobody appears.
- **Capacity:** the shift's Maximum Attendees caps assignments; only assignments with *Count Toward Shift Capacity* checked use it up.
- **Assignment without a shift:** it applies to the job position.

These are **learning simplifications**, labelled in the UI:
- **Date/time availability:** a Person Location Availability's Operating Hours must contain a Time Slot on the shift's weekday that covers its start and end time. With location matching on too, the same availability record must also be at the job's location.
- **Combining requirements:** every selected requirement must be met, so the highest level for a competency wins.
- **Effective dates:** not checked.
- **Canceled assignments:** never count toward capacity.
- **Person Account fields:** Name and Account Type stand in for First/Last Name and the person-account record type.

## 5. Relationships still marked `verify`

| id | Relationship | Why |
|---|---|---|
| `afe-applicationFormRelation` | Application Form Evaluation → Application Form Relation | Reversed from the prompt; no official reference fetched |
| `contact-businessAccount` | Contact → Account (Business Account) | Not in the prompt; the Contact-end glyph isn't drawn |

## 6. Provisional fields and objects needing source material

- **Provisional relationship field names:**
  - Application: `ApplicationRenderMethodId`, `ApplicationFormId` (on Evaluation and Relation), `ApplicationFormRelationId`, `JobPositionId` (on Application Form Relation).
  - Action Plans: `ActionPlanTemplateId`, `PositionId` and `JobPositionId` on Template Assignment; `IntakeFormSectionId`, `ApplicationFormEvaluationId`.
  - Volunteer and Volunteer Management: `AccountId` on Constituent Role, Person Examination and Donor Gift Summary; `ContactId` on Contact Profile; `VolunteerInitiativeId` on Job Position; `JobPositionId` on Recurrence Schedule.
- **No official field reference fetched** (Name, relationship fields, and course fields where marked):
  - Application Stage Definition, Application Render Method, Application Form Evaluation, Application Form Relation;
  - Action Plan Template Assignment, Benefit, Constituent Role, Contact Profile, Donor Gift Summary.
- **Picklist values from the course documents or the lab, not official:**
  - Position Status, Location Type, Proficiency Level (Salesforce calls these "dynamic values");
  - the Time Zone lists.

## 7. How to add or correct definitions

- **Fields:** edit `src/data/npc-vm/fields.js` → `objectConfig.<Object>.fields`. Give each field a `sourceStatus` (`official`, `course`, `assumed-standard`, `learning`) and, for an official object, a `sourceRef` link.
- **Relationships:** edit `src/data/npc-vm/relationships.js`.
  - Set `fieldApiName` when the official name is known.
  - Set `officialRequired` when the reference says whether the field is required.
  - Change `confidence` to `'official'` once the direction is confirmed.
- **Explanations:** edit `src/data/npc-vm/learning.js`, tagging each entry `official`, `course` or `learning`.
- Then run `npm run vm:validate`. It checks the schema, the demo data, and the matching lessons.

## Sources

- [Match Volunteers to Volunteer Initiative Job Positions and Shifts](https://help.salesforce.com/s/articleView?id=sfdo.volunteer_mgmt_match_to_job_positions_and_shifts.htm&type=5)
- [Assign Volunteers](https://help.salesforce.com/s/articleView?id=sfdo.volunteer_mgmt_assign_volunteers.htm&type=5)
- [Create Position Qualifications](https://help.salesforce.com/s/articleView?id=sfdo.volunteer_mgmt_create_position_qualifications.htm&type=5) · [Create Job Position Qualifications](https://help.salesforce.com/s/articleView?id=sfdo.volunteer_mgmt_create_job_position_qualifications.htm&type=5)
- [Create Job Position Shifts](https://help.salesforce.com/s/articleView?id=sfdo.volunteer_mgmt_create_job_position_shifts.htm&type=5) · [Configure Volunteer Details](https://help.salesforce.com/s/articleView?id=sfdo.volunteer_mgmt_configure_volunteer_details.htm&type=5)
- [Create Positions](https://help.salesforce.com/s/articleView?id=sfdo.volunteer_mgmt_create_positions.htm&type=5) · [Create Job Positions](https://help.salesforce.com/s/articleView?id=sfdo.volunteer_mgmt_create_job_positions.htm&type=5) · [Create Volunteer Initiatives](https://help.salesforce.com/s/articleView?id=sfdo.volunteer_mgmt_create_volunteer_initiatives.htm&type=5)
- [Volunteer Management Standard Objects](https://developer.salesforce.com/docs/atlas.en-us.nonprofit_cloud.meta/nonprofit_cloud/volunteer_mgmt_standard_objects.htm)
- Object references for JobPositionAssignment, JobPositionShift, JobPositionQualification, PositionQualification, PersonLocationAvailability, PositionBenefit, VolunteerInitiative, PersonCompetency, Competency, PersonExamination, Examination, JobPosition, Position, IntakeFormSection, ApplicationForm, RecurrenceSchedule, TimeSlot, OperatingHours, ActionPlan, ActionPlanItem, ActionPlanTemplate, ActionPlanTemplateVersion and ActionPlanTemplateItem. Each is linked from its object's Details tab in the lab.
