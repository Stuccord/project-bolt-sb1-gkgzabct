/*
  # Create BearGuard Admin Account
  
  Creates admin user: bearguard25@gmail.com
  Password: BearGuard2025!
*/

DO $$
DECLARE
  new_id uuid := gen_random_uuid();
BEGIN
  -- Insert auth user
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  ) VALUES (
    new_id,
    '00000000-0000-0000-0000-000000000000',
    'bearguard25@gmail.com',
    crypt('BearGuard2025!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"],"role":"admin"}'::jsonb,
    '{"full_name":"BearGuard Admin"}'::jsonb,
    'authenticated',
    'authenticated',
    now(),
    now(),
    '',
    ''
  );

  -- Wait a moment for trigger to complete
  PERFORM pg_sleep(0.1);

  -- Ensure agent record exists with admin role
  INSERT INTO agents (id, email, full_name, role, is_active)
  VALUES (new_id, 'bearguard25@gmail.com', 'BearGuard Admin', 'admin', true)
  ON CONFLICT (id) DO UPDATE SET role = 'admin', is_active = true;

  RAISE NOTICE 'Admin created: bearguard25@gmail.com';
END $$;
