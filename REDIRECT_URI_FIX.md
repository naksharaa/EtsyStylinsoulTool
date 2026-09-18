# Fixing "The requested redirect URL is not permitted" Error

## The Problem

You're seeing this error because the **Redirect URI** in your app doesn't match what's registered in your Etsy developer app, OR it's using HTTP instead of HTTPS.

## What You Need To Do

### Step 1: Find Your App's Actual URL

Look at your browser's address bar. You should see something like:
- `https://8080-idx-...cloudshell.dev` (if using Google Cloud Shell)
- `https://your-app.vercel.app` (if deployed to Vercel)
- `https://localhost:3000` (if running locally with HTTPS)

**Copy this URL exactly** - this is what you need to register with Etsy.

### Step 2: Register the Redirect URI in Etsy

1. Go to [https://www.etsy.com/developers/your-apps](https://www.etsy.com/developers/your-apps)
2. Click on your app
3. Find the **Redirect URI** field
4. Add your app's URL (from Step 1)
5. Make sure it's **HTTPS** (not HTTP)
6. Save the changes

### Step 3: Update Your App Settings

1. In your app, go to **Settings** → **Etsy API**
2. In the **Redirect URI** field, enter the **EXACT SAME URL** you registered in Etsy
3. Click **Save Configuration**

### Step 4: Try Connecting Again

1. Go back to the **Dashboard**
2. Click **Connect Etsy Shop**
3. You should now be redirected to Etsy's authorization page

## Common Mistakes

❌ **Wrong**: Using `http://localhost:3000` (HTTP instead of HTTPS)  
✅ **Right**: Using `https://localhost:3000` or your deployed HTTPS URL

❌ **Wrong**: Adding a trailing slash `https://your-app.com/`  
✅ **Right**: No trailing slash `https://your-app.com`

❌ **Wrong**: Adding query parameters `https://your-app.com?callback=true`  
✅ **Right**: Clean URL `https://your-app.com`

❌ **Wrong**: Mismatch between app and Etsy settings  
✅ **Right**: Exact match in both places

## If You're Running Locally

If you're running the app on `localhost`, you need to use HTTPS. Here are your options:

### Option A: Use a Tunnel Service (Recommended for Testing)

Use a service like [ngrok](https://ngrok.com/) or [localtunnel](https://localtunnel.github.io/www/) to create an HTTPS tunnel:

```bash
# Using ngrok
ngrok http 3000

# This will give you an HTTPS URL like:
# https://abc123.ngrok.io
```

Then register that HTTPS URL in both Etsy and your app settings.

### Option B: Deploy to Vercel (Recommended for Production)

Deploy your app to Vercel to get a free HTTPS URL:

```bash
npm install -g vercel
vercel
```

Then use the Vercel URL (e.g., `https://your-app.vercel.app`) in both Etsy and your app settings.

### Option C: Use mkcert for Local HTTPS

For local development with HTTPS:

```bash
# Install mkcert
brew install mkcert

# Create local CA
mkcert -install

# Generate certificate for localhost
mkcert localhost

# Configure Vite to use HTTPS (add to vite.config.js):
# server: { https: true }
```

## Verification Checklist

Before clicking "Connect Etsy Shop", verify:

- [ ] Redirect URI in Etsy app uses HTTPS
- [ ] Redirect URI in your app settings uses HTTPS
- [ ] Both URLs match EXACTLY (character for character)
- [ ] No trailing slashes
- [ ] No query parameters
- [ ] No port numbers (unless your deployed URL has one)

## Debug Information

If you're still having issues, check the browser console (F12) when you click "Connect Etsy Shop". You should see:

```
Redirecting to Etsy OAuth: https://www.etsy.com/oauth/connect?...
Redirect URI being used: https://your-actual-url.com
```

This will show you exactly what URL is being sent to Etsy.

## Need Help?

If you're still stuck after following these steps, please provide:
1. The exact Redirect URI you're using in your app
2. The exact Redirect URI registered in your Etsy app
3. Your app's actual URL (from the browser address bar)
4. Any error messages from the browser console
