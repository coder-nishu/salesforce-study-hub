---
title: Revision & Exam Keywords
summary: Everything in Configuration & Setup III condensed — master comparison table, common confusions, exam keyword dictionary, golden rules, rapid-fire questions and a 15-minute before-exam revision.
tags:
  - configuration-setup
  - revision
  - module-3
  - high-yield
---

> **Module 3 · Revision.** Part of [Configuration & Setup III](/salesforce-admin/configuration-setup/setup-iii-overview). Read the pages first; use this one to revise.

## Master comparison table

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
| Session-Based Permission Set | When should a permission exist only for an active session? |
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
| Deactivate | Make the user inactive |

## Common exam confusions

| Confusion | Remember |
|---|---|
| **Profile vs Role** | Profile = **what** · Role = **whose records** |
| **Permission Set vs Sharing Rule** | Permission Set = object/system/field/app permission · Sharing Rule = record access |
| **OWD vs Profile** | Profile = object-level baseline permission · OWD = record-level baseline access |
| **Sharing Rule vs Restriction Rule** | Sharing = **open** · Restriction = **limit** |
| **Locale vs Language** | Language = interface language · Locale = formatting |
| **Freeze vs Deactivate** | Freeze = stop login · Deactivate = make inactive |
| **Login Hours vs Business Hours** | Login Hours = when a user may log in · Business Hours = when the business/support process is considered open |
| **Login History vs Setup Audit Trail** | Login History = user login activity · Setup Audit Trail = configuration changes |
| **View All vs Modify All** | View All = see all records · Modify All = broad control over all records |

## Exam shortcuts

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
| "cannot delete user" | Deactivate / Freeze |
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

## Golden rules

1. **Profile** gives the baseline; **Permission Sets** extend it.
2. **Permission Set Groups** bundle Permission Sets.
3. **Muting** removes selected permissions from a Permission Set Group.
4. **Object permission** and **record sharing** are different layers.
5. **OWD** is the baseline for record access.
6. **Role Hierarchy** can open record access upward.
7. **Sharing Rules** generally open record access.
8. **Restriction Rules** limit/filter record access.
9. **Field-Level Security** controls field visibility/access.
10. **Login Hours** control **when** users can log in.
11. **IP Restrictions** control **where** users can log in.
12. **MFA** adds another authentication factor.
13. **Setup Audit Trail** tracks setup/configuration changes.
14. **Login History** helps investigate login activity.
15. **Salesforce users cannot be deleted** — freeze or deactivate instead.

## Rapid fire

Say the answer before reading the right-hand column.

| Question | Answer |
|---|---|
| Every user must have what? | Profile |
| Username uniqueness? | Globally unique |
| Base type of Salesforce access? | User License |
| Extra feature? | Feature License |
| Base permissions? | Profile |
| Extra permissions? | Permission Set |
| Bundle permission sets? | Permission Set Group |
| Remove a permission inside a PSG? | Muting |
| Temporary permission? | Expiration |
| Permission only during a session? | Session-Based Permission Set |
| Can Salesforce users be deleted? | No |
| Temporarily stop login? | Freeze |
| Make a user inactive? | Deactivate |
| Object access? | Profile / Permission Set |
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

## Final memory map

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

## Memory tricks

One-line master cheat sheet:

```text
USER = WHO                       OWD = RECORD BASELINE
LICENSE = TYPE OF ACCESS         ROLE = HIERARCHY
PROFILE = BASE                   SHARING = OPEN RECORD ACCESS
PERMISSION SET = EXTRA           MANUAL SHARING = ONE RECORD
PSG = BUNDLE                     PUBLIC GROUP = GROUP USERS
MUTING = REMOVE FROM BUNDLE      RESTRICTION = LIMIT RECORDS
                                 SCOPING = FILTER DEFAULT RECORDS
FLS = FIELD
LOGIN HOURS = WHEN               AUDIT TRAIL = WHO CHANGED SETUP
IP = WHERE                       LOGIN HISTORY = WHAT HAPPENED AT LOGIN
MFA = EXTRA IDENTITY             HEALTH CHECK = SECURITY POSTURE
DEVICE ACTIVATION = VERIFY DEVICE
FREEZE = STOP LOGIN              DEACTIVATE = INACTIVE USER
```

## Before exam

**Users** — Username = globally unique · User License = base access type · Feature License = additional feature · Profile = required baseline access · Users cannot be deleted · Freeze = block login · Deactivate = inactive user.

**Permissions** — Profile = base · Permission Set = extra · Permission Set Group = bundle · Muting = remove selected permission from the PSG · Expiration = temporary access · Session-based = session-only access · Access Granted By = find the permission source.

**Data security** — Object = Profile / Permission Set · Record = OWD / Role / Sharing · Field = FLS.

**Record sharing** — OWD = baseline · Role = hierarchy · Sharing = open · Manual Sharing = one record · Public Group = group of users · Restriction = limit · Scoping = filter/default presentation.

**Login security** — WHEN = Login Hours · WHERE = IP Restrictions · TRUSTED = Trusted IP · WHO ARE YOU = MFA / Device Activation · SESSION = Session Settings.

**Troubleshooting** — Login problem = Login History · Configuration change = Setup Audit Trail · Security posture = Security Health Check · Permission source = Access Granted By.
