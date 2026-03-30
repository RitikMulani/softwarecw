import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js';
import { useAuth } from '../context/AuthContext';
import TurtleAvatar from '../components/TurtleAvatar/TurtleAvatar';
import { authAPI, usersAPI, sharingAPI } from '../services/api';
import api from '../services/api';
import './Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('dashboard');
  const [profileData, setProfileData] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showHeartRateDetails, setShowHeartRateDetails] = useState(false);
  const [showBloodPressureDetails, setShowBloodPressureDetails] = useState(false);
  const [showO2Details, setShowO2Details] = useState(false);
  const [showStepsDetails, setShowStepsDetails] = useState(false);
  const [heartRateData, setHeartRateData] = useState([72, 75, 71, 73, 70, 72, 74, 73, 71, 72, 75, 73, 72, 71, 73, 72, 74, 73, 72, 71]);
  const [bloodPressureData] = useState([120, 118, 122, 119, 121, 120, 118, 120, 119, 121, 120, 122, 119, 120, 121, 119, 120, 118, 121, 120]);
  const [o2Data] = useState([98, 97, 98, 99, 98, 97, 98, 98, 99, 97, 98, 98, 97, 99, 98, 97, 98, 99, 98, 97]);
  const [stepsData] = useState([100, 500, 1200, 2100, 3400, 4200, 5100, 5900, 6800, 7200, 7800, 8200, 8500]);
  const [hrvData] = useState([55, 58, 54, 56, 59, 57, 55, 58, 56, 59, 57, 55, 58, 56, 59, 57, 56, 58, 57, 55]);
  const [accessRequests, setAccessRequests] = useState([]);
  const [connectedProviders, setConnectedProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [biometricAlerts, setBiometricAlerts] = useState([
    {
      id: 1,
      type: 'anomaly',
      metric: 'Heart Rate',
      reading: 48,
      status: 'Low',
      message: 'Your heart rate is unusually low (48 bpm). This is lower than your typical range.',
      timestamp: new Date(Date.now() - 3600000),
      severity: 'warning'
    },
    {
      id: 2,
      type: 'anomaly',
      metric: 'SpO2',
      reading: 94,
      status: 'Low',
      message: 'Your oxygen saturation is lower than normal (94%). Normal range is 95-100%.',
      timestamp: new Date(Date.now() - 7200000),
      severity: 'warning'
    },
    {
      id: 3,
      type: 'alert',
      metric: 'Heart Rate',
      reading: 94,
      status: 'High',
      message: 'Your heart rate is elevated (194 bpm). Consider relaxing or consulting a doctor if this persists.',
      timestamp: new Date(Date.now() - 7200000),
      severity: 'warning'
    }
  ]);
  
  const [leaderboard, setLeaderboard] = useState([]);

  const [userStats] = useState({
    monthlySteps: 245000,
    monthlyStepsAverage: 220000,
    weeklyStress: 42,
    weeklyStressAverage: 48
  });

  const [pointsLeaderboard, setPointsLeaderboard] = useState([]);

  const heartRate = 72;
  const steps = 8500;
  const stressScore = 45;
  const bloodPressure = '120/80';
  const o2Level = 98;
  const hrv = 57;
  const stressLevel = stressScore < 30 ? 'Low' : stressScore < 60 ? 'Moderate' : 'High';
  const stressColor = stressScore < 30 ? '#4CAF50' : stressScore < 60 ? '#FFC107' : '#F44336';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleEmergencyCall = () => {
    alert('Emergency services have been notified! Help is on the way.\n\nEmergency Contact: (911)\nYour location has been shared.');
    setShowEmergencyModal(false);
  };

  const handleExportBiometrics = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 15;

    // Header with gradient background color
    doc.setFillColor(102, 126, 234);
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont(undefined, 'bold');
    doc.text('🐢 TurtleHealth', pageWidth / 2, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('Biometric Health Summary Report', pageWidth / 2, 25, { align: 'center' });

    // Reset to black text and add date
    doc.setTextColor(0, 0, 0);
    yPosition = 45;

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Report Date: ${today}`, 15, yPosition);
    yPosition += 8;
    doc.text(`Patient: ${user?.name || 'User'}`, 15, yPosition);
    yPosition += 8;
    doc.text(`Health ID: ${user?.id || 'N/A'}`, 15, yPosition);
    yPosition += 15;

    // Section: Current Metrics
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(102, 126, 234);
    doc.text('📊 CURRENT METRICS', 15, yPosition);
    yPosition += 10;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');

    const metrics = [
      { label: '❤️  Heart Rate', value: `${heartRate} bpm`, color: [108, 99, 255] },
      { label: '🩸 Blood Pressure', value: `${bloodPressure} mmHg`, color: [233, 30, 99] },
      { label: '💨 Oxygen Level (SpO2)', value: `${o2Level}%`, color: [76, 175, 80] },
      { label: '👟 Daily Steps', value: `${steps}`, color: [255, 152, 0] },
      { label: '💓 HRV', value: `${hrv} ms`, color: [156, 39, 176] },
      { label: '😰 Stress Level', value: `${stressLevel} (Score: ${stressScore})`, color: [244, 67, 54] }
    ];

    metrics.forEach(metric => {
      doc.setFillColor(...metric.color);
      doc.rect(15, yPosition - 4, 180, 7, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont(undefined, 'bold');
      doc.text(metric.label, 18, yPosition + 1);
      
      doc.setFont(undefined, 'normal');
      doc.text(metric.value, 150, yPosition + 1, { align: 'right' });
      
      yPosition += 10;
      doc.setTextColor(0, 0, 0);
    });

    yPosition += 5;

    // Section: Weekly Averages
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(102, 126, 234);
    doc.text('📈 WEEKLY AVERAGES', 15, yPosition);
    yPosition += 10;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');

    const weeklyData = [
      `Avg Heart Rate: ${Math.round(heartRateData.reduce((a, b) => a + b) / heartRateData.length)} bpm`,
      `Avg Blood Pressure: ${Math.round(bloodPressureData.reduce((a, b) => a + b) / bloodPressureData.length)}/80 mmHg`,
      `Avg SpO2: ${Math.round(o2Data.reduce((a, b) => a + b) / o2Data.length)}%`,
      `Avg HRV: ${Math.round(hrvData.reduce((a, b) => a + b) / hrvData.length)} ms`
    ];

    weeklyData.forEach(item => {
      doc.text(`• ${item}`, 21, yPosition);
      yPosition += 7;
    });

    yPosition += 5;

    // Section: Monthly Stats
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(102, 126, 234);
    doc.text('📋 MONTHLY STATISTICS', 15, yPosition);
    yPosition += 10;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');

    const monthlyStats = [
      `Total Steps (Est.): ${Math.round(steps * 30).toLocaleString()}`,
      `Average Stress: ${stressScore}`,
      `Activity Level: ${steps > 10000 ? 'Excellent' : steps > 7000 ? 'Good' : 'Fair'}`
    ];

    monthlyStats.forEach(item => {
      doc.text(`• ${item}`, 21, yPosition);
      yPosition += 7;
    });

    yPosition += 10;

    // Section: Health Status
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(102, 126, 234);
    doc.text('✅ HEALTH STATUS', 15, yPosition);
    yPosition += 10;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');

    const healthStatus = [
      { status: `Heart Rate: ${heartRate > 100 ? '⚠️  Elevated' : '✓ Normal'}`, ok: heartRate <= 100 },
      { status: `Blood Pressure: ${parseInt(bloodPressure) > 140 ? '⚠️  High' : '✓ Normal'}`, ok: parseInt(bloodPressure) <= 140 },
      { status: `Oxygen Level: ${o2Level < 95 ? '⚠️  Low' : '✓ Normal'}`, ok: o2Level >= 95 },
      { status: `Stress Levels: ${stressScore > 70 ? '⚠️  High' : stressScore > 50 ? '⚡ Moderate' : '✓ Good'}`, ok: stressScore <= 70 }
    ];

    healthStatus.forEach(item => {
      const color = item.ok ? [76, 175, 80] : [244, 67, 54];
      doc.setTextColor(...color);
      doc.text(`• ${item.status}`, 21, yPosition);
      yPosition += 7;
      doc.setTextColor(0, 0, 0);
    });

    yPosition += 10;

    // Section: Recommendations
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(102, 126, 234);
    doc.text('💡 WELLNESS RECOMMENDATIONS', 15, yPosition);
    yPosition += 10;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');

    const recommendations = [];
    if (heartRate > 100) recommendations.push('Try to relax and practice deep breathing exercises');
    if (stressScore > 60) recommendations.push('Consider meditation or yoga to reduce stress');
    if (steps < 7000) recommendations.push('Aim for 10,000 steps daily - try a short walk');
    if (o2Level < 96) recommendations.push('Ensure good ventilation and breathing exercises');
    recommendations.push('Maintain consistent sleep schedule (7-9 hours)');
    recommendations.push('Stay hydrated throughout the day');
    recommendations.push('Regular physical activity helps with overall wellness');

    recommendations.forEach(rec => {
      const lines = doc.splitTextToSize(`• ${rec}`, 170);
      lines.forEach(line => {
        doc.text(line, 21, yPosition);
        yPosition += 6;
      });
    });

    yPosition += 10;

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated: ${new Date().toLocaleString()} | TurtleHealth Dashboard`, pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Download PDF
    doc.save(`Biometric_Summary_${new Date().toISOString().split('T')[0]}.pdf`);
    alert('✅ Biometric summary exported as PDF successfully!');
  };

  // Heart Rate Export
  const exportHeartRate = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 15;

    // Header
    doc.setFillColor(108, 99, 255);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont(undefined, 'bold');
    doc.text('❤️ Heart Rate Report', pageWidth / 2, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('Detailed Analysis & Trends', pageWidth / 2, 25, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    yPosition = 50;

    // Current Reading
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(108, 99, 255);
    doc.text('Current Reading', 15, yPosition);
    yPosition += 10;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Current Heart Rate: ${Math.round(heartRateData[heartRateData.length - 1])} bpm`, 21, yPosition);
    yPosition += 6;
    doc.text(`Time: ${new Date().toLocaleTimeString()}`, 21, yPosition);
    yPosition += 6;
    const hrStatus = getHeartRateStatus(Math.round(heartRateData[heartRateData.length - 1]));
    doc.text(`Status: ${hrStatus.status}`, 21, yPosition);
    yPosition += 12;

    // Statistics
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(108, 99, 255);
    doc.text('Statistics', 15, yPosition);
    yPosition += 8;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    
    const avgHR = Math.round(heartRateData.reduce((a, b) => a + b) / heartRateData.length);
    const maxHR = Math.max(...heartRateData);
    const minHR = Math.min(...heartRateData);

    doc.text(`Weekly Average: ${avgHR} bpm`, 21, yPosition);
    yPosition += 6;
    doc.text(`Highest Reading: ${maxHR} bpm`, 21, yPosition);
    yPosition += 6;
    doc.text(`Lowest Reading: ${minHR} bpm`, 21, yPosition);
    yPosition += 6;
    doc.text(`Variation: ${maxHR - minHR} bpm`, 21, yPosition);
    yPosition += 12;

    // Detailed Data
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(108, 99, 255);
    doc.text('Daily Data', 15, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    
    heartRateData.forEach((reading, idx) => {
      doc.text(`Day ${idx + 1}: ${Math.round(reading)} bpm`, 21, yPosition);
      yPosition += 5;
      if (yPosition > 240) {
        doc.addPage();
        yPosition = 20;
      }
    });

    yPosition += 5;

    // Normal Range Reference
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFillColor(227, 242, 253);
    doc.rect(15, yPosition - 4, 180, 25, 'F');
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(21, 101, 192);
    doc.text('📚 Reference Information', 18, yPosition + 2);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    yPosition += 8;
    doc.text('Normal Resting Heart Rate: 60-100 bpm', 21, yPosition);
    yPosition += 5;
    doc.text('Elevated: 100-120 bpm | High: >120 bpm', 21, yPosition);
    yPosition += 5;
    doc.text('Lower is generally better for resting heart rate', 21, yPosition);

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

    doc.save(`Heart_Rate_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    alert('✅ Heart Rate report exported!');
  };

  // Blood Pressure Export
  const exportBloodPressure = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 15;

    doc.setFillColor(233, 30, 99);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont(undefined, 'bold');
    doc.text('🩸 Blood Pressure Report', pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('Detailed Analysis & Trends', pageWidth / 2, 25, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    yPosition = 50;

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(233, 30, 99);
    doc.text('Current Reading', 15, yPosition);
    yPosition += 10;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Current BP: ${bloodPressure} mmHg`, 21, yPosition);
    yPosition += 6;
    doc.text(`Time: ${new Date().toLocaleTimeString()}`, 21, yPosition);
    yPosition += 6;
    const bpStatus = getBloodPressureStatus(bloodPressure);
    doc.text(`Status: ${bpStatus.status}`, 21, yPosition);
    yPosition += 12;

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(233, 30, 99);
    doc.text('Statistics', 15, yPosition);
    yPosition += 8;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    const avgBP = Math.round(bloodPressureData.reduce((a, b) => a + b) / bloodPressureData.length);
    const maxBP = Math.max(...bloodPressureData);
    const minBP = Math.min(...bloodPressureData);

    doc.text(`Weekly Average: ${avgBP}/80 mmHg`, 21, yPosition);
    yPosition += 6;
    doc.text(`Highest: ${maxBP}/80 mmHg`, 21, yPosition);
    yPosition += 6;
    doc.text(`Lowest: ${minBP}/80 mmHg`, 21, yPosition);
    yPosition += 6;
    doc.text(`Variation: ${maxBP - minBP} mmHg`, 21, yPosition);
    yPosition += 12;

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(233, 30, 99);
    doc.text('Daily Data', 15, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    
    bloodPressureData.forEach((reading, idx) => {
      doc.text(`Day ${idx + 1}: ${Math.round(reading)}/80 mmHg`, 21, yPosition);
      yPosition += 5;
      if (yPosition > 240) {
        doc.addPage();
        yPosition = 20;
      }
    });

    yPosition += 10;
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFillColor(255, 235, 238);
    doc.rect(15, yPosition - 4, 180, 30, 'F');
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(194, 24, 91);
    doc.text('📚 Reference Information', 18, yPosition + 2);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    yPosition += 8;
    doc.text('Normal: Less than 120/80 mmHg', 21, yPosition);
    yPosition += 5;
    doc.text('Elevated: 120/80 - 129/<80 | High: ≥130/80', 21, yPosition);
    yPosition += 5;
    doc.text('Systolic (top) measures pressure when heart beats', 21, yPosition);
    yPosition += 5;
    doc.text('Diastolic (bottom) measures pressure at rest', 21, yPosition);

    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

    doc.save(`Blood_Pressure_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    alert('✅ Blood Pressure report exported!');
  };

  // Steps Export
  const exportSteps = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 15;

    doc.setFillColor(255, 152, 0);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont(undefined, 'bold');
    doc.text('👟 Daily Steps Report', pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('Activity & Movement Analysis', pageWidth / 2, 25, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    yPosition = 50;

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(255, 152, 0);
    doc.text('Today\'s Activity', 15, yPosition);
    yPosition += 10;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Total Steps: ${steps} steps`, 21, yPosition);
    yPosition += 6;
    doc.text(`Goal: 10,000 steps`, 21, yPosition);
    yPosition += 6;
    doc.text(`Progress: ${Math.round((steps / 10000) * 100)}%`, 21, yPosition);
    yPosition += 12;

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(255, 152, 0);
    doc.text('Statistics', 15, yPosition);
    yPosition += 8;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    const avgSteps = Math.round(stepsData.reduce((a, b) => a + b) / stepsData.length);
    const maxSteps = Math.max(...stepsData);
    const totalSteps = stepsData.reduce((a, b) => a + b);

    doc.text(`Daily Average: ${avgSteps} steps`, 21, yPosition);
    yPosition += 6;
    doc.text(`Best Day: ${maxSteps} steps`, 21, yPosition);
    yPosition += 6;
    doc.text(`Total This Week: ${totalSteps.toLocaleString()} steps`, 21, yPosition);
    yPosition += 6;
    doc.text(`Estimated Monthly: ${Math.round(steps * 30).toLocaleString()} steps`, 21, yPosition);
    yPosition += 12;

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(255, 152, 0);
    doc.text('Daily Breakdown', 15, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    
    stepsData.forEach((steps, idx) => {
      const status = steps >= 10000 ? '✓' : steps >= 7000 ? '→' : '!';
      doc.text(`Day ${idx + 1}: ${Math.round(steps)} steps ${status}`, 21, yPosition);
      yPosition += 5;
      if (yPosition > 240) {
        doc.addPage();
        yPosition = 20;
      }
    });

    yPosition += 10;
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFillColor(255, 243, 224);
    doc.rect(15, yPosition - 4, 180, 25, 'F');
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(230, 124, 16);
    doc.text('📚 Activity Recommendations', 18, yPosition + 2);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    yPosition += 8;
    doc.text('Aim for 10,000 steps daily • Light: <5,000 steps', 21, yPosition);
    yPosition += 5;
    doc.text('Moderate: 5,000-7,499 • Active: 7,500-10,000', 21, yPosition);

    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

    doc.save(`Steps_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    alert('✅ Steps report exported!');
  };

  // Oxygen Level Export
  const exportOxygen = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 15;

    doc.setFillColor(76, 175, 80);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont(undefined, 'bold');
    doc.text('💨 Oxygen Level Report', pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('SpO2 Analysis & Respiratory Health', pageWidth / 2, 25, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    yPosition = 50;

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(76, 175, 80);
    doc.text('Current Reading', 15, yPosition);
    yPosition += 10;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Current SpO2: ${o2Level}%`, 21, yPosition);
    yPosition += 6;
    doc.text(`Time: ${new Date().toLocaleTimeString()}`, 21, yPosition);
    yPosition += 6;
    doc.text(`Status: ${o2Level >= 95 ? 'Normal' : 'Low'}`, 21, yPosition);
    yPosition += 12;

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(76, 175, 80);
    doc.text('Statistics', 15, yPosition);
    yPosition += 8;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    const avgO2 = Math.round(o2Data.reduce((a, b) => a + b) / o2Data.length);

    doc.text(`Weekly Average: ${avgO2}%`, 21, yPosition);
    yPosition += 6;
    doc.text(`Highest: ${Math.max(...o2Data)}%`, 21, yPosition);
    yPosition += 6;
    doc.text(`Lowest: ${Math.min(...o2Data)}%`, 21, yPosition);
    yPosition += 12;

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(76, 175, 80);
    doc.text('Daily SpO2 Readings', 15, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    
    o2Data.forEach((reading, idx) => {
      doc.text(`Day ${idx + 1}: ${Math.round(reading)}%`, 21, yPosition);
      yPosition += 5;
      if (yPosition > 240) {
        doc.addPage();
        yPosition = 20;
      }
    });

    yPosition += 10;
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFillColor(232, 245, 233);
    doc.rect(15, yPosition - 4, 180, 30, 'F');
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(27, 94, 32);
    doc.text('📚 Reference Information', 18, yPosition + 2);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    yPosition += 8;
    doc.text('Normal SpO2 (at sea level): 95-100%', 21, yPosition);
    yPosition += 5;
    doc.text('Acceptable: 90-94% | Low: <90%', 21, yPosition);
    yPosition += 5;
    doc.text('SpO2 measures oxygen saturation in blood', 21, yPosition);

    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

    doc.save(`Oxygen_Level_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    alert('✅ Oxygen Level report exported!');
  };

  // HRV Export
  const exportHRV = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 15;

    doc.setFillColor(156, 39, 176);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont(undefined, 'bold');
    doc.text('💓 HRV Report', pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('Heart Rate Variability Analysis', pageWidth / 2, 25, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    yPosition = 50;

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(156, 39, 176);
    doc.text('Current HRV', 15, yPosition);
    yPosition += 10;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Current HRV: ${hrv} ms`, 21, yPosition);
    yPosition += 6;
    doc.text(`Time: ${new Date().toLocaleTimeString()}`, 21, yPosition);
    yPosition += 6;
    doc.text(`Status: ${hrv > 50 ? 'Good Recovery' : 'Moderate'}`, 21, yPosition);
    yPosition += 12;

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(156, 39, 176);
    doc.text('Statistics', 15, yPosition);
    yPosition += 8;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    const avgHRV = Math.round(hrvData.reduce((a, b) => a + b) / hrvData.length);
    const maxHRV = Math.max(...hrvData);
    const minHRV = Math.min(...hrvData);

    doc.text(`Weekly Average: ${avgHRV} ms`, 21, yPosition);
    yPosition += 6;
    doc.text(`Highest: ${maxHRV} ms`, 21, yPosition);
    yPosition += 6;
    doc.text(`Lowest: ${minHRV} ms`, 21, yPosition);
    yPosition += 12;

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(156, 39, 176);
    doc.text('Daily HRV Data', 15, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    
    hrvData.forEach((hrv, idx) => {
      doc.text(`Day ${idx + 1}: ${Math.round(hrv)} ms`, 21, yPosition);
      yPosition += 5;
      if (yPosition > 240) {
        doc.addPage();
        yPosition = 20;
      }
    });

    yPosition += 10;
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFillColor(243, 229, 245);
    doc.rect(15, yPosition - 4, 180, 35, 'F');
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(106, 27, 154);
    doc.text('📚 What is HRV?', 18, yPosition + 2);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    yPosition += 8;
    doc.text('HRV measures variation between heartbeats', 21, yPosition);
    yPosition += 5;
    doc.text('Higher HRV = Better recovery & cardiovascular fitness', 21, yPosition);
    yPosition += 5;
    doc.text('Lower HRV = May indicate stress or fatigue', 21, yPosition);
    yPosition += 5;
    doc.text('Optimal range varies by age and fitness level', 21, yPosition);

    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

    doc.save(`HRV_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    alert('✅ HRV report exported!');
  };

  // Stress Level Export
  const exportStress = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 15;

    doc.setFillColor(244, 67, 54);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont(undefined, 'bold');
    doc.text('😰 Stress Level Report', pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('Mental & Physical Stress Analysis', pageWidth / 2, 25, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    yPosition = 50;

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(244, 67, 54);
    doc.text('Current Stress Level', 15, yPosition);
    yPosition += 10;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Stress Score: ${stressScore}/100`, 21, yPosition);
    yPosition += 6;
    doc.text(`Level: ${stressLevel}`, 21, yPosition);
    yPosition += 6;
    doc.text(`Status: ${stressScore > 70 ? '⚠️  Critical' : stressScore > 50 ? '⚡ Moderate' : '✓ Good'}`, 21, yPosition);
    yPosition += 12;

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(244, 67, 54);
    doc.text('Wellness Recommendations', 15, yPosition);
    yPosition += 8;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');

    const stressRecs = [
      '✓ Practice deep breathing exercises (5-10 min daily)',
      '✓ Meditate to reduce mental stress',
      '✓ Get 7-9 hours of quality sleep',
      '✓ Exercise regularly (30 min minimum)',
      '✓ Limit caffeine and stimulants',
      '✓ Spend time in nature or outdoors',
      '✓ Maintain healthy work-life balance',
      '✓ Talk to friends and family',
      '✓ Practice yoga or stretching'
    ];

    stressRecs.forEach(rec => {
      doc.text(rec, 21, yPosition);
      yPosition += 6;
    });

    yPosition += 10;
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFillColor(255, 235, 238);
    doc.rect(15, yPosition - 4, 180, 35, 'F');
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(194, 24, 91);
    doc.text('📚 Stress Level Guide', 18, yPosition + 2);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    yPosition += 8;
    doc.text('0-30: Excellent - You\'re in great shape mentally', 21, yPosition);
    yPosition += 5;
    doc.text('31-50: Good - Continue healthy habits', 21, yPosition);
    yPosition += 5;
    doc.text('51-70: Moderate - Time for more self-care', 21, yPosition);
    yPosition += 5;
    doc.text('71-100: High - Please seek stress reduction methods', 21, yPosition);

    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

    doc.save(`Stress_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    alert('✅ Stress report exported!');
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setHeartRateData(prev => {
        const newData = [...prev.slice(1), 70 + Math.random() * 10];
        return newData;
      });
    }, 3000);

    // Fetch access requests
    fetchAccessRequests();

    // Fetch connected providers
    fetchConnectedProviders();
    
    // Fetch profile data
    fetchProfileData();

    // Fetch leaderboard data
    fetchLeaderboard();

    // Fetch points leaderboard data
    fetchPointsLeaderboard();

    return () => clearInterval(interval);
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await authAPI.getProfile();
      setProfileData(response.data.user);
    } catch (error) {
      // Profile fetch failed - using default empty profile
    }
  };

  const handleEditProfile = () => {
    setEditFormData({
      full_name: profileData?.full_name || '',
      phone: profileData?.phone || '',
      date_of_birth: profileData?.date_of_birth ? profileData.date_of_birth.split('T')[0] : '',
      gender: profileData?.gender || '',
      address: profileData?.address || '',
      blood_group: profileData?.patientDetails?.blood_group || '',
      allergies: profileData?.patientDetails?.allergies || '',
      chronic_conditions: profileData?.patientDetails?.chronic_conditions || '',
      emergency_contact: profileData?.patientDetails?.emergency_contact || '',
      emergency_phone: profileData?.patientDetails?.emergency_phone || '',
    });
    setIsEditingProfile(true);
  };

  const handleEditFormChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      await usersAPI.updateProfile(editFormData);
      await fetchProfileData();
      setIsEditingProfile(false);
    } catch (error) {
      alert('Error saving profile: ' + (error.response?.data?.message || error.message));
    }
    setIsSavingProfile(false);
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
  };

  const fetchAccessRequests = async () => {
    try {
      const response = await api.get('/sharing/requests');
      const pending = response.data.requests?.filter(req => req.status === 'pending') || [];
      setAccessRequests(pending);
    } catch (error) {
      // Access requests unavailable
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get('/leaderboard');
      setLeaderboard(response.data.leaderboard || []);
    } catch (error) {
      // Leaderboard unavailable - will show empty
    }
  };

  const fetchPointsLeaderboard = async () => {
    try {
      const response = await api.get('/points');
      setPointsLeaderboard(response.data.leaderboard || []);
    } catch (error) {
      // Points leaderboard unavailable - will show empty
    }
  };

  const handleApproveRequest = async (requestId) => {
    setLoading(true);
    try {
      await api.post(`/sharing/${requestId}/accept`);
      alert('Access request approved!');
      fetchAccessRequests();
    } catch (error) {
      alert('Failed to approve request');
    }
    setLoading(false);
  };

  const handleRejectRequest = async (requestId) => {
    setLoading(true);
    try {
      await api.post(`/sharing/${requestId}/reject`);
      alert('Request rejected.');
      fetchAccessRequests();
    } catch (error) {
      alert('Failed to reject request');
    }
    setLoading(false);
  };

  const fetchConnectedProviders = async () => {
    try {
      const response = await sharingAPI.getMyProviders();
      setConnectedProviders(response.data.providers || []);
    } catch (error) {
      console.error('Error fetching connected providers:', error);
    }
  };

  const handleDisconnectProvider = async (sharingId, providerName) => {
    if (window.confirm(`Are you sure you want to remove access for ${providerName}? They will no longer be able to view your health data.`)) {
      try {
        await sharingAPI.disconnectProvider(sharingId);
        alert('Healthcare provider access removed successfully!');
        fetchConnectedProviders();
      } catch (error) {
        alert('Failed to remove provider access: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const getTrendArrow = (trend) => {
    if (trend === 'up') return <span style={{ color: '#4CAF50' }}>↑</span>;
    if (trend === 'down') return <span style={{ color: '#F44336' }}>↓</span>;
    return <span style={{ color: '#9E9E9E' }}>→</span>;
  };

  const calculateUserPoints = () => {
    const stepBonus = Math.floor((userStats.monthlySteps - userStats.monthlyStepsAverage) / 1000);
    const stressBonus = Math.floor((userStats.weeklyStressAverage - userStats.weeklyStress) * 2);
    return Math.max(0, stepBonus + stressBonus);
  };

  const userPoints = calculateUserPoints();

  const getHeartRateStatus = (hr) => {
    if (hr < 60) return { status: 'Low', color: '#2196F3', emoji: '📉' };
    if (hr > 100) return { status: 'High', color: '#F44336', emoji: '📈' };
    return { status: 'Normal', color: '#4CAF50', emoji: '✓' };
  };

  const getBloodPressureStatus = (bp) => {
    // Parse "120/80" format
    const [sys, dia] = bp.split('/').map(Number);
    if (sys < 90 || dia < 60) return { status: 'Low', color: '#2196F3', emoji: '📉' };
    if (sys >= 140 || dia >= 90) return { status: 'High', color: '#F44336', emoji: '📈' };
    return { status: 'Normal', color: '#4CAF50', emoji: '✓' };
  };

  const getO2Status = (o2) => {
    if (o2 < 95) return { status: 'Low', color: '#F44336', emoji: '⚠️' };
    if (o2 >= 95 && o2 <= 100) return { status: 'Normal', color: '#4CAF50', emoji: '✓' };
    return { status: 'Normal', color: '#4CAF50', emoji: '✓' };
  };

  const getStepsStatus = (steps, goal = 10000) => {
    const percentage = (steps / goal) * 100;
    if (percentage < 50) return { status: 'Keep Going', color: '#FF9800', emoji: '🚶' };
    if (percentage < 100) return { status: 'Almost There', color: '#FFC107', emoji: '💪' };
    return { status: 'Goal Reached!', color: '#4CAF50', emoji: '🎉' };
  };

  const chartData = {
    labels: Array(heartRateData.length).fill(''),
    datasets: [
      {
        data: heartRateData,
        fill: true,
        backgroundColor: 'rgba(99, 132, 255, 0.1)',
        borderColor: 'rgba(99, 132, 255, 1)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: { display: false },
      y: { display: false },
    },
  };

  const createChartData = (data, color) => ({
    labels: Array(data.length).fill(''),
    datasets: [{
      data: data,
      fill: true,
      backgroundColor: `${color}20`,
      borderColor: color,
      borderWidth: 2,
      tension: 0.4,
      pointRadius: 0,
    }],
  });

  const stepsPercent = Math.min((steps / 10000) * 100, 100);

  const renderProfileView = () => {
    if (isEditingProfile) {
      // Edit mode
      return (
        <div className="dashboard-card">
          <h3 className="card-title mb-4">👤 Edit Profile</h3>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                name="full_name"
                value={editFormData.full_name}
                onChange={handleEditFormChange}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                className="form-control"
                name="phone"
                value={editFormData.phone}
                onChange={handleEditFormChange}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                className="form-control"
                name="date_of_birth"
                value={editFormData.date_of_birth}
                onChange={handleEditFormChange}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Gender</label>
              <select
                className="form-control"
                name="gender"
                value={editFormData.gender}
                onChange={handleEditFormChange}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Address</label>
              <input
                type="text"
                className="form-control"
                name="address"
                value={editFormData.address}
                onChange={handleEditFormChange}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Blood Type</label>
              <input
                type="text"
                className="form-control"
                name="blood_group"
                value={editFormData.blood_group}
                onChange={handleEditFormChange}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Allergies</label>
              <input
                type="text"
                className="form-control"
                name="allergies"
                value={editFormData.allergies}
                onChange={handleEditFormChange}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Chronic Conditions</label>
              <textarea
                className="form-control"
                name="chronic_conditions"
                value={editFormData.chronic_conditions}
                onChange={handleEditFormChange}
                rows="2"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Emergency Contact</label>
              <input
                type="text"
                className="form-control"
                name="emergency_contact"
                value={editFormData.emergency_contact}
                onChange={handleEditFormChange}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Emergency Phone</label>
              <input
                type="tel"
                className="form-control"
                name="emergency_phone"
                value={editFormData.emergency_phone}
                onChange={handleEditFormChange}
              />
            </div>
          </div>
          <div className="mt-3">
            <button 
              className="btn btn-primary me-2"
              onClick={handleSaveProfile}
              disabled={isSavingProfile}
            >
              {isSavingProfile ? 'Saving...' : '💾 Save'}
            </button>
            <button 
              className="btn btn-secondary"
              onClick={handleCancelEdit}
              disabled={isSavingProfile}
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    // View mode
    return (
      <div className="dashboard-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h3 className="card-title" style={{margin: 0}}>👤 Profile</h3>
          <button 
            className="btn btn-outline-primary btn-sm"
            onClick={handleEditProfile}
          >
            ✏️ Edit
          </button>
        </div>
        <div style={{ display: 'flex', gap: '3rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontWeight: '600', color: '#666', display: 'block', marginBottom: '0.5rem' }}>Name</label>
              <p style={{ fontSize: '1.1rem', margin: 0 }}>{profileData?.full_name || 'Not provided'}</p>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontWeight: '600', color: '#666', display: 'block', marginBottom: '0.5rem' }}>Email</label>
              <p style={{ fontSize: '1.1rem', margin: 0 }}>{profileData?.email || 'user@turtlehealth.com'}</p>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontWeight: '600', color: '#666', display: 'block', marginBottom: '0.5rem' }}>Date of Birth</label>
              <p style={{ fontSize: '1.1rem', margin: 0 }}>
                {profileData?.date_of_birth ? new Date(profileData.date_of_birth).toLocaleDateString() : 'Not provided'}
              </p>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontWeight: '600', color: '#666', display: 'block', marginBottom: '0.5rem' }}>Phone</label>
              <p style={{ fontSize: '1.1rem', margin: 0 }}>{profileData?.phone || 'Not provided'}</p>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontWeight: '600', color: '#666', display: 'block', marginBottom: '0.5rem' }}>Blood Type</label>
              <p style={{ fontSize: '1.1rem', margin: 0 }}>{profileData?.patientDetails?.blood_group || 'Not provided'}</p>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontWeight: '600', color: '#666', display: 'block', marginBottom: '0.5rem' }}>Allergies</label>
              <p style={{ fontSize: '1.1rem', margin: 0 }}>{profileData?.patientDetails?.allergies || 'None' }</p>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontWeight: '600', color: '#666', display: 'block', marginBottom: '0.5rem' }}>Emergency Contact</label>
              <p style={{ fontSize: '1.1rem', margin: 0 }}>{profileData?.patientDetails?.emergency_contact ? `${profileData.patientDetails.emergency_contact} - ${profileData.patientDetails.emergency_phone}` : 'Not provided'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLeaderboardView = () => (
    <div className="dashboard-card">
      <h3 className="card-title mb-3">🏆 Leaderboard (Lowest Stress)</h3>
      {leaderboard.length === 0 ? (
        <p style={{ color: '#999', textAlign: 'center', padding: '2rem' }}>Loading leaderboard data...</p>
      ) : (
        leaderboard.map((entry) => (
          <div key={entry.rank} className="leaderboard-row">
            <span className="leaderboard-rank">#{entry.rank}</span>
            <span className="leaderboard-name">{entry.name}</span>
            <div className="leaderboard-divider"></div>
            <span className="leaderboard-stress">
              Stress: {entry.stress}
              <span style={{ marginLeft: '0.5rem' }}>{getTrendArrow(entry.trend)}</span>
            </span>
          </div>
        ))
      )}
    </div>
  );

  const renderPointsLeaderboardView = () => (
    <div>
      <div className="row mb-4">
        <div className="col-md-6 mb-4">
          <div className="dashboard-card">
            <h4 style={{ color: '#667eea', marginBottom: '1.5rem' }}>📈 Your Points</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ fontSize: '3rem' }}>💎</div>
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#667eea' }}>{profileData?.points || 0}</div>
                <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontSize: '0.95rem' }}>Points earned</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="dashboard-card">
            <h4 style={{ color: '#667eea', marginBottom: '1.5rem' }}>⭐ Your Progress</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#666' }}>Monthly Steps</span>
                  <span style={{ fontWeight: 'bold', color: '#667eea' }}>{userStats.monthlySteps.toLocaleString()} / {userStats.monthlyStepsAverage.toLocaleString()}</span>
                </div>
                <div style={{ background: '#e0e7ff', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
                  <div style={{ 
                    background: userStats.monthlySteps > userStats.monthlyStepsAverage ? 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)' : '#667eea',
                    height: '100%',
                    width: `${Math.min((userStats.monthlySteps / userStats.monthlyStepsAverage) * 100, 100)}%`,
                    transition: 'width 0.3s'
                  }}></div>
                </div>
                {userStats.monthlySteps > userStats.monthlyStepsAverage && (
                  <p style={{ margin: '0.5rem 0 0 0', color: '#27AE60', fontSize: '0.9rem', fontWeight: '500' }}>
                    +{Math.floor((userStats.monthlySteps - userStats.monthlyStepsAverage) / 1000)} points bonus ✓
                  </p>
                )}
              </div>
              
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#666' }}>Weekly Stress</span>
                  <span style={{ fontWeight: 'bold', color: '#667eea' }}>{userStats.weeklyStress} / {userStats.weeklyStressAverage}</span>
                </div>
                <div style={{ background: '#e0e7ff', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
                  <div style={{ 
                    background: userStats.weeklyStress < userStats.weeklyStressAverage ? 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)' : '#667eea',
                    height: '100%',
                    width: `${Math.max(100 - (userStats.weeklyStress / userStats.weeklyStressAverage) * 100, 0)}%`,
                    transition: 'width 0.3s'
                  }}></div>
                </div>
                {userStats.weeklyStress < userStats.weeklyStressAverage && (
                  <p style={{ margin: '0.5rem 0 0 0', color: '#27AE60', fontSize: '0.9rem', fontWeight: '500' }}>
                    +{Math.floor((userStats.weeklyStressAverage - userStats.weeklyStress) * 2)} points bonus ✓
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="dashboard-card">
            <h3 className="card-title mb-3">💎 Monthly Leaderboard</h3>
            <div style={{ overflowX: 'auto' }}>
              {pointsLeaderboard.length === 0 ? (
                <p style={{ color: '#999', textAlign: 'center', padding: '2rem' }}>Loading points leaderboard...</p>
              ) : (
                pointsLeaderboard.map((entry) => (
                <div 
                  key={entry.rank} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1.2rem',
                    marginBottom: '0.8rem',
                    background: entry.isTopThree ? 'linear-gradient(135deg, #fffde7 0%, #fff9c4 100%)' : '#f8f9fa',
                    borderRadius: '12px',
                    border: entry.isTopThree ? '2px solid #FFD700' : '1px solid #e0e0e0',
                    transition: 'all 0.3s'
                  }}
                >
                  <div style={{ 
                    width: '50px', 
                    height: '50px', 
                    borderRadius: '50%',
                    background: entry.isTopThree ? '#FFD700' : '#e0e0e0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                    color: entry.isTopThree ? '#333' : '#999',
                    marginRight: '1.5rem'
                  }}>
                    {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#333' }}>{entry.name}</span>
                      {entry.isTopThree && (
                        <span style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>
                          {entry.multiplier}x Points
                        </span>
                      )}
                    </div>
                    <p style={{ margin: 0, color: '#999', fontSize: '0.9rem' }}>
                      Rank #{entry.rank} • {entry.points} points
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#667eea' }}>
                      {entry.points}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#999' }}>pts</div>
                  </div>
                </div>
              ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMedicalView = () => {
    const patientDetails = profileData?.patientDetails || {};
    const isEditing = activeView === 'medical' && isEditingProfile;

    if (isEditing) {
      return (
        <div className="dashboard-card">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="card-title mb-0">💊 Medical Information</h3>
            <div>
              <button
                className="btn btn-primary btn-sm me-2"
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
              >
                {isSavingProfile ? 'Saving...' : '💾 Save'}
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleCancelEdit}
                disabled={isSavingProfile}
              >
                Cancel
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ color: '#667eea', marginBottom: '1rem' }}>Blood Type</h4>
            <input
              type="text"
              className="form-control"
              name="blood_group"
              value={editFormData.blood_group || ''}
              onChange={handleEditFormChange}
              placeholder="e.g., O+, A-, B+"
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ color: '#667eea', marginBottom: '1rem' }}>Chronic Conditions</h4>
            <textarea
              className="form-control"
              name="chronic_conditions"
              value={editFormData.chronic_conditions || ''}
              onChange={handleEditFormChange}
              rows="3"
              placeholder="List any chronic conditions (e.g., Hypertension, Diabetes)"
            />
          </div>

          <div>
            <h4 style={{ color: '#667eea', marginBottom: '1rem' }}>Allergies</h4>
            <textarea
              className="form-control"
              name="allergies"
              value={editFormData.allergies || ''}
              onChange={handleEditFormChange}
              rows="3"
              placeholder="List any allergies (e.g., Penicillin, Pollen)"
            />
          </div>
        </div>
      );
    }

    // View mode
    return (
      <div className="dashboard-card">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="card-title mb-0">💊 Medical Information</h3>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={handleEditProfile}
          >
            ✏️ Edit
          </button>
        </div>

        {!patientDetails.blood_group && !patientDetails.allergies && !patientDetails.chronic_conditions ? (
          <p style={{ color: '#999' }}>No medical information added yet. Click Edit to add your details.</p>
        ) : (
          <>
            {patientDetails.blood_group && (
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ color: '#667eea', marginBottom: '1rem' }}>Blood Type</h4>
                <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{patientDetails.blood_group}</p>
              </div>
            )}

            {patientDetails.chronic_conditions && (
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ color: '#667eea', marginBottom: '1rem' }}>Chronic Conditions</h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {patientDetails.chronic_conditions.split(',').map((condition, i) => (
                    <span
                      key={i}
                      style={{
                        background: '#e3f2fd',
                        color: '#1976d2',
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        fontSize: '0.9rem'
                      }}
                    >
                      {condition.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {patientDetails.allergies && (
              <div>
                <h4 style={{ color: '#667eea', marginBottom: '1rem' }}>Allergies</h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {patientDetails.allergies.split(',').map((allergy, i) => (
                    <span
                      key={i}
                      style={{
                        background: '#ffebee',
                        color: '#c62828',
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        fontSize: '0.9rem'
                      }}
                    >
                      {allergy.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderBiometricsView = () => (
    <>
      <div className="row mb-4">
        <div className="col-md-6 mb-4">
          <div className="dashboard-card" style={{ cursor: 'pointer' }} onClick={() => setShowHeartRateDetails(!showHeartRateDetails)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className="card-title mb-0">❤️ Heart Rate {showHeartRateDetails && '▼'}</h3>
              <button
                onClick={(e) => { e.stopPropagation(); exportHeartRate(); }}
                style={{
                  background: '#6C63FF',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#5548d6'}
                onMouseOut={(e) => e.target.style.background = '#6C63FF'}
              >
                📥 Export
              </button>
            </div>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <strong style={{ fontSize: '2.5rem', color: '#6C63FF' }}>{Math.round(heartRateData[heartRateData.length - 1])}</strong>
              <span style={{ fontSize: '1.2rem', color: '#666', marginLeft: '0.5rem' }}>bpm</span>
            </div>
            <div className="chart-container" style={{ height: '150px' }}>
              <Line data={createChartData(heartRateData, '#6C63FF')} options={chartOptions} />
            </div>

            {showHeartRateDetails && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px solid #e0e0e0' }}>
                <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#333' }}>📊 Heart Rate Analysis</h4>
                
                <div style={{ marginBottom: '1rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Today</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{getHeartRateStatus(Math.round(heartRateData[heartRateData.length - 1])).emoji}</span>
                    <span style={{ fontWeight: 'bold', color: getHeartRateStatus(Math.round(heartRateData[heartRateData.length - 1])).color }}>
                      {getHeartRateStatus(Math.round(heartRateData[heartRateData.length - 1])).status}
                    </span>
                    <span style={{ color: '#666' }}>({Math.round(heartRateData[heartRateData.length - 1])} bpm)</span>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Yesterday</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{getHeartRateStatus(Math.round(heartRateData[heartRateData.length - 5])).emoji}</span>
                    <span style={{ fontWeight: 'bold', color: getHeartRateStatus(Math.round(heartRateData[heartRateData.length - 5])).color }}>
                      {getHeartRateStatus(Math.round(heartRateData[heartRateData.length - 5])).status}
                    </span>
                    <span style={{ color: '#666' }}>({Math.round(heartRateData[heartRateData.length - 5])} bpm)</span>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Last Week Average</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>📈</span>
                    <span style={{ fontWeight: 'bold', color: '#FF9800' }}>
                      {Math.round(heartRateData.reduce((a, b) => a + b) / heartRateData.length)}
                    </span>
                    <span style={{ color: '#666' }}>bpm</span>
                  </div>
                </div>

                <div style={{ padding: '1rem', background: '#E3F2FD', borderRadius: '8px', borderLeft: '4px solid #2196F3' }}>
                  <div style={{ fontSize: '0.85rem', color: '#1565C0', lineHeight: '1.6' }}>
                    <strong>ℹ️ Normal Range:</strong> 60-100 bpm at rest. Your readings show a healthy pattern.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="dashboard-card" style={{ cursor: 'pointer' }} onClick={() => setShowBloodPressureDetails(!showBloodPressureDetails)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className="card-title mb-0">🩸 Blood Pressure {showBloodPressureDetails && '▼'}</h3>
              <button
                onClick={(e) => { e.stopPropagation(); exportBloodPressure(); }}
                style={{
                  background: '#E91E63',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#c2185b'}
                onMouseOut={(e) => e.target.style.background = '#E91E63'}
              >
                📥 Export
              </button>
            </div>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <strong style={{ fontSize: '2.5rem', color: '#E91E63' }}>{bloodPressure}</strong>
              <span style={{ fontSize: '1.2rem', color: '#666', marginLeft: '0.5rem' }}>mmHg</span>
            </div>
            <div className="chart-container" style={{ height: '150px' }}>
              <Line data={createChartData(bloodPressureData, '#E91E63')} options={chartOptions} />
            </div>

            {showBloodPressureDetails && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px solid #e0e0e0' }}>
                <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#333' }}>📊 Blood Pressure Analysis</h4>
                
                <div style={{ marginBottom: '1rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Today</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{getBloodPressureStatus(bloodPressure).emoji}</span>
                    <span style={{ fontWeight: 'bold', color: getBloodPressureStatus(bloodPressure).color }}>
                      {getBloodPressureStatus(bloodPressure).status}
                    </span>
                    <span style={{ color: '#666' }}>({bloodPressure} mmHg)</span>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Yesterday</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{getBloodPressureStatus(`${bloodPressureData[bloodPressureData.length - 5]}/80`).emoji}</span>
                    <span style={{ fontWeight: 'bold', color: getBloodPressureStatus(`${bloodPressureData[bloodPressureData.length - 5]}/80`).color }}>
                      {getBloodPressureStatus(`${bloodPressureData[bloodPressureData.length - 5]}/80`).status}
                    </span>
                    <span style={{ color: '#666' }}>({bloodPressureData[bloodPressureData.length - 5]}/80 mmHg)</span>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Last Week Average</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>📊</span>
                    <span style={{ fontWeight: 'bold', color: '#FF9800' }}>
                      {Math.round(bloodPressureData.reduce((a, b) => a + b) / bloodPressureData.length)}/80
                    </span>
                    <span style={{ color: '#666' }}>mmHg</span>
                  </div>
                </div>

                <div style={{ padding: '1rem', background: '#FFF3E0', borderRadius: '8px', borderLeft: '4px solid #FF9800' }}>
                  <div style={{ fontSize: '0.85rem', color: '#E65100', lineHeight: '1.6' }}>
                    <strong>ℹ️ Normal Range:</strong> Systolic 120 or less, Diastolic 80 or less. Stay hydrated and manage stress.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-6 mb-4">
          <div className="dashboard-card" style={{ cursor: 'pointer' }} onClick={() => setShowO2Details(!showO2Details)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className="card-title mb-0">💨 Oxygen Level {showO2Details && '▼'}</h3>
              <button
                onClick={(e) => { e.stopPropagation(); exportOxygen(); }}
                style={{
                  background: '#00BCD4',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#0097a7'}
                onMouseOut={(e) => e.target.style.background = '#00BCD4'}
              >
                📥 Export
              </button>
            </div>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <strong style={{ fontSize: '2.5rem', color: '#00BCD4' }}>{o2Level}</strong>
              <span style={{ fontSize: '1.2rem', color: '#666', marginLeft: '0.5rem' }}>%</span>
            </div>
            <div className="chart-container" style={{ height: '150px' }}>
              <Line data={createChartData(o2Data, '#00BCD4')} options={chartOptions} />
            </div>

            {showO2Details && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px solid #e0e0e0' }}>
                <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#333' }}>📊 Oxygen Saturation Analysis</h4>
                
                <div style={{ marginBottom: '1rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Today</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{getO2Status(o2Level).emoji}</span>
                    <span style={{ fontWeight: 'bold', color: getO2Status(o2Level).color }}>
                      {getO2Status(o2Level).status}
                    </span>
                    <span style={{ color: '#666' }}>({o2Level}%)</span>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Yesterday</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{getO2Status(o2Data[o2Data.length - 5]).emoji}</span>
                    <span style={{ fontWeight: 'bold', color: getO2Status(o2Data[o2Data.length - 5]).color }}>
                      {getO2Status(o2Data[o2Data.length - 5]).status}
                    </span>
                    <span style={{ color: '#666' }}>({o2Data[o2Data.length - 5]}%)</span>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Last Week Average</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>📈</span>
                    <span style={{ fontWeight: 'bold', color: '#FF9800' }}>
                      {Math.round(o2Data.reduce((a, b) => a + b) / o2Data.length)}
                    </span>
                    <span style={{ color: '#666' }}>%</span>
                  </div>
                </div>

                <div style={{ padding: '1rem', background: '#E0F2F1', borderRadius: '8px', borderLeft: '4px solid #00BCD4' }}>
                  <div style={{ fontSize: '0.85rem', color: '#004D40', lineHeight: '1.6' }}>
                    <strong>ℹ️ Normal Range:</strong> 95-100%. If below 95%, consult a doctor. Ensure good ventilation and avoid strenuous activity.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="dashboard-card" style={{ cursor: 'pointer' }} onClick={() => setShowStepsDetails(!showStepsDetails)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className="card-title mb-0">👟 Steps {showStepsDetails && '▼'}</h3>
              <button
                onClick={(e) => { e.stopPropagation(); exportSteps(); }}
                style={{
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#388e3c'}
                onMouseOut={(e) => e.target.style.background = '#4CAF50'}
              >
                📥 Export
              </button>
            </div>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <strong style={{ fontSize: '2.5rem', color: '#4CAF50' }}>{steps.toLocaleString()}</strong>
              <span style={{ fontSize: '1.2rem', color: '#666', marginLeft: '0.5rem' }}>/ 10,000</span>
            </div>
            <div className="chart-container" style={{ height: '150px' }}>
              <Line data={createChartData(stepsData, '#4CAF50')} options={chartOptions} />
            </div>

            {showStepsDetails && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px solid #e0e0e0' }}>
                <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#333' }}>📊 Steps & Goals Analysis</h4>
                
                <div style={{ marginBottom: '1rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Today</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{getStepsStatus(steps).emoji}</span>
                    <span style={{ fontWeight: 'bold', color: getStepsStatus(steps).color }}>
                      {getStepsStatus(steps).status}
                    </span>
                    <span style={{ color: '#666' }}>({Math.round((steps / 10000) * 100)}%)</span>
                  </div>
                  <div style={{ background: 'white', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ height: '8px', background: '#e0e0e0', width: '100%' }}>
                      <div style={{ height: '100%', background: '#4CAF50', width: `${Math.min((steps / 10000) * 100, 100)}%`, transition: 'width 0.3s' }}></div>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Yesterday</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{getStepsStatus(stepsData[stepsData.length - 5]).emoji}</span>
                    <span style={{ fontWeight: 'bold', color: getStepsStatus(stepsData[stepsData.length - 5]).color }}>
                      {getStepsStatus(stepsData[stepsData.length - 5]).status}
                    </span>
                    <span style={{ color: '#666' }}>({stepsData[stepsData.length - 5].toLocaleString()} steps)</span>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Weekly Average</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>📊</span>
                    <span style={{ fontWeight: 'bold', color: '#FF9800' }}>
                      {Math.round(stepsData.reduce((a, b) => a + b) / stepsData.length).toLocaleString()}
                    </span>
                    <span style={{ color: '#666' }}>steps/day</span>
                  </div>
                </div>

                <div style={{ padding: '1rem', background: '#F1F8E9', borderRadius: '8px', borderLeft: '4px solid #4CAF50' }}>
                  <div style={{ fontSize: '0.85rem', color: '#33691E', lineHeight: '1.6' }}>
                    <strong>ℹ️ Daily Goal:</strong> 10,000 steps recommended. Keep moving! Even small walks throughout the day help.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-6 mb-4">
          <div className="dashboard-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className="card-title mb-0">😰 Stress Level</h3>
              <button
                onClick={exportStress}
                style={{
                  background: '#F44336',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#d32f2f'}
                onMouseOut={(e) => e.target.style.background = '#F44336'}
              >
                📥 Export
              </button>
            </div>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <strong style={{ fontSize: '2.5rem', color: stressColor }}>{stressScore}</strong>
              <span style={{ fontSize: '1.2rem', color: '#666', marginLeft: '0.5rem' }}>/ 100</span>
            </div>
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <span style={{ 
                background: stressColor, 
                color: 'white', 
                padding: '0.5rem 1.5rem', 
                borderRadius: '20px',
                fontWeight: '600'
              }}>
                {stressLevel} Stress
              </span>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="dashboard-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className="card-title mb-0">💓 HRV (Heart Rate Variability)</h3>
              <button
                onClick={exportHRV}
                style={{
                  background: '#9C27B0',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#7b1fa2'}
                onMouseOut={(e) => e.target.style.background = '#9C27B0'}
              >
                📥 Export
              </button>
            </div>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <strong style={{ fontSize: '2.5rem', color: '#9C27B0' }}>{hrv}</strong>
              <span style={{ fontSize: '1.2rem', color: '#666', marginLeft: '0.5rem' }}>ms</span>
            </div>
            <div className="chart-container" style={{ height: '150px' }}>
              <Line data={createChartData(hrvData, '#9C27B0')} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button
          onClick={handleExportBiometrics}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '12px 32px',
            fontSize: '1rem',
            fontWeight: '600',
            borderRadius: '25px',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            transition: 'all 0.3s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
          }}
        >
          📥 Export Summary
        </button>
      </div>
    </>
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ fontSize: '2rem', margin: 0 }}>🐢 TurtleHealth</h1>
            <span style={{ color: '#666' }}>Welcome, {user?.name || 'User'}</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button 
              onClick={() => setShowEmergencyModal(true)}
              style={{
                background: '#F44336',
                border: 'none',
                color: 'white',
                padding: '10px 24px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              🚨 Emergency
            </button>
            <button 
              onClick={handleLogout}
              style={{
                background: 'white',
                border: '2px solid #667eea',
                color: '#667eea',
                padding: '8px 20px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Emergency Modal */}
      {showEmergencyModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            animation: 'slideIn 0.3s ease-out'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚨</div>
              <h2 style={{ fontSize: '1.8rem', color: '#F44336', marginBottom: '0.5rem' }}>Emergency Services</h2>
              <p style={{ color: '#666', fontSize: '1rem' }}>Do you need immediate assistance?</p>
            </div>
            
            <div style={{
              background: '#fff3e0',
              border: '1px solid #ff9800',
              borderRadius: '10px',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <p style={{ margin: 0, color: '#e65100', fontSize: '0.9rem' }}>
                <strong>⚠️ Note:</strong> This will immediately contact emergency services (911) and share your location.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setShowEmergencyModal(false)}
                style={{
                  flex: 1,
                  background: '#e0e0e0',
                  border: 'none',
                  color: '#333',
                  padding: '1rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#d0d0d0'}
                onMouseLeave={(e) => e.target.style.background = '#e0e0e0'}
              >
                Cancel
              </button>
              <button
                onClick={handleEmergencyCall}
                style={{
                  flex: 1,
                  background: '#F44336',
                  border: 'none',
                  color: 'white',
                  padding: '1rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem',
                  boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#D32F2F';
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#F44336';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                Call 911 Now
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Sidebar */}
        <div style={{ 
          width: '250px', 
          background: 'white', 
          minHeight: 'calc(100vh - 80px)',
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
          padding: '2rem 0'
        }}>
          <nav>
            <button
              onClick={() => setActiveView('dashboard')}
              style={{
                width: '100%',
                padding: '1rem 2rem',
                background: activeView === 'dashboard' ? '#667eea' : 'transparent',
                color: activeView === 'dashboard' ? 'white' : '#333',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              🏠 Dashboard
            </button>
            <button
              onClick={() => setActiveView('profile')}
              style={{
                width: '100%',
                padding: '1rem 2rem',
                background: activeView === 'profile' ? '#667eea' : 'transparent',
                color: activeView === 'profile' ? 'white' : '#333',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              👤 Profile
            </button>
            <button
              onClick={() => setActiveView('leaderboard')}
              style={{
                width: '100%',
                padding: '1rem 2rem',
                background: activeView === 'leaderboard' ? '#667eea' : 'transparent',
                color: activeView === 'leaderboard' ? 'white' : '#333',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              🏆 Leaderboard
            </button>
            <button
              onClick={() => setActiveView('medical')}
              style={{
                width: '100%',
                padding: '1rem 2rem',
                background: activeView === 'medical' ? '#667eea' : 'transparent',
                color: activeView === 'medical' ? 'white' : '#333',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              💊 Medical Info
            </button>
            <button
              onClick={() => setActiveView('biometrics')}
              style={{
                width: '100%',
                padding: '1rem 2rem',
                background: activeView === 'biometrics' ? '#667eea' : 'transparent',
                color: activeView === 'biometrics' ? 'white' : '#333',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              📊 Biometrics
            </button>
            <button
              onClick={() => setActiveView('notifications')}
              style={{
                width: '100%',
                padding: '1rem 2rem',
                background: activeView === 'notifications' ? '#667eea' : 'transparent',
                color: activeView === 'notifications' ? 'white' : '#333',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'all 0.2s',
                position: 'relative'
              }}
            >
              🔔 Notifications
              {accessRequests.length > 0 && (
                <span style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#F44336',
                  color: 'white',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}>
                  {accessRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveView('providers')}
              style={{
                width: '100%',
                padding: '1rem 2rem',
                background: activeView === 'providers' ? '#667eea' : 'transparent',
                color: activeView === 'providers' ? 'white' : '#333',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              👨‍⚕️ Connected Providers
            </button>
            <button
              onClick={() => setActiveView('smartwatch')}
              style={{
                width: '100%',
                padding: '1rem 2rem',
                background: activeView === 'smartwatch' ? '#667eea' : 'transparent',
                color: activeView === 'smartwatch' ? 'white' : '#333',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              ⌚ Smartwatch
            </button>
            <button
              onClick={() => setActiveView('points')}
              style={{
                width: '100%',
                padding: '1rem 2rem',
                background: activeView === 'points' ? '#667eea' : 'transparent',
                color: activeView === 'points' ? 'white' : '#333',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              💎 Points
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: '2rem' }}>
          {activeView === 'dashboard' && (
            <>
              <div className="row mb-4">
                <div className="col-md-6 mb-4">
                  <div className="dashboard-card">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h3 className="card-title">Heart Rate</h3>
                      <div className="heart-rate-display">
                        <strong style={{ fontSize: '1.5rem', color: '#6C63FF' }}>
                          {Math.round(heartRateData[heartRateData.length - 1])} bpm
                        </strong>
                      </div>
                    </div>
                    <div className="chart-container">
                      <Line data={chartData} options={chartOptions} />
                    </div>
                  </div>
                </div>

                <div className="col-md-6 mb-4">
                  <div className="dashboard-card">
                    <h3 className="card-title mb-3">Steps</h3>
                    <div className="steps-section">
                      <div className="steps-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="#4CAF50">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M10 8h4v8h-4z" fill="white" />
                        </svg>
                      </div>
                      <div className="steps-info">
                        <div className="steps-count">
                          <strong style={{ fontSize: '1.8rem' }}>{steps.toLocaleString()}</strong>
                          <span style={{ color: '#666', marginLeft: '0.5rem' }}>/ 10,000 Goal</span>
                        </div>
                        <div className="progress-bar mt-2">
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${stepsPercent}%` }}
                          />
                        </div>
                        <small className="text-muted mt-1" style={{ display: 'block' }}>{Math.round(stepsPercent)}% Complete</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-7 mb-4">
                  <div className="dashboard-card">
                    <h3 className="card-title mb-3">🏆 Leaderboard (Lowest Stress)</h3>
                    {leaderboard.map((entry) => (
                      <div key={entry.rank} className="leaderboard-row">
                        <span className="leaderboard-rank">#{entry.rank}</span>
                        <span className="leaderboard-name">{entry.name}</span>
                        <div className="leaderboard-divider"></div>
                        <span className="leaderboard-stress">
                          Stress: {entry.stress}
                          <span style={{ marginLeft: '0.5rem' }}>{getTrendArrow(entry.trend)}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-md-5 mb-4">
                  <div className="dashboard-card">
                    <h3 className="card-title mb-3">Daily Suggestion</h3>
                    <p className="suggestion-text">
                      Please drink at least 2 liters of water today and take short breaks to stretch.
                    </p>
                    <div className="text-center my-3">
                      <TurtleAvatar
                        stressScore={stressScore}
                        metrics={{ heartRate, steps, stressScore }}
                      />
                    </div>
                    <div className="text-center">
                      <button
                        className="stress-pill"
                        style={{ backgroundColor: stressColor, border: 'none', cursor: 'default' }}
                      >
                        Stress: {stressLevel} ({stressScore})
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          {activeView === 'profile' && renderProfileView()}
          {activeView === 'leaderboard' && renderLeaderboardView()}
          {activeView === 'medical' && renderMedicalView()}
          {activeView === 'biometrics' && renderBiometricsView()}
          {activeView === 'notifications' && (
            <>
              <h2 style={{ marginBottom: '2rem' }}>📬 Notifications</h2>

              {/* Healthcare Provider Notifications Section */}
              <div style={{ marginBottom: '3rem' }}>
                <h3 style={{ marginBottom: '1.5rem', color: '#333', fontSize: '1.3rem' }}>
                  🏥 Healthcare Provider Access Requests
                </h3>
                
                {accessRequests.length > 0 ? (
                  <div className="row">
                    {accessRequests.map((request) => (
                      <div key={request.id} className="col-12 mb-3">
                        <div className="dashboard-card" style={{ borderLeft: '4px solid #FF9800' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div style={{ flex: 1 }}>
                              <h4 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>
                                🏥 Healthcare Provider Access Request
                              </h4>
                              <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>
                                <strong>{request.provider_name}</strong> from <strong>{request.facility}</strong>
                              </p>
                              <p style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.9rem' }}>
                                Specialization: {request.specialization}
                              </p>
                              <p style={{ margin: '0 0 1rem 0', color: '#888', fontSize: '0.85rem' }}>
                                Requested on: {new Date(request.created_at).toLocaleString()}
                              </p>
                              <div style={{ 
                                background: '#FFF3E0', 
                                padding: '1rem', 
                                borderRadius: '8px',
                                marginBottom: '1rem'
                              }}>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#E65100' }}>
                                  ℹ️ This provider is requesting access to view your health data and history. 
                                  You can approve or reject this request below.
                                </p>
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button
                              onClick={() => handleApproveRequest(request.id)}
                              disabled={loading}
                              style={{
                                flex: 1,
                                background: '#4CAF50',
                                color: 'white',
                                border: 'none',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '10px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontWeight: '600',
                                fontSize: '1rem',
                                opacity: loading ? 0.7 : 1
                              }}
                            >
                              ✓ Approve Access
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request.id)}
                              disabled={loading}
                              style={{
                                flex: 1,
                                background: '#F44336',
                                color: 'white',
                                border: 'none',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '10px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontWeight: '600',
                                fontSize: '1rem',
                                opacity: loading ? 0.7 : 1
                              }}
                            >
                              ✗ Reject Request
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="dashboard-card" style={{ textAlign: 'center', padding: '2rem', background: '#E8F5E9' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✓</div>
                    <h3 style={{ color: '#2E7D32', marginBottom: '0.5rem' }}>No Access Requests</h3>
                    <p style={{ color: '#558B2F', margin: 0 }}>
                      You don't have any pending provider access requests.
                    </p>
                  </div>
                )}
              </div>

              <div style={{ borderTop: '2px solid #e0e0e0', paddingTop: '2rem' }}></div>

              {/* Biometric Notifications Section */}
              <div>
                <h3 style={{ marginBottom: '1.5rem', color: '#333', fontSize: '1.3rem' }}>
                  💓 Biometric Alerts & Anomalies
                </h3>

                {biometricAlerts.length > 0 ? (
                  <div className="row">
                    {biometricAlerts.map((alert) => {
                      let borderColor = '#FF9800';
                      let bgColor = '#FFF3E0';
                      let textColor = '#E65100';
                      let icon = '⚠️';

                      if (alert.severity === 'critical') {
                        borderColor = '#F44336';
                        bgColor = '#FFEBEE';
                        textColor = '#C62828';
                        icon = '🚨';
                      } else if (alert.severity === 'warning') {
                        borderColor = '#FF9800';
                        bgColor = '#FFF3E0';
                        textColor = '#E65100';
                        icon = '⚠️';
                      } else {
                        borderColor = '#2196F3';
                        bgColor = '#E3F2FD';
                        textColor = '#1565C0';
                        icon = 'ℹ️';
                      }

                      return (
                        <div key={alert.id} className="col-12 mb-3">
                          <div className="dashboard-card" style={{ borderLeft: `4px solid ${borderColor}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                              <div style={{ flex: 1 }}>
                                <h4 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>
                                  {icon} {alert.metric} Alert
                                </h4>
                                <p style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.95rem' }}>
                                  <strong>Status:</strong> {alert.status} ({alert.reading} {alert.metric === 'Heart Rate' ? 'bpm' : alert.metric === 'SpO2' ? '%' : '°C'})
                                </p>
                                <p style={{ margin: '0 0 0.75rem 0', color: '#666', fontSize: '0.9rem' }}>
                                  {alert.message}
                                </p>
                                <p style={{ margin: '0', color: '#999', fontSize: '0.85rem' }}>
                                  {alert.timestamp.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div style={{ 
                              background: bgColor, 
                              padding: '1rem', 
                              borderRadius: '8px',
                              marginTop: '1rem'
                            }}>
                              <p style={{ margin: 0, fontSize: '0.85rem', color: textColor, lineHeight: '1.5' }}>
                                {alert.severity === 'critical' ? 
                                  '🚨 This is a critical alert. Please seek medical attention if symptoms persist.' :
                                  alert.severity === 'warning' ?
                                  '⚠️ This reading is outside your normal range. Monitor this metric and contact your doctor if it persists.' :
                                  'ℹ️ This reading is unusual but within normal ranges. Continue monitoring.'}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="dashboard-card" style={{ textAlign: 'center', padding: '2rem', background: '#E8F5E9' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✓</div>
                    <h3 style={{ color: '#2E7D32', marginBottom: '0.5rem' }}>All Clear</h3>
                    <p style={{ color: '#558B2F', margin: 0 }}>
                      No biometric anomalies detected. Your health metrics look good!
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
          {activeView === 'providers' && (
            <>
              <h2 style={{ marginBottom: '2rem' }}>👨‍⚕️ Connected Healthcare Providers</h2>

              {connectedProviders.length > 0 ? (
                <div className="row">
                  {connectedProviders.map((provider) => (
                    <div key={provider.sharing_id} className="col-md-6 mb-4">
                      <div className="dashboard-card" style={{ borderLeft: '4px solid #667eea' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#333', fontSize: '1.2rem' }}>
                              👨‍⚕️ {provider.name}
                            </h4>
                            <p style={{ margin: '0 0 0.75rem 0', color: '#666', fontSize: '0.95rem' }}>
                              <strong>Email:</strong> {provider.email}
                            </p>
                            {provider.phone && (
                              <p style={{ margin: '0 0 0.75rem 0', color: '#666', fontSize: '0.95rem' }}>
                                <strong>Phone:</strong> {provider.phone}
                              </p>
                            )}
                            <p style={{ margin: '0', color: '#999', fontSize: '0.85rem' }}>
                              Connected since: {new Date(provider.connected_since).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div style={{ 
                          background: '#E8F5E9', 
                          padding: '0.75rem', 
                          borderRadius: '8px',
                          marginBottom: '1rem',
                          borderLeft: '3px solid #4CAF50'
                        }}>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: '#2E7D32', lineHeight: '1.5' }}>
                            ✓ This provider has access to your health data and medical records.
                          </p>
                        </div>

                        <button
                          onClick={() => handleDisconnectProvider(provider.sharing_id, provider.name)}
                          style={{
                            width: '100%',
                            background: '#F44336',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.95rem',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.background = '#D32F2F'}
                          onMouseLeave={(e) => e.target.style.background = '#F44336'}
                        >
                          🔗 Remove Access
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="dashboard-card" style={{ textAlign: 'center', padding: '3rem', background: '#F5F5F5' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👨‍⚕️</div>
                  <h3 style={{ color: '#666', marginBottom: '0.5rem' }}>No Connected Providers</h3>
                  <p style={{ color: '#999', margin: 0, lineHeight: '1.6' }}>
                    You haven't connected any healthcare providers yet. When a provider requests access to your health data, 
                    you'll be able to approve them in the <strong>Notifications</strong> tab. Once approved, they will appear here.
                  </p>
                </div>
              )}
            </>
          )}
          {activeView === 'smartwatch' && (
            <>
              <h2 style={{ marginBottom: '2rem' }}>⌚ Smartwatch Connection</h2>
              
              <div className="row">
                <div className="col-lg-6">
                  <div className="dashboard-card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ fontSize: '6rem', marginBottom: '1.5rem' }}>⌚</div>
                    <h3 style={{ color: '#667eea', marginBottom: '1rem' }}>Connect Your Smartwatch</h3>
                    <p style={{ color: '#666', marginBottom: '2rem', lineHeight: '1.6' }}>
                      Connect your smartwatch to automatically sync your health data in real-time. 
                      This feature allows seamless tracking of your biometric data including heart rate, 
                      steps, sleep patterns, and more.
                    </p>
                    <button
                      onClick={() => alert('This is a demo feature. In a real application, this would connect to your smartwatch via Bluetooth or API.')}
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '1rem 2.5rem',
                        borderRadius: '12px',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                        transition: 'transform 0.2s'
                      }}
                      onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                      onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                      🔗 Connect Smartwatch
                    </button>
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="dashboard-card" style={{ background: '#f8f9fa' }}>
                    <h4 style={{ marginBottom: '1.5rem', color: '#333' }}>Supported Devices</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {[
                        { name: 'Apple Watch', icon: '🍎', status: 'Compatible' },
                        { name: 'Samsung Galaxy Watch', icon: '📱', status: 'Compatible' },
                        { name: 'Fitbit', icon: '🏃', status: 'Compatible' },
                        { name: 'Garmin', icon: '⚡', status: 'Compatible' },
                        { name: 'Google Wear OS', icon: '🤖', status: 'Compatible' }
                      ].map((device, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1rem',
                            background: 'white',
                            borderRadius: '10px',
                            border: '1px solid #e0e0e0'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontSize: '2rem' }}>{device.icon}</span>
                            <span style={{ fontWeight: '500', color: '#333' }}>{device.name}</span>
                          </div>
                          <span style={{
                            padding: '0.4rem 1rem',
                            background: '#E8F5E9',
                            color: '#2E7D32',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            fontWeight: '600'
                          }}>
                            ✓ {device.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          {activeView === 'points' && (
            <>
              <h2 style={{ marginBottom: '2rem' }}>💎 Points & Rewards</h2>
              {renderPointsLeaderboardView()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
