/*
  # Create Appointments System

  1. New Tables
    - `appointments`
      - `id` (uuid, primary key)
      - `full_name` (text, required) - Name of person booking
      - `email` (text, required) - Contact email
      - `phone` (text, required) - Contact phone number
      - `appointment_date` (date, required) - Preferred date
      - `appointment_time` (text, required) - Preferred time slot
      - `service_type` (text, required) - Type of service needed
      - `message` (text, optional) - Additional details
      - `status` (text, default 'pending') - pending, confirmed, cancelled, completed
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `appointments` table
    - Allow public inserts (anyone can book)
    - Only authenticated users can view/update appointments

  3. Indexes
    - Index on status for filtering
    - Index on appointment_date for sorting
    - Index on created_at for sorting
*/

CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  appointment_date date NOT NULL,
  appointment_time text NOT NULL,
  service_type text NOT NULL,
  message text DEFAULT '',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create appointments"
  ON appointments
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update appointments"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_created ON appointments(created_at DESC);