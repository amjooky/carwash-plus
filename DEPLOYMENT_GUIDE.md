# CarWash+ Backend Deployment Guide (Free Tier)

This guide will walk you through deploying the `CarWash+` backend to **Render**, a cloud provider that offers free tiers for Node.js, PostgreSQL, and Redis. This allows you to get a public URL (domain) for your APIs to test with the mobile app.

## Prerequisites

1.  **GitHub Account**: You need a GitHub account to host your code.
2.  **Git Installed**: You already have this.

## Step 1: Push Code to GitHub

CarWash+ is currently a local repository. You need to push it to GitHub.

1.  **Create a New Repository** on [GitHub](https://github.com/new).
    *   Name it `carwash-plus` (or similar).
    *   Set it to **Private** (recommended for safety) or Public.
    *   **Do not** initialize with README, .gitignore, or license (you already have these).

2.  **Push your local code**:
    Run the following commands in your terminal (VS Code):

    ```powershell
    git remote add origin https://github.com/YOUR_USERNAME/carwash-plus.git
    git branch -M main
    git add .
    git commit -m "Prepare for deployment"
    git push -u origin main
    ```
    *(Replace `YOUR_USERNAME` with your actual GitHub username)*

## Step 2: Create Accounts on Render

1.  Go to [dashboard.render.com](https://dashboard.render.com/).
2.  Sign up using your **GitHub** account.

## Step 3: Create the Database (PostgreSQL)

1.  Click **New +** and select **PostgreSQL**.
2.  **Name**: `carwash-db`
3.  **Region**: Choose one closest to you (e.g., Frankfurt or Ohio).
4.  **PostgreSQL Version**: 16 (or latest).
5.  **Instance Type**: Select **Free**.
6.  Click **Create Database**.
7.  **Wait** for it to be created.
8.  **Copy the "Internal Connection URL"**: You will need this later.
    *   *Note: If you plan to connect from your computer (optional), you might need the "External Connection URL". For the backend deployed on Render, "Internal" is faster and safer.*

## Step 4: Create Redis

1.  Click **New +** and select **Redis**.
2.  **Name**: `carwash-redis`
3.  **Region**: Must be the **same region** as your database and backend.
4.  **Instance Type**: Select **Free**.
5.  Click **Create Redis**.
6.  **Copy the "Internal Connection URL"**: It usually looks like `redis://...`.

## Step 5: Deploy the Backend (Web Service)

1.  Click **New +** and select **Web Service**.
2.  Select **Build and deploy from a Git repository**.
3.  Connect your `carwash-plus` repository.
4.  **Configuration**:
    *   **Name**: `carwash-backend`
    *   **Region**: Same as DB/Redis.
    *   **Branch**: `main`
    *   **Root Directory**: `backend` (Important! This tells Render the app is in the backend folder).
    *   **Runtime**: **Node**
    *   **Build Command**: `npm install; npm run build`
    *   **Start Command**: `npx prisma migrate deploy && npm run start:prod`
    *   **Instance Type**: **Free**.

5.  **Environment Variables**:
    Scroll down to "Environment Variables" and add the following:

    | Key | Value |
    | :--- | :--- |
    | `NODE_ENV` | `production` |
    | `DATABASE_URL` | *(Paste the Internal Create Database URL from Step 3)* |
    | `REDIS_URL` | *(Paste the Internal Redis URL from Step 4)* |
    | `JWT_ACCESS_SECRET` | *(Generate a random long string, e.g. `mysecret123`)* |
    | `JWT_REFRESH_SECRET` | *(Generate another random long string)* |
    | `API_PREFIX` | `api/v1` |
    | `PORT` | `3000` |

6.  Click **Create Web Service**.

## Step 6: Finalize

1.  Render will start building your app. It may take a few minutes.
2.  Watch the **Logs** tab.
3.  Once it says "Build successful" and "Application is running", look for your **Service URL** at the top left (e.g., `https://carwash-backend.onrender.com`).

## Step 7: Update Mobile App

1.  Copy your new Service URL.
2.  Go to `mobile_app/lib/config/app_config.dart`.
3.  Update the `baseUrl` to your new domain:
    ```dart
    static const String baseUrl = 'https://carwash-backend.onrender.com/api/v1';
    ```
4.  Rebuild your mobile app.

**Note:** The free tier on Render "spins down" after 15 minutes of inactivity. The first request after a break might take 30-60 seconds to load. This is normal for the free tier.
