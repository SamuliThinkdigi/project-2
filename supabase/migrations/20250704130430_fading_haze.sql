/*
  # Create Demo User for Authentication

  1. Changes
    - Create demo user in auth.users table with proper password hash
    - Create corresponding profile linked to demo organization
    - Update notifications to link to demo user

  2. Security
    - Use proper password hashing
    - Maintain referential integrity
    - Handle conflicts gracefully
*/

-- Create demo user in auth.users table
DO $$
DECLARE
  demo_user_id uuid;
  demo_org_id uuid;
  demo_profile_id uuid;
BEGIN
  -- Check if demo user already exists
  SELECT id INTO demo_user_id FROM auth.users WHERE email = 'demo@test.com' LIMIT 1;
  
  -- If demo user doesn't exist, create it
  IF demo_user_id IS NULL THEN
    demo_user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role,
      aud,
      confirmation_token,
      email_change_token_new,
      recovery_token
    ) VALUES (
      demo_user_id,
      '00000000-0000-0000-0000-000000000000',
      'demo@test.com',
      crypt('demo123456', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      '{"full_name": "Demo Käyttäjä"}',
      false,
      'authenticated',
      'authenticated',
      '',
      '',
      ''
    );
  END IF;
  
  -- Get the demo organization ID
  SELECT id INTO demo_org_id FROM organizations WHERE business_id = '2847123-4' LIMIT 1;
  
  IF demo_user_id IS NOT NULL AND demo_org_id IS NOT NULL THEN
    -- Check if profile already exists
    SELECT id INTO demo_profile_id FROM profiles WHERE user_id = demo_user_id LIMIT 1;
    
    IF demo_profile_id IS NULL THEN
      -- Create new profile
      INSERT INTO profiles (
        user_id,
        email,
        full_name,
        organization_id,
        role
      ) VALUES (
        demo_user_id,
        'demo@test.com',
        'Demo Käyttäjä',
        demo_org_id,
        'admin'
      );
    ELSE
      -- Update existing profile
      UPDATE profiles SET
        organization_id = demo_org_id,
        role = 'admin',
        updated_at = now()
      WHERE id = demo_profile_id;
    END IF;
    
    -- Get the profile ID for notifications update
    SELECT id INTO demo_profile_id FROM profiles WHERE user_id = demo_user_id LIMIT 1;
    
    -- Update notifications to link to demo user profile
    IF demo_profile_id IS NOT NULL THEN
      UPDATE notifications 
      SET user_id = demo_profile_id
      WHERE organization_id = demo_org_id AND user_id IS NULL;
    END IF;
  END IF;
END $$;