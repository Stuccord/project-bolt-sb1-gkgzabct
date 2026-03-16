# Database Access Guide

This guide explains how to access your Supabase database externally for management, backups, and integrations.

## Supabase Dashboard Access

**URL**: https://supabase.com/dashboard

### What You Can Do:
- View and edit data in all tables
- Run SQL queries
- Manage users and authentication
- Monitor database performance
- View API logs
- Configure Row Level Security policies
- Create database backups

### Quick Access:
1. **Table Editor**: View/edit data in spreadsheet format
2. **SQL Editor**: Run custom SQL queries
3. **Database**: View schema, relationships, and triggers
4. **Authentication**: Manage users and auth settings

---

## Connection Details

### Your Supabase Project
- **Project URL**: `https://ipzekkvxovwityzvnnry.supabase.co`
- **Project Reference**: `ipzekkvxovwityzvnnry`

### API Keys
- **Anon/Public Key**:
  ```
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwemVra3Z4b3Z3aXR5enZubnJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMTc3NzcsImV4cCI6MjA3ODY5Mzc3N30.949EmM60DV_QeU2CgBE9I7IPGRax5ag1aU9pXBM_DfA
  ```
  - Use this for client-side applications (already configured in your app)
  - Respects Row Level Security (RLS) policies

- **Service Role Key**: (Get from Supabase Dashboard → Settings → API)
  - **IMPORTANT**: Bypasses RLS - use only server-side!
  - Never expose in client applications
  - Use for admin operations and migrations

---

## Direct Database Connection

### PostgreSQL Connection String

Get your connection string from: **Supabase Dashboard → Settings → Database**

**Connection Info Format**:
```
Host: db.ipzekkvxovwityzvnnry.supabase.co
Port: 5432
Database: postgres
User: postgres
Password: [Get from Supabase Dashboard]
```

**Connection String**:
```
postgresql://postgres:[YOUR-PASSWORD]@db.ipzekkvxovwityzvnnry.supabase.co:5432/postgres
```

### Using Popular Database Clients:

#### 1. **TablePlus** (Mac/Windows/Linux)
- Download: https://tableplus.com
- Click "Create a new connection" → PostgreSQL
- Enter connection details above
- Test and Save

#### 2. **DBeaver** (Free, Cross-platform)
- Download: https://dbeaver.io
- New Database Connection → PostgreSQL
- Enter host, port, database, user, password
- Test Connection

#### 3. **pgAdmin** (Free, Cross-platform)
- Download: https://www.pgadmin.org
- Right-click Servers → Create → Server
- Enter connection details

#### 4. **DataGrip** (JetBrains)
- File → New → Data Source → PostgreSQL
- Enter connection details

#### 5. **VS Code** (with PostgreSQL Extension)
- Install "PostgreSQL" extension by Chris Kolkman
- Click PostgreSQL icon in sidebar
- Add connection with details above

---

## Using Supabase CLI

### Installation:
```bash
# macOS
brew install supabase/tap/supabase

# Windows
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Linux
brew install supabase/tap/supabase
```

### Login:
```bash
supabase login
```

### Link to Project:
```bash
supabase link --project-ref ipzekkvxovwityzvnnry
```

### Run SQL Commands:
```bash
supabase db dump
supabase db push
supabase db reset
```

---

## API Access (REST & GraphQL)

### REST API
**Base URL**: `https://ipzekkvxovwityzvnnry.supabase.co/rest/v1`

**Example Request**:
```bash
curl 'https://ipzekkvxovwityzvnnry.supabase.co/rest/v1/agents' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

**Auto-generated API Documentation**:
https://ipzekkvxovwityzvnnry.supabase.co/rest/v1/

### GraphQL API (Optional)
**Endpoint**: `https://ipzekkvxovwityzvnnry.supabase.co/graphql/v1`

Enable in: Supabase Dashboard → Settings → API → GraphQL

---

## Access Methods Summary

| Method | Best For | Security Level |
|--------|----------|----------------|
| **Supabase Dashboard** | Quick edits, monitoring | Full (requires login) |
| **Database Client** | Complex queries, migrations | Full (requires password) |
| **REST API** | Application integrations | RLS-protected |
| **GraphQL API** | Modern app development | RLS-protected |
| **Supabase CLI** | Development, automation | Full (requires login) |
| **JavaScript Client** | Web/mobile apps | RLS-protected |

---

## Common Tasks

### View All Tables
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

### Export Data (via Dashboard)
1. Go to Table Editor
2. Select table
3. Click "..." menu → Export as CSV

### Backup Database
**Via Dashboard**:
- Settings → Database → Backups
- Enable automatic daily backups (recommended)

**Via CLI**:
```bash
supabase db dump -f backup.sql
```

### Run Migrations
**Via Dashboard**:
- SQL Editor → New query → Paste SQL → Run

**Via CLI**:
```bash
supabase db push
```

---

## Security Best Practices

1. **Never expose Service Role Key** in client-side code
2. **Use RLS policies** for all tables (already configured)
3. **Rotate API keys** if compromised (Dashboard → Settings → API)
4. **Use environment variables** for sensitive data (already done in `.env`)
5. **Enable 2FA** on your Supabase account
6. **Regular backups**: Enable automatic daily backups
7. **Monitor logs**: Check API logs for suspicious activity

---

## Getting Help

- **Supabase Docs**: https://supabase.com/docs
- **Community**: https://github.com/supabase/supabase/discussions
- **Status**: https://status.supabase.com
- **Support**: support@supabase.com

---

## Quick Reference Card

**Dashboard**: https://supabase.com/dashboard
**Project URL**: https://ipzekkvxovwityzvnnry.supabase.co
**Database Host**: db.ipzekkvxovwityzvnnry.supabase.co:5432
**API Docs**: https://ipzekkvxovwityzvnnry.supabase.co/rest/v1/

**Tables**:
- `agents` - User accounts
- `clients` - Client information
- `policies` - Insurance policies
- `claims` - Insurance claims
- `commissions` - Commission tracking
