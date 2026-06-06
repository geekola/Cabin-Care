# Cabin Care Checklist Platform

## Overview

Build a SaaS platform for property inspections and maintenance coordination. Property owners purchase inspection checklists, schedule visits, receive reports, review repair estimates, and approve work. Staff complete inspections onsite using a mobile-friendly interface.

Target customers:

* Non-local property owners
* STR, MTR, and long-term rental owners
* Vacation cabin owners
* Property managers
* Compliance and licensing inspections

---

## Tech Stack

### Frontend

* React (Vite)
* Material UI
* React Query
* React Hook Form
* Zod
* tRPC client

### Backend

* Node.js
* Express
* PostgreSQL (hosted on Railway)
* Prisma ORM
* tRPC

### Hosting

* Frontend: Vercel
* Backend + Database: Railway

### Storage

* Cloudflare R2 (S3-compatible, no egress fees)

### Payments

* Stripe

### Authentication

* Clerk (handles sessions, refresh tokens, email verification, roles)

### Email

* Resend

---

## Core Modules

### Customer Portal

* Register/login
* Manage properties
* Purchase checklists
* Schedule inspections
* View reports
* Approve/decline repairs
* View invoices and history

### Checklist Library

Templates:

* Pre-Guest Arrival
* Safety Compliance
* Seasonal Cabin
* Inventory
* Move-Out Inspection
* General Maintenance

Each checklist contains configurable checklist items.

### Staff Dashboard

* Assigned jobs
* Mobile-friendly interface
* Pass/fail, text, numeric inputs
* Photo uploads
* Repair recommendations
* Time tracking
* Job completion workflow

### Admin Dashboard

* Customers
* Properties
* Staff
* Checklists
* Pricing
* Service regions
* Reporting and analytics

---

## Customer Workflow

1. Select checklist(s)
2. Enter property details
3. Choose preferred date and backup date
4. Pay online
5. Order created
6. Job assigned
7. Staff completes inspection
8. Report generated
9. Repair estimates generated
10. Customer approves or declines repairs
11. Approved repairs become work orders

---

## Staff Workflow

1. Login
2. View assigned jobs
3. Open checklist
4. Complete inspection items
5. Upload photos
6. Add repair recommendations
7. Submit inspection
8. Job marked complete

---

## Database

### Users

* id
* clerk_id (Clerk user ID, used for auth lookups)
* name
* email
* phone
* role
* status

Roles:

* customer
* staff
* admin
* repair_tech

### Properties

* id
* owner_id
* property_name
* address
* access_instructions
* lockbox_code
* notes

### Checklists

* id
* name
* category
* description
* base_price
* estimated_minutes

### Checklist_Items

* id
* checklist_id
* section_name
* item_text
* item_type
* required
* sort_order

Types:

* pass_fail
* yes_no
* number
* text
* photo

### Orders

* id
* customer_id
* property_id
* total_price
* payment_status
* status
* scheduled_date
* backup_date

### Order_Checklists

* id
* order_id
* checklist_id
* price

### Jobs

* id
* order_id
* assigned_staff_id
* status
* started_at
* completed_at

### Job_Results

* id
* job_id
* checklist_item_id
* result_value
* notes

### Job_Photos

* id
* job_result_id
* photo_url

### Repair_Items

* id
* job_id
* title
* description
* estimated_hours
* hourly_rate
* material_cost
* subtotal
* status
* customer_approved

### Work_Orders

* id
* repair_item_id
* assigned_to
* status
* scheduled_date

---

## Assignment Engine

Assign staff using:

* Availability
* Service region
* Distance to property
* Current workload

If no staff available:

* Notify admin

---

## Reporting

Inspection reports include:

* Property information
* Inspection summary
* Checklist results
* Notes
* Photos
* Repair recommendations
* Cost estimates
* Inspector name
* Timestamp

Store all reports by property for historical tracking.

---

## MVP Scope

### Phase 1

* Authentication
* Property management
* Checklist purchasing
* Scheduling
* Staff inspections
* Photo uploads
* Reports
* Repair estimates

### Phase 2

* SMS/email notifications
* Recurring inspections
* Automated assignment
* PDF generation

### Phase 3

* Work orders
* Vendor management
* Route optimization
* Subscription plans
* Property health scoring

---

## UI Requirements

* Mobile-first design
* Responsive Material UI components
* Clean dashboard experience
* Dark mode support
* Fast checklist completion workflow
* Offline-friendly inspection forms where possible

---

## Development Standards

* TypeScript throughout
* Prisma migrations
* tRPC for type-safe API (replaces REST boilerplate)
* Role-based authorization via Clerk
* Input validation using Zod
* Reusable component architecture
* Modular service layer
* Comprehensive error handling
* Audit logging for critical actions
* Production-ready code only

---

## Deferred Tasks

* **Clerk production instance** — When going live, create a Clerk production instance, add the Vercel domain to Allowed Origins, update `VITE_CLERK_PUBLISHABLE_KEY` (Vercel) and `CLERK_SECRET_KEY` + `CLERK_WEBHOOK_SECRET` (Railway) with production keys.
