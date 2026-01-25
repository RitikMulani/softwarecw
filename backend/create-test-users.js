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
        
        // Add patient details
        await db.query(
          `INSERT INTO patients (user_id, blood_group, allergies, chronic_conditions, emergency_contact, emergency_phone) 
           VALUES (?, 'O+', 'Penicillin', 'None', 'Mary Johnson', '555-0301')`,
          [result[0].id]
        );
        console.log('✓ Created: alice.johnson@email.com (Patient)');
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
           VALUES (?, 'A+', 'None', 'Diabetes Type 2', 'Jane Williams', '555-0302')`,
          [result[0].id]
        );
        console.log('✓ Created: bob.williams@email.com (Patient)');
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
