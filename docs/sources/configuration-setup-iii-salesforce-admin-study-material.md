---
title: "Salesforce Admin — Configuration & Setup III"
module: "Configuration & Setup"
module_number: 3
content_type: "Learning Study Material"
audience: "Salesforce Administrator Certification"
language: "English"
version: "1.0"
source_basis:
  - "Configuration And Setup III — Custom Profile / Permission Set / Permission Set Group / Muting"
  - "Configuration And Setup III — Organization Security Controls"
  - "Configuration And Setup III — User Setup and Maintenance"
  - "Configuration And Setup III — Previous Topic"
---

# Salesforce Admin — Configuration & Setup III

> **Purpose:** Learn Configuration & Setup III as one connected system instead of memorizing isolated Salesforce features.
>
> **Core idea:** Salesforce security answers four questions:
>
> 1. **Who is the user?**
> 2. **What can the user do?**
> 3. **Which records can the user access?**
> 4. **How and when can the user enter the org?**

---

# 1. Module Overview

Configuration & Setup III combines four closely related areas:

| Area | Main Question | Important Concepts |
|---|---|---|
| User Setup & Maintenance | Who is the user? | User, Username, License, Locale, User Maintenance, Freeze, Deactivate |
| Profiles & Permission Management | What can the user do? | Profile, Custom Profile, Permission Set, Permission Set Group, Muting |
| Organization Security Controls | How can the user securely enter Salesforce? | MFA, IP, Login Hours, Password Policies, Session Settings, Device Activation |
| Record & Field Access | Which data can the user access? | OWD, Role Hierarchy, Sharing Rules, Public Groups, Manual Sharing, Restriction Rules, FLS |

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

---

# 2. The Most Important Mental Model

Do not start an exam question by looking for a feature name.

Start by asking:

```text
WHAT IS THE QUESTION REALLY ASKING?
            |
            +--> Can the user log in?
            |       -> User status / password / MFA / IP / Login Hours / Session
            |
            +--> What can the user do?
            |       -> Profile / Permission Set / Permission Set Group / Muting
            |
            +--> Can the user access this object?
            |       -> Object permissions
            |
            +--> Can the user access this record?
            |       -> OWD / Role / Sharing / Manual Sharing / Restriction
            |
            +--> Can the user see this field?
                    -> Field-Level Security
```

## The master formula

```text
USER
  |
  v
USER LICENSE
  |
  v
PROFILE = BASE ACCESS
  |
  +----> PERMISSION SET = EXTRA ACCESS
  |
  +----> PERMISSION SET GROUP = BUNDLE
  |
  +----> MUTING = REMOVE SELECTED PERMISSION FROM A GROUP
  |
  v
OBJECT ACCESS
  |
  v
RECORD ACCESS
  |
  +----> OWD
  +----> ROLE HIERARCHY
  +----> SHARING RULES
  +----> MANUAL SHARING
  +----> GROUPS / TEAMS / OTHER SHARING
  +----> RESTRICTION RULES
  |
  v
FIELD ACCESS
  |
  v
FIELD-LEVEL SECURITY
```

---

# 3. User Setup & Maintenance

## 3.1 What Is a Salesforce User?

A Salesforce User is a person or identity that has access to the Salesforce organization.

A user record contains information such as:

- First/Last Name
- Email
- Username
- Alias
- User License
- Profile
- Role, where applicable
- Language
- Locale
- Time Zone
- Currency
- User status and login information

Every Salesforce user has a profile, and the user license determines the type/level of Salesforce access available and which profiles can be selected.

---

# 4. Username

## What to remember

A Salesforce username:

- Is used to identify the user for login.
- Must use an email-style format.
- Must be **globally unique across Salesforce**, not merely unique inside one org.
- Can be different from the user's Email field.

### Example

```text
Username:
abid@example.salesforce

Email:
abid@company.com
```

The username and email address do not have to be identical.

## Exam keyword

> **"Globally unique"**

If the question focuses on uniqueness of a Salesforce username, think:

**Global uniqueness across Salesforce.**

---

# 5. User License

## Definition

The **User License** determines the user's general level/type of access to Salesforce and controls which profiles are available for that user.

Think:

```text
USER LICENSE
     =
BASE TYPE OF ACCESS
```

### Simple example

```text
Employee
   |
   +--> User License
   |
   +--> Profile
   |
   +--> Additional Permissions
```

A profile must be compatible with the selected user license.

## Exam pattern

> "The administrator wants to assign a profile, but the profile is not available for the user."

Think about:

**User License compatibility.**

---

# 6. Feature License

A **Feature License** gives access to additional functionality that is not included in the base user license.

Think:

```text
USER LICENSE
    |
    +--> Base access
    |
FEATURE LICENSE
    |
    +--> Additional feature
```

### Example scenario

A marketing user can already view campaigns but needs additional campaign functionality supported by a feature license.

The administrator may assign the appropriate feature license on the user record.

## Exam shortcut

> **User License = base**
>
> **Feature License = additional feature**

---

# 7. Permission Set License

Do not confuse:

- User License
- Feature License
- Permission Set
- Permission Set License

### Quick comparison

| Item | Main purpose |
|---|---|
| User License | Determines the type/level of Salesforce access |
| Feature License | Provides access to an additional feature |
| Permission Set | Grants additional permissions |
| Permission Set License | Enables functionality that can then be used through the relevant permissions |

---

# 8. Required User Information

When creating a user, important required information includes:

- Last Name
- Email
- Username
- User License
- Profile

Other user information can then be configured according to the organization's needs.

## Exam tip

If a question asks which information is required when creating a user, remember:

```text
LAST NAME
EMAIL
USERNAME
USER LICENSE
PROFILE
```

---

# 9. Locale Settings

Salesforce users can have personalized localization settings.

The most important settings are:

```text
LANGUAGE
LOCALE
TIME ZONE
CURRENCY
```

## Language

Controls the language used for Salesforce interface text.

Example:

```text
English
Italian
Spanish
```

## Locale

Controls localization formats such as:

- Date format
- Time format
- Number format
- Name/address formatting

### Example

Different locales can display a date differently.

```text
Locale A -> 12/25/2026
Locale B -> 25/12/2026
```

## Time Zone

Controls how times are displayed to the user.

Example:

```text
User A -> Eastern Time
User B -> Bangladesh Time
```

The same event can be displayed according to each user's time zone.

## Currency

Currency settings affect how currency is represented for users in an org where multi-currency is relevant.

---

# 10. Locale Scenario

### Scenario

A support agent wants:

- Salesforce interface text in Italian.
- Calendar times displayed according to an Italian time zone.

### Solution

Edit the **user record** and change the appropriate:

- Language
- Time Zone

### Exam clue

> "Interface language"

Think:

**Language**

> "Date/number formatting"

Think:

**Locale**

> "Event time"

Think:

**Time Zone**

---

# 11. User License Distribution

Salesforce licenses are limited resources.

Think:

```text
TOTAL LICENSES
      |
      +--> USED
      |
      +--> AVAILABLE
```

### Example

```text
Salesforce User Licenses = 20
Used = 17
Available = 3
```

Only the available licenses can be assigned to additional users.

---

# 12. Add Multiple Users

Salesforce provides an option to add multiple users.

The source material describes adding up to **10 users** at a time through the Add Multiple Users function.

This is useful when:

- Several users need the same license.
- Users have similar setup requirements.
- The administrator wants to speed up user creation.

### Exam scenario

> An administrator needs to create 8 users with the same license.

Think:

**Add Multiple Users**

---

# 13. Creating Users with Data Loader

Users can also be inserted using Data Loader.

General flow:

```text
Prepare CSV
    |
    v
Include required User fields
    |
    v
Use INSERT
    |
    v
Create User records
```

Pay attention to values for fields such as:

- Email
- Username
- Locale
- Language
- Time Zone
- Currency
- Profile
- User License

---

# 14. New User Account Verification

When a new user is created, an account verification email can be sent.

The source material notes that the verification link has an expiration period and that the user is prompted to establish a password through the verification process.

### Important scenario

> The user did not complete account verification before the link expired.

The administrator may need to reset the user's password so the user can complete the login process.

---

# 15. User Maintenance

Administrators can perform several user-maintenance tasks:

- Reset password
- Unlock user
- Freeze user
- Deactivate user
- Review login history
- Review failed login attempts
- Change user settings
- Manage licenses/features
- Manage profile/role assignment
- Login as another user where the administrator has the appropriate capability

---

# 16. Reset Password

An administrator can reset:

- One user's password.
- Passwords for multiple users through administrative functions.

### Flow

```text
User Record
    |
    v
Reset Password
    |
    v
Password reset process
```

### Exam clue

> "User forgot their password."

Think:

**Reset Password**

---

# 17. Failed Login Attempts

A user record can provide information about failed login attempts.

This is useful for troubleshooting authentication problems.

### Scenario

> A user says they cannot log in and the administrator suspects repeated incorrect passwords.

Useful places to investigate include:

**User record + Login History**

---

# 18. Unlock User Account

A user account can become locked because of too many failed login attempts.

An administrator can unlock the account.

### Scenario

```text
Wrong password repeatedly
       |
       v
Account locked
       |
       v
Administrator unlocks
```

---

# 19. Freeze vs Deactivate

This is one of the most important exam comparisons.

| Freeze | Deactivate |
|---|---|
| Prevents the user from logging in | Makes the user inactive |
| Useful for temporary access blocking | Useful when user should no longer be active |
| User record remains | User record remains |
| Can be reversed | Can be reactivated when appropriate |
| Does not by itself remove the assigned license | Deactivation frees the user license for reuse |

## Memory trick

```text
FREEZE
= Stop login temporarily

DEACTIVATE
= Make user inactive
```

### Scenario 1

> Employee is under investigation and access must be stopped immediately, but the account may need to be restored.

**Freeze**

### Scenario 2

> Employee leaves the organization and should no longer be an active Salesforce user.

**Deactivate**

---

# 20. Salesforce Users Cannot Be Deleted

This is a classic exam fact.

```text
DELETE USER
    ❌
```

Instead:

```text
FREEZE
or
DEACTIVATE
```

The user record remains available for historical/reference purposes.

---

# 21. Delegated Administration

Delegated Administration allows selected users to perform limited administrative tasks without giving them full System Administrator access.

Examples from the source material include:

- Managing users
- Assigning/removing permission sets
- Managing public groups
- Managing specified custom objects

## Scenario

> A regional administrator should manage certain users and groups but should not receive full System Administrator access.

Think:

**Delegated Administration**

## Memory trick

> **Delegated Admin = limited admin responsibility**

---

# 22. Login As Another User

Where the administrator has the required capability, "Login As" can help reproduce a user's experience.

### Scenario

> User says, "I cannot see the Sales Reports tab."

Instead of guessing:

```text
Login as user
     |
     v
Experience the user's access
     |
     v
Identify configuration/permission issue
```

---

# 23. Business Hours vs User Working Context

Do not confuse user settings with **Business Hours**.

Business Hours define when an organization/team is considered available for supported Salesforce processes.

The source material notes that multiple Business Hours definitions can exist, with one used as the default.

### Example

```text
Business Hours
Monday-Friday
9 AM-5 PM
```

A Case can use the appropriate business-hours definition to determine support availability.

### Exam clue

If the question is about **support availability, case calculations, or business operation hours**, think:

**Business Hours**

If it is about **when a profile's users can log in**, think:

**Login Hours**

---

# 24. Profiles — The Foundation of User Permissions

Every Salesforce user has a profile.

A profile defines baseline access such as:

- Object permissions
- Field permissions
- App access
- Tab settings
- System permissions
- Login restrictions
- Other profile-level settings

## Core idea

```text
PROFILE
=
BASELINE ACCESS
```

---

# 25. Standard Profile

Salesforce provides standard profiles out of the box.

The source includes examples such as:

- Standard User
- Marketing User
- Solution Manager
- Contract Manager
- System Administrator
- Minimum Access - Salesforce

Different standard profiles provide different baseline capabilities.

### Important

Do not memorize every permission in every standard profile unless your exam material specifically requires it.

Instead understand the pattern:

```text
Standard Profile
=
Salesforce-provided baseline
```

---

# 26. Custom Profile

A custom profile is created to provide a tailored baseline permission model.

The source material shows custom profiles being created by cloning an existing profile.

### General flow

```text
Existing Profile
      |
      v
Clone
      |
      v
Custom Profile
      |
      v
Modify required settings
```

### Scenario

> A company needs a user type with almost the same access as Standard User, but with different object/system permissions.

Think:

**Custom Profile**

---

# 27. When to Use Profile vs Permission Set

This is probably the most important decision pattern in this topic.

## Use a Profile when:

The requirement describes a **common baseline** for a category/type of users.

Example:

```text
All Sales Reps
    |
    +--> Accounts
    +--> Contacts
    +--> Opportunities
    +--> Sales App
```

Create/configure the baseline profile.

## Use a Permission Set when:

Only some users need **additional access**.

Example:

```text
100 Sales Reps
       |
       +--> Base Profile

10 Senior Reps
       |
       +--> Reporting Permission Set
```

---

# 28. Profile vs Permission Set — Master Table

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

---

# 29. Object Settings

Profiles and permission sets can control object-level permissions.

Typical object permissions include:

```text
Read
Create
Edit
Delete
View All
Modify All
```

### Basic CRUD

```text
C = Create
R = Read
U = Update/Edit
D = Delete
```

---

# 30. View All vs Modify All

## View All

Allows broad visibility to records for that object, beyond normal record-sharing restrictions.

Think:

```text
VIEW ALL
=
SEE ALL
```

## Modify All

Provides broad control over records for that object.

Think:

```text
MODIFY ALL
=
SEE + MODIFY ALL
```

### Memory trick

> **View All = visibility**
>
> **Modify All = control**

---

# 31. Field-Level Security

Field-Level Security controls whether a user can:

- See a field.
- Edit a field.

### Scenario

User can access an Account but cannot see:

```text
Annual Revenue
```

The likely security layer is:

**Field-Level Security**

Not:

- OWD
- Sharing Rule
- Role Hierarchy

---

# 32. Page Layout vs Field-Level Security

Both can affect what users see, but they are not the same.

### Field-Level Security

Controls whether the user can access the field.

### Page Layout

Controls how fields and components are arranged/displayed on the page and can control field-level visibility on that layout.

### Exam strategy

If the question emphasizes **security/access to a field**, think:

**FLS**

If it emphasizes **page presentation/layout**, think:

**Page Layout**

---

# 33. Tab Settings

Profile settings can control tab visibility.

Common settings:

| Setting | Meaning |
|---|---|
| Default On | Tab is shown by default |
| Default Off | Tab is available but not automatically shown |
| Hidden | Tab is hidden/unavailable to the user |

### Memory trick

```text
ON
= SHOW

OFF
= AVAILABLE, NOT DEFAULT

HIDDEN
= HIDE
```

---

# 34. App Settings

Profile settings can control app availability and related app permissions.

Think:

```text
Profile
   |
   +--> Which apps can the user access?
   |
   +--> What permissions does the user have within the app?
```

---

# 35. System Permissions

Profiles and permission sets can contain system permissions.

Examples can include permissions related to:

- Setup
- Reports
- Data access
- Administration
- Other Salesforce functionality

The exact permissions available depend on enabled Salesforce features and the user's license/context.

---

# 36. Permission Sets

A Permission Set is a collection of additional permissions that can be assigned to users.

Think:

```text
PROFILE
   |
   | baseline
   v
USER
   ^
   |
PERMISSION SET
   |
   | additional access
```

Permission Sets can contain:

- App permissions
- System permissions
- Object permissions
- Field permissions
- Other supported permissions

---

# 37. Why Permission Sets Are Powerful

Suppose there are 100 Sales Users.

All need:

```text
Sales Profile
```

But only 8 need:

```text
Manage Campaigns
```

Instead of creating another profile just for 8 users:

```text
Sales Profile
      +
Campaign Management Permission Set
```

This keeps the baseline profile simpler and gives additional access only to the required users.

---

# 38. Permission Set Group

A Permission Set Group bundles multiple Permission Sets.

### Example

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

---

# 39. Muting Permission Set

A Muting Permission Set is used with a Permission Set Group to mute selected permissions that would otherwise be included through the group.

### Example

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

## Important

Muting is specifically about **permissions included through the Permission Set Group**.

### Memory trick

> **Permission Set Group = bundle**
>
> **Muting = selectively remove from that bundle**

---

# 40. Permission Set Expiration

A Permission Set or Permission Set Group can have an expiration date.

### Example

```text
Temporary Project
       |
       v
Permission Set
       |
       v
Expires: 31 Dec
       |
       v
Access ends after expiration
```

Useful for:

- Temporary assignments
- Contractors
- Temporary elevated access
- Short-term projects

---

# 41. Session-Based Permission Sets

A session-based permission set grants permissions only during an activated session.

### Normal Permission Set

```text
Assigned
   |
   v
Permission remains available
```

### Session-Based Permission Set

```text
Assigned
   |
   v
Session activated
   |
   v
Permission active
   |
   v
Session ends/deactivated
   |
   v
Permission no longer active
```

A Permission Set Group can be used when multiple permission sets need to be activated for the session.

---

# 42. User Access Summary

The User Access Summary helps administrators understand a user's access.

It can show information such as:

- User permissions
- Object permissions
- Field permissions
- Custom permissions
- Group membership
- Queue membership

This is useful when troubleshooting access.

---

# 43. Access Granted By

If the question is:

> "Why does this user have this permission?"

Use:

**Access Granted By**

It helps identify whether a permission was granted through:

- Profile
- Permission Set
- Permission Set Group
- Related permission source

### Troubleshooting flow

```text
User reports unexpected permission
             |
             v
Open User Access / Permission information
             |
             v
Use "Access Granted By"
             |
             v
Find source of permission
```

---

# 44. Permission Troubleshooting Scenario

### Scenario

A user says:

> "I should not be able to edit Accounts, but Salesforce allows me to."

Do not immediately change the profile.

First investigate:

```text
User
 |
 +--> Profile
 |
 +--> Permission Sets
 |
 +--> Permission Set Groups
 |
 +--> Access Granted By
```

The permission may be coming from a Permission Set rather than the profile.

---

# 45. Organization Security Controls

Organization security controls protect the Salesforce login/session environment.

The major controls covered in this module are:

```text
Setup Audit Trail
Password Policies
Session Settings
Login Hours
IP Restrictions
Trusted IP Ranges
Device Activation
MFA
SSO
Login History / Forensics
Security Health Check
Agent Access
```

---

# 46. Setup Audit Trail

## What does it answer?

> **Who changed the Salesforce configuration?**

Think:

```text
WHO
+
WHAT
+
WHEN
```

Setup Audit Trail is useful for monitoring administrative/configuration changes.

### Examples

An administrator wants to know:

- Who changed a profile?
- Who modified a configuration?
- Who changed a setup setting?

Think:

**Setup Audit Trail**

---

# 47. Password Policies

Password policies can be configured to improve password security.

Relevant areas include:

- Password requirements
- Password expiration
- Password history
- Lockout-related behavior
- Password strength/security settings

### Exam clue

> "The administrator wants stronger password requirements."

Think:

**Password Policies**

---

# 48. Session Settings

Session Settings control security-related behavior after a user has established a Salesforce session.

They can be configured at organization/profile-related levels depending on the setting.

Think:

```text
LOGIN
  |
  v
SESSION CREATED
  |
  v
SESSION SETTINGS CONTROL SESSION BEHAVIOR
```

### Exam clue

> "Question is specifically about behavior/security of the Salesforce session."

Think:

**Session Settings**

---

# 49. Login Hours

Login Hours answer:

> **When can users log in?**

Login Hours are configured through the profile.

### Example

```text
Monday-Friday
9:00 AM - 6:00 PM
```

Users with that profile are restricted according to the configured login hours.

### Memory trick

> **WHEN = Login Hours**

---

# 50. IP Restrictions

IP Restrictions answer:

> **From where can users log in?**

Profile-level login IP ranges can restrict access to specified IP ranges.

### Example

```text
Allowed:
Company Network

Denied:
Outside IP Range
```

### Memory trick

> **WHERE = IP Restrictions**

---

# 51. Trusted IP Ranges

Organization-level trusted IP ranges can be configured through **Network Access**.

Users logging in from a trusted IP range can avoid an identity verification challenge.

If a user logs in outside the trusted range, an activation/verification challenge can occur according to the configured security behavior.

### Compare

| Trusted IP Range | Profile Login IP Range |
|---|---|
| Organization/network-level concept | Profile-level restriction |
| Trusted locations | Allowed login IP ranges |
| Helps determine whether a login challenge is required | Can deny login outside allowed ranges |

---

# 52. Device Activation

Device Activation adds another security layer beyond username/password.

It can be triggered when a user logs in from an unrecognized browser/device and is outside a trusted IP range.

The verification can use methods such as:

- Email
- SMS
- Salesforce Authenticator
- Built-in authenticators/biometrics

### Simple flow

```text
Username + Password
        |
        v
Recognized/trusted?
      /   \
    YES    NO
     |      |
     v      v
   Login   Identity Verification
```

---

# 53. Salesforce Authenticator

Salesforce Authenticator can be used for identity verification/MFA-related workflows.

If push notifications are unavailable, the source material notes that users can use time-based one-time passcodes generated by the authenticator app in supported scenarios.

---

# 54. Built-In Authenticator

Built-in authenticators can use device biometric capabilities such as:

- Touch ID
- Face ID
- Windows Hello

These use the device's biometric mechanism to verify identity.

---

# 55. Multi-Factor Authentication (MFA)

MFA requires more than one authentication factor.

Basic model:

```text
Something you know
        +
Something you have / are
        =
Stronger authentication
```

Example:

```text
Password
+
Salesforce Authenticator
```

or:

```text
Password
+
Security Key
```

### Exam clue

> "Require a second verification method."

Think:

**MFA**

---

# 56. Single Sign-On (SSO)

SSO allows Salesforce authentication to be integrated with an external identity provider.

The source material discusses federated authentication such as SAML and delegated authentication.

### Simple idea

```text
User
 |
 v
Identity Provider
 |
 v
Salesforce
```

The user can use centralized identity management rather than maintaining separate authentication for every application.

---

# 57. Login History

Login History is useful for investigating login attempts.

It can help an administrator understand:

- Successful attempts
- Failed attempts
- Time/date
- Login-related information

### Scenario

> "A user says someone may have attempted to access their account."

Think:

**Login History**

---

# 58. Login Forensics

Login Forensics is intended for deeper analysis of login-related event information.

Think:

```text
Login History
= Basic login investigation

Login Forensics
= Deeper login event investigation
```

---

# 59. Security Health Check

Security Health Check helps identify potential vulnerabilities and compare security settings against a security baseline.

The source describes a summary score based on how the organization's settings compare to a baseline.

### Think

```text
Current Security Settings
          |
          v
Security Health Check
          |
          v
Compare with Security Baseline
          |
          v
Identify risky / less secure settings
```

### Exam clue

> "Admin wants to evaluate the overall security posture of the Salesforce org."

Think:

**Security Health Check**

---

# 60. Security Controls — Quick Table

| Requirement | Feature |
|---|---|
| Monitor setup/configuration changes | Setup Audit Trail |
| Strong password requirements | Password Policies |
| Control session behavior | Session Settings |
| Restrict login time | Login Hours |
| Restrict login location | IP Restrictions |
| Trusted network locations | Trusted IP Ranges / Network Access |
| Additional identity verification | Device Activation |
| Multiple authentication factors | MFA |
| Centralized authentication | SSO |
| Investigate login attempts | Login History |
| Deeper login event investigation | Login Forensics |
| Evaluate security configuration | Security Health Check |

---

# 61. Record-Level Security — The Four-Level Model

The source material presents security in layers.

A useful mental model is:

```text
LEVEL 1 — ORGANIZATION
    |
    +--> Login Hours
    +--> IP Restrictions
    +--> Password Policies
    +--> Authentication

LEVEL 2 — OBJECT
    |
    +--> Profiles
    +--> Permission Sets

LEVEL 3 — RECORD
    |
    +--> OWD
    +--> Role Hierarchy
    +--> Sharing
    +--> Teams
    +--> Other record-sharing mechanisms

LEVEL 4 — FIELD
    |
    +--> Field-Level Security
    +--> Page Layout-related visibility
```

---

# 62. Object-Level Security

Object-level security answers:

> **Can the user work with this object?**

Examples:

```text
Account
Contact
Opportunity
Case
Custom Object
```

Permissions:

```text
Read
Create
Edit
Delete
View All
Modify All
```

Controlled mainly through:

- Profile
- Permission Set
- Permission Set Group

---

# 63. Record-Level Security

Record-level security answers:

> **Which records of that object can the user access?**

Main concepts:

- Organization-Wide Defaults
- Role Hierarchy
- Sharing Rules
- Manual Sharing
- Public Groups
- Teams
- Other sharing mechanisms
- Restriction Rules
- Scoping Rules

---

# 64. Field-Level Security

Field-level security answers:

> **Which fields can the user see/edit?**

Example:

```text
Account
 |
 +--> Name          Visible
 +--> Phone         Visible
 +--> AnnualRevenue Hidden
```

---

# 65. Organization-Wide Defaults (OWD)

OWD defines the baseline record-level access for users.

Think:

> **OWD = starting point**

It does not define object permission.

### Important distinction

```text
PROFILE / PERMISSION SET
        |
        v
Can the user access the OBJECT?

OWD / SHARING
        |
        v
Which RECORDS can the user access?
```

---

# 66. Common OWD Access Levels

Depending on the object, OWD options can include:

- Private
- Public Read Only
- Public Read/Write
- Public Read/Write/Transfer
- Controlled by Parent

## Memory ladder

```text
PRIVATE
   |
   v
READ ONLY
   |
   v
READ/WRITE
   |
   v
TRANSFER
```

As access becomes more open, more record actions are available.

---

# 67. OWD = Baseline, Not Everything

Suppose:

```text
Account OWD = Private
```

A user may still get access through:

- Role Hierarchy
- Sharing Rule
- Manual Sharing
- Account Team
- Other applicable sharing mechanisms

Therefore:

> **OWD defines the baseline, not necessarily the final access.**

---

# 68. Role Hierarchy

Role Hierarchy opens record access based on organizational hierarchy.

Typical idea:

```text
VP
 |
 +--> Manager
       |
       +--> Sales Rep
```

A manager can generally gain access to records owned by users below them according to the role hierarchy and object behavior.

### Memory trick

> **Role = hierarchy-based record access**

---

# 69. Role vs Profile

This is a major exam distinction.

| Profile | Role |
|---|---|
| Defines baseline permissions | Helps determine record visibility |
| What can the user do? | Whose records can the user see? |
| Object/system access | Record hierarchy/access |
| Every user needs a profile | Role is not simply a replacement for profile |

### Memory

```text
PROFILE = WHAT CAN I DO?
ROLE = WHOSE RECORDS CAN I SEE?
```

---

# 70. Sharing Rules

Sharing Rules extend record access beyond the baseline provided by OWD and applicable hierarchy.

Two major patterns:

### Owner-Based Sharing Rule

Share records based on who owns them.

### Criteria-Based Sharing Rule

Share records based on record criteria.

---

# 71. Owner-Based Sharing Example

```text
Branch A Users
       |
       v
Own Customer Records
       |
       v
Sharing Rule
       |
       v
Branch A Public Group
```

The group gets access to records owned by the specified users.

---

# 72. Criteria-Based Sharing Example

Requirement:

> All Accounts where Region = "North" should be accessible to the North Sales Group.

Flow:

```text
Account
  |
  +--> Region = North
          |
          v
Criteria-Based Sharing Rule
          |
          v
North Sales Group
```

---

# 73. Sharing Rule Does Not Replace Object Permission

This is a very important exam trap.

Suppose:

```text
Sharing Rule
   |
   v
Gives access to Account records
```

But:

```text
Profile
   |
   v
Account Read = FALSE
```

The sharing rule cannot magically give object-level access.

### Golden rule

> **First object access, then record access.**

---

# 74. Public Groups

A Public Group is a collection of users/other supported members that can be used for access management.

Public Groups are useful for:

- Sharing Rules
- Folder sharing
- Other access scenarios

### Example

```text
North Region Public Group
    |
    +--> User A
    +--> User B
    +--> User C
```

Instead of sharing separately with each user, share with the group.

---

# 75. Manual Sharing

Manual Sharing provides record-specific sharing.

### Example

```text
Opportunity A
     |
     v
Share
     |
     v
User B
     |
     v
Read/Write
```

Use it for individual exceptions rather than broad automatic access.

---

# 76. Teams

Teams can also be used for record access in supported scenarios.

Examples include:

- Account Teams
- Opportunity Teams
- Case Teams

Think:

> **Teams = record collaboration/access for specific records**

---

# 77. Restriction Rules

Restriction Rules are different from sharing rules.

### Sharing Rule

```text
OPEN ACCESS
```

### Restriction Rule

```text
LIMIT / FILTER ACCESS
```

Restriction Rules can restrict the records visible to users based on user and record criteria.

### Scenario

A user may otherwise have broad access to Project records, but should only see:

```text
Project.Status = Active
```

A restriction rule can be used for supported objects/scenarios to narrow what the user can access.

---

# 78. Scoping Rules

Scoping Rules filter which records are presented to users by default based on criteria.

The important distinction is:

```text
SCOPING
=
What records should normally appear?

RESTRICTION
=
What records should the user be prevented from accessing?
```

Scoping Rules do not replace the underlying sharing model.

---

# 79. Sharing vs Restriction vs Scoping

| Feature | Main idea |
|---|---|
| Sharing Rule | Grant additional record access |
| Restriction Rule | Restrict/filter record access |
| Scoping Rule | Filter records presented by default |
| OWD | Establish baseline record access |
| Role Hierarchy | Open access through hierarchy |
| Manual Sharing | One-off record sharing |

---

# 80. Report & Dashboard Folder Access

Reports and dashboards are stored in folders.

Folder access can be granted to users/groups with levels such as:

- Viewer
- Editor
- Manager

### Example

```text
Sales Reports Folder
       |
       +--> Sales Public Group
               |
               +--> Viewer
```

This allows the group to view the reports without necessarily giving them editing or management rights.

---

# 81. Complete Security Architecture Diagram

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

---

# 82. Scenario: Branch-Based Customer Access

## Requirement

A company has multiple branches.

Employees in each branch:

- Can see customers belonging to their own branch.
- Should not see customers belonging to other branches.
- Employees have different roles.

## Solution pattern

```text
OWD = Private
        |
        v
Create Public Group per Branch
        |
        v
Create Sharing Rule
        |
        v
Share branch-owned customers
        |
        v
Branch Public Group
```

This pattern is directly represented in the source material.

### Why?

- OWD = baseline restriction.
- Public Group = branch membership.
- Sharing Rule = opens records to the appropriate branch.

---

# 83. Scenario: Report Permission for Selected Users

## Requirement

100 users have the same basic profile.

Only 10 should be able to create and customize reports.

## Solution

```text
Common Profile
      |
      v
Base access for 100 users

Permission Set
      |
      v
Create & Customize Reports
      |
      v
Assign to 10 users
```

### Why?

The requirement is an **additional permission for selected users**, not a completely different baseline.

---

# 84. Scenario: Temporary Elevated Access

## Requirement

An employee needs extra permissions for a short project.

## Solution

Consider:

**Permission Set with expiration**

or, where the requirement is session-only access:

**Session-Based Permission Set**

### Decision

```text
Need access for days/weeks?
        |
        v
Permission Set + Expiration

Need access only during a session?
        |
        v
Session-Based Permission Set
```

---

# 85. Scenario: Permission Bundle With One Exception

## Requirement

A Project Analyst needs:

- Create Project
- Edit Project
- Delete Project

through a standard Permission Set Group.

But analysts should not delete projects.

## Solution

```text
Permission Set Group
      |
      +--> Project Permissions
      |
      +--> Muting Permission Set
                |
                +--> Mute Delete
```

---

# 86. Scenario: User Can't Log In

Use this troubleshooting sequence:

```text
USER CANNOT LOGIN
       |
       v
Is user active?
       |
       v
Is user frozen?
       |
       v
Check password / reset
       |
       v
Check failed login attempts
       |
       v
Check Login History
       |
       v
Check Login Hours
       |
       v
Check IP restrictions
       |
       v
Check trusted IP / identity verification
       |
       v
Check MFA / device verification
```

---

# 87. Scenario: User Has Too Much Access

Use this sequence:

```text
USER HAS EXTRA ACCESS
       |
       v
Check Profile
       |
       v
Check Permission Sets
       |
       v
Check Permission Set Groups
       |
       v
Use Access Granted By
       |
       v
Identify permission source
       |
       v
Remove/correct the appropriate source
```

Do not immediately modify the profile without finding the source.

---

# 88. Scenario: User Can't See a Record

Use this sequence:

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

---

# 89. Scenario: User Can See Record but Not Field

```text
Can access Object?
       |
       v
Can access Record?
       |
       v
Can see Field?
       |
       v
Field-Level Security
```

This is one of the most useful exam decision trees.

---

# 90. Configuration & Setup III — Master Comparison Table

| Concept | Question it answers |
|---|---|
| User | Who is accessing Salesforce? |
| User License | What type of Salesforce access does the user have? |
| Feature License | What additional feature can the user use? |
| Profile | What is the user's baseline access? |
| Permission Set | What extra permissions does the user need? |
| Permission Set Group | Which permission sets belong together? |
| Muting Permission Set | Which group permissions should be muted? |
| Permission Set Expiration | When should temporary access end? |
| Session-Based Permission Set | When should permission exist only for an active session? |
| OWD | What is the baseline record access? |
| Role Hierarchy | Which records can users above the owner access? |
| Sharing Rule | Which additional records should be shared? |
| Public Group | Which users should be treated as a sharing group? |
| Manual Sharing | Which individual record should be shared? |
| Restriction Rule | Which records should be restricted? |
| Scoping Rule | Which records should appear by default? |
| FLS | Which fields can the user see/edit? |
| Login Hours | When can users log in? |
| IP Restrictions | From where can users log in? |
| Trusted IP | Which locations are trusted? |
| MFA | How do we add another authentication factor? |
| Device Activation | How do we verify an unfamiliar device/browser? |
| Setup Audit Trail | Who changed Salesforce setup? |
| Login History | What happened during login attempts? |
| Security Health Check | How secure is the configuration compared with a baseline? |
| Freeze | Temporarily prevent login |
| Deactivate | Make user inactive |

---

# 91. Common Exam Confusions

## Confusion 1 — Profile vs Role

```text
PROFILE = WHAT
ROLE = WHOSE RECORDS
```

---

## Confusion 2 — Permission Set vs Sharing Rule

```text
PERMISSION SET
= Object/system/field/app permission

SHARING RULE
= Record access
```

---

## Confusion 3 — OWD vs Profile

```text
PROFILE
= Object-level baseline permission

OWD
= Record-level baseline access
```

---

## Confusion 4 — Sharing Rule vs Restriction Rule

```text
SHARING
= OPEN

RESTRICTION
= LIMIT
```

---

## Confusion 5 — Locale vs Language

```text
LANGUAGE
= Interface language

LOCALE
= Formatting
```

---

## Confusion 6 — Freeze vs Deactivate

```text
FREEZE
= Stop login

DEACTIVATE
= Make inactive
```

---

## Confusion 7 — Login Hours vs Business Hours

```text
LOGIN HOURS
= When a user may log in

BUSINESS HOURS
= When the business/support process is considered open
```

---

## Confusion 8 — Login History vs Setup Audit Trail

```text
LOGIN HISTORY
= User login activity

SETUP AUDIT TRAIL
= Configuration changes
```

---

## Confusion 9 — View All vs Modify All

```text
VIEW ALL
= See all records

MODIFY ALL
= Broad control over all records
```

---

# 92. Exam Keyword Dictionary

When you see this phrase, think this:

| Exam wording | Think |
|---|---|
| "baseline permissions" | Profile |
| "additional permissions" | Permission Set |
| "selected users" | Permission Set |
| "bundle permission sets" | Permission Set Group |
| "mute/remove permission from group" | Muting Permission Set |
| "temporary access" | Permission Set Expiration |
| "only during session" | Session-Based Permission Set |
| "globally unique username" | Username |
| "additional feature" | Feature License |
| "temporarily block login" | Freeze |
| "employee left" | Deactivate |
| "cannot delete user" | Deactivate/Freeze |
| "manager sees subordinate records" | Role Hierarchy |
| "baseline record access" | OWD |
| "share based on owner" | Owner-Based Sharing Rule |
| "share based on field/criteria" | Criteria-Based Sharing Rule |
| "share one record" | Manual Sharing |
| "group of users for sharing" | Public Group |
| "restrict records" | Restriction Rule |
| "filter default records" | Scoping Rule |
| "hide field" | FLS |
| "when can they log in?" | Login Hours |
| "where can they log in?" | IP Restrictions |
| "trusted network" | Trusted IP |
| "second verification" | MFA / Device Activation |
| "who changed setup?" | Setup Audit Trail |
| "failed login attempts" | Login History |
| "security score/baseline" | Security Health Check |

---

# 93. Before-Exam Revision — 15 Minute Version

If you only have 15 minutes, revise this section.

## Users

```text
Username = globally unique
User License = base access type
Feature License = additional feature
Profile = required baseline access
Users cannot be deleted
Freeze = block login
Deactivate = inactive user
```

## Permissions

```text
Profile = Base
Permission Set = Extra
Permission Set Group = Bundle
Muting = Remove selected permission from PSG
Expiration = Temporary access
Session-Based = Session-only access
Access Granted By = Find permission source
```

## Data Security

```text
Object = Profile / Permission Set
Record = OWD / Role / Sharing
Field = FLS
```

## Record Sharing

```text
OWD = Baseline
Role = Hierarchy
Sharing = Open
Manual Sharing = One record
Public Group = Group of users
Restriction = Limit
Scoping = Filter/default presentation
```

## Login Security

```text
WHEN = Login Hours
WHERE = IP Restrictions
TRUSTED = Trusted IP
WHO ARE YOU = MFA / Device Activation
SESSION = Session Settings
```

## Troubleshooting

```text
Login problem = Login History
Configuration change = Setup Audit Trail
Security posture = Security Health Check
Permission source = Access Granted By
```

---

# 94. Before-Exam Rapid Fire

Say the answer mentally before reading the right side.

| Question | Answer |
|---|---|
| Every user must have what? | Profile |
| Username uniqueness? | Globally unique |
| Base type of Salesforce access? | User License |
| Extra feature? | Feature License |
| Base permissions? | Profile |
| Extra permissions? | Permission Set |
| Bundle permission sets? | Permission Set Group |
| Remove permission inside PSG? | Muting |
| Temporary permission? | Expiration |
| Permission only during session? | Session-Based Permission Set |
| Can Salesforce users be deleted? | No |
| Temporarily stop login? | Freeze |
| Make user inactive? | Deactivate |
| Object access? | Profile/Permission Set |
| Record access baseline? | OWD |
| Manager/subordinate access? | Role Hierarchy |
| Automatically share records? | Sharing Rule |
| Share one record? | Manual Sharing |
| Group users? | Public Group |
| Limit records? | Restriction Rule |
| Filter records shown by default? | Scoping Rule |
| Field visibility? | FLS |
| Login time? | Login Hours |
| Login location? | IP Restrictions |
| Trusted network? | Trusted IP |
| Second factor? | MFA |
| Device verification? | Device Activation |
| Configuration changes? | Setup Audit Trail |
| Login attempts? | Login History |
| Security configuration score? | Security Health Check |

---

# 95. Final Memory Map

```text
                     CONFIGURATION & SETUP III
                               |
        +----------------------+----------------------+
        |                      |                      |
       USER                PERMISSIONS              SECURITY
        |                      |                      |
   User License             Profile              Password
   Username                 Permission Set        MFA
   Locale                   Permission Set Group  SSO
   Language                 Muting                IP
   Time Zone                Expiration            Login Hours
   Currency                 Session-Based         Session
   Freeze                   Access Granted By     Device
   Deactivate                                      Audit Trail
   Login History                                   Health Check
        |                      |
        +----------------------+----------------------+
                               |
                          DATA ACCESS
                               |
              +----------------+----------------+
              |                                 |
           OBJECT                            RECORD
              |                                 |
       Profile/Permission                  OWD
       Set/PSG                              Role
                                            Sharing
                                            Manual
                                            Groups
                                            Teams
                                            Restriction
                                            Scoping
                               |
                               v
                             FIELD
                               |
                              FLS
```

---

# 96. Golden Rules to Memorize

> **Rule 1:** Profile gives the baseline; Permission Sets extend it.

> **Rule 2:** Permission Set Groups bundle Permission Sets.

> **Rule 3:** Muting removes selected permissions from a Permission Set Group.

> **Rule 4:** Object permission and record sharing are different layers.

> **Rule 5:** OWD is the baseline for record access.

> **Rule 6:** Role Hierarchy can open record access upward.

> **Rule 7:** Sharing Rules generally open record access.

> **Rule 8:** Restriction Rules limit/filter record access.

> **Rule 9:** Field-Level Security controls field visibility/access.

> **Rule 10:** Login Hours control **when** users can log in.

> **Rule 11:** IP Restrictions control **where** users can log in.

> **Rule 12:** MFA adds another authentication factor.

> **Rule 13:** Setup Audit Trail tracks setup/configuration changes.

> **Rule 14:** Login History helps investigate login activity.

> **Rule 15:** Salesforce users cannot be deleted; freeze or deactivate instead.

---

# 97. Final Exam Strategy

When an Admin exam question looks complicated, **do not panic**.

Break the scenario into layers.

### Step 1 — Identify the person

```text
Who is the user?
What license?
What profile?
```

### Step 2 — Identify the permission

```text
Base access?
Extra access?
Bundle?
Temporary?
Session-only?
```

### Step 3 — Identify the data layer

```text
Object?
Record?
Field?
```

### Step 4 — Identify the sharing requirement

```text
Baseline?
Hierarchy?
Automatic sharing?
One-off sharing?
Restriction?
```

### Step 5 — Identify login security

```text
When?
Where?
Identity?
Session?
```

### Step 6 — Look for the strongest keyword

For example:

```text
"selected users"
       -> Permission Set

"bundle"
       -> Permission Set Group

"mute"
       -> Muting Permission Set

"manager"
       -> Role Hierarchy

"baseline records"
       -> OWD

"criteria"
       -> Criteria-Based Sharing Rule

"temporarily prevent login"
       -> Freeze

"left company"
       -> Deactivate

"field hidden"
       -> FLS

"working hours for login"
       -> Login Hours

"office IP"
       -> IP Restrictions

"who changed"
       -> Setup Audit Trail

"failed login"
       -> Login History
```

---

# 98. One-Line Master Cheat Sheet

```text
USER = WHO
LICENSE = TYPE OF ACCESS
PROFILE = BASE
PERMISSION SET = EXTRA
PSG = BUNDLE
MUTING = REMOVE FROM BUNDLE
OWD = RECORD BASELINE
ROLE = HIERARCHY
SHARING = OPEN RECORD ACCESS
MANUAL SHARING = ONE RECORD
PUBLIC GROUP = GROUP USERS
RESTRICTION = LIMIT RECORDS
SCOPING = FILTER DEFAULT RECORDS
FLS = FIELD
LOGIN HOURS = WHEN
IP = WHERE
MFA = EXTRA IDENTITY
DEVICE ACTIVATION = VERIFY DEVICE
AUDIT TRAIL = WHO CHANGED SETUP
LOGIN HISTORY = WHAT HAPPENED AT LOGIN
HEALTH CHECK = SECURITY POSTURE
FREEZE = STOP LOGIN
DEACTIVATE = INACTIVE USER
```

---

# 99. Source Coverage

This module consolidates the following learning sources:

1. **Custom Profiles, Permission Sets, Permission Set Groups and Muting**
2. **Organization Security Controls**
3. **User Setup and Maintenance**
4. **Previous Topic — Record Sharing and Access**

The material is intentionally organized as a single learning path so that the learner can understand how **users → permissions → objects → records → fields → login/security controls** connect together.

---

# 100. Learning Order Recommended for the Website

For a learner seeing Configuration & Setup III for the first time, use this order:

```text
1. Understand the Security Model
          ↓
2. Learn Users
          ↓
3. Learn User Licenses
          ↓
4. Learn Profiles
          ↓
5. Learn Permission Sets
          ↓
6. Learn Permission Set Groups
          ↓
7. Learn Muting
          ↓
8. Learn Object vs Record vs Field Security
          ↓
9. Learn OWD
          ↓
10. Learn Role Hierarchy
          ↓
11. Learn Sharing Rules
          ↓
12. Learn Public Groups / Manual Sharing
          ↓
13. Learn Restriction & Scoping Rules
          ↓
14. Learn Login Security
          ↓
15. Learn Audit Trail / Login History
          ↓
16. Practice Scenario Questions
          ↓
17. Rapid Revision
```

## The goal

Do not memorize Salesforce as hundreds of disconnected features.

Understand this:

```text
WHO?
 ↓
USER

WHAT CAN THEY DO?
 ↓
PROFILE
 ↓
PERMISSION SET
 ↓
PERMISSION SET GROUP

WHICH OBJECT?
 ↓
OBJECT PERMISSIONS

WHICH RECORD?
 ↓
OWD
 ↓
ROLE
 ↓
SHARING

WHICH FIELD?
 ↓
FLS

CAN THEY LOGIN?
 ↓
PASSWORD
 ↓
MFA
 ↓
IP
 ↓
LOGIN HOURS
 ↓
SESSION
```

Once this structure is clear, most Configuration & Setup III scenario questions become a **classification problem** rather than a memorization problem.
