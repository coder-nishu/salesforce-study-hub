---
title: Profiles & Object Permissions
summary: The profile as every user's baseline access — standard and custom profiles, when to use a profile vs a permission set, object permissions, View All vs Modify All, FLS, tabs, apps and system permissions.
tags:
  - configuration-setup
  - profiles
  - module-3
  - high-yield
---

> **Module 3 · Question 2 — What can the user do?** Part of [Configuration & Setup III](/salesforce-admin/configuration-setup/setup-iii-overview).

## Profiles — the foundation of user permissions

Every Salesforce user has a profile. A profile defines **baseline access**, such as:

- Object permissions
- Field permissions
- App access
- Tab settings
- System permissions
- Login restrictions
- Other profile-level settings

```flow
!Profile :: Baseline access
```

## Standard profiles

Salesforce provides standard profiles out of the box. The source includes examples such as:

- Standard User
- Marketing User
- Solution Manager
- Contract Manager
- System Administrator
- Minimum Access - Salesforce

Different standard profiles provide different baseline capabilities.

### Gotcha

Do not memorize every permission in every standard profile unless your exam material specifically requires it. Understand the pattern instead: **a standard profile = a Salesforce-provided baseline.**

## Custom profiles

A custom profile is created to provide a tailored baseline permission model. The source material shows custom profiles being created by **cloning** an existing profile.

```sequence
Existing Profile
Clone
Custom Profile
!Modify required settings
```

### Scenario: Almost like Standard User

**Situation:** A company needs a user type with almost the same access as Standard User, but with different object/system permissions.

**Recommended concept:** **Custom Profile** — clone and adjust.

**Why:** The requirement is a different **baseline** for a whole type of user.

## When to use a Profile vs a Permission Set

This is probably the most important decision pattern in this topic.

**Use a Profile** when the requirement describes a **common baseline** for a category/type of users:

```text
All Sales Reps
    |
    +--> Accounts
    +--> Contacts
    +--> Opportunities
    +--> Sales App
```

Create/configure the baseline profile.

**Use a Permission Set** when only **some** users need **additional** access:

```text
100 Sales Reps   --> Base Profile
10 Senior Reps   --> + Reporting Permission Set
```

### Master table

| Requirement | Best concept |
|---|---|
| Every user needs baseline access | Profile |
| One common user type | Profile |
| Different baseline access | Custom Profile |
| A few users need extra access | Permission Set |
| Temporary additional access | Permission Set / expiration |
| Several permission sets should be bundled | Permission Set Group |
| Remove a permission from a Permission Set Group | Muting Permission Set |
| Permission only during an active session | Session-Based Permission Set |

Permission Sets and their variations are covered on the next page: [Permission Sets, Groups & Muting](/salesforce-admin/configuration-setup/permission-sets-and-groups).

## Object settings

Profiles and permission sets can control object-level permissions:

| Permission | Meaning |
|---|---|
| **Create** | C — create records |
| **Read** | R — view records |
| **Edit** | U — update records |
| **Delete** | D — delete records |
| **View All** | See all records of the object |
| **Modify All** | Broad control over all records of the object |

Read, Create, Edit and Delete are the basic **CRUD** permissions.

## View All vs Modify All

| | Meaning | Think |
|---|---|---|
| **View All** | Broad visibility to records for that object, beyond normal record-sharing restrictions | See all |
| **Modify All** | Broad control over records for that object | See + modify all |

### Memory trick

**View All = visibility · Modify All = control**

## Field-Level Security

Field-Level Security (FLS) controls whether a user can **see** a field and whether they can **edit** it.

### Scenario: Annual Revenue is missing

**Situation:** A user can access an Account but cannot see **Annual Revenue**.

**Recommended concept:** **Field-Level Security.**

**Why:** The user already has the object and the record — only one field is hidden. It's not OWD, a Sharing Rule or the Role Hierarchy (those control records, not fields).

## Page Layout vs Field-Level Security

Both can affect what users see, but they are not the same:

- **Field-Level Security** controls whether the user can access the field.
- **Page Layout** controls how fields and components are arranged/displayed on the page, and can control field-level visibility on that layout.

### Exam shortcut

The question emphasizes **security/access to a field** → **FLS**. It emphasizes **page presentation/layout** → **Page Layout**.

## Tab settings

Profile settings can control tab visibility:

| Setting | Meaning |
|---|---|
| **Default On** | Tab is shown by default |
| **Default Off** | Tab is available but not automatically shown |
| **Hidden** | Tab is hidden/unavailable to the user |

### Memory trick

**ON** = show · **OFF** = available, not default · **HIDDEN** = hide

## App settings

Profile settings can control app availability and related app permissions:

- **Which apps** can the user access?
- **What permissions** does the user have within the app?

## System permissions

Profiles and permission sets can contain system permissions — for example permissions related to Setup, Reports, data access, administration and other Salesforce functionality.

The exact permissions available depend on the enabled Salesforce features and the user's license/context.

## Before exam

- Every user **must** have a profile — it is the **baseline**.
- Different baseline for a user type → **Custom Profile** (clone an existing one).
- A few users need extra → **Permission Set**, not a new profile.
- Object permissions: **Create, Read, Edit, Delete, View All, Modify All**.
- **View All = visibility · Modify All = control.**
- One field hidden → **FLS**. Layout/presentation → **Page Layout**.
- Tabs: **Default On · Default Off · Hidden**.
