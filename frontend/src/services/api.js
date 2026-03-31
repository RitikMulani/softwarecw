import axios from 'axios';

// Base URL for API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile')
};

// Users API
export const usersAPI = {
  getAllDoctors: () => api.get('/users/doctors'),
  getDoctorById: (id) => api.get(`/users/doctors/${id}`),
  getAllPatients: () => api.get('/users/patients'),
  updateProfile: (userData) => api.put('/users/profile', userData)
};

// Appointments API
export const appointmentsAPI = {
  createAppointment: (appointmentData) => api.post('/appointments', appointmentData),
  getMyAppointments: () => api.get('/appointments'),
  getAppointmentById: (id) => api.get(`/appointments/${id}`),
  updateAppointment: (id, appointmentData) => api.put(`/appointments/${id}`, appointmentData),
  cancelAppointment: (id) => api.delete(`/appointments/${id}`)
};

// Prescriptions API
export const prescriptionsAPI = {
  createPrescription: (prescriptionData) => api.post('/prescriptions', prescriptionData),
  getMyPrescriptions: () => api.get('/prescriptions'),
  getPrescriptionById: (id) => api.get(`/prescriptions/${id}`),
  getPatientPrescriptions: (patientId) => api.get(`/prescriptions/patient/${patientId}`),
  updatePrescription: (id, prescriptionData) => api.put(`/prescriptions/${id}`, prescriptionData),
  deletePrescription: (id) => api.delete(`/prescriptions/${id}`)
};

// Medical Records API
export const medicalRecordsAPI = {
  createMedicalRecord: (recordData) => api.post('/medical-records', recordData),
  getMyMedicalRecords: () => api.get('/medical-records'),
  getMedicalRecordById: (id) => api.get(`/medical-records/${id}`),
  getPatientMedicalRecords: (patientId) => api.get(`/medical-records/patient/${patientId}`),
  updateMedicalRecord: (id, recordData) => api.put(`/medical-records/${id}`, recordData),
  deleteMedicalRecord: (id) => api.delete(`/medical-records/${id}`)
};

// Sharing API (Doctor-Patient Access)
export const sharingAPI = {
  getMyProviders: () => api.get('/sharing/my-providers'),
  disconnectProvider: (sharingId) => api.delete(`/sharing/${sharingId}/disconnect`)
};

// Thresholds API (Biometric Alert Thresholds)
export const thresholdsAPI = {
  getThresholds: () => api.get('/thresholds'),
  updateThresholds: (thresholds) => api.put('/thresholds', thresholds)
};

// Device API (Biometric Readings)
export const deviceAPI = {
  getReadingsHistory: () => api.get('/device/readings/history'),
  getLatestReading: () => api.get('/device/readings/latest'),
  storeReading: (readingData) => api.post('/device/readings', readingData)
};

export default api;
