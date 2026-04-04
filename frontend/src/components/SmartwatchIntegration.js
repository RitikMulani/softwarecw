import React, { useState, useEffect } from 'react';
import api from '../services/api';

const SmartwatchIntegration = ({ userId }) => {
  const [connected, setConnected] = useState(false);
  const [biometricData, setBiometricData] = useState({
    heartRate: 0,
    steps: 0,
    stressLevel: 0,
    spo2: 0,
    temperature: 0,
    hrv: 0
  });
  const [simulationRunning, setSimulationRunning] = useState(false);

  useEffect(() => {
    checkConnection();
    fetchLatestData();
  }, []);

  const checkConnection = () => {
    if (navigator.bluetooth) {
      console.log('Web Bluetooth API available');
    }
  };

  const fetchLatestData = async () => {
    try {
      const response = await api.get('/device/readings/latest');
      if (response.data.reading) {
        setBiometricData({
          heartRate: response.data.reading.heart_rate || 0,
          steps: response.data.reading.steps || 0,
          stressLevel: response.data.reading.stress_level || 0,
          spo2: response.data.reading.spo2 || 0,
          temperature: response.data.reading.body_temp || 0,
          hrv: response.data.reading.hrv || 0
        });
      }
    } catch (error) {
      console.error('Error fetching biometric data:', error);
    }
  };

  const connectSmartwatch = async () => {
    try {
      if (navigator.bluetooth) {
        const device = await navigator.bluetooth.requestDevice({
          filters: [
            { services: ['heart_rate'] },
            { services: ['0000180d-0000-1000-8000-00805f9b34fb'] }
          ],
          optionalServices: ['battery_service']
        });

        const server = await device.gatt.connect();
        console.log('Connected to device:', device.name);
        
        const service = await server.getPrimaryService('heart_rate');
        const characteristic = await service.getCharacteristic('heart_rate_measurement');
        
        await characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', (event) => {
          const value = event.target.value;
          const heartRate = value.getUint8(1);
          setBiometricData(prev => ({ ...prev, heartRate }));
        });

        setConnected(true);
        alert('Smartwatch connected successfully!');
      } else {
        alert('Web Bluetooth API not available. Using simulation mode.');
        startSimulation();
      }
    } catch (error) {
      console.error('Error connecting to smartwatch:', error);
      alert('Failed to connect. Starting simulation mode instead.');
      startSimulation();
    }
  };

  const startSimulation = () => {
    setConnected(true);
    setSimulationRunning(true);
    
    const interval = setInterval(async () => {
      const newData = {
        heartRate: Math.floor(Math.random() * (100 - 60 + 1)) + 60,
        steps: Math.floor(Math.random() * 100) + biometricData.steps,
        stressLevel: Math.floor(Math.random() * (80 - 20 + 1)) + 20,
        spo2: Math.floor(Math.random() * (100 - 95 + 1)) + 95,
        temperature: (Math.random() * (37.5 - 36.5) + 36.5).toFixed(1),
        hrv: Math.floor(Math.random() * (100 - 40 + 1)) + 40
      };

      setBiometricData(newData);

      // Send to backend
      try {
        await api.post('/device/readings', {
          heart_rate: newData.heartRate,
          steps: newData.steps,
          stress_level: newData.stressLevel,
          spo2: newData.spo2,
          body_temp: newData.temperature,
          hrv: newData.hrv
        });
      } catch (error) {
        console.error('Error sending biometric data:', error);
      }
    }, 5000); // Update every 5 seconds

    // Store interval ID to clear it later
    window.smartwatchInterval = interval;
  };

  const stopSimulation = () => {
    setSimulationRunning(false);
    setConnected(false);
    if (window.smartwatchInterval) {
      clearInterval(window.smartwatchInterval);
    }
  };

  return (
    <div className="smartwatch-integration" style={{
      padding: '20px',
      border: '2px solid #6eb5d0',
      borderRadius: '15px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      marginBottom: '20px'
    }}>
      <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
        ⌚ Smartwatch Integration
        {connected && <span style={{
          marginLeft: '10px',
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          background: '#4ade80',
          display: 'inline-block',
          animation: 'pulse 2s infinite'
        }}></span>}
      </h3>

      {!connected ? (
        <button
          onClick={connectSmartwatch}
          style={{
            background: 'white',
            color: '#667eea',
            border: 'none',
            padding: '12px 30px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
        >
          Connect Smartwatch
        </button>
      ) : (
        <>
          <div className="biometric-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '15px',
            marginBottom: '20px'
          }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '15px', borderRadius: '10px' }}>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>Heart Rate</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{biometricData.heartRate} <span style={{ fontSize: '14px' }}>bpm</span></div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '15px', borderRadius: '10px' }}>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>Steps</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{biometricData.steps}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '15px', borderRadius: '10px' }}>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>SpO2</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{biometricData.spo2}<span style={{ fontSize: '14px' }}>%</span></div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '15px', borderRadius: '10px' }}>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>Stress Level</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{biometricData.stressLevel}<span style={{ fontSize: '14px' }}>%</span></div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '15px', borderRadius: '10px' }}>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>Temperature</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{biometricData.temperature}<span style={{ fontSize: '14px' }}>°C</span></div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '15px', borderRadius: '10px' }}>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>HRV</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{biometricData.hrv}<span style={{ fontSize: '14px' }}>ms</span></div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={stopSimulation}
              style={{
                background: 'rgba(255,255,255,0.3)',
                color: 'white',
                border: '1px solid white',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Disconnect
            </button>
            <button
              onClick={fetchLatestData}
              style={{
                background: 'rgba(255,255,255,0.3)',
                color: 'white',
                border: '1px solid white',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Refresh Data
            </button>
          </div>

          {simulationRunning && (
            <p style={{ marginTop: '15px', fontSize: '14px', opacity: 0.9 }}>
              📡 Simulation mode active - Data updates every 5 seconds
            </p>
          )}
        </>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default SmartwatchIntegration;
