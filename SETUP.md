# MERN Portfolio - Setup Instructions

## ⚠️ ONE THING YOU MUST DO BEFORE RUNNING

Open `backend/.env` and replace `YOUR_PASSWORD_HERE` with your real MongoDB Atlas password:

```
MONGODB_URI=mongodb+srv://makedreams0048:YOUR_PASSWORD_HERE@nikhilsuryawanshi.ozybx.mongodb.net/portfolio?retryWrites=true&w=majority
```

---

## Running the Project

### Terminal 1 — Backend
```powershell
cd backend
npm install
npm run dev
```
✅ Should show: "Server running on port 5001" + "MongoDB connected successfully"

### Terminal 2 — Frontend (new window)
```powershell
cd frontend
npm install
npm run dev
```
✅ Should show: "Local: http://localhost:3000"

---

## Check it works

| URL | What you should see |
|-----|-------------------|
| http://localhost:3000 | Your portfolio website |
| http://localhost:5001/health | JSON: status "healthy" |
| http://localhost:5001/api/v1/projects | JSON array (empty is fine) |

---

## What's already configured
- ✅ PORT=5001 (backend)
- ✅ Frontend points to backend correctly
- ✅ CORS set to localhost:3000
- ✅ Redis DISABLED (not needed)
- ✅ Real-time notifications DISABLED (needs Redis)
- ✅ Email DISABLED (configure later)
- ✅ JWT secrets set

## Enable later (optional)
- Email: fill in SMTP_* values in backend/.env
- Image uploads: fill in CLOUDINARY_* values
- GitHub repos: fill in GITHUB_TOKEN and GITHUB_USERNAME
