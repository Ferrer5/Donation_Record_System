# 🚀 Simple Free Deployment - Render.com (Manual Method)

This is the **simplest and most reliable** way to deploy your app.

## Step 1: Create Free MySQL Database

1. Go to [PlanetScale](https://planetscale.com) (free MySQL)
2. Sign up with GitHub
3. Click "Create database"
4. Name it: `donation-db`
5. Select **Free** plan
6. Click "Create database"
7. Once created, click "Connect"
8. **Copy these details** (you'll need them):
   - Host
   - Username
   - Password
   - Database name

## Step 2: Initialize Database

1. In PlanetScale, go to your database
2. Click "Console" tab
3. Run your `database_setup.sql` script (copy and paste)
4. Also run `create_system_user.sql`

## Step 3: Deploy to Render (Manual)

1. Go to [render.com](https://render.com)
2. Sign up/login with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect your repository: `Ferrer5/Donation_Report_System`
5. Configure:
   - **Name**: `donation-system`
   - **Environment**: `Java`
   - **Build Command**: `./mvnw clean package -DskipTests`
   - **Start Command**: `java -jar target/donation-report-system-1.0.0.jar`
   - **Plan**: **Free**

## Step 4: Set Environment Variables

In Render dashboard, go to your service → **Environment** tab, add:

```
SPRING_PROFILES_ACTIVE=production
SPRING_DATASOURCE_URL=jdbc:mysql://YOUR_PLANETSCALE_HOST:3306/project2?useSSL=true&allowPublicKeyRetrieval=true
SPRING_DATASOURCE_USERNAME=YOUR_PLANETSCALE_USERNAME
SPRING_DATASOURCE_PASSWORD=YOUR_PLANETSCALE_PASSWORD
SPRING_MAIL_USERNAME=your-email@gmail.com
SPRING_MAIL_PASSWORD=your-gmail-app-password
PORT=10000
```

**Replace:**
- `YOUR_PLANETSCALE_HOST` with your PlanetScale host
- `YOUR_PLANETSCALE_USERNAME` with your username
- `YOUR_PLANETSCALE_PASSWORD` with your password
- Email credentials (optional, only for forgot password)

## Step 5: Deploy!

1. Click **"Create Web Service"**
2. Wait 5-10 minutes
3. Your app will be live!

## ✅ Your App URL

After deployment, you'll get a URL like:
`https://donation-system.onrender.com`

## 🐛 Troubleshooting

**Build fails?**
- Check logs in Render dashboard
- Make sure `mvnw` file has execute permissions (Render handles this)

**Database connection error?**
- Double-check your connection string
- Make sure database name is `project2`
- Verify PlanetScale database is running

**App won't start?**
- Check environment variables are all set
- Look at logs for specific error messages

## 🎉 Done!

Share your Render URL with anyone - it's live!

