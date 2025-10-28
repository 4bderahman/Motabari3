# Deployment Guide for Vercel

This document provides step-by-step instructions for deploying the Motabari3 Blood Bank application on Vercel.

## Prerequisites

- A [Vercel account](https://vercel.com/signup)
- [GitHub account](https://github.com/signup) for deploying directly from your repository
- [MongoDB Atlas account](https://www.mongodb.com/cloud/atlas/register) for the database
- [Stripe account](https://dashboard.stripe.com/register) for payment processing (optional)
- [Resend account](https://resend.com/signup) for email services (optional)

## Pre-Deployment Checks

Before deploying to Vercel, run the case sensitivity check to ensure there are no path-related issues:

```bash
npm run check-case
```

Fix any issues that are found, especially with imports that use incorrect case or path formats.

## Deployment Steps

### 1. Set Up MongoDB Atlas

1. Create a new MongoDB Atlas cluster
2. Configure network access to allow connections from anywhere (or specifically from Vercel IPs)
3. Create a database user with read/write privileges
4. Get your MongoDB connection string

### 2. Deploy to Vercel

#### Option 1: Deploy from GitHub

1. Push your repository to GitHub
2. Log in to your Vercel account
3. Click "New Project"
4. Import your repository
5. Configure the project:
   - Build Command: `npm run vercel-build`
   - Output Directory: `dist`
   - Development Command: `npm run dev`
   - Install Command: `npm install`

#### Option 2: Deploy using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Log in to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from your project directory:
   ```bash
   vercel
   ```

### 3. Configure Environment Variables

After creating the project in Vercel, add the following environment variables in the Vercel project settings:

- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secure random string for JWT token signing
- `STRIPE_SECRET_KEY`: Your Stripe secret key (if using payment features)
- `RESEND_API_KEY`: Your Resend API key (for email functionality)
- `NODE_ENV`: Set to `production`
- `FRONTEND_URL`: The URL of your deployed frontend (will be the Vercel URL)

### 4. Deploy Server to Vercel

For the server, you can either:

1. Deploy it as part of the same project using Vercel serverless functions (recommended)
2. Deploy it separately as a standalone Node.js application

For option 1, make sure the `vercel.json` configuration includes:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### 5. Test Your Deployment

After deployment, test all key functionalities:

- User registration and login
- Blood donation request creation
- Blood need request creation
- Admin dashboard access
- QR code scanning
- Payment processing (if implemented)

## Troubleshooting

### Case Sensitivity Issues

Vercel uses case-sensitive file systems. If you encounter 404 errors for certain components, check that the import paths match the actual file paths exactly, including case.

### API Connection Issues

If your frontend can't connect to your API:

1. Check that the API URL in your code matches the deployed URL
2. Verify your environment variables are properly set
3. Check CORS settings in your server code

### Serverless Function Timeouts

If your API calls time out:
1. Optimize your database queries
2. Consider moving long-running processes to background tasks
3. Use proper indexing on your MongoDB collections

## Maintenance

### Monitoring

Monitor your application using Vercel's built-in analytics and logs.

### Updating

To update your deployed application:
1. Push changes to your GitHub repository
2. Vercel will automatically rebuild and deploy the changes

### Rollbacks

If needed, you can roll back to previous deployments through the Vercel dashboard.
