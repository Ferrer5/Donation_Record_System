# 🚀 Free Deployment Guide - Render.com

This guide will help you deploy your Donation System online for FREE using Render.com.

## 📋 Prerequisites

1. A GitHub account (free)
2. Your code pushed to a GitHub repository
3. A Gmail account (for email functionality - optional)

## 🎯 Step-by-Step Deployment

### Step 1: Push Your Code to GitHub

1. If you haven't already, create a GitHub repository
2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

### Step 2: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up for free (use GitHub to sign in - easiest way)
3. Verify your email

### Step 3: Create Database

**Option A: Use Free MySQL Hosting (Recommended)**

1. Go to [PlanetScale](https://planetscale.com) or [Aiven](https://aiven.io) (both free)
2. Create a free MySQL database
3. Get your connection string
4. Use it in Step 5

**Option B: Use Render PostgreSQL (Requires Code Changes)**

If you want to use Render's free PostgreSQL, you'll need to change your database from MySQL to PostgreSQL (more complex).

**For now, use Option A** - it's simpler!

### Step 4: Deploy Your Application

1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Render will auto-detect it's a Java/Spring Boot app
4. Configure:
   - **Name**: `donation-system` (or any name you like)
   - **Environment**: `Java`
   - **Build Command**: `./mvnw clean package -DskipTests`
   - **Start Command**: `java -jar target/donation-report-system-1.0.0.jar`
   - **Plan**: **Free**

### Step 5: Set Environment Variables

In your Web Service settings, go to **"Environment"** tab and add:

```
SPRING_PROFILES_ACTIVE=production
SPRING_DATASOURCE_URL=jdbc:mysql://YOUR_DB_HOST:3306/project2?useSSL=true&allowPublicKeyRetrieval=true
SPRING_DATASOURCE_USERNAME=YOUR_DB_USERNAME
SPRING_DATASOURCE_PASSWORD=YOUR_DB_PASSWORD
SPRING_MAIL_USERNAME=your-email@gmail.com
SPRING_MAIL_PASSWORD=your-app-password
PORT=10000
```

**Note**: 
- Get database connection details from your free MySQL provider (PlanetScale/Aiven)
- Format: `jdbc:mysql://hostname:3306/database_name?useSSL=true`
- Email credentials are optional (only needed for forgot password feature)

### Step 6: Deploy!

1. Click **"Create Web Service"**
2. Wait 5-10 minutes for first deployment
3. Your app will be live at: `https://your-app-name.onrender.com`

## 🔧 Alternative: Using render.yaml (Easier!)

If you use the `render.yaml` file I created:

1. Push your code with `render.yaml` to GitHub
2. In Render, click **"New +"** → **"Blueprint"**
3. Connect your GitHub repo
4. Render will automatically:
   - Create the database
   - Deploy your app
   - Set up environment variables
5. Just add email credentials in Environment Variables

## 📧 Email Setup (Optional)

If you want forgot password to work:

1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Go to App Passwords
4. Create an app password for "Mail"
5. Use that password in `SPRING_MAIL_PASSWORD`

## ✅ After Deployment

1. Your app URL will be: `https://your-app-name.onrender.com`
2. Share this link with anyone!
3. The frontend will automatically use the correct API URL

## 🆓 Free Tier Limits

- **750 hours/month** (enough for 24/7 operation)
- **512 MB RAM**
- **Spins down after 15 min inactivity** (first request takes ~30 seconds)

## 🐛 Troubleshooting

**App won't start?**
- Check logs in Render dashboard
- Make sure database connection string is correct
- Verify all environment variables are set

**Database connection error?**
- Check if database is running
- Verify connection string format
- Make sure database name is `project2`

**Email not working?**
- Check Gmail app password is correct
- Verify email environment variables are set

## 🎉 That's It!

Your donation system is now online and accessible to anyone with the link!

