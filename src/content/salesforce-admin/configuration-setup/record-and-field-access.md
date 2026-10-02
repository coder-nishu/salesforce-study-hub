---
title: Record & Field Access
summary: Which records and fields a user can access — OWD as the baseline, role hierarchy, owner- and criteria-based sharing rules, public groups, manual sharing, teams, restriction and scoping rules, and report folder access.
tags:
  - configuration-setup
  - sharing
  - module-3
  - high-yield
---

> **Module 3 · Question 3 — Which records can the user access?** Part of [Configuration & Setup III](/salesforce-admin/configuration-setup/setup-iii-overview).

## Organization-Wide Defaults (OWD)

OWD defines the **baseline record-level access** for users. **OWD = starting point.** It does **not** define object permission.

| Layer | Answers |
|---|---|
| **Profile / Permission Set** | Can the user access the **object**? |
| **OWD / Sharing** | Which **records** can the user access? |

## Common OWD access levels

Depending on the object, OWD options can include:

- Private
- Public Read Only
- Public Read/Write
- Public Read/Write/Transfer
- Controlled by Parent

```sequence
Private
Read Only
Read/Write
!Transfer
```

As access becomes more open, more record actions are available.

## OWD is the baseline, not everything

Suppose **Account OWD = Private**. A user may still get access through:

- Role Hierarchy
- Sharing Rule
- Manual Sharing
- Account Team
- Other applicable sharing mechanisms

**OWD defines the baseline, not necessarily the final access.**

## Role Hierarchy

Role Hierarchy opens record access based on the organizational hierarchy.

```flow
VP
Manager
Sales Rep
```

A manager can generally gain access to records owned by users below them, according to the role hierarchy and object behavior.

### Memory trick

**Role = hierarchy-based record access.**

## Role vs Profile

A major exam distinction:

| Profile | Role |
|---|---|
| Defines baseline permissions | Helps determine record visibility |
| What can the user do? | Whose records can the user see? |
| Object/system access | Record hierarchy/access |
| Every user needs a profile | A role is not a replacement for a profile |

### Memory trick

**PROFILE = What can I do? · ROLE = Whose records can I see?**

## Sharing Rules

Sharing Rules **extend** record access beyond the baseline provided by OWD and the applicable hierarchy. Two major patterns:

- **Owner-based sharing rule** — share records based on **who owns them**.
- **Criteria-based sharing rule** — share records based on **record criteria**.

### Owner-based example

```flow
Branch A Users
Own customer records
Sharing Rule
!Branch A Public Group
```

The group gets access to records owned by the specified users.

### Criteria-based example

**Requirement:** all Accounts where **Region = "North"** should be accessible to the North Sales Group.

```flow
Account
Region = North
Criteria-Based Sharing Rule
!North Sales Group
```

## Sharing doesn't replace object permission

This is a very important exam trap.

Suppose a **sharing rule** gives access to Account records — but the user's **profile** has **Account Read = FALSE**. The sharing rule cannot magically give object-level access.

### Gotcha

**First object access, then record access.** A sharing rule only opens records of an object the user already has permission to use.

## Public Groups

A Public Group is a collection of users/other supported members that can be used for access management. They're useful for sharing rules, folder sharing and other access scenarios.

```text
North Region Public Group
    |
    +--> User A
    +--> User B
    +--> User C
```

Instead of sharing separately with each user, share with the group.

## Manual Sharing

Manual Sharing provides **record-specific** sharing.

```flow
Opportunity A
Share
User B
!Read/Write
```

Use it for individual exceptions, rather than broad automatic access.

## Teams

Teams can also be used for record access in supported scenarios — for example **Account Teams, Opportunity Teams and Case Teams**.

**Teams = record collaboration/access for specific records.**

## Restriction Rules

Restriction Rules are different from sharing rules: **sharing rules open access; restriction rules limit/filter access.**

Restriction Rules can restrict the records visible to users based on user and record criteria.

### Scenario: Only active projects

**Situation:** A user may otherwise have broad access to Project records, but should only see projects where **Project.Status = Active**.

**Recommended concept:** A **Restriction Rule**, for supported objects/scenarios.

**Why:** The goal is to **narrow** what the user can access, not to open more records.

## Scoping Rules

Scoping Rules filter which records are **presented to users by default**, based on criteria.

| | Answers |
|---|---|
| **Scoping** | What records should normally appear? |
| **Restriction** | What records should the user be prevented from accessing? |

Scoping Rules do not replace the underlying sharing model.

## Sharing vs Restriction vs Scoping

| Feature | Main idea |
|---|---|
| Sharing Rule | Grant additional record access |
| Restriction Rule | Restrict/filter record access |
| Scoping Rule | Filter records presented by default |
| OWD | Establish baseline record access |
| Role Hierarchy | Open access through hierarchy |
| Manual Sharing | One-off record sharing |

## Report & dashboard folder access

Reports and dashboards are stored in folders. Folder access can be granted to users/groups with levels such as **Viewer, Editor and Manager**.

```text
Sales Reports Folder
       |
       +--> Sales Public Group
               |
               +--> Viewer
```

This lets the group view the reports without necessarily giving them editing or management rights.

## Field access

Once the user can reach the object and the record, **Field-Level Security** decides which fields they can see and edit — see [Profiles & Object Permissions](/salesforce-admin/configuration-setup/profiles-and-object-permissions#field-level-security).

## Memory tricks

```text
OWD            = Baseline
ROLE           = Hierarchy
SHARING        = Open
MANUAL SHARING = One record
PUBLIC GROUP   = Group of users
RESTRICTION    = Limit
SCOPING        = Filter / default presentation
FLS            = Field
```

## Before exam

- **OWD** = baseline record access — not object permission, and not the final answer.
- "Manager sees subordinate records" → **Role Hierarchy**.
- "Share based on owner" → **owner-based** rule; "based on a field/criteria" → **criteria-based** rule.
- "Share one record" → **Manual Sharing**; "group of users for sharing" → **Public Group**.
- "Restrict records" → **Restriction Rule**; "filter default records" → **Scoping Rule**.
- **Sharing can't grant object access** — object first, then record, then field.
- Next: [Scenarios & Troubleshooting](/salesforce-admin/configuration-setup/setup-iii-scenarios).
