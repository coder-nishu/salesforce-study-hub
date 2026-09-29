# NPC Volunteer Management Lab — Use cases

How the Volunteer Management objects work together, and how to practise each idea in the lab. **(official)** marks documented Salesforce behaviour; **(simplification)** marks the lab's learning simplifications. Details are in `vm-model-reconciliation.md` §4.

Every scenario below runs against the records in the lab (**Scenarios** tab, `/vm/scenarios`).

## The demo organization

| Person | Competencies (QL) | Availability | Lesson |
|---|---|---|---|
| Sarah Ahmed | First Aid 4, Communication 3 | Dhaka Community Center, Sat 09:00–13:00 | ✓ matches the Health Camp First Aid shift |
| John Rahman | First Aid 2 | Dhaka, Sat morning | Available but **QL too low** |
| Maria Khan | First Aid 5 | Dhaka, weekday evenings | Qualified but **unavailable** |
| Nadia Chowdhury | First Aid 3, Communication 4, Event Coordination 4 | **Mirpur**, Sat morning | Fails on **location** only |
| David Islam | Food Safety 3, Event Coordination 2 | Mirpur, Sat afternoon | Matches the **Food Drive** |

The programs are Dhaka Community Programs 2026 (the parent initiative), with two child initiatives:
- **Dhaka Community Health Camp**, with three job positions: First Aid, Registration and Event Coordinator.
- **Winter Food Drive**, with a Distribution job, whose shift is on a weekly recurrence schedule.

## Concepts

- **Volunteer profile** — Person Account (WHO) + Person Competency + Person Examination + Person Location Availability. Creating a Person Account also creates its Contact (standard link).
- **Competency** — a reusable skill definition. **Person Competency** says a person has it, with an integer **Qualification Level** (official) and a Proficiency Level. Matching doesn't evaluate the Proficiency Level (official).
- **Examination** — a certification or exam definition. **Person Examination** is the person's result. Volunteer matching only uses competencies, not examinations (official).
- **Availability** — Person Location Availability links a person to a **Location** and **Operating Hours**, whose **Time Slots** give day and time. Availability ≠ assignment.
- **Position** — a reusable role. **Position Qualification** requirements apply across all related job positions (official).
- **Job Position** — the role inside an initiative, with its own location and shifts. **Job Position Qualifications** are additive and apply only to that job (official).
- **Initiative** — the program; it can have a parent initiative.
- **Qualification target** — a qualification points to a Competency **or** an Examination (the ERD OR arc; officially one polymorphic field).
- **Shift** — when the work happens. It belongs to a job position and optionally to a recurrence schedule. **Maximum Attendees** is the capacity (official).
- **Matching** — criteria are qualification, shift or date-and-time range, and job-position location, each optional. Matching is inclusive (official). Availability is compared through Time Slots (simplification).
- **Assignment** — a Job Position Assignment records who actually does it: person, job position, shift and initiative, all as IDs. Without a shift it applies to the job position (official).
- **Capacity** — remaining = Maximum Attendees − assignments with *Count Toward Shift Capacity* checked (official). Canceled assignments never count (simplification).
- **Application / onboarding** — **Example application/onboarding learning scenario**:
  - Application Form → Intake Form Sections;
  - Application Form Relation → Job Position;
  - Evaluation → Action Plan (from a template version) → Action Plan Items.

  It uses only ERD relationships and is not a mandatory Volunteer Management lifecycle.

## Scenarios

| # | Scenario | Try |
|---|---|---|
| 1 | Build a Volunteer Profile | Create a person, a competency, an exam and availability; review the graph |
| 2 | Create a Volunteer Program | Initiative → Position → PQ → Location → Job Position → JPQ → Shift |
| 3 | Match Volunteers | Health Camp · First Aid · Sat morning → only Sarah matches |
| 4 | Assign a Volunteer | Select Sarah → create the assignment → capacity 1 / 5 |
| 5 | Shift Coverage | Read capacity, find volunteers for the remaining seats |
| 6 | Qualified but Unavailable | Maria: Qualification ✓, Date/time ✗ |
| 7 | Available but Not Qualified | John: Date/time ✓, Location ✓, Qualification ✗ (2 < 3) |
| 8 | Position vs Job Position | PQ First Aid 2 + JPQ First Aid 3 |
| 9 | Multiple Job Positions | Three Health Camp jobs with different requirements and shifts |
| 10 | Application / Onboarding | Sarah's application → evaluation → onboarding action plan |
| 11 | Fill an Unstaffed Shift | Saturday-afternoon First Aid: nobody qualified is free |
| 12 | Investigate Why a Volunteer Doesn't Match | Nadia: everything ✓ except Location |

## Acceptance exercise (from an empty org)

Home → **Reset Everything**, then:
1. Create the initiative **Dhaka Community Health Camp**.
2. Create the Position **First Aid Volunteer** and the Competency **First Aid**.
3. Create a Position Qualification: Competency First Aid, QL 3.
4. Create the Job Position **Health Camp First Aid Volunteer**, with its Position and Initiative.
5. Create the Job Position Qualification: First Aid, QL 3.
6. Create the Location **Dhaka Community Center** and set it on the Job Position.
7. Create a Job Position Shift: Saturday 2026-11-14, 09:00–13:00, Maximum Attendees 5.
8. Create the Person Account **Sarah Ahmed** and her Person Competency: First Aid, QL 4.
9. Create Operating Hours **Saturday Mornings** with a Time Slot (Saturday 09:00–13:00).
10. Create Sarah's Person Location Availability: Dhaka Community Center + Saturday Mornings.
11. **Find Volunteers** for the shift → Sarah **MATCH** (✓ qualification, date/time and location).
12. Select her and assign → the Dashboard shows capacity 5, assigned 1, remaining 4.
13. Check the related records:
    - **Sarah** — competency, availability and assignment;
    - **the Job Position** — its qualification, shift and assignment;
    - **the Shift** — its capacity and assigned volunteers.
14. **Data Model → Record view** for Sarah shows the schema path next to the record path.
15. **Data Model → Full model** shows the chain: Person Account → Person Competency → Competency → Job Position Qualification → Job Position → Job Position Shift → Job Position Assignment.
