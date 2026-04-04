import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import sharingRoutes from './routes/sharing.routes.js';
import adminRoutes from './routes/admin.routes.js';
import deviceRoutes from './routes/device.routes.js';
import medicalRoutes from './routes/medical.routes.js';
import prescriptionRoutes from './routes/prescription.routes.js';
import leaderboardRoutes from './routes/leaderboard.routes.js';
import pointsRoutes from './routes/points.routes.js';
import thresholdsRoutes from './routes/thresholds.routes.js';
import { apiLimiter } from './middleware/rateLimiter.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
  path: process.env.WS_PATH || '/ws',
});

app.set('io', io);

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/sharing', sharingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/device', deviceRoutes);
app.use('/api/medical-records', medicalRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/thresholds', thresholdsRoutes);

// Swagger documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TurtleHealth API',
      version: '1.0.0',
      description: 'Production-grade health tracking API with real-time biometrics',
      contact: {
        name: 'TurtleHealth Team',
        email: 'api@turtlehealth.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 4000}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Reading: {
          type: 'object',
          required: ['deviceId', 'userId', 'timestamp'],
          properties: {
            deviceId: { type: 'string' },
            userId: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
            heartRate: { type: 'integer', minimum: 20, maximum: 250 },
            steps: { type: 'integer', minimum: 0 },
            bloodPressure: {
              type: 'object',
              properties: {
                sys: { type: 'integer' },
                dia: { type: 'integer' },
              },
            },
            bloodO2: { type: 'number', minimum: 70, maximum: 100 },
            hrv: { type: 'number', minimum: 0, maximum: 200 },
            raw: { type: 'object' },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/api/auth', authRoutes);
app.use('/api/sharing', sharingRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'TurtleHealth API',
    version: '1.0.0',
    status: 'online',
    documentation: '/api/docs',
    websocket: process.env.WS_PATH || '/ws',
    endpoints: {
      auth: '/api/auth',
      sharing: '/api/sharing',
    },
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

io.on('connection', socket => {
  console.log(`WebSocket client connected: ${socket.id}`);

  socket.on('join', userId => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined room user_${userId}`);
  });

  socket.on('leave', userId => {
    socket.leave(`user_${userId}`);
    console.log(`User ${userId} left room user_${userId}`);
  });

  socket.on('disconnect', () => {
    console.log(`WebSocket client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  console.log('');
  console.log('🐢 TurtleHealth Backend Server');
  console.log('================================');
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ API Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`✓ WebSocket endpoint: ws://localhost:${PORT}${process.env.WS_PATH || '/ws'}`);
  console.log('================================');
  console.log('');
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
