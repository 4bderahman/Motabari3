import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Redirect API requests to the actual server
const apiProxy = createProxyMiddleware('/api', {
  target: process.env.BACKEND_URL || 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api',
  },
  logLevel: 'debug',
});

app.use('/api', apiProxy);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Handle 404s
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist`,
  });
});

// Error handling middleware
app.use((err, req, res) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Server Error',
    message: err.message || 'An unexpected error occurred',
  });
});

// Export for Vercel serverless function
export default app;
