import { VercelRequest, VercelResponse } from '@vercel/node';
import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from '../src/utils/db';
import authRoutes from '../src/routes/auth.routes';
import driverRoutes from '../src/routes/driver.routes';
import businessRoutes from '../src/routes/business.routes';
import adminRoutes from '../src/routes/admin.routes';
import campaignRoutes from '../src/routes/compaign.routes';
import path from 'path';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Server is running!', 
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    endpoint: '/api/test',
    routes: [
      '/api/auth',
      '/api/driver', 
      '/api/business',
      '/api/admin',
      '/api/campaigns'
    ]
  });
});

// Your existing routes
app.use('/api/auth', authRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/campaigns', campaignRoutes);

// Connect to database
connectDB().catch(console.error);

// Export the serverless function
export default serverless(app);
