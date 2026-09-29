---
title: Salesforce Administrator — Introduction
summary: Understand what Salesforce is, what an Administrator does, and how to approach the Salesforce Admin learning journey.
tags:
  - introduction
  - admin
  - fundamentals
---

## What is Salesforce?

Salesforce is a cloud-based **customer relationship management (CRM)** platform. It gives a company one shared place to store customer data — accounts, contacts, leads, opportunities, cases — and to run the business processes built around that data.

Everything runs in the browser. Each company works in its own Salesforce environment, called an **org**. An org comes with standard objects out of the box, and it can be extended with custom objects, fields, automation, and apps so that it matches how the business actually works.

```flow
Customer data :: Accounts, contacts, leads, cases
Business processes :: Sales, service, marketing
!Salesforce org :: One shared, configurable platform
> Salesforce brings a company's customer data and processes into one place.
```

## What is a Salesforce Administrator?

A Salesforce Administrator owns the day-to-day health and configuration of the org. Admins translate business requirements into Salesforce configuration — mostly with **point-and-click (declarative) tools in Setup**, rather than code.

In practice, an Administrator:

- Listens to what the business needs and decides how Salesforce should support it
- Configures the org so users can do their jobs efficiently
- Keeps data secure, accurate, and accessible to the right people
- Automates repetitive work so users don't have to do it by hand
- Gives teams the reports and dashboards they need to make decisions

### Memory trick

**Admin = declarative first.** When you meet a requirement, first ask: *which built-in, point-and-click feature solves this?*

## What does an Administrator manage?

| Area | What the Admin manages | Example |
|---|---|---|
| **Users** | User accounts, licenses, login access | Create a user for a new sales rep |
| **Configuration** | Company-wide settings in Setup | Set the company's business hours |
| **Objects and fields** | The data model — what is stored and how | Add a custom field to Account |
| **Security and access** | Who can see and edit which records and fields | Give managers access to their team's records |
| **Data** | Importing, cleaning, and maintaining records | Import a list of leads from a spreadsheet |
| **Automation** | Processes that run without manual effort | Update related records when a record changes |
| **Reports and dashboards** | How teams see and measure their data | Build a dashboard of open opportunities |

## Salesforce Admin Learning Map

The course is organized into domains. Each domain groups related subtopics, and each subtopic is a focused study page.

| # | Domain | Focus |
|---|---|---|
| 01 | [Configuration & Setup](/salesforce-admin/configuration-setup) | Organization settings, users, licenses |
| 02 | [Object Manager](/salesforce-admin/object-manager) | Objects, fields, record types, layouts, formulas |
| 03 | [Security](/salesforce-admin/security) | Profiles, permission sets, roles, sharing |
| 04 | [Data Management](/salesforce-admin/data-management) | Importing, exporting, and maintaining data |
| 05 | [Automation](/salesforce-admin/automation) | Flow Builder, validation rules, approvals |
| 06 | [Agentforce](/salesforce-admin/agentforce) | Core concepts and configuration of Agentforce |
| 07 | [Sales](/salesforce-admin/sales) | Sales processes in Salesforce |
| 08 | [Service](/salesforce-admin/service) | Service processes in Salesforce |
| 09 | [Reports & Dashboards](/salesforce-admin/reports-dashboards) | Reporting and analytics |
| 10 | [Marketing](/salesforce-admin/marketing) | Marketing features in Salesforce |

## How to Study This Website

Every study page follows the same learning path. Work through it in order — each step builds on the one before.

```sequence
Understand :: The concept
Examples :: See it applied
Tables :: Compare options
Shortcuts :: Memorize the rules
Gotchas :: Avoid the traps
!Before exam :: Final revision
```

1. **Understand the concept first.** Read the explanation until you can describe it in your own words.
2. **Study the examples and scenarios.** They show *when* a feature is the right answer.
3. **Review the comparison tables.** Many exam questions are really "which option fits?" questions.
4. **Memorize the exam shortcuts.** Short rules help you eliminate wrong answers quickly.
5. **Review the gotchas.** These are the details that commonly trip people up.
6. **Finish with the Before Exam section.** It is the page's condensed revision.

The special boxes on each page look like this:

### Exam shortcut

Quick rules that point you to the right answer — e.g. *"record change → record-triggered flow"*.

### Gotcha

Details that are easy to get wrong. Read these twice.

### Scenario: How scenarios work

**Situation:** A realistic business requirement is described.

**Think about:** What the requirement is really asking for.

**Recommended concept:** The Salesforce feature that fits.

**Why:** The reasoning that connects the two.

## Before exam

- **Declarative first** — prefer point-and-click configuration over code.
- **Know the domains** — Configuration & Setup, Object Manager, Security, Data Management, Automation, Agentforce, Sales, Service, Reports & Dashboards, Marketing.
- **Security questions** — always ask *who* needs access to *what* (objects, fields, or records).
- **Automation questions** — identify *what starts* the process and *whether a user is involved*.
- **Data questions** — identify *how much* data and *which operation* (import, update, delete).
- **Read every scenario carefully** — the requirement's wording usually points to one specific feature.
