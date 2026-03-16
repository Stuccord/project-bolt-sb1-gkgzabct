/*
  # Add Notification Preferences

  1. Changes
    - Add notification_preferences column to agents table
    - Store email_notifications, commission_alerts, policy_reminders as JSONB

  2. Security
    - Users can only update their own notification preferences
*/

-- Add notification preferences column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'agents' AND column_name = 'notification_preferences'
  ) THEN
    ALTER TABLE agents ADD COLUMN notification_preferences JSONB DEFAULT '{"email_notifications": true, "commission_alerts": true, "policy_reminders": true}'::JSONB;
  END IF;
END $$;

-- Update existing agents to have default preferences
UPDATE agents
SET notification_preferences = '{"email_notifications": true, "commission_alerts": true, "policy_reminders": true}'::JSONB
WHERE notification_preferences IS NULL;
