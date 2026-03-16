# Creating the First Admin Account

Since the application doesn't allow public sign-up, you need to manually create the first admin account directly in the Supabase database.

## Option 1: Using Supabase Dashboard (Recommended)

### Step 1: Create Auth User
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Users**
3. Click **"Add user"** → **"Create new user"**
4. Fill in the form:
   - **Email**: `admin@agency.com` (or your preferred email)
   - **Password**: Choose a secure password (e.g., `Admin123456!`)
   - **Auto Confirm User**: Check this box (important!)
5. Click **"Create user"**
6. Copy the User ID (UUID) that appears - you'll need this

### Step 2: Update Agent Role to Admin
1. Still in Supabase Dashboard, go to **Table Editor** → **agents** table
2. Find the row with the user ID you just copied
3. Click on the row to edit it
4. Change the `role` column from `agent` to `admin`
5. Click **"Save"**

### Step 3: Login
1. Go to your application
2. Login with:
   - Email: `admin@agency.com` (or the email you used)
   - Password: The password you set
3. You should now see the Admin Portal with full access

---

## Option 2: Using SQL Editor

If you prefer using SQL, you can create the admin account in one go:

### Step 1: Go to SQL Editor
1. In Supabase Dashboard, navigate to **SQL Editor**
2. Click **"New query"**

### Step 2: Run This SQL

```sql
-- First, create the auth user (replace with your email and password)
-- Note: You'll need to get the user_id after creation to update the role

-- Create a function to insert admin user
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Insert into auth.users (this creates the authentication record)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@agency.com',  -- Change this to your email
    crypt('Admin123456!', gen_salt('bf')),  -- Change this to your password
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"System Administrator","role":"admin"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO new_user_id;

  -- The trigger will automatically create the agent record
  -- But we need to update it to admin role
  UPDATE public.agents
  SET role = 'admin',
      full_name = 'System Administrator'
  WHERE id = new_user_id;

  RAISE NOTICE 'Admin user created with ID: %', new_user_id;
END $$;
```

**Important**: Replace `'admin@agency.com'` and `'Admin123456!'` with your desired credentials.

### Step 3: Login
Login to your application with the credentials you just created.

---

## Option 3: Simple SQL Update (If User Already Exists)

If you've already created a user and just need to make them an admin:

```sql
-- Update existing user to admin role
UPDATE agents
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

---

## Verification

After creating your admin account:

1. **Login** with the credentials
2. You should see:
   - Blue-themed interface
   - "Admin" label under your name in the sidebar
   - "Admin Dashboard" as the main page
   - "Agent Management" option in the sidebar
3. **Test permissions**:
   - Navigate to Agent Management
   - Try creating a new user (agent, manager, or admin)
   - Try changing user roles using the dropdown

---

## Troubleshooting

### "Invalid login credentials"
- Make sure the user's `email_confirmed_at` is set in auth.users
- Check that the email and password match exactly

### "Agent record not found"
- Check if the agents table has a record with the same ID as the auth.users record
- The trigger should create this automatically, but you can manually insert if needed:

```sql
INSERT INTO agents (id, email, full_name, role, is_active)
VALUES (
  'YOUR_USER_ID_HERE',
  'admin@agency.com',
  'System Administrator',
  'admin',
  true
);
```

### Can't see admin features
- Verify the role is set to 'admin' in the agents table:

```sql
SELECT id, email, role FROM agents WHERE email = 'admin@agency.com';
```

---

## Security Notes

- After creating the first admin, all future users should be created through the Admin Portal UI
- Never share admin credentials
- Use a strong password
- Consider enabling 2FA once logged in
- Regularly audit admin accounts in the Agent Management page
