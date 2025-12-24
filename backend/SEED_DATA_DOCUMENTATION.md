# Seed Data Documentation

This document describes the seed data structure and contents that are populated when running the database seed script.

## Overview

The seed script creates a comprehensive set of realistic test data for the Project Cost Management application. All data is cleared before seeding to ensure a clean state.

## Default Credentials

**All users share the same password:**
- Password: `Password123!`

**Primary Admin User:**
- Email: `alexandra.chen@techcorp.com`
- Role: Project Manager
- Status: Online

## Data Structure

### 1. Users (8 users)

A diverse team of professionals across different departments:

| Name | Email | Role | Department | Position | Status |
|------|-------|------|------------|----------|--------|
| Alexandra Chen | alexandra.chen@techcorp.com | Project Manager | Engineering | Senior Project Manager | Online |
| Marcus Rodriguez | marcus.rodriguez@techcorp.com | Developer | Engineering | Senior Full Stack Developer | Online |
| Sophie Laurent | sophie.laurent@techcorp.com | Designer | Design | UI/UX Designer | Away |
| James Kim | james.kim@techcorp.com | QA Engineer | Quality Assurance | Senior QA Engineer | Busy |
| Emma Thompson | emma.thompson@techcorp.com | Developer | Engineering | Backend Developer | Offline |
| David Park | david.park@techcorp.com | Developer | Engineering | Frontend Developer | Online |
| Lisa Anderson | lisa.anderson@techcorp.com | Business Analyst | Product | Senior Business Analyst | Online |
| Michael Brown | michael.brown@techcorp.com | DevOps Engineer | Engineering | Senior DevOps Engineer | Online |

**User Features:**
- All users have email verification enabled
- Each user has personalized preferences (theme, language, notifications)
- Custom timezone and date format settings
- Unique avatars generated via DiceBear API

### 2. Team Spaces (4 spaces)

Organized workspaces for different teams:

1. **Engineering Team** (Blue)
   - Members: 5 (Alexandra, Marcus, Emma, David, Michael)
   - Description: Main engineering workspace for all development projects

2. **Design Team** (Purple)
   - Members: 1 (Sophie)
   - Description: Design and UX collaboration space

3. **QA Team** (Green)
   - Members: 1 (James)
   - Description: Quality assurance and testing workspace

4. **Product Team** (Orange)
   - Members: 2 (Alexandra, Lisa)
   - Description: Product management and business analysis workspace

### 3. Projects (6 projects)

Realistic projects with varying statuses and progress:

| Project Name | Status | Progress | Start Date | End Date | Team Space |
|--------------|--------|----------|------------|----------|------------|
| E-Commerce Platform | Active | 72% | 2024-01-15 | 2024-08-30 | Engineering |
| Mobile App Redesign | Active | 45% | 2024-02-01 | 2024-09-15 | Design |
| API Integration Hub | Active | 85% | 2024-01-20 | 2024-06-20 | Engineering |
| Testing Framework | On Hold | 30% | 2024-03-01 | 2024-10-01 | QA |
| Analytics Dashboard | Active | 92% | 2024-01-10 | 2024-05-30 | Engineering |
| Customer Portal | Active | 58% | 2024-02-15 | 2024-08-15 | Product |

**Project Details:**
- Each project has a unique UID (format: `PRJ-{timestamp}-{random}`)
- Projects include detailed descriptions
- Color-coded and icon-labeled for easy identification
- Proper owner and member assignments

### 4. Project Members

Each project has appropriate member assignments:
- **Owner**: Alexandra Chen (Project Manager)
- **Admins**: Senior team members based on project type
- **Members**: Other relevant team members

### 5. Tasks (30+ tasks)

Tasks are distributed across projects with realistic:
- **Statuses**: TODO, IN_PROGRESS, COMPLETE, BACKLOG
- **Priorities**: LOW, MEDIUM, HIGH, URGENT
- **Assignees**: Multiple team members per task
- **Due Dates**: Staggered over upcoming weeks
- **Estimated Costs**: Varying amounts in USD

**Task Examples:**
- E-Commerce Platform: 6 tasks (authentication, database, API, cart, payments)
- Mobile App Redesign: 5 tasks (wireframes, design system, components, testing)
- API Integration Hub: 5 tasks (payment gateway, shipping, webhooks, rate limiting)
- Testing Framework: 4 tasks (unit tests, E2E setup, coverage, integration)
- Analytics Dashboard: 4 tasks (layout, charts, filters, optimization)
- Customer Portal: 4 tasks (UI design, account management, tickets, billing)

### 6. Costs (25 costs)

Various cost items including:
- Server Infrastructure
- Cloud Storage
- Third-party API Subscriptions
- Development Tools License
- Database Hosting
- CDN Services
- SSL Certificates
- Monitoring Services
- And more...

**Cost Details:**
- Amounts: $100 - $5,100
- Categories: All cost categories represented
- Linked to projects and some tasks
- Tagged appropriately

### 7. Expenses (20 expenses)

Recurring and one-time expenses:
- Office Rent
- Internet & Utilities
- Team Lunch
- Conference Tickets
- Training Courses
- Software Licenses
- Hardware Equipment
- Marketing Campaign
- Travel Expenses
- And more...

**Expense Details:**
- Frequencies: Daily, Weekly, Monthly, Yearly, One-time
- Active/Inactive status
- Linked to projects
- Realistic amounts and descriptions

### 8. Budgets (12 budgets)

Budget allocations across different periods:
- Q1 Development Budget
- Infrastructure Budget
- Marketing Budget
- Operations Budget
- Training & Development
- Equipment Budget
- Software Licenses Budget
- Travel & Events Budget

**Budget Details:**
- Periods: Daily, Weekly, Monthly, Yearly
- Amounts: $15,000 - $180,000
- Date ranges spanning past and future
- Linked to projects

### 9. Contracts (10 contracts)

Vendor service agreements:
- Contract Numbers: `CNT-2024-0001` through `CNT-2024-0010`
- Vendors: CloudHost Solutions, TechSoft Inc., DataSecure Systems, etc.
- Statuses: Draft, Active, Expired, Terminated, Pending Renewal, Cancelled
- Payment Frequencies: One-time, Monthly, Quarterly, Semi-annual, Annual
- Auto-renewal settings

**Contract Details:**
- Amounts: $8,000 - $80,000
- Start and end dates
- Renewal dates
- Vendor contact information
- Notes and attachments

### 10. Sprints (8 sprints)

Agile sprint planning:
- Sprint 1: Foundation
- Sprint 2: Core Features
- Sprint 3: Integration
- Sprint 4: Optimization
- Sprint 5: Testing
- Sprint 6: Launch Prep

**Sprint Details:**
- Statuses: Planned, Active, Completed
- 2-week sprint cycles
- Task counts and completion tracking
- Goals defined for each sprint

### 11. Conversations (6 conversations)

Team communication channels:
- Project Discussion
- Team Standup
- Design Review
- Technical Discussion
- Client Meeting Notes

**Conversation Details:**
- Types: Direct (1-on-1) and Group conversations
- 3-8 messages per conversation
- Unread counts
- Pinned conversations
- Linked to projects and team spaces

### 12. Messages (18+ messages)

Realistic message content:
- Greetings and project discussions
- Technical conversations
- Status updates
- Read/unread status
- Sender information included

### 13. Notifications (20 notifications)

Various notification types:
- Task assignments
- Project updates
- Deadline warnings
- New comments
- Task completions

**Notification Details:**
- Types: Info, Success, Warning, Error
- Read/unread status
- Action URLs linking to relevant items
- Icons and labels

### 14. Notes (15 notes)

Sticky notes with:
- Reminders and important information
- Project-related notes
- Meeting notes
- Action items

**Note Details:**
- Colors: Yellow, Blue, Green, Pink
- Rotation: -5°, 0°, or 5° for visual variety
- Linked to users
- Realistic content

## Data Relationships

### Hierarchical Structure:
```
Users
  ├── Team Spaces (created by users, contain members)
  │     └── Projects (owned by users, belong to team spaces)
  │           ├── Project Members (users assigned to projects)
  │           ├── Tasks (created by users, assigned to users)
  │           ├── Costs (linked to projects and tasks)
  │           ├── Expenses (linked to projects)
  │           ├── Budgets (linked to projects)
  │           ├── Contracts (linked to projects)
  │           └── Sprints (linked to projects)
  ├── Conversations (participants are users)
  │     └── Messages (sent by users)
  ├── Notifications (for users)
  └── Notes (created by users)
```

## Running the Seed Script

To populate the database with this seed data:

```bash
# From the backend directory
npm run seed
# or
ts-node src/database/seed.ts
```

**Important Notes:**
- ⚠️ **All existing data will be deleted** before seeding
- The script connects to the database using your `.env` configuration
- Ensure your database is accessible and migrations are up to date
- The seed script will output progress and a summary upon completion

## Data Characteristics

### Realistic Values:
- All dates are relative to the current date
- Amounts are realistic for business operations
- Names and emails follow professional conventions
- Descriptions are detailed and meaningful
- Relationships are properly maintained

### Data Distribution:
- Projects have varying progress percentages
- Tasks span all status and priority levels
- Costs and expenses are distributed across categories
- Budgets cover different time periods
- Contracts have various statuses and payment terms

## Customization

To modify the seed data:
1. Edit `backend/src/database/seed.ts`
2. Adjust the arrays and objects in each section
3. Run the seed script again

**Tips:**
- Maintain referential integrity (users exist before projects, etc.)
- Use realistic values for dates, amounts, and descriptions
- Ensure enum values match entity definitions
- Test relationships after modifications

## Troubleshooting

**Common Issues:**

1. **Foreign Key Violations**: Ensure parent entities are created before children
2. **Enum Mismatches**: Verify enum values match entity definitions
3. **Date Issues**: Check date formats and timezone handling
4. **Unique Constraints**: Ensure UIDs and identifiers are unique

**Debug Tips:**
- Check console output for specific error messages
- Verify database connection settings
- Ensure all entity imports are correct
- Check that all required fields are provided

---

**Last Updated**: Generated with seed script
**Version**: 2.0 (Enhanced with realistic data)

