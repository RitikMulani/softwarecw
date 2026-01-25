import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI, usersAPI } from '../services/api';

const Profile = () => {
  const { user, updateUser, isPatient, isDoctor } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: '',
    // Patient fields
    blood_group: '',
    allergies: '',
    chronic_conditions: '',
    emergency_contact: '',
    emergency_phone: '',
    // Doctor fields
    specialization: '',
    qualification: '',
    experience_years: '',
    consultation_fee: '',
    available_days: '',
    available_hours: ''
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      const userData = response.data.user;
      
      setFormData({
        full_name: userData.full_name || '',
        phone: userData.phone || '',
        date_of_birth: userData.date_of_birth ? userData.date_of_birth.split('T')[0] : '',
        gender: userData.gender || '',
        address: userData.address || '',
        // Patient fields
        blood_group: userData.patientDetails?.blood_group || '',
        allergies: userData.patientDetails?.allergies || '',
        chronic_conditions: userData.patientDetails?.chronic_conditions || '',
        emergency_contact: userData.patientDetails?.emergency_contact || '',
        emergency_phone: userData.patientDetails?.emergency_phone || '',
        // Doctor fields
        specialization: userData.doctorDetails?.specialization || '',
        qualification: userData.doctorDetails?.qualification || '',
        experience_years: userData.doctorDetails?.experience_years || '',
        consultation_fee: userData.doctorDetails?.consultation_fee || '',
        available_days: userData.doctorDetails?.available_days || '',
        available_hours: userData.doctorDetails?.available_hours || ''
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage({ type: '', text: '' });

    try {
      await usersAPI.updateProfile(formData);
      
      // Fetch updated profile
      const response = await authAPI.getProfile();
      updateUser(response.data.user);
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error updating profile' 
      });
    }

    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2>My Profile</h2>
      <p className="text-muted">Update your profile information</p>

      {message.text && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`}>
          {message.text}
        </div>
      )}

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <h5 className="mb-3">Basic Information</h5>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="full_name" className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={user?.email}
                  disabled
                />
                <small className="text-muted">Email cannot be changed</small>
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="phone" className="form-label">Phone</label>
                <input
                  type="tel"
                  className="form-control"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="date_of_birth" className="form-label">Date of Birth</label>
                <input
                  type="date"
                  className="form-control"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="gender" className="form-label">Gender</label>
                <select
                  className="form-control"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="address" className="form-label">Address</label>
                <input
                  type="text"
                  className="form-control"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Patient Specific Fields */}
            {isPatient && (
              <>
                <h5 className="mb-3 mt-4">Patient Information</h5>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="blood_group" className="form-label">Blood Group</label>
                    <input
                      type="text"
                      className="form-control"
                      name="blood_group"
                      value={formData.blood_group}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="allergies" className="form-label">Allergies</label>
                    <input
                      type="text"
                      className="form-control"
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-12 mb-3">
                    <label htmlFor="chronic_conditions" className="form-label">Chronic Conditions</label>
                    <textarea
                      className="form-control"
                      name="chronic_conditions"
                      value={formData.chronic_conditions}
                      onChange={handleChange}
                      rows="2"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="emergency_contact" className="form-label">Emergency Contact</label>
                    <input
                      type="text"
                      className="form-control"
                      name="emergency_contact"
                      value={formData.emergency_contact}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="emergency_phone" className="form-label">Emergency Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      name="emergency_phone"
                      value={formData.emergency_phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Doctor Specific Fields */}
            {isDoctor && (
              <>
                <h5 className="mb-3 mt-4">Doctor Information</h5>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="specialization" className="form-label">Specialization</label>
                    <input
                      type="text"
                      className="form-control"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="qualification" className="form-label">Qualification</label>
                    <input
                      type="text"
                      className="form-control"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="experience_years" className="form-label">Years of Experience</label>
                    <input
                      type="number"
                      className="form-control"
                      name="experience_years"
                      value={formData.experience_years}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="consultation_fee" className="form-label">Consultation Fee</label>
                    <input
                      type="number"
                      className="form-control"
                      name="consultation_fee"
                      value={formData.consultation_fee}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="available_days" className="form-label">Available Days</label>
                    <input
                      type="text"
                      className="form-control"
                      name="available_days"
                      value={formData.available_days}
                      onChange={handleChange}
                      placeholder="e.g., Mon,Wed,Fri"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="available_hours" className="form-label">Available Hours</label>
                    <input
                      type="text"
                      className="form-control"
                      name="available_hours"
                      value={formData.available_hours}
                      onChange={handleChange}
                      placeholder="e.g., 9:00-17:00"
                    />
                  </div>
                </div>
              </>
            )}

            <button 
              type="submit" 
              className="btn btn-primary mt-3"
              disabled={updating}
            >
              {updating ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
