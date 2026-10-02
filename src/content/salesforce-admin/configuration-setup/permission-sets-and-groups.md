---
title: Permission Sets, Groups & Muting
summary: Extending the profile baseline — permission sets, permission set groups, muting, expiration, session-based permission sets, and finding where a permission comes from.
tags:
  - configuration-setup
  - permission-sets
  - module-3
  - high-yield
---

> **Module 3 · Question 2 — What can the user do?** Part of [Configuration & Setup III](/salesforce-admin/configuration-setup/setup-iii-overview).

## Permission Sets

A Permission Set is a collection of **additional** permissions that can be assigned to users.

```flow
Profile :: Baseline | Permission Set :: Additional access
!User
```

Permission Sets can contain:

- App permissions
- System permissions
- Object permissions
- Field permissions
- Other supported permissions

## Why Permission Sets are powerful

Suppose there are **100 Sales Users**. All need the **Sales Profile**, but only **8** need **Manage Campaigns**.

Instead of creating another profile just for 8 users:

```flow
Sales Profile :: All 100 users | Campaign Management Permission Set :: Only the 8 users
```

This keeps the baseline profile simpler and gives additional access only to the users who need it.

## Permission Set Group

A Permission Set Group **bundles** multiple Permission Sets.

```text
Sales Senior PSG
    |
    +--> Advanced Reporting PS
    |
    +--> Campaign PS
    |
    +--> Forecasting PS
```

Assign the Permission Set Group instead of manually assigning all three permission sets individually.

## Muting Permission Set

A Muting Permission Set is used with a Permission Set Group to **mute selected permissions** that would otherwise be included through the group.

```text
Project Analyst PSG
       |
       +--> Project Management PS
       |       |
       |       +--> Create
       |       +--> Edit
       |       +--> Delete
       |
       +--> Muting PS
               |
               +--> Mute Delete
```

The resulting user access through the group can exclude the muted permission.

### Gotcha

Muting is specifically about **permissions included through the Permission Set Group** — it isn't a general way to remove permissions.

### Memory trick

**Permission Set Group = bundle · Muting = selectively remove from that bundle**

## Permission Set Expiration

A Permission Set or Permission Set Group can have an **expiration date**.

```sequence
Temporary project
Permission Set
Expires: 31 Dec
!Access ends after expiration
```

Useful for:

- Temporary assignments
- Contractors
- Temporary elevated access
- Short-term projects

## Session-Based Permission Sets

A session-based permission set grants permissions **only during an activated session**.

| Normal Permission Set | Session-Based Permission Set |
|---|---|
| Assigned → permission remains available | Assigned → session activated → permission active → session ends/deactivated → permission no longer active |

A Permission Set Group can be used when multiple permission sets need to be activated for the session.

### Exam shortcut

| Need | Choose |
|---|---|
| Access for days or weeks | **Permission Set + expiration** |
| Access only during a session | **Session-Based Permission Set** |

## User Access Summary

The User Access Summary helps administrators understand a user's access. It can show:

- User permissions
- Object permissions
- Field permissions
- Custom permissions
- Group membership
- Queue membership

This is useful when troubleshooting access.

## Access Granted By

If the question is **"Why does this user have this permission?"**, use **Access Granted By**.

It helps identify whether a permission was granted through the **Profile**, a **Permission Set**, a **Permission Set Group**, or a related permission source.

```sequence
Unexpected permission
Open user access information
Access Granted By
!Find the source
```

### Scenario: "I shouldn't be able to edit Accounts"

**Situation:** A user says, "I should not be able to edit Accounts, but Salesforce allows me to."

**Think about:** The permission could come from the profile **or** from a permission set or group. Don't immediately change the profile.

**Recommended concept:** Check the **Profile → Permission Sets → Permission Set Groups**, and use **Access Granted By** to find the source.

**Why:** The permission may be coming from a Permission Set rather than the profile — changing the profile wouldn't fix it.

## Memory tricks

```text
PROFILE              = BASE
PERMISSION SET       = EXTRA
PERMISSION SET GROUP = BUNDLE
MUTING               = REMOVE SELECTED PERMISSION FROM THE PSG
EXPIRATION           = TEMPORARY ACCESS
SESSION-BASED        = SESSION-ONLY ACCESS
ACCESS GRANTED BY    = FIND THE PERMISSION SOURCE
```

## Before exam

- "Selected users" / "additional permissions" → **Permission Set**.
- "Bundle permission sets" → **Permission Set Group**.
- "Remove one permission from the group" → **Muting Permission Set** (only affects the group).
- "Temporary access" → **expiration** · "only during a session" → **session-based**.
- "Why does the user have this?" → **Access Granted By**; check permission sets before changing the profile.
- Next: [Organization Security Controls](/salesforce-admin/configuration-setup/organization-security).
