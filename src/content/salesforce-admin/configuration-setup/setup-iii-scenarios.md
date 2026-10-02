---
title: Scenarios & Troubleshooting
summary: Worked Configuration & Setup III scenarios — branch-based access, report permissions, temporary access, muting — and step-by-step troubleshooting for login, extra access, missing records and hidden fields.
tags:
  - configuration-setup
  - scenarios
  - module-3
  - high-yield
---

> **Module 3 · Practice.** Part of [Configuration & Setup III](/salesforce-admin/configuration-setup/setup-iii-overview). Each scenario combines concepts from earlier pages.

## Design scenarios

### Scenario: Branch-based customer access

**Situation:** A company has multiple branches. Employees in each branch can see customers belonging to their own branch, should not see customers belonging to other branches, and have different roles.

**Think about:** Start everything private, then open records to the right branch.

**Recommended concept:** **OWD = Private** → create a **Public Group per branch** → create a **Sharing Rule** that shares branch-owned customers with the branch's public group.

**Why:** OWD is the baseline restriction, the Public Group represents branch membership, and the Sharing Rule opens records to the appropriate branch. This pattern is directly represented in the source material.

### Scenario: Report permission for selected users

**Situation:** 100 users have the same basic profile. Only 10 should be able to create and customize reports.

**Think about:** Is this a different baseline, or something extra for some users?

**Recommended concept:** Keep the **common profile** for all 100, and assign a **Permission Set** with *Create and Customize Reports* to the 10 users.

**Why:** The requirement is an **additional permission for selected users**, not a completely different baseline.

### Scenario: Temporary elevated access

**Situation:** An employee needs extra permissions for a short project.

**Think about:** For how long is the access needed?

**Recommended concept:** A **Permission Set with expiration** — or, if the requirement is session-only access, a **Session-Based Permission Set**.

**Why:** Days/weeks → Permission Set + expiration. Only during a session → Session-Based Permission Set.

### Scenario: Permission bundle with one exception

**Situation:** A Project Analyst needs Create, Edit and Delete Project through a standard Permission Set Group — but analysts should not delete projects.

**Think about:** You want the whole bundle except one permission.

**Recommended concept:** Add a **Muting Permission Set** to the Permission Set Group that **mutes Delete**.

**Why:** Muting removes selected permissions included through the group.

## Troubleshooting: the user can't log in

Work through the checks in order:

```sequence
Is the user active?
Is the user frozen?
Password / reset
Failed login attempts
Login History
Login Hours
IP restrictions
Trusted IP / identity verification
!MFA / device verification
```

## Troubleshooting: the user has too much access

```sequence
Check Profile
Check Permission Sets
Check Permission Set Groups
Access Granted By
Identify the source
!Remove / correct that source
```

### Gotcha

Do not immediately modify the profile without finding the source — the extra permission may come from a permission set or group.

## Troubleshooting: the user can't see a record

```text
CAN'T SEE RECORD
      |
      v
Can user access OBJECT?
      |
      +---- NO --> Profile / Permission Set
      |
      +---- YES
             |
             v
           OWD
             |
             v
       Role Hierarchy
             |
             v
        Sharing Rule
             |
             v
      Manual Sharing / Team
             |
             v
      Restriction Rule
```

## Troubleshooting: the user can see the record but not a field

```flow
Can access the object?
Can access the record?
Can see the field?
!Field-Level Security
```

This is one of the most useful exam decision trees.

## Final exam strategy

When an Admin exam question looks complicated, don't panic — break the scenario into layers:

| Step | Ask |
|---|---|
| 1. Identify the person | Who is the user? What license? What profile? |
| 2. Identify the permission | Base access? Extra access? Bundle? Temporary? Session-only? |
| 3. Identify the data layer | Object? Record? Field? |
| 4. Identify the sharing requirement | Baseline? Hierarchy? Automatic sharing? One-off sharing? Restriction? |
| 5. Identify login security | When? Where? Identity? Session? |
| 6. Look for the strongest keyword | See the table below |

## Exam shortcuts

| Keyword in the question | Think |
|---|---|
| "selected users" | Permission Set |
| "bundle" | Permission Set Group |
| "mute" | Muting Permission Set |
| "manager" | Role Hierarchy |
| "baseline records" | OWD |
| "criteria" | Criteria-Based Sharing Rule |
| "temporarily prevent login" | Freeze |
| "left company" | Deactivate |
| "field hidden" | FLS |
| "working hours for login" | Login Hours |
| "office IP" | IP Restrictions |
| "who changed" | Setup Audit Trail |
| "failed login" | Login History |

## Before exam

- Can't log in → status, freeze, password, failed attempts, Login History, Login Hours, IP, trusted IP, MFA/device — in that order.
- Too much access → find the source with **Access Granted By** before changing anything.
- Can't see a record → **object first**, then OWD → Role → Sharing → Manual/Team → Restriction.
- Can see the record but not a field → **FLS**.
- Next: [Revision & Exam Keywords](/salesforce-admin/configuration-setup/setup-iii-revision).
