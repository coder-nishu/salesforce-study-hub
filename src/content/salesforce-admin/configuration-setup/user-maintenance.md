---
title: User Maintenance
summary: Resetting passwords, unlocking, freezing and deactivating users, delegated administration, Login As, and the difference between Business Hours and Login Hours.
tags:
  - configuration-setup
  - users
  - module-3
  - high-yield
---

> **Module 3 · Question 1 — Who is the user?** Part of [Configuration & Setup III](/salesforce-admin/configuration-setup/setup-iii-overview).

## User maintenance tasks

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
- Login as another user, where the administrator has the appropriate capability

## Reset password

An administrator can reset **one user's password**, or **passwords for multiple users** through administrative functions.

```flow
User Record
Reset Password
Password reset process
```

### Exam shortcut

> "User forgot their password."

Think: **Reset Password.**

## Failed login attempts

A user record can provide information about failed login attempts. This is useful for troubleshooting authentication problems.

### Scenario: Repeated incorrect passwords

**Situation:** A user says they cannot log in, and the administrator suspects repeated incorrect passwords.

**Recommended concept:** Investigate the **user record + Login History**.

**Why:** Both show login attempts, including failed ones.

## Unlock user account

A user account can become locked because of too many failed login attempts. An administrator can unlock the account.

```flow
Wrong password repeatedly
Account locked
!Administrator unlocks
```

## Freeze vs Deactivate

This is one of the most important exam comparisons.

| Freeze | Deactivate |
|---|---|
| Prevents the user from logging in | Makes the user inactive |
| Useful for temporary access blocking | Useful when the user should no longer be active |
| User record remains | User record remains |
| Can be reversed | Can be reactivated when appropriate |
| Does not by itself remove the assigned license | Deactivation frees the user license for reuse |

### Scenario: Under investigation

**Situation:** An employee is under investigation and access must be stopped immediately — but the account may need to be restored.

**Recommended concept:** **Freeze.**

**Why:** It stops login temporarily and can be reversed.

### Scenario: Leaving the organization

**Situation:** An employee leaves the organization and should no longer be an active Salesforce user.

**Recommended concept:** **Deactivate.**

**Why:** It makes the user inactive and frees the license for reuse.

### Memory trick

**FREEZE** = stop login temporarily · **DEACTIVATE** = make the user inactive

## Salesforce users cannot be deleted

This is a classic exam fact: **you cannot delete a Salesforce user.**

Instead, **freeze** or **deactivate** the user. The user record remains available for historical/reference purposes.

### Gotcha

If an answer option says "delete the user", it is wrong — the choice is **Freeze** (temporary) or **Deactivate** (no longer active).

## Delegated Administration

Delegated Administration allows selected users to perform limited administrative tasks **without** giving them full System Administrator access.

Examples from the source material:

- Managing users
- Assigning/removing permission sets
- Managing public groups
- Managing specified custom objects

### Scenario: A regional administrator

**Situation:** A regional administrator should manage certain users and groups, but should not receive full System Administrator access.

**Recommended concept:** **Delegated Administration.**

**Why:** It grants limited admin responsibility for specific tasks.

### Memory trick

**Delegated Admin = limited admin responsibility.**

## Login as another user

Where the administrator has the required capability, **Login As** can help reproduce a user's experience.

### Scenario: "I can't see the Sales Reports tab"

**Situation:** A user says, "I cannot see the Sales Reports tab."

**Think about:** Instead of guessing which setting is wrong, see exactly what the user sees.

**Recommended concept:** **Login as the user** → experience the user's access → identify the configuration/permission issue.

## Business Hours vs Login Hours

Do not confuse user settings with **Business Hours**.

**Business Hours** define when an organization/team is considered available for supported Salesforce processes. The source material notes that multiple Business Hours definitions can exist, with one used as the default.

```text
Business Hours
Monday–Friday
9 AM–5 PM
```

A Case can use the appropriate business-hours definition to determine support availability.

| If the question is about… | Think |
|---|---|
| Support availability, case calculations, business operation hours | **Business Hours** |
| When a profile's users can log in | **Login Hours** (see [Organization Security Controls](/salesforce-admin/configuration-setup/organization-security)) |

## Before exam

- Forgot password → **Reset Password**. Locked out → **Unlock**.
- Failed logins → **user record + Login History**.
- **Users cannot be deleted** — Freeze (temporary) or Deactivate (inactive, frees the license).
- Limited admin rights → **Delegated Administration**.
- Reproduce what a user sees → **Login As**.
- **Business Hours** = when the business/support process is open; **Login Hours** = when users may log in.
- Next: [Profiles & Object Permissions](/salesforce-admin/configuration-setup/profiles-and-object-permissions).
