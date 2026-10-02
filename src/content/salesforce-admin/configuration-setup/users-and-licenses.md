---
title: Users & Licenses
summary: What a Salesforce user is, how usernames and licenses work, the information a new user needs, locale settings, and the ways to create users.
tags:
  - configuration-setup
  - users
  - module-3
---

> **Module 3 · Question 1 — Who is the user?** Part of [Configuration & Setup III](/salesforce-admin/configuration-setup/setup-iii-overview).

## What is a Salesforce user?

A Salesforce User is a person or identity that has access to the Salesforce organization.

A user record contains information such as:

- First/Last Name
- Email
- Username
- Alias
- User License
- Profile
- Role, where applicable
- Language, Locale, Time Zone and Currency
- User status and login information

Every Salesforce user has a profile, and the user license determines the type/level of Salesforce access available and which profiles can be selected.

## Username

A Salesforce username:

- Is used to identify the user for login.
- Must use an email-style format.
- Must be **globally unique across Salesforce**, not merely unique inside one org.
- Can be different from the user's Email field.

```text
Username:  abid@example.salesforce
Email:     abid@company.com
```

The username and email address do not have to be identical.

### Exam shortcut

Exam keyword: **"globally unique"**. If the question focuses on the uniqueness of a Salesforce username, think **global uniqueness across Salesforce**.

## User License

The **User License** determines the user's general level/type of access to Salesforce and controls which profiles are available for that user.

```flow
Employee
User License :: Base type of access
Profile :: Must be compatible with the license
Additional Permissions
```

A profile must be compatible with the selected user license.

### Exam shortcut

> "The administrator wants to assign a profile, but the profile is not available for the user."

Think: **User License compatibility.**

## Feature License

A **Feature License** gives access to additional functionality that is not included in the base user license.

```flow
User License :: Base access
!Feature License :: Additional feature
```

**Example:** a marketing user can already view campaigns but needs additional campaign functionality supported by a feature license. The administrator may assign the appropriate feature license on the user record.

### Memory trick

**User License = base · Feature License = additional feature**

## Permission Set License

Do not confuse these four:

| Item | Main purpose |
|---|---|
| **User License** | Determines the type/level of Salesforce access |
| **Feature License** | Provides access to an additional feature |
| **Permission Set** | Grants additional permissions |
| **Permission Set License** | Enables functionality that can then be used through the relevant permissions |

## Required user information

When creating a user, the important required information is:

- **Last Name**
- **Email**
- **Username**
- **User License**
- **Profile**

Other user information can then be configured according to the organization's needs.

### Exam shortcut

Which information is required when creating a user? **Last Name · Email · Username · User License · Profile.**

## Locale settings

Salesforce users can have personalized localization settings. The four most important are **Language, Locale, Time Zone and Currency**.

| Setting | Controls | Example |
|---|---|---|
| **Language** | The language used for Salesforce interface text | English, Italian, Spanish |
| **Locale** | Localization formats — date, time, number, name/address formatting | Locale A → 12/25/2026 · Locale B → 25/12/2026 |
| **Time Zone** | How times are displayed to the user | User A → Eastern Time · User B → Bangladesh Time |
| **Currency** | How currency is represented, in an org where multi-currency is relevant | — |

The same event can be displayed according to each user's time zone.

### Scenario: Italian interface and time zone

**Situation:** A support agent wants Salesforce interface text in Italian, and calendar times displayed according to an Italian time zone.

**Think about:** These are personal settings for one user, not org-wide configuration.

**Recommended concept:** Edit the **user record** and change the **Language** and **Time Zone**.

**Why:** "Interface language" → **Language**. "Date/number formatting" → **Locale**. "Event time" → **Time Zone**.

## User license distribution

Salesforce licenses are limited resources.

```text
Salesforce User Licenses = 20
Used      = 17
Available = 3
```

Only the **available** licenses can be assigned to additional users.

## Add multiple users

Salesforce provides an option to add multiple users. The source material describes adding **up to 10 users** at a time through the Add Multiple Users function.

This is useful when several users need the same license, have similar setup requirements, or the administrator wants to speed up user creation.

### Scenario: Eight users with the same license

**Situation:** An administrator needs to create 8 users with the same license.

**Recommended concept:** **Add Multiple Users.**

**Why:** It creates several similar users at once (up to 10 at a time, per the source material).

## Creating users with Data Loader

Users can also be inserted using Data Loader.

```sequence
Prepare CSV
Include required User fields
Use INSERT
!Create User records
```

Pay attention to the values for fields such as Email, Username, Locale, Language, Time Zone, Currency, Profile and User License.

## New user account verification

When a new user is created, an account verification email can be sent. The source material notes that the verification link has an expiration period, and that the user is prompted to establish a password through the verification process.

### Scenario: The verification link expired

**Situation:** The user did not complete account verification before the link expired.

**Recommended concept:** The administrator may need to **reset the user's password** so the user can complete the login process.

## Memory tricks

```text
USERNAME        = globally unique
USER LICENSE    = base type of access
FEATURE LICENSE = additional feature
LANGUAGE        = interface text
LOCALE          = formatting
TIME ZONE       = how times are shown
```

## Before exam

- Every user has a **profile**; the **user license** decides which profiles can be chosen.
- Username: email format, **globally unique**, can differ from Email.
- Required on a new user: **Last Name, Email, Username, User License, Profile**.
- **Language ≠ Locale**: language is interface text, locale is formatting.
- Only **available** licenses can be assigned.
- Many similar users → **Add Multiple Users** (up to 10) or **Data Loader** insert.
- Next: [User Maintenance](/salesforce-admin/configuration-setup/user-maintenance).
