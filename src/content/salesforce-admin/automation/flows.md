---
title: Flow Builder
summary: Learn how Salesforce Flow automates business processes — flow types, building blocks, execution context, error handling, and transaction control.
tags:
  - automation
  - flow
  - high-yield
---

> **Exam objective:** Describe capabilities, use cases, and configuration for Flow — screen flows, record-triggered flows, autolaunched flows, and order of execution.

## What is Flow Builder?

**Flow Builder** is a robust **declarative automation tool** used to create automation solutions — called **flows** — for processes in a Salesforce org.

Through an intuitive visual interface, and **without using Apex code**, a flow can:

- **Receive user input**
- **Execute logic**
- **Interact with Salesforce data**
- **Display output**

Flows can handle more complex business processes, and they appear in many forms — a screen flow that captures user input, an autolaunched flow invoked automatically from a record change, a scheduled flow that runs at certain times, and more.

### Who works with flows

| User type | What they typically do |
|---|---|
| **Administrators** | Deploy flows using a custom button or link, custom action, standard Lightning component, or Utility Item · Use processes to start flows · Use **Debug logs** to see real-time details of what a flow does · Use the **flow fault email** to troubleshoot |
| **Developers** | Deploy flows by creating **Lightning pages** or **Visualforce pages** |
| **Users** | Run flows — provided they have the **Run Flows** permission |

### Gotcha

Building and running flows need **different permissions**:

| To… | Permission |
|---|---|
| **Build** flows (access Flow Builder) | `Manage Force.com Flow` |
| **Run** flows | `Run Flows` |

Build ≠ Run. These two are classic distractors.

## Why do we use Flow?

Flow Builder's capabilities are easiest to remember grouped by what they do.

| Theme | Capabilities |
|---|---|
| **Start automatically** | **Record Change** — run when a record is created, updated, or deleted · **Run on Schedule** — daily or weekly tasks · **Subscribe to Event** — run when a platform event message is received |
| **Work with data** | **Access Records** — query, create, update, delete · **Select Return Fields** — return all fields or only specified fields from Get Records · **Access External Data** — look up, create, or update data in an external system · **Access Prior Values** — `$Record__Prior` · **Handle Complex Data** — Apex-defined variables for complex data returned from web service calls |
| **Logic and control** | **Decide Conditionally** · **Direct Actions** — branch based on logical conditions · **Pause Operation** — pause for a certain time period · **Perform Loops** — loop through variable or record collections · **Sort Trigger Order** |
| **Values** | **Use Variables** — create and assign variables used throughout the flow · **Use Output Values** — variables are created automatically to store outputs from Get Records, screen components, etc. · **Build Formulas** — calculate values |
| **User interface** | **Build Entry Forms** — text input, picklists, radio buttons, other field types · **Build Multiple Screens** — a wizard with logic branches based on user input · **Upload Files** — single or multiple files of different formats |
| **Actions and reuse** | **Perform Actions** — quick actions, email alerts, submit approval requests · **Route Work Items** — attribute-based routing · **Use Flow Templates** — create them, or download from AppExchange |
| **Building and troubleshooting** | **Save the Progress** — save without fully configuring the Start element (record-triggered flows) or Create Records elements (all flows) · **Flow Tips** — identify inefficient designs and optimize performance · **Troubleshoot Flow Efficiently** — errors and warnings grouped by element, with links to the error source on the canvas |

## The Big Picture

Every flow follows the same shape: something starts it, it works with data and logic, and it does something.

```flow
User | Record change | Schedule | Platform event
!Flow starts :: The Start element
Logic & data :: Resources, elements, connectors
Action :: Create, update, notify, display…
Result
```

And every flow is fundamentally one of **two main types**:

| | Screen-based | Autolaunched |
|---|---|---|
| **Does a user see it?** | Yes — it uses a **Screen** element | No — runs in the background |
| **What starts it?** | Button, link, page, and more | Record change, process, Apex, platform event, schedule, etc. |
| **Typical use** | Wizards, guided data entry, capturing or displaying information | Automatic record updates and creation, scheduled work |

Everything else in this chapter is detail hanging off those two ideas.

## Main Flow Types

When you create a flow, you first choose one of **four categories**, then a flow type within it.

| Category | Description |
|---|---|
| **Triggered** | Launched by records and events. Runs without user interaction. |
| **Autolaunched** | Launches when invoked by APIs, templates, processes, conditions, or something else. |
| **Scheduled** | Time-based; launches at a specific time or frequency. Runs without user interaction. |
| **Screen** | Interface-driven; guides users through business processes and collects or displays information. |

The frequently used flow types compare like this:

| Flow type | User interaction? | Typical trigger | Runs in background? |
|---|---|---|---|
| **Screen Flow** | Yes | Launched from Lightning pages, Experience Cloud sites, quick actions, and more | No |
| **Record-Triggered Flow** | No | A record is created, updated, or deleted | Yes |
| **Schedule-Triggered Flow** | No | A specified time and frequency, for each record in a batch | Yes |
| **Platform Event-Triggered Flow** | No | A platform event message is received | Yes |
| **Autolaunched Flow (No Trigger)** | No | Invoked by Apex, processes, REST API, and more | Yes |

### Exam shortcut

| If the requirement says… | Think… |
|---|---|
| A **user** must enter or see information | **Screen Flow** |
| When a record is **created, updated, or deleted** | **Record-Triggered Flow** |
| Every day / every week / at a set time | **Schedule-Triggered Flow** |
| When an **event message** is received | **Platform Event-Triggered Flow** |
| Called from **Apex, REST API, or a process** | **Autolaunched Flow (No Trigger)** |

## Screen Flow

A **screen flow** is a flow that uses the **Screen** element to capture or display information. It is the only main type that involves the user directly.

**When to use it:** whenever a person needs to be guided through a process — entering data in a form, stepping through a multi-screen wizard with branches based on their answers, or uploading files.

**Typical launch methods:**

- Lightning pages, Experience Cloud sites, and quick actions
- A custom button or link, custom action, standard Lightning component, or Utility Item (how Administrators typically deploy flows)
- Lightning pages or Visualforce pages (how Developers typically deploy flows)

### The Screen element

The **Screen** element is used to implement custom functionality that **requires user input**.

| Aspect | Detail |
|---|---|
| **Screen display** | Displays a screen to the user running the flow — to **display information to** or **collect information from** the user |
| **Component types** | Standard **input** components, standard **display** components, and **custom** components |
| **Field types** | Address, Checkbox, Currency, Date, Text, URL, Display Image, File Upload, and more |

Other screen automation types exist too: Embedded Appointment Management Flow, Individual-Object Linking Flow, User Provisioning Flow, Contact Request Flow, Field Service Mobile Flow, and Data Capture Flow.

### Scenario: Guiding agents through case creation

**Situation:** A support team wants agents to be walked step by step through creating a case, with fewer data-entry mistakes.

**Think about:** A user is involved, and they need to be guided through a process.

**Recommended concept:** A **screen flow** — Salesforce even ships a prebuilt **Create a Case** screen flow for this.

**Why:** Screen flows are interface-driven and guide users through business processes. Salesforce's prebuilt agent screen flows are **Create a Case** (helps eliminate user errors), **Reset Password**, and **Verify Identity**. They appear in **Setup → Flows** with Package State *Managed-Installed* and Template ✓.

## Autolaunched Flow

An **autolaunched flow** runs **in the background** while performing its actions — no screens, no user interaction.

It can be triggered from a record change, process, Apex, platform event, schedule, and more. That is why record-triggered and schedule-triggered flows are described as autolaunched flows that run in the background.

The flow type called **Autolaunched Flow (No Trigger)** has no trigger of its own. It launches when it is **invoked** — by Apex, processes, REST API, templates, conditions, and more.

## Record-Triggered Flow

A **record-triggered flow** launches when a record is:

- **Created**
- **Updated**
- **Deleted**

It is autolaunched and runs in the background.

**Criteria.** A record criteria can be defined so the flow runs conditionally. For **create or update** triggers, you choose whether the flow runs:

1. **Every time** the record matches the criteria, or
2. **Only once**, when the record is **updated to meet** the criteria.

Decision outcomes inside record-triggered flows offer the same two options: run when the condition requirements are met, or only if the triggering record was **updated to meet** them.

**Before and after save.** The prebuilt **Triggered Flows** list view shows each flow's triggering object or platform event and its trigger type — for example *Record—Run Before Save*, *Record—Run After Save*, *Record—Run Before Delete*, and *Platform Event* — so you don't have to open each flow to find out what starts it.

An example Start element configuration:

```
Start — Record-Triggered Flow
  Object:        Account
  Trigger:       A record is updated
  Optimize for:  Actions and Related Records
  + Add Scheduled Paths (Optional)
```

## Schedule-Triggered Flow

A **schedule-triggered flow** launches at a **specified time and frequency**, **for each record in a batch**. It runs in the background without user interaction.

Use it to automate time-based work such as **daily or weekly tasks** — for example, a *Birthday Reminder* scheduled flow.

## Platform Event-Triggered Flow

A flow can **subscribe to a platform event** and run automatically **when an event message is received**.

This is event-driven automation: instead of reacting to a record change or a clock, the flow reacts to an event message. These flows belong to the **Triggered** category (launched by records and events, without user interaction), and in the Triggered Flows list view their trigger type shows as **Platform Event**, with the platform event as the triggering object.

## Flow Builder Building Blocks

A flow is built from a combination of three tools, plus a start point and error handling.

```flow
Resources | Elements | Connectors
!Flow
> Resources hold the data, elements do the work, connectors set the order.
```

| Block | What it is |
|---|---|
| **Resources** | Containers for holding data values — input from the user, data queried from Salesforce, a global constant, a calculated field, etc. |
| **Elements** | Define the **behavior** of the flow — the actions taken at each step (Screen, Create Records, Get Records, Apex Action…) |
| **Connectors** | The paths between elements that represent the **order of execution** |
| **Start element** | Marks the beginning of a flow — added **automatically** when a new flow is created |
| **Fault path** | Error handling — added to elements that can fail |

**Defining an element.** When you add an element to the canvas, a configuration window appears automatically. **Every element needs a Label and an API Name.**

### Variables, formulas, and loops

- **Variables** — create and assign variables that can be used throughout the flow. Output variables are also created **automatically** to store values from a Get Records element, a screen component, and so on.
- **Formulas** — calculate values. In screen flows, formulas can even recalculate live on the screen (see [Reactive Screen Components](#reactive-screen-components)).
- **Loops** — loop through variable or record collections.
- **Apex-defined variables** — manipulate complex data objects returned from calls to web services.

## Important Elements

| Element | Purpose |
|---|---|
| **Screen** | Display information to, or collect information from, the user (screen flows) |
| **Action** | Perform an action outside of the flow — e.g. quick actions, email alerts, submit approval requests, Apex actions |
| **Subflow** | Launch another flow that's available in your org |
| **Assignment** | Set variable values |
| **Decision** | Create paths for the flow to take based on conditions |
| **Loop** | Loop through a variable or record collection |
| **Get Records** | Query records — returning all fields or only the fields you specify |
| **Create Records** | Create records |
| **Update Records** | Update records |
| **Delete Records** | Delete records |
| **Roll Back Records** | Cancel all pending record changes in the current transaction (screen flows) |

In the Toolbox, elements are grouped like this:

| Group | Elements |
|---|---|
| **Interaction (3)** | Screen, Action, Subflow |
| **Logic (5)** | Assignment, Decision, Loop, Collection Sort, Collection Filter |
| **Data (5)** | Create Records, Update Records, Get Records, Delete Records, Roll Back Records |

A typical record-triggered flow chains a few of these together:

```flow
Start :: Record-triggered — Account updated
Get Records :: Get Related Contract
Assignment :: Set Contract Fields
Update Records :: Update Contract
```

## The Flow Builder Interface

| Region | Purpose |
|---|---|
| **Toolbox pane** | Holds the elements and resources used to build the flow |
| **Canvas** | Where elements are added and joined together with connectors |
| **Button bar** | Run, Debug, Activate/Deactivate, Save, and other options |
| **Start element** | Every flow always begins here |

The Toolbox has two tabs:

- **Elements tab** — the element types the flow can execute. *This pane is removed when the flow uses Auto-Layout.*
- **Manager tab** — lists all **resources** (variables, record variables, and so on) and all **elements** added to the flow, and lets you edit them.

**Creating a flow:** Setup → Process Automation → **Flows** → **New Flow**. Select a **category**, then a **flow type** — or use search, or let Einstein build an automation. Instead of choosing a type, you can also start from a **template**: standard Salesforce templates exist (for example *Approvals Workflow: Evaluate Approval Requests*, *Approve a Deal*, *Cancel Item Flow*), and custom templates can be created.

### Save options

| Option | Effect |
|---|---|
| **Save** | Save progress so changes aren't lost |
| **Save As New Version** | Create a new version of the current flow |
| **Save As New Flow** | Clone the flow as a separate new flow |
| **Save as Template** | Save it as a template for creating flows with predefined custom configurations |

## Auto-Layout vs Freeform

Flow Builder has two canvas layouts. A dropdown lets you switch between them.

| | Auto-Layout | Freeform |
|---|---|---|
| **Default?** | ✅ Yes | No |
| **Adding elements** | Click the **(+)** buttons along the flow paths | **Drag and drop** from the Elements tab |
| **Alignment and spacing** | Automatic — elements are aligned, spaced, and fixed | Manual — full control over positioning |
| **Toolbox** | Hidden by default (toggle to show); no Elements pane | Elements tab available in the Toolbox |

Features only available in **Auto-Layout**:

- The Toolbox is hidden by default and can be shown or hidden with a toggle
- When adding an element, a **search box** finds it by name (e.g. type *MyInvocableMethod* instead of hunting for *Action*)
- Clicking an element offers **Copy Element, Cut Element, Delete Element,** and **Add Fault Path**

### Gotcha

The layout type **only** affects how elements are added, aligned, and connected on the canvas. It has **no impact on flow behavior**. Switching from Freeform to Auto-Layout does not change what the flow does.

## Flow Execution Context

The execution context decides **whose access rules** the flow respects when it reads and changes data. It is configured **when you save the flow** — in the Save dialog, under the advanced options, as **"How to Run the Flow"**.

```flow
User or System Context :: Depends on how the flow is launched | System Context with Sharing :: Enforces record-level access | System Context Without Sharing :: Access all data
```

| Option (as shown in the Save dialog) | Object & field-level security | Record-level access (sharing) |
|---|---|---|
| **User or System Context** — *Depends on How Flow is Launched* | Depends on how the flow is launched | Depends on how the flow is launched |
| **System Context with Sharing** — *Enforces Record-Level Access* | **Ignored** | **Enforced** |
| **System Context Without Sharing** — *Access All Data* | **Ignored** | **Ignored** |

**System Context Without Sharing** ignores everything With Sharing ignores, **and also** ignores:

- Org-wide defaults
- Role hierarchies
- Sharing rules
- Manual sharing
- Teams
- Territories

### Memory trick

- **With Sharing** = *"I can see all **fields**, but only **your** records."*
- **Without Sharing** = *"I can see **everything**."*
- **User or System** = *"It depends how I was **launched**."*

## $Record__Prior

In a **record-triggered flow**, the **`$Record__Prior`** global variable gives access to the record's **prior values** — what the fields held **before** the change that triggered the flow.

```
Before update:   Status = "New"
After update:    Status = "Closed"

Current record:         Status = "Closed"
$Record__Prior.Status   →  "New"
```

Comparing `$Record__Prior` with the current record lets a flow react to *what changed*, not just what the record looks like now.

### Memory trick

`$Record__Prior` is the flow equivalent of Apex's `Trigger.old` — the **old** values.

## Trigger Order

When several **record-triggered flows** exist for the **same object** and the **same trigger event type**, **Trigger Order** controls which one runs first. You set it with the **Trigger Order** value in the flow's **advanced properties**.

```
Account — "A record is updated"

  Flow A   →  Trigger Order 1   runs first
  Flow B   →  Trigger Order 2   runs second
  Flow C   →  Trigger Order 3   runs third
```

### Gotcha

Trigger Order only orders flows that share **both** the same object **and** the same trigger event type. It is set in the flow's **advanced properties**, not on the object.

## Flow Creation Sequence

Flows are built in five steps, in this order:

```sequence
Resources :: Define the resources
Elements :: Define and add elements
Connect :: Connect the elements
Test :: Test the flow
!Activate :: Activate the flow
```

### Memory trick

**Resources → Elements → Connect → Test → Activate.** Test comes **before** Activate — expect an ordering question.

## Error Handling

Flow offers three **distinct** error-handling mechanisms. Don't mix them up.

### Fault Path

A **fault path** is an error branch added to an element that can fail. It keeps a flow robust against unexpected validation errors, "record not found" errors, and so on — and lets the system relay meaningful error messages to end users and debug issues more efficiently.

In **Auto-Layout**, you add one by clicking an element and choosing **Add Fault Path**.

```
Start (Record-Triggered · Account · A record is updated)
  └─► Update Records: Update Eligible Contacts
        └─(fault)─► Apex Action: Handle Error
                      └─► Email Alert: Notify Account Owner
```

### Custom Error Message

The **Custom Error Message** element lets record-triggered flows show **targeted** error messages that explain what went wrong or how to fix it — instead of a system-generated message that is hard to understand.

- Displays **in a window on the record page** or **as an inline error on a specific field**
- Message limit: **255 characters**
- Works in both **before-save and after-save** flows
- The associated record change is **rolled back**

Example message: *"Please check for the existing property with the same unique Area-ID and add it instead."*

### Roll Back Records

**Screen flows** provide a **Roll Back Records** element that **cancels all pending record changes in the current transaction**.

- Add it wherever needed — for example in the outcome of a **Decision** element, or at the **end of a transaction**
- Example: perform a rollback whenever an Update Records operation encounters an error
- A **screen** in a screen flow can represent the **starting point of a new transaction** or the **ending point of the current one**

### Comparison

| Mechanism | Where used | Purpose |
|---|---|---|
| **Fault path** | Any flow, on elements that can fail | Routes execution down an error branch |
| **Custom Error Message** | Record-triggered flows (before- and after-save) | Shows a targeted message to the user **and rolls back** the record change |
| **Roll Back Records** | Screen flows | Cancels all pending record changes in the current transaction |

### Scenario: A clear message instead of a system error

**Situation:** When a user saves a property record that duplicates an existing Area-ID, a record-triggered flow blocks it — but users only see a confusing system error.

**Think about:** The flow is record-triggered, and the user needs to understand what to fix.

**Recommended concept:** The **Custom Error Message** element.

**Why:** It shows a targeted message (up to 255 characters) in a window on the record page or inline on a field, and it rolls back the record change.

## Reactive Screen Components

Screen flows support **real-time recalculation within the same screen** — the user doesn't need to click Next to see updated values. Three forms are supported:

| Type | Example |
|---|---|
| **Reactive global variables** | *Final Amount* is a formula referencing *Enter Amount* and a global variable holding a 25% discount rate |
| **Reactive selections** | A dynamic text component reflects the row chosen in a **Data Table** — selecting an opportunity instantly fills "Selected Opportunity" with its Name and Stage |
| **Formula functions** | `SUBSTITUTE`, `ADDMONTHS`, and `*` evaluate live on the same screen — e.g. SUBSTITUTE replacing "There" with "First Lady" in the output field as the user types |

```
Your Discount % is 25.00

Enter Amount:   1,000
Final Amount:     750    ← updates instantly, same screen
```

## Transaction Control

**The problem:** performing a **DML operation and a callout in the same transaction** causes an error because of **uncommitted work**.

```flow
DML operation :: e.g. Update Records
Callout :: Apex action calling an external system
!Uncommitted work error
```

**The fix:** on the **Apex action**, set **Transaction Control** (under the action's advanced settings) so the callout can run in a **different transaction**. There are three options:

| Option | Behavior | Risk |
|---|---|---|
| **Let the flow decide** *(recommended)* | At run time, the flow decides whether a new transaction is needed. If the action involves a callout and the current transaction has pending operations, the current transaction is **committed first**, then the action runs in a new transaction. | — |
| **Always start a new transaction** | The current transaction is committed, then the action runs in a new transaction. | If the action fails, Salesforce **can't roll back** operations from the previous transaction. |
| **Always continue in current transaction** | The action always runs in the current transaction. | If it involves a callout while operations are pending, **the flow fails**. |

### Gotcha

If you choose **"Let the flow decide"**, the **invocable method** must have the attribute **`callout = true`** added to it.

### Scenario: A screen flow that saves, then calls out

**Situation:** A screen flow updates a record and then calls an Apex action that makes a callout. It fails with an uncommitted-work error.

**Think about:** DML and a callout are happening in the same transaction.

**Recommended concept:** Set the Apex action's **Transaction Control** to **Let the flow decide (recommended)**, and make sure the invocable method has `callout = true`.

**Why:** The flow commits the pending work first, then runs the callout in a new transaction.

## Exam shortcuts

| If the question mentions… | The answer is usually… |
|---|---|
| User must enter or see data | **Screen Flow** |
| Record created / updated / deleted | **Record-Triggered Flow** |
| Daily, weekly, at a set time | **Schedule-Triggered Flow** |
| Platform event message | **Platform Event-Triggered Flow** |
| Invoked by Apex, REST API, a process | **Autolaunched Flow (No Trigger)** |
| Permission to **build** flows | `Manage Force.com Flow` |
| Permission to **run** flows | `Run Flows` |
| The record's values **before** the change | `$Record__Prior` |
| Which same-object flow runs first | **Trigger Order** (advanced properties) |
| Ignore field security, keep sharing | **System Context with Sharing** |
| Access all data | **System Context Without Sharing** |
| Friendly error + roll back, record-triggered | **Custom Error Message** |
| Cancel pending changes in a screen flow | **Roll Back Records** |
| DML + callout error | **Transaction Control** → *Let the flow decide* |
| Update values without clicking Next | **Reactive components** |

## Memory tricks

- **Two main types:** *Screen = someone is watching. Autolaunched = no one is watching.*
- **Three building blocks:** *Resources hold, Elements do, Connectors order.*
- **Five creation steps:** *Resources → Elements → Connect → Test → Activate.*
- **Three error tools:** *Fault path **reroutes**, Custom Error Message **explains**, Roll Back Records **undoes**.*
- **Sharing:** *With Sharing sees all fields but only your records; Without Sharing sees everything.*
- **Layout:** *Auto-Layout and Freeform change the **look**, never the **logic**.*

## Before exam

- Flow Builder is a **declarative** automation tool — no Apex required.
- **Build** = `Manage Force.com Flow` · **Run** = `Run Flows`.
- Two main types: **screen-based** (Screen element, user involved) and **autolaunched** (background).
- Record-triggered: **created / updated / deleted**; run **every time** criteria match, or **only once** when updated to meet them.
- **`$Record__Prior`** = values before the change (like `Trigger.old`).
- **Trigger Order** = same object **+** same trigger event type, set in advanced properties.
- Every element needs a **Label** and an **API Name**.
- **Auto-Layout** is the default; layout never changes behavior.
- Execution context is set **when saving**, under *How to Run the Flow*.

| Context | Object & field security | Sharing |
|---|---|---|
| With Sharing | Ignored | Enforced |
| Without Sharing | Ignored | Ignored |
| User or System | Depends on launch | Depends on launch |

| Error tool | Flow type | Remember |
|---|---|---|
| Fault path | Any | Error branch |
| Custom Error Message | Record-triggered | 255 chars · rolls back |
| Roll Back Records | Screen | Cancels pending changes |

- DML + callout → **Transaction Control**; *Let the flow decide* needs **`callout = true`** on the invocable method.
