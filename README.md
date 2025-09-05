# Ticket Mini-App (Next.js + Vercel)

## 1) Set environment variables
Create `.env.local` in the project root:
```
APPS_SCRIPT_ENDPOINT=https://script.google.com/macros/s/REPLACE_WITH_DEPLOYMENT_ID/exec
APPS_SCRIPT_SECRET=REPLACE_WITH_SECRET
```

## 2) Install & run locally
```
npm install
npm run dev
# open http://localhost:3000
```

## 3) Deploy on Vercel
- Push this project to GitHub.
- In Vercel, import the repo. Add the same env vars in the project's Settings → Environment Variables.
- Deploy. Done.
