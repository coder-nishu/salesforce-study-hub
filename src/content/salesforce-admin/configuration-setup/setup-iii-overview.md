---
title: Configuration & Setup III — The Security Model
summary: Learn Configuration & Setup III as one connected system — who the user is, what they can do, which records they can access, and how they enter the org.
tags:
  - configuration-setup
  - security
  - module-3
  - high-yield
---

> **Purpose:** Learn Configuration & Setup III as one connected system instead of memorizing isolated Salesforce features.

## Four questions

Salesforce security answers four questions:

1. **Who is the user?**
2. **What can the user do?**
3. **Which records can the user access?**
4. **How and when can the user enter the org?**

Configuration & Setup III combines four closely related areas — one for each question:

| Area | Main question | Important concepts |
|---|---|---|
| [User Setup & Maintenance](/salesforce-admin/configuration-setup/users-and-licenses) | Who is the user? | User, Username, License, Locale, User Maintenance, Freeze, Deactivate |
| [Profiles & Permission Management](/salesforce-admin/configuration-setup/profiles-and-object-permissions) | What can the user do? | Profile, Custom Profile, Permission Set, Permission Set Group, Muting |
| [Organization Security Controls](/salesforce-admin/configuration-setup/organization-security) | How can the user securely enter Salesforce? | MFA, IP, Login Hours, Password Policies, Session Settings, Device Activation |
| [Record & Field Access](/salesforce-admin/configuration-setup/record-and-field-access) | Which data can the user access? | OWD, Role Hierarchy, Sharing Rules, Public Groups, Manual Sharing, Restriction Rules, FLS |

## The complete security picture

```text
                           SALESFORCE ORG
                                |
              +-----------------+-----------------+
              |                                   |
        USER & IDENTITY                     DATA ACCESS
              |                                   |
       User License                         Object Access
       Profile                              Record Access
       Login Security                       Field Access
              |                                   |
       +------+-------+                  +--------+--------+
       |              |                  |        |        |
     MFA             IP                OWD      Role    Sharing
   Password      Login Hours                    Hierarchy Rules
   Session       Device                           |
                                                Record
                                                  |
                                                 FLS
                                                  |
                                                Field
```

## The most important mental model

Do not start an exam question by looking for a feature name. Start by asking **what is the question really asking?**

| If the question is really asking… | Look at |
|---|---|
| Can the user log in? | User status · password · MFA · IP · Login Hours · Session |
| What can the user do? | Profile · Permission Set · Permission Set Group · Muting |
| Can the user access this object? | Object permissions |
| Can the user access this record? | OWD · Role · Sharing · Manual Sharing · Restriction |
| Can the user see this field? | Field-Level Security |

## The master formula

```flow
User
User License
!Profile :: Baseline access
Permission Set :: Extra access | Permission Set Group :: Bundle | Muting :: Remove selected permission from a group
Object access
Record access :: OWD · Role Hierarchy · Sharing Rules · Manual Sharing · Groups / Teams · Restriction Rules
Field access :: Field-Level Security
> Each layer narrows or extends what the previous one allows.
```

## The four-level security model

The source material presents security in layers:

| Level | Answers | Controlled by |
|---|---|---|
| **1 — Organization** | Can the user enter the org? | Login Hours · IP Restrictions · Password Policies · Authentication |
| **2 — Object** | Can the user work with this object? | Profiles · Permission Sets |
| **3 — Record** | Which records of that object? | OWD · Role Hierarchy · Sharing · Teams · other record-sharing mechanisms |
| **4 — Field** | Which fields can the user see/edit? | Field-Level Security · Page Layout-related visibility |

### Object-level security

Answers: **Can the user work with this object?** — for example Account, Contact, Opportunity, Case or a custom object.

Permissions are **Read · Create · Edit · Delete · View All · Modify All**, controlled mainly through the Profile, Permission Sets and Permission Set Groups.

### Record-level security

Answers: **Which records of that object can the user access?** Main concepts: Organization-Wide Defaults, Role Hierarchy, Sharing Rules, Manual Sharing, Public Groups, Teams, other sharing mechanisms, Restriction Rules and Scoping Rules.

### Field-level security

Answers: **Which fields can the user see/edit?**

```text
Account
 |
 +--> Name          Visible
 +--> Phone         Visible
 +--> AnnualRevenue Hidden
```

## Complete security architecture

```text
                         USER
                           |
                           v
                    USER LICENSE
                           |
                           v
                        PROFILE
                           |
              +------------+------------+
              |                         |
              v                         v
       OBJECT PERMISSIONS        LOGIN CONTROLS
              |                         |
       Read/Create/Edit/Delete     Password
       View All/Modify All         MFA
              |                    IP
              v                    Login Hours
          OBJECT ACCESS            Session
              |                    Device
              v
             OWD
              |
       +------+------+
       |             |
       v             v
 ROLE HIERARCHY   SHARING
       |             |
       +------+------+
              |
              v
        RECORD ACCESS
              |
      +-------+--------+
      |                |
      v                v
 RESTRICTION        SCOPING
      |
      v
     FLS
      |
      v
 FIELD ACCESS
```

## How to study this module

The recommended learning order follows the pages of this module:

```sequence
Security model :: This page
Users :: Users & Licenses
Maintenance :: User Maintenance
Profiles :: Object permissions
Permissions :: Sets, groups, muting
Login security :: Org security controls
Data access :: Record & field access
!Practice :: Scenarios & revision
```

Once this structure is clear, most Configuration & Setup III scenario questions become a **classification problem** rather than a memorization problem.

## Memory tricks

```text
WHO?                 → USER
WHAT CAN THEY DO?    → PROFILE → PERMISSION SET → PERMISSION SET GROUP
WHICH OBJECT?        → OBJECT PERMISSIONS
WHICH RECORD?        → OWD → ROLE → SHARING
WHICH FIELD?         → FLS
CAN THEY LOG IN?     → PASSWORD → MFA → IP → LOGIN HOURS → SESSION
```

## Before exam

- Break every scenario into layers: **person → permission → data layer (object / record / field) → sharing → login security**.
- **Object** = Profile / Permission Set · **Record** = OWD / Role / Sharing · **Field** = FLS.
- Object access comes **before** record access — sharing can't give access to an object the user has no permission for.
- Full revision: [Revision & Exam Keywords](/salesforce-admin/configuration-setup/setup-iii-revision).
