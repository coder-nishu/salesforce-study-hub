# NPC Volunteer Management Lab — Schema notes (Phase 1)

Source of truth: [`docs/vm-erd.png`](vm-erd.png) — Salesforce *Nonprofit Cloud · Volunteer Management* ERD, last modified 4/29/2025.
The ERD shows objects and relationships only; it contains **no field lists**.

Schema files: `src/data/npc-vm/` — `areas.js`, `objects.js`, `relationships.js`, `index.js` (derived data + validation).
Check it any time with `npm run vm:validate`.

**Current totals:** 35 objects (3 standard, 32 included in license) · 5 areas · 49 relationships (40 lookup, 8 master-detail, 1 standard link) · 11 cross-area · 5 still marked `verify`.

---

## 1. Reconciliation — where my reading of the ERD differs from the prompt's

Relationship numbers refer to the prompt's list.

### Counts and areas

| Prompt | ERD | Used |
|---|---|---|
| "Total: 33 objects" | 35 boxes (Application 6, Action Plans 6, Program Management 1, Volunteer 10, Volunteer Management 12) — the same objects as the prompt's own table | **35** |
| "the 4 areas" | 5 labelled panels — **Program Management** is its own panel | **5 areas** |

### Direction reversed (crow's foot is on the other end)

| # | Prompt | ERD reading (used) | Evidence |
|---|---|---|---|
| 3 | Application Form → Intake Form Section | **Intake Form Section → Application Form** (LK, optional) | Crow's foot + circle at the Intake Form Section end; circle + bar at Application Form |
| 7 | Application Form Relation → Application Form Evaluation | **Application Form Evaluation → Application Form Relation** (LK, optional) | Crow's foot + circle at the Evaluation end; circle + bar at Relation |
| 45 | Job Position Shift → Job Position Assignment | **Job Position Assignment → Job Position Shift** (LK, optional) | Crow's foot + circle at the Assignment end; circle + bar at Shift |

All three stay `confidence: 'verify'` so you can confirm them.

### Missing from the prompt

| Relationship | Notes |
|---|---|
| **Contact → Account (Business Account)** — LK | A second line runs from the *Business Account* inner box (circle + bar) down to Contact. The Contact end has **no glyph drawn**, so "many contacts per business account" is assumed. Marked `verify`. |

### Resolved "(verify)" items — read clearly, now `confidence: 'erd'`

| # | Relationship | Reading |
|---|---|---|
| 2 | Intake Form Section → Application Stage Definition | LK, optional (crow's foot at Intake Form Section) |
| 4 | Application Form → Person Account | LK, optional |
| 5 | Application Form Evaluation → Application Form | LK, **required** (double bar at Application Form) |
| 9 | Action Plan Template Version → Action Plan Template | **LK**, required — double bar, no diamond |
| 10 | Action Plan Template Item → Action Plan Template Version | **LK**, required — double bar, no diamond |
| 14 | Action Plan Template Assignment → Position | LK, required |
| 28 | Person Location Availability → Location | LK, required |
| 31 | Contact Profile → Contact | **MD** — diamond at Contact; at most one Contact Profile per Contact |
| 41 | Job Position → Volunteer Initiative | Direction confirmed: crow's foot at Job Position |
| 43 | Job Position Assignment → Volunteer Initiative | LK, optional |
| 46 | Job Position Shift → Recurrence Schedule | LK, optional; the shift end is "one or many" |
| 47 | Recurrence Schedule ↔ Job Position | **Recurrence Schedule → Job Position**, LK, required (crow's foot at Recurrence Schedule, bar at Job Position) |

### Extra detail captured from the glyphs

The prompt's list didn't include cardinality. `relationships.js` records the glyph at each end (`parentCardinality`, `childCardinality`). This drives the "Required?" column and the plain-language sentences. Notable cases:

- **Donor Gift Summary → Person Account (MD):** at most one Donor Gift Summary per account.
- **Contact Profile → Contact (MD):** at most one Contact Profile per contact.
- **Person Location Availability ↔ Operating Hours:** zero-or-one on **both** ends (one-to-one).
- **Person Account ↔ Contact:** double bar on both ends (one-to-one), modelled as `StandardLink`.

---

## 2. Relationships still marked `verify`

| id | Relationship | Why |
|---|---|---|
| `ifs-applicationForm` | Intake Form Section → Application Form | Reversed from the prompt's reading |
| `afe-applicationFormRelation` | Application Form Evaluation → Application Form Relation | Reversed from the prompt's reading |
| `jpa-jobPositionShift` | Job Position Assignment → Job Position Shift | Reversed from the prompt's reading |
| `pla-operatingHours` | Person Location Availability → Operating Hours | One-to-one (zero-or-one on both ends), so the direction can't be read from the ERD |
| `contact-businessAccount` | Contact → Account (Business Account) | Not in the prompt's list; Contact-end glyph not drawn |

In the UI these show a **"verify against source"** marker on details pages, and an amber dashed line with a **?** in the Relationship Map.

---

## 3. Source material still needed (per object)

**Needed for every object (all 35):**
- A full field list: label, API name, type, required flag, and picklist values where relevant.
- A description (every object has `description: null`, `descriptionStatus: 'todo'`).

**API names:**
- The 32 license objects have **provisional** API names (the label without spaces, e.g. `JobPositionAssignment`).
- The generated relationship field API names are also provisional (field label + `Id`, e.g. `JobPositionId`).
- `Account`, `Contact` and `Location` are marked `standard`, because they are well-known standard object API names.

| Area | Objects | Specific questions for the source |
|---|---|---|
| Application | Application Stage Definition, Application Render Method, Intake Form Section, Application Form, Application Form Evaluation, Application Form Relation | Confirm the direction of Intake Form Section ↔ Application Form and Evaluation ↔ Relation |
| Action Plans | Action Plan Template, Action Plan Template Version, Action Plan Template Item, Action Plan Template Assignment, Action Plan, Action Plan Item | Confirm Template Version / Template Item are lookups (not master-detail) |
| Program Management | Benefit | — |
| Volunteer | Person Account (Account), Contact, Contact Profile, Constituent Role, Person Competency, Person Examination, Donor Gift Summary, Person Location Availability, Operating Hours, Time Slot | Which account type each lookup targets; direction of the Person Location Availability ↔ Operating Hours link; the Contact → Business Account relationship |
| Volunteer Management | Competency, Examination, Position, Position Benefit, Position Qualification, Job Position, Job Position Qualification, Job Position Assignment, Job Position Shift, Volunteer Initiative, Recurrence Schedule, Location | Confirm Job Position Assignment → Job Position Shift; how the one-of Competency/Examination rule is enforced |

---

## 4. How to add real field definitions later

Everything is a drop-in edit to **`src/data/npc-vm/objects.js`**. Components and relationships don't change.

1. Find the object and give it a `fields` list (keep `Name` if it applies). Add a description if you have one:

   ```js
   customObject('Job Position', 'volunteer-management', {
     description: 'Text from your course material…',
     descriptionStatus: 'sourced',
     fieldsStatus: 'sourced',
     fields: [
       { apiName: 'Name', label: 'Name', type: 'Text', required: true, source: 'course' },
       { apiName: 'Status', label: 'Status', type: 'Picklist', required: false, source: 'course',
         picklistValues: ['…'] },
     ],
   }),
   ```

2. **Don't add Lookup / Master-Detail fields by hand.** `index.js` generates them from `relationships.js` and appends them after your fields. To rename a generated field, set `fieldLabel` on the relationship.
3. Verified API names: pass `apiName` and `apiNameStatus: 'verified'` in the options. For example, `customObject('Job Position', 'volunteer-management', { apiName: 'JobPosition', apiNameStatus: 'verified' })`.
4. Confirmed a `verify` relationship? Change its `confidence` to `'erd'` (or fix its direction) in `relationships.js`.
5. Run `npm run vm:validate`. It fails on unknown objects, duplicate API names, unknown areas, and one-of groups with fewer than two members.

Once `fieldsStatus` is `'sourced'`, the details page hides the TODO banner. The field table's "Source" column shows the `source` value you give.

## 5. Designed for Phases 2–3 (not built)

- **Records:** each object's `parents` list tells a future record form which lookup pickers to show and which are required (`required` is on every generated field).
- **Related lists:** each object's `children` list is exactly its future related lists.
- **One-of rule:** available as `object.constraints` for form validation (pick a Competency **or** an Examination).
- **Matching:** "find suitable volunteer" can walk Position/Job Position Qualification → Competency/Examination ← Person Competency/Person Examination → Account using the same maps.
