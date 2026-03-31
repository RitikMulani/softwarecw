import bcrypt from 'bcryptjs';
import db from './config/database.js';

async function createTestUsers() {
  try {
    // Hash password123
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    console.log('\n🐢 Creating test users with password: password123\n');
    console.log('Test Accounts:');
    console.log('====================');

    // Create Admin User
    try {
      const [adminCheck] = await db.query('SELECT id FROM users WHERE email = ?', ['admin@turtlehealth.com']);
      if (adminCheck.length === 0) {
        await db.query(
          `INSERT INTO users (email, password, user_type, full_name, created_at) 
           VALUES (?, ?, 'admin', 'Admin User', CURRENT_TIMESTAMP)`,
          ['admin@turtlehealth.com', hashedPassword]
        );
        console.log('✓ Created: admin@turtlehealth.com (Admin)');
      } else {
        await db.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, 'admin@turtlehealth.com']);
        console.log('✓ Updated: admin@turtlehealth.com (Admin)');
      }
    } catch (err) {
      console.log('⚠ admin@turtlehealth.com:', err.message);
    }

    // Create/Update Dr. John Smith
    try {
      const [docCheck] = await db.query('SELECT id FROM users WHERE email = ?', ['dr.smith@hospital.com']);
      if (docCheck.length === 0) {
        const [result] = await db.query(
          `INSERT INTO users (email, password, user_type, full_name, phone, date_of_birth, gender, address, created_at) 
           VALUES (?, ?, 'doctor', 'Dr. John Smith', '555-0101', '1980-05-15', 'male', '123 Medical Center, City', CURRENT_TIMESTAMP) RETURNING id`,
          ['dr.smith@hospital.com', hashedPassword]
        );
        
        // Add doctor details
        await db.query(
          `INSERT INTO doctors (user_id, specialization, qualification, experience_years, license_number, consultation_fee, available_days, available_hours) 
           VALUES (?, 'Cardiology', 'MD, FACC', 15, 'LIC001', 150.00, 'Mon,Wed,Fri', '9:00-17:00')`,
          [result[0].id]
        );
        console.log('✓ Created: dr.smith@hospital.com (Doctor - Cardiology)');
      } else {
        await db.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, 'dr.smith@hospital.com']);
        console.log('✓ Updated: dr.smith@hospital.com (Doctor - Cardiology)');
      }
    } catch (err) {
      console.log('⚠ dr.smith@hospital.com:', err.message);
    }

    // Create/Update Dr. Sarah Jones
    try {
      const [docCheck] = await db.query('SELECT id FROM users WHERE email = ?', ['dr.jones@hospital.com']);
      if (docCheck.length === 0) {
        const [result] = await db.query(
          `INSERT INTO users (email, password, user_type, full_name, phone, date_of_birth, gender, address, created_at) 
           VALUES (?, ?, 'doctor', 'Dr. Sarah Jones', '555-0102', '1985-08-22', 'female', '456 Health Plaza, City', CURRENT_TIMESTAMP) RETURNING id`,
          ['dr.jones@hospital.com', hashedPassword]
        );
        
        // Add doctor details
        await db.query(
          `INSERT INTO doctors (user_id, specialization, qualification, experience_years, license_number, consultation_fee, available_days, available_hours) 
           VALUES (?, 'Pediatrics', 'MD, FAAP', 10, 'LIC002', 100.00, 'Tue,Thu,Sat', '10:00-18:00')`,
          [result[0].id]
        );
        console.log('✓ Created: dr.jones@hospital.com (Doctor - Pediatrics)');
      } else {
        await db.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, 'dr.jones@hospital.com']);
        console.log('✓ Updated: dr.jones@hospital.com (Doctor - Pediatrics)');
      }
    } catch (err) {
      console.log('⚠ dr.jones@hospital.com:', err.message);
    }

    // Create/Update Patient - Alice Johnson
    try {
      const [patCheck] = await db.query('SELECT id FROM users WHERE email = ?', ['alice.johnson@email.com']);
      if (patCheck.length === 0) {
        const [result] = await db.query(
          `INSERT INTO users (email, password, user_type, full_name, phone, date_of_birth, gender, address, created_at) 
           VALUES (?, ?, 'patient', 'Alice Johnson', '555-0201', '1990-03-10', 'female', '789 Oak Street, City', CURRENT_TIMESTAMP) RETURNING id`,
          ['alice.johnson@email.com', hashedPassword]
        );
        
        // Add patient details with chronic conditions
        await db.query(
          `INSERT INTO patients (user_id, blood_group, allergies, chronic_conditions, emergency_contact, emergency_phone) 
           VALUES (?, 'O+', 'Penicillin', 'Asthma, Seasonal Allergies', 'Mary Johnson', '555-0301')`,
          [result[0].id]
        );
        
        // Add test biomarker readings for Alice
        const biopayloads = [
          { heart_rate: 68, blood_pressure_sys: 115, blood_pressure_dia: 75, spo2: 99, body_temp: 37.0, hrv: 62, steps: 10200 },
          { heart_rate: 71, blood_pressure_sys: 116, blood_pressure_dia: 76, spo2: 98, body_temp: 36.9, hrv: 65, steps: 11500 },
          { heart_rate: 69, blood_pressure_sys: 114, blood_pressure_dia: 74, spo2: 99, body_temp: 37.1, hrv: 63, steps: 9800 },
          { heart_rate: 72, blood_pressure_sys: 117, blood_pressure_dia: 77, spo2: 99, body_temp: 37.0, hrv: 60, steps: 12300 },
          { heart_rate: 70, blood_pressure_sys: 115, blood_pressure_dia: 75, spo2: 98, body_temp: 36.8, hrv: 64, steps: 10700 }
        ];
        
        for (const bio of biopayloads) {
          await db.query(
            `INSERT INTO device_readings (user_id, heart_rate, blood_pressure_sys, blood_pressure_dia, spo2, body_temp, hrv, steps, is_anomaly, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, false, CURRENT_TIMESTAMP - INTERVAL '1 hour')`,
            [result[0].id, bio.heart_rate, bio.blood_pressure_sys, bio.blood_pressure_dia, bio.spo2, bio.body_temp, bio.hrv, bio.steps]
          );
        }
        
        console.log('✓ Created: alice.johnson@email.com (Patient) with biomarker data');
      } else {
        await db.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, 'alice.johnson@email.com']);
        console.log('✓ Updated: alice.johnson@email.com (Patient)');
      }
    } catch (err) {
      console.log('⚠ alice.johnson@email.com:', err.message);
    }

    // Create/Update Patient - Bob Williams
    try {
      const [patCheck] = await db.query('SELECT id FROM users WHERE email = ?', ['bob.williams@email.com']);
      if (patCheck.length === 0) {
        const [result] = await db.query(
          `INSERT INTO users (email, password, user_type, full_name, phone, date_of_birth, gender, address, created_at) 
           VALUES (?, ?, 'patient', 'Bob Williams', '555-0202', '1985-11-25', 'male', '321 Pine Avenue, City', CURRENT_TIMESTAMP) RETURNING id`,
          ['bob.williams@email.com', hashedPassword]
        );
        
        // Add patient details
        await db.query(
          `INSERT INTO patients (user_id, blood_group, allergies, chronic_conditions, emergency_contact, emergency_phone) 
           VALUES (?, 'A+', 'None', 'Diabetes Type 2, Hypertension', 'Jane Williams', '555-0302')`,
          [result[0].id]
        );
        
        // Add test biomarker readings for Bob
        const biopayloads = [
          { heart_rate: 72, blood_pressure_sys: 120, blood_pressure_dia: 80, spo2: 98, body_temp: 37.2, hrv: 55, steps: 8500 },
          { heart_rate: 75, blood_pressure_sys: 118, blood_pressure_dia: 79, spo2: 97, body_temp: 37.1, hrv: 58, steps: 9200 },
          { heart_rate: 70, blood_pressure_sys: 122, blood_pressure_dia: 81, spo2: 98, body_temp: 37.3, hrv: 52, steps: 7800 },
          { heart_rate: 78, blood_pressure_sys: 125, blood_pressure_dia: 82, spo2: 97, body_temp: 37.0, hrv: 60, steps: 10500 },
          { heart_rate: 73, blood_pressure_sys: 119, blood_pressure_dia: 80, spo2: 99, body_temp: 37.2, hrv: 56, steps: 8900 }
        ];
        
        for (const bio of biopayloads) {
          await db.query(
            `INSERT INTO device_readings (user_id, heart_rate, blood_pressure_sys, blood_pressure_dia, spo2, body_temp, hrv, steps, is_anomaly, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, false, CURRENT_TIMESTAMP - INTERVAL '1 hour')`,
            [result[0].id, bio.heart_rate, bio.blood_pressure_sys, bio.blood_pressure_dia, bio.spo2, bio.body_temp, bio.hrv, bio.steps]
          );
        }
        
        console.log('✓ Created: bob.williams@email.com (Patient) with biomarker data');
      } else {
        await db.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, 'bob.williams@email.com']);
        console.log('✓ Updated: bob.williams@email.com (Patient)');
      }
    } catch (err) {
      console.log('⚠ bob.williams@email.com:', err.message);
    }

    console.log('\n====================');
    console.log('✅ Test users setup complete!\n');
    console.log('Login Credentials:');
    console.log('  Admin:  admin@turtlehealth.com / password123');
    console.log('  Doctor: dr.smith@hospital.com / password123');
    console.log('  Doctor: dr.jones@hospital.com / password123');
    console.log('  Patient: alice.johnson@email.com / password123');
    console.log('  Patient: bob.williams@email.com / password123');
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('Error creating test users:', error);
    process.exit(1);
  }
}

createTestUsers();
