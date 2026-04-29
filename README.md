<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Team Kavyati - Elite Platform

## Deployment (Netlify)

This project uses **Netlify Functions** for the M-Pesa backend. 

### 1. Setup Environment Variables
In Netlify dashboard, add:
- `DARAJA_CONSUMER_KEY`
- `DARAJA_CONSUMER_SECRET`
- `DARAJA_PASSKEY`
- `DARAJA_BUSINESS_SHORTCODE`
- `DARAJA_CALLBACK_URL`: `https://YOUR-SITE.netlify.app/api/callback`
- `FIREBASE_SERVICE_ACCOUNT`: Content of your `service-account.json`
- `VITE_FIREBASE_PROJECT_ID`

### 2. Push to GitHub
Commit all changes (including `netlify/` and `netlify.toml`) and push. Netlify will automatically detect the functions and deploy them.

## Local Development

1. Install dependencies: `npm install`
2. Run local server: `npx tsx server.ts`
3. Run frontend: `npm run dev`
