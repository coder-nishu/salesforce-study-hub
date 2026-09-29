---
title: How to read this model
---

| Concept | What it means here |
|---|---|
| **Lookup** (LK, dashed line) | The child record *points to* a parent record. On the ERD: a plain line end at the parent. |
| **Master-Detail** (MD, solid line) | The child *belongs to* the parent — drawn with a **diamond** on the parent end. |
| **Standard object** | A core Salesforce object — gray on the ERD (Person Account, Contact, Location). |
| **License object** | Another object included in the Volunteer Management license — purple on the ERD. |
| **Cardinality** | The end glyphs: a **crow's foot** means *many*, a **circle** means *optional (zero)*, a **bar** means *one*. |

**Junction-style objects** sit between two parents to connect them many-to-many. Look at [Person Competency](/vm/objects/PersonCompetency) (Person Account ↔ Competency), [Person Examination](/vm/objects/PersonExamination) (Person Account ↔ Examination) and [Job Position Assignment](/vm/objects/JobPositionAssignment) (Person Account ↔ Job Position).

**OR arcs:** [Position Qualification](/vm/objects/PositionQualification) and [Job Position Qualification](/vm/objects/JobPositionQualification) each reference a Competency **or** an Examination — one of them, not both.

### Memory trick

**Read every line child → parent.** The crow's foot sits at the *child* end (the "many" side). The parent is the end with a bar or a diamond.
