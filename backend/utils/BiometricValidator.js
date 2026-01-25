/**
 * Biometric Data Validator
 * Validates incoming health readings for unrealistic/impossible values
 */

const BiometricValidator = {
  /**
   * Validate heart rate reading
   * Realistic range: 20-250 bpm
   * Typical range: 40-160 bpm
   */
  validateHeartRate: (hr) => {
    if (typeof hr !== 'number' || isNaN(hr)) return { valid: false, reason: 'Invalid type' };
    if (hr < 20 || hr > 250) return { valid: false, reason: `Heart rate ${hr} bpm is unrealistic` };
    return { valid: true };
  },

  /**
   * Validate blood pressure (systolic/diastolic)
   * Realistic range: 30-250 mmHg (systolic), 0-150 mmHg (diastolic)
   */
  validateBloodPressure: (sys, dia) => {
    if (typeof sys !== 'number' || typeof dia !== 'number' || isNaN(sys) || isNaN(dia)) {
      return { valid: false, reason: 'Invalid blood pressure format' };
    }
    if (sys < 30 || sys > 250) return { valid: false, reason: `Systolic pressure ${sys} mmHg is unrealistic` };
    if (dia < 0 || dia > 150) return { valid: false, reason: `Diastolic pressure ${dia} mmHg is unrealistic` };
    if (dia > sys) return { valid: false, reason: 'Diastolic pressure cannot exceed systolic' };
    return { valid: true };
  },

  /**
   * Validate blood oxygen saturation (SpO2)
   * Realistic range: 70-100%
   * Typical healthy: 95-100%
   */
  validateSpO2: (spo2) => {
    if (typeof spo2 !== 'number' || isNaN(spo2)) return { valid: false, reason: 'Invalid type' };
    if (spo2 < 70 || spo2 > 100) return { valid: false, reason: `SpO2 ${spo2}% is unrealistic` };
    return { valid: true };
  },

  /**
   * Validate body temperature
   * Realistic range: 32°C - 42°C
   * Typical range: 36.1°C - 37.2°C
   */
  validateTemperature: (temp) => {
    if (typeof temp !== 'number' || isNaN(temp)) return { valid: false, reason: 'Invalid type' };
    if (temp < 32 || temp > 42) return { valid: false, reason: `Temperature ${temp}°C is unrealistic` };
    return { valid: true };
  },

  /**
   * Validate steps count
   * Realistic range: 0 - 100,000 in a day (very high but possible)
   * Typical range: 0 - 50,000 steps/day
   */
  validateSteps: (steps) => {
    if (typeof steps !== 'number' || isNaN(steps) || steps < 0) {
      return { valid: false, reason: 'Steps must be a positive number' };
    }
    if (steps > 100000) return { valid: false, reason: `${steps} steps in a day is unrealistic` };
    return { valid: true };
  },

  /**
   * Validate HRV (Heart Rate Variability)
   * Realistic range: 0 - 250 ms
   * Typical: 20 - 100 ms
   */
  validateHRV: (hrv) => {
    if (typeof hrv !== 'number' || isNaN(hrv) || hrv < 0) {
      return { valid: false, reason: 'HRV must be a positive number' };
    }
    if (hrv > 250) return { valid: false, reason: `HRV ${hrv} ms is unrealistic` };
    return { valid: true };
  },

  /**
   * Validate entire reading object
   * Returns validation result with details
   */
  validateReading: (reading) => {
    const errors = [];
    const warnings = [];

    // Check required fields
    if (!reading || typeof reading !== 'object') {
      return { valid: false, errors: ['Invalid reading format'], warnings: [], data: null };
    }

    // Validate each biometric if present
    if (reading.heart_rate !== undefined) {
      const hrValidation = this.validateHeartRate(reading.heart_rate);
      if (!hrValidation.valid) errors.push(`Heart Rate: ${hrValidation.reason}`);
      if (reading.heart_rate < 50 || reading.heart_rate > 120) warnings.push(`Heart rate ${reading.heart_rate} bpm is unusual`);
    }

    if (reading.blood_pressure_sys !== undefined || reading.blood_pressure_dia !== undefined) {
      const sys = reading.blood_pressure_sys || 120;
      const dia = reading.blood_pressure_dia || 80;
      const bpValidation = this.validateBloodPressure(sys, dia);
      if (!bpValidation.valid) errors.push(`Blood Pressure: ${bpValidation.reason}`);
    }

    if (reading.spo2 !== undefined) {
      const spo2Validation = this.validateSpO2(reading.spo2);
      if (!spo2Validation.valid) errors.push(`SpO2: ${spo2Validation.reason}`);
      if (reading.spo2 < 95) warnings.push(`SpO2 ${reading.spo2}% is lower than normal (95-100%)`);
    }

    if (reading.body_temp !== undefined) {
      const tempValidation = this.validateTemperature(reading.body_temp);
      if (!tempValidation.valid) errors.push(`Temperature: ${tempValidation.reason}`);
      if (reading.body_temp < 36 || reading.body_temp > 37.5) warnings.push(`Temperature ${reading.body_temp}°C is unusual`);
    }

    if (reading.steps !== undefined) {
      const stepsValidation = this.validateSteps(reading.steps);
      if (!stepsValidation.valid) errors.push(`Steps: ${stepsValidation.reason}`);
    }

    if (reading.hrv !== undefined) {
      const hrvValidation = this.validateHRV(reading.hrv);
      if (!hrvValidation.valid) errors.push(`HRV: ${hrvValidation.reason}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      data: errors.length === 0 ? reading : null,
      isAnomaly: warnings.length > 0
    };
  }
};

export default BiometricValidator;
