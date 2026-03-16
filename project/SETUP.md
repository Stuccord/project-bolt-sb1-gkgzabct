# Insurance Agency Management System - Setup Guide

## Overview
A comprehensive SaaS platform for insurance agents to manage clients, policies, claims, and track commissions.

## Features
- Agent authentication with role-based access
- Client referral management
- Policy tracking and management
- Claims processing center
- Commission tracking and reporting
- Analytics and reporting dashboard
- Responsive design for mobile and desktop

## Database Setup

The database is already configured and running. The schema includes:

### Tables
- **agents** - User accounts with roles (admin, agent, manager)
- **clients** - Client information and referrals
- **policies** - Insurance policies with status tracking
- **claims** - Claims with approval workflow
- **commissions** - Agent earnings and payment tracking

### Sample Data
Sample data has been pre-loaded including:
- 3 agents (demo@agent.com, manager@agency.com, admin@agency.com)
- 5 clients
- 5 policies (various types and statuses)
- 3 claims (pending, approved, rejected)
- 7 commission records

## Creating User Accounts

### How User Registration Works

1. **Sign Up via the App** - Users can sign up through the login page
2. **Automatic Agent Creation** - When a user signs up, the system automatically creates an agent record with role='agent'
3. **Role Assignment** - All new users start as agents. To assign manager or admin roles, an existing admin must update the user's role in the database

### Creating Test Accounts with Different Roles

**Step 1: Create Users via Sign-Up**
1. Visit the application and click "Sign Up"
2. Create accounts with these emails:
   - `demo@agent.com` (will be Agent)
   - `manager@agency.com` (will be Manager)
   - `admin@agency.com` (will be Admin)

**Step 2: Assign Roles (Required for Manager and Admin)**
Since all new users default to the 'agent' role, you need to update roles for manager and admin users:

**Option A: Using Supabase Dashboard (Recommended)**
1. Go to your Supabase project dashboard
2. Navigate to Table Editor → agents table
3. Find the user by email
4. Update the 'role' column to 'manager' or 'admin'

**Option B: Using SQL Editor**
```sql
-- Make manager@agency.com a manager
UPDATE agents
SET role = 'manager'
WHERE email = 'manager@agency.com';

-- Make admin@agency.com an admin
UPDATE agents
SET role = 'admin'
WHERE email = 'admin@agency.com';
```

**Option C: Via Admin Portal (Future Enhancement)**
Once you have an admin account, you can use the Agent Management page to update user roles directly from the UI.

## Login Credentials

Once you've created the user accounts in Supabase Auth, you can log in with:

**Demo Agent Account:**
- Email: `demo@agent.com`
- Password: The password you set in Supabase Auth
- Role: Agent (can only view own data)

**Manager Account:**
- Email: `manager@agency.com`
- Password: The password you set in Supabase Auth
- Role: Manager (can view all agents' data)

**Admin Account:**
- Email: `admin@agency.com`
- Password: The password you set in Supabase Auth
- Role: Admin (full access to all features and data)

## Application Structure

### Pages
1. **Dashboard** - Overview with key metrics and recent referrals
2. **New Client Referral** - Form to add new clients and create policies
3. **Policy Management** - View, filter, and manage all policies
4. **Claims Center** - Track and manage insurance claims
5. **Commissions** - View earnings by month and commission history
6. **Reports & Analytics** - Performance metrics and data export
7. **Support** - Help documentation and contact information

### User Roles
- **Agent** - Can manage their own clients, policies, and view their commissions
- **Manager** - Can view all agents' data and manage the team
- **Admin** - Full access to all features and user management

## Key Features

### Commission Tracking
- Automatically calculated at 10% of premium amount
- Monthly breakdown and year-to-date totals
- Payment status tracking (pending/paid)
- Commission types: referral, renewal, bonus

### Policy Management
- Real-time status updates (pending, active, expired, cancelled)
- Filter and search capabilities
- Policy renewal tracking
- Premium and coverage amount tracking

### Claims Processing
- Claims submission and tracking
- Status workflow (pending, approved, rejected)
- Document management support
- Approval amount tracking

### Reports & Analytics
- Performance overview with key metrics
- Policy distribution analysis
- Export functionality for reports
- Year-over-year comparison

## Design System

### Colors
- Primary: Purple (#6C63FF)
- Sidebar: Dark Navy (#111827)
- Background: Light Gray (#F9FAFB)
- Success: Green
- Warning: Yellow
- Error: Red

### Typography
- Font: System fonts (optimized for performance)
- Rounded corners: Large (rounded-2xl)
- Shadows: Subtle with hover effects

### Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## Development

### Running Locally
The application is already running. Visit the preview URL to see it in action.

### Building for Production
```bash
npm run build
```

### Type Checking
```bash
npm run typecheck
```

## Security Features

### Row Level Security (RLS)
All database tables have RLS enabled with policies that:
- Agents can only see their own data
- Managers and admins can see all data
- Prevents unauthorized data access

### Authentication
- JWT-based authentication via Supabase
- Session persistence
- Secure password handling
- Role-based access control

## Support

For assistance:
- Email: support@insureagent.com
- Phone: +233 123 456 789
- In-app support documentation

## Next Steps

1. Create your demo account using the instructions above
2. Log in to the application
3. Explore the dashboard and view pre-loaded data
4. Try adding a new client referral
5. Check the commissions page to see earnings breakdown
6. Export a report from the Analytics page

Enjoy using the Insurance Agency Management System!
