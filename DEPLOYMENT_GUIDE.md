# TurtleHealth Deployment Guide - Netlify & Render with Supabase

Deploy your application for free to Netlify (frontend), Render (backend), and Supabase (database).

## Quick Start Checklist

- [ ] Create Supabase account and copy database URL
- [ ] Deploy backend on Render (6 minutes)
- [ ] Deploy frontend on Netlify (3 minutes)
- [ ] Update Render CORS settings
- [ ] Test your deployed app

## Prerequisites

1. GitHub account (to store code)
2. Supabase account (free tier)
3. Netlify account (free tier)
4. Render account (free tier)

---

## Part 1: Supabase Setup (Database)

### Step 1.1: Create Supabase Project
1. Go to https://supabase.com
2. Click "Start your project" and sign up
3. Create a new project (select free tier)
4. Wait for the database to initialize (~2 minutes)

### Step 1.2: Get Your Database Connection String
1. In Supabase Dashboard, go to **Project Settings > Database**
2. Scroll down to "Connection string"
3. Select "URI" tab (not the other options)
4. Copy the URI that looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```
5. **Keep this safe** - you'll need this for Render

### Step 1.3: Set Up Database Tables
1. In Supabase, go to **SQL Editor**
2. Create a new query and run the SQL from your `backend/config/database.sql` file
3. Also run the migration files:
   - `backend/config/migrations/add_points.sql`
   - `backend/config/migrations/add_stress_level.sql`

---

## Part 2: Backend Deployment on Render

### Step 2.1: Prepare Your Repository
1. Make sure your code is pushed to GitHub
2. Your backend should be in the `backend/` folder (which it is)

### Step 2.2: Create Render Service
1. Go to https://render.com
2. Sign up/Login with GitHub
3. Click **"New +" > "Web Service"**
4. Connect your GitHub repository
5. Fill in the following:
   - **Name**: `turtlehealth-api`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`

### Step 2.3: Add Environment Variables to Render
Click on **"Environment"** and add these variables:

```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
PORT=5000
NODE_ENV=production
JWT_SECRET=[strong random string]
JWT_REFRESH_SECRET=[strong random string]
JWT_EXPIRE=1h
JWT_REFRESH_EXPIRE=7d
CORS_ORIGIN=https://your-netlify-domain.netlify.app
WS_PATH=/ws
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

Generate JWT secrets at: https://tool.geekbench.com/random-string or `openssl rand -base64 32`

### Step 2.4: Deploy Backend
1. Select **Free** tier pricing (at the bottom)
2. Click **"Create Web Service"**
3. Render will deploy your backend (takes 2-5 minutes)
4. Once deployed, you'll get a URL like: `https://turtlehealth-api-xxxxx.onrender.com`

**Save this URL** - you'll need it for Netlify

---

## Part 3: Frontend Deployment on Netlify

### Step 3.1: Connect GitHub to Netlify
1. Go to https://netlify.com
2. Click **"Sign up"** (use GitHub)
3. Authorize Netlify to access your GitHub repos
4. Click **"Add new site"** > **"Import an existing project"**
5. Select your GitHub repository

### Step 3.2: Configure Build Settings
1. **Base directory**: `frontend`
2. **Build command**: `npm run build`
3. **Publish directory**: `build`
4. Click **"Deploy site"**

### Step 3.3: Add Environment Variable
1. After deployment starts, click **"Site settings"**
2. Go to **"Build & deploy"** > **"Environment"**
3. Click **"Edit variables"**
4. Add:
   - **Key**: `REACT_APP_API_URL`
   - **Value**: `https://your-render-backend-url.onrender.com` (your Render URL from Step 2.4)
5. Click **"Save"**

### Step 3.4: Redeploy
1. Go to **"Deploys"**
2. Click **"Trigger deploy"** > **"Deploy site"**
3. Wait for it to finish (2-3 minutes)
4. You'll get a Netlify URL like: `https://your-app-name.netlify.app`

### Step 3.5: Update Backend CORS
1. Go back to **Render Dashboard**
2. Open your backend service
3. Go to **"Environment"** and update:
   ```
   CORS_ORIGIN=https://your-app-name.netlify.app
   ```
4. Click **"Save"** (this redeploys your backend)

---

## Part 4: Environment Variables Reference

### Render (Backend) Variables

```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
PORT=5000
NODE_ENV=production
JWT_SECRET=[Generate strong random string]
JWT_REFRESH_SECRET=[Generate another strong random string]
JWT_EXPIRE=1h
JWT_REFRESH_EXPIRE=7d
CORS_ORIGIN=https://your-netlify-domain.netlify.app
WS_PATH=/ws
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Netlify (Frontend) Variables

```
REACT_APP_API_URL=https://your-render-backend-url.onrender.com
```

---

## Part 5: Testing & Troubleshooting

### Health Checks
- Backend: `https://your-render-backend.onrender.com/health` (should return JSON)
- API Docs: `https://your-render-backend.onrender.com/api/docs`

### Common Issues

**"Cannot connect to database"**
- Verify Supabase connection string in Render environment variables
- Check that your Supabase database is running
- Confirm the password is correct

**"CORS errors in browser"**
- Make sure `CORS_ORIGIN` in Render matches your Netlify domain exactly
- Include the full domain: `https://your-app-name.netlify.app`

**"WebSocket connection failed"**
- Check browser Console for error messages
- Verify your backend is running (test /health endpoint)
- Render free tier supports WebSocket

**"Frontend shows blank page"**
- Check Netlify deployment logs for build errors
- Verify `REACT_APP_API_URL` is set in Netlify environment
- Trigger a redeploy in Netlify

**"Backend takes 30+ seconds to respond"**
- This is normal on Render free tier (auto-sleep after 15 mins)
- Consider upgrading to paid plan ($7/month) for production

### View Logs

**Render Logs** (Backend)
1. Go to Render Dashboard > Your service
2. Click "Logs" to see server output
3. Look for database connection errors

**Netlify Logs** (Frontend)
1. Go to Netlify Dashboard > Your site
2. Click "Deploys" to see deployment history
3. Click on a deploy to see build logs

---

## Part 6: Free Tier Limits

- **Render**: Free backend may sleep after 15 mins inactivity (30-50s spinup time)
- **Netlify**: 300 free build minutes/month (plenty for testing)
- **Supabase**: 500MB storage, 2GB bandwidth (good for development)

---

## All Done!

Your app should now be live at your Netlify domain. Test everything and enjoy!
