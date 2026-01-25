/**
 * Biometric Validator Test Examples
 * Shows how the validation catches unrealistic data
 */

import BiometricValidator from '../utils/BiometricValidator.js';

// Example 1: Valid reading
console.log('=== Example 1: Valid Reading ===');
const validReading = {
  heart_rate: 72,
  blood_pressure_sys: 120,
  blood_pressure_dia: 80,
  spo2: 98,
  body_temp: 36.8,
  hrv: 55,
  steps: 8500
};
const result1 = BiometricValidator.validateReading(validReading);
console.log('Reading:', validReading);
console.log('Validation Result:', result1);
console.log('');

// Example 2: Unrealistic heart rate (1000 bpm)
console.log('=== Example 2: Unrealistic Heart Rate (1000 bpm) ===');
const unrealisticHR = {
  heart_rate: 1000,
  blood_pressure_sys: 120,
  blood_pressure_dia: 80,
  spo2: 98
};
const result2 = BiometricValidator.validateReading(unrealisticHR);
console.log('Reading:', unrealisticHR);
console.log('Valid?', result2.valid);
console.log('Errors:', result2.errors);
console.log('');

// Example 3: Impossible blood pressure
console.log('=== Example 3: Impossible Blood Pressure (Diastolic > Systolic) ===');
const impossibleBP = {
  heart_rate: 72,
  blood_pressure_sys: 80,
  blood_pressure_dia: 120,
  spo2: 98
};
const result3 = BiometricValidator.validateReading(impossibleBP);
console.log('Reading:', impossibleBP);
console.log('Valid?', result3.valid);
console.log('Errors:', result3.errors);
console.log('');

// Example 4: Invalid SpO2
console.log('=== Example 4: Invalid SpO2 (150%) ===');
const invalidSpO2 = {
  heart_rate: 72,
  spo2: 150,
  steps: 5000
};
const result4 = BiometricValidator.validateReading(invalidSpO2);
console.log('Reading:', invalidSpO2);
console.log('Valid?', result4.valid);
console.log('Errors:', result4.errors);
console.log('');

// Example 5: Unusual but valid (low oxygen)
console.log('=== Example 5: Unusual but Valid (Low SpO2 94%) ===');
const lowSpO2 = {
  heart_rate: 72,
  spo2: 94,
  steps: 5000
};
const result5 = BiometricValidator.validateReading(lowSpO2);
console.log('Reading:', lowSpO2);
console.log('Valid?', result5.valid);
console.log('Is Anomaly?', result5.isAnomaly);
console.log('Warnings:', result5.warnings);
console.log('');

// Example 6: Sensor error - 0 heart rate
console.log('=== Example 6: Sensor Error (0 bpm) ===');
const sensorError = {
  heart_rate: 0,
  spo2: 98,
  steps: 5000
};
const result6 = BiometricValidator.validateReading(sensorError);
console.log('Reading:', sensorError);
console.log('Valid?', result6.valid);
console.log('Errors:', result6.errors);
console.log('');

console.log('=== Validation Complete ===');
