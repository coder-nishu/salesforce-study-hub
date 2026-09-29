# NPC Volunteer Management Lab — Architecture

The lab is a schema-driven learning simulator inside the Salesforce Study Hub. It uses the same stack as the rest of the site: Vite + React (plain JS), react-router-dom v6, and one `src/styles.css`. There is no backend, no API and no dependency added for the lab.

```
SCHEMA      src/data/npc-vm/    areas · objects · relationships · fields · learning
   │        index.js            derived maps, generated relationship fields, validateSchema()
   ▼
RECORDS     src/lib/vm/store.js      create / update / delete / reset / persistence (pure)
   │        src/lib/vm/validation.js validation on every write and on load
   │        src/lib/vm/records.js    relationship resolver
   ▼
ENGINES     src/lib/vm/matching.js · capacity.js · metrics.js   (pure functions of the records)
   ▼
UI          src/components/vm/*  generic: RecordTable, RecordForm, FieldInput, LookupField, RelatedLists,
            src/pages/vm/*       RecordGraph, MatchPanel, CapacityMeter … and one page per route
   ▼
USE CASES   src/data/npc-vm/useCases.js (data) → pages/vm/VmUseCase.jsx (generic runner)
```

Nothing below the UI layer imports React. The Node validation script (`npm run vm:validate`) runs the same schema, validation and matching code the browser uses.

## Schema

| File | Holds |
|---|---|
| `areas.js` | The 5 ERD areas and their colour tokens |
| `objects.js` | The 35 objects: API name, label, area, standard or not, notes |
| `relationships.js` | The 49 relationships, the **single** relationship list: type, cardinality at both ends, confidence, one-of constraint, official field name, official required flag |
| `fields.js` | Per object: `idPrefix`, `nameField`, `listFields`, `sourceRef`, and non-relationship fields with their type, required flag, options and `sourceStatus` |
| `learning.js` | "Why does this object exist?" and "Why is this field here?" text, each tagged official / course / learning |
| `seedData.js` | The demo org |
| `useCases.js`, `processes.js` | Scenario and learning-process definitions |

`index.js` builds each object's full field list. It takes `fields.js` and appends **generated** relationship fields: one per `(child, fieldApiName)` pair. Two relationships that share a field become one **polymorphic** field with several `targets` — the Qualification Reference Record.

A relationship field's required flag works as follows:
- master-detail → always required;
- otherwise the official flag where known;
- otherwise the ERD cardinality.

Where the official flag and the ERD cardinality disagree, the field gets `requiredDiffers: true`.

`validateSchema()` rejects:
- unknown objects, areas, types, cardinalities or confidences;
- duplicate API names or relationship IDs;
- one-of groups with fewer than 2 members;
- objects missing from `fields.js`;
- duplicate, invalid or empty fields;
- bad or duplicate ID prefixes;
- name fields that aren't defined.

**Adding an object:**
1. Add it to `objects.js`.
2. Add its relationships to `relationships.js`.
3. Add its fields to `fields.js`.

The Object Explorer, forms, lists, related lists, maps and the record graph pick it up with no UI change.

## Records

```js
{ id: 'JPS001', objectApiName: 'JobPositionShift', origin: 'demo' | 'user', createdAt, updatedAt,
  learningNote,                             // demo records only
  values: { JobPositionId: 'JOB001', StartDate: '2026-11-14', MaximumAttendeesCount: 5, … } }
```

- **IDs** are `<idPrefix><seq>`. Prefixes are unique, so `objectForId()` can tell which object any ID belongs to. Polymorphic lookups rely on this.
- **Relationship values** are **always IDs**. Names are resolved when displayed and never stored.
- **AutoNumber names** (`JPA-0001`) and field defaults are filled in on create.
- **Store operations** (`createRecord`, `updateRecord`, `deleteRecord`, `deletePlan`) are pure: they take `{ version, records }` and return `{ ok, state, errors, fieldErrors }`.
- **Refusals:** a write with any error is refused whole and the state is unchanged. The form shows the messages next to the fields.

## Relationship resolver (`records.js`)

- `displayName(record)` — the name field(s), with special handling for Time Slots.
- `parentRefs(record)` — each relationship field and the record it points to.
- `relatedLists(record)` — for every relationship whose parent is this record's object: the child records whose field holds `record.id`, plus standard links. **Derived on every render, never stored.**
- `recordGraph(record, depth)` — parents plus a child tree, used by the Record Relationship Explorer and scenario reviews.

## Lookup engine

`components/vm/LookupField.jsx` is reused by every relationship field:
- **Search:** it searches the target object's records by name or ID.
- **Stores the ID, shows the name**, and links to the record.
- **Can create:** it offers "+ New …" in a new tab. The provider listens for `storage` events so the new record appears straight away.

Polymorphic fields render a target-object radio (Competency / Examination), then the lookup for that object.

## Validation (`validation.js`)

Every write and every load checks:
- unknown fields and the required rule (master-detail parents get a specific message);
- value types — number, integer QL, email, date, time, datetime, checkbox, picklist value;
- lookup IDs: the target must exist **and** be the right object type;
- ranges: an end date or time can't come before its start.

## Delete rules (`store.js → deletePlan`)

These are Salesforce-like, and previewed in the UI before anything is removed:
- **Master-detail children** are deleted with their parent, recursively.
- **Standard link:** a person account and its contact are deleted together.
- **Required lookup** children **block** the delete; the UI lists them.
- **Optional lookups** on children are **cleared**.

## Engines

- `matching.js → findVolunteers(records, { jobPositionId, requirementIds, time, byLocation })`
  - Returns a verdict per volunteer for qualification, date/time and location, with a reason for each.
  - Also returns the availability record used and any existing assignments.
  - Official rules and learning simplifications are documented in its header and in `vm-model-reconciliation.md` §4.
- `capacity.js`:
  - `shiftCapacity` — capacity, counted assignments, remaining and coverage;
  - `computeField` — the Computed fields `PositionAssignmentCount` and `RemainingCapacity`;
  - `assignmentValues` — a new assignment filled from its shift;
  - `checkAssignment` — enforces capacity and refuses duplicates.
- `metrics.js → computeMetrics(records)`: every dashboard number, each with its definition.

## Use-case engine

A use case is data: `{ id, title, description, learningObjective, requiredObjects, whatYouUsed, defaults, steps, resultExplanation }`.

`VmUseCase.jsx` renders the steps by `kind`:

| Step kind | What it does |
|---|---|
| `create` | Form, or choose an existing record |
| `pick` | Choose a record |
| `match` | Find Volunteers |
| `assign` | Create an assignment |
| `inspect` | Explain one volunteer's result |
| `coverage` | Show capacity |
| `requirements` | Position vs Job Position qualifications |
| `initiative` | Every job position of an initiative |
| `review` | Record graph |

The runner keeps a small context of chosen record IDs. It also fills in what can be derived: a shift implies its job position, which implies its initiative. A required step can't be passed until its record really exists in the store.

## Demo data and reset

- **Demo data:** `seedData.js` is a small Dhaka organization, designed so the matching outcomes teach something (see `vm-use-cases.md`). `vm:validate` checks it against the schema and asserts the expected matching results.
- **State and persistence:** `VmStoreProvider` wraps every `/vm` route. It holds `{ version, records }` and saves to `localStorage` (`sfsh.vm.store.v1`) after each change. Every access is wrapped in try/catch, so the lab still works in memory if storage is blocked.
- **Loading:** saved data is validated when it loads. If it's invalid or from another version, the demo data is shown with a banner, and nothing is overwritten until the next change or an explicit "Use demo data". Saved data is never silently repaired.
- **Reset Demo Data** restores the seed; **Reset Everything** gives an empty org. Both ask for confirmation.
- **Demo vs your records:** `origin` distinguishes demo records from user-created ones, and the UI shows it with badges and counts.

## Routes

All routes live under the `vm` layout route in `App.jsx`, alongside the unchanged Admin course routes:

```
/vm  /vm/dashboard  /vm/objects  /vm/objects/:apiName?tab=…
/vm/objects/:apiName/records  …/new  …/:recordId  …/:recordId/edit
/vm/find-volunteers?shift=|job=  /vm/model?view=focus|area|full|record  /vm/processes
/vm/scenarios  /vm/use-cases/:useCaseId
```
