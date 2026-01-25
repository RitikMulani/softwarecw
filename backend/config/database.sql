-- Health App Database Schema for PostgreSQL (Supabase)
-- Run this SQL script in Supabase SQL Editor to create tables

-- Users table (patients, doctors, and admin)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('patient', 'doctor', 'admin')),
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Doctor-specific information
CREATE TABLE IF NOT EXISTS doctors (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  specialization VARCHAR(255) NOT NULL,
  qualification VARCHAR(255),
  experience_years INT,
  license_number VARCHAR(100) UNIQUE,
  consultation_fee DECIMAL(10, 2),
  available_days VARCHAR(255),
  available_hours VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Patient-specific information
CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  blood_group VARCHAR(10),
  allergies TEXT,
  chronic_conditions TEXT,
  emergency_contact VARCHAR(255),
  emergency_phone VARCHAR(20),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Medical Records
CREATE TABLE IF NOT EXISTS medical_records (
  id SERIAL PRIMARY KEY,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  appointment_id INT,
  diagnosis TEXT,
  symptoms TEXT,
  treatment TEXT,
  notes TEXT,
  record_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
);

-- Prescriptions
CREATE TABLE IF NOT EXISTS prescriptions (
  id SERIAL PRIMARY KEY,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  medical_record_id INT,
  medication_name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100),
  frequency VARCHAR(100),
  duration VARCHAR(100),
  instructions TEXT,
  prescribed_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (medical_record_id) REFERENCES medical_records(id) ON DELETE SET NULL
);

-- Doctor-Patient Access Requests (Sharing Requests)
CREATE TABLE IF NOT EXISTS sharing_requests (
  id SERIAL PRIMARY KEY,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TRIGGER update_sharing_requests_updated_at BEFORE UPDATE ON sharing_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
-- Sample Doctors
INSERT INTO users (email, password, user_type, full_name, phone, date_of_birth, gender, address) VALUES
('dr.smith@hospital.com', '$2a$10$YourHashedPasswordHere', 'doctor', 'Dr. John Smith', '555-0101', '1980-05-15', 'male', '123 Medical Center, City'),
('dr.jones@hospital.com', '$2a$10$YourHashedPasswordHere', 'doctor', 'Dr. Sarah Jones', '555-0102', '1985-08-22', 'female', '456 Health Plaza, City');

-- Sample Doctor Details
INSERT INTO doctors (user_id, specialization, qualification, experience_years, license_number, consultation_fee, available_days, available_hours) VALUES
(1, 'Cardiology', 'MD, FACC', 15, 'LIC001', 150.00, 'Mon,Wed,Fri', '9:00-17:00'),
(2, 'Pediatrics', 'MD, FAAP', 10, 'LIC002', 100.00, 'Tue,Thu,Sat', '10:00-18:00');

-- Sample Patients
INSERT INTO users (email, password, user_type, full_name, phone, date_of_birth, gender, address) VALUES
('patient1@email.com', '$2a$10$YourHashedPasswordHere', 'patient', 'Alice Johnson', '555-0201', '1990-03-10', 'female', '789 Oak Street, City'),
('patient2@email.com', '$2a$10$YourHashedPasswordHere', 'patient', 'Bob Williams', '555-0202', '1985-11-25', 'male', '321 Pine Avenue, City');

-- Sample Patient Details
INSERT INTO patients (user_id, blood_group, allergies, chronic_conditions, emergency_contact, emergency_phone) VALUES
(3, 'O+', 'Penicillin', 'None', 'Mary Johnson', '555-0301'),
(4, 'A+', 'None', 'Diabetes Type 2', 'Jane Williams', '555-0302');
