# SRA System - Quick Start (30 seconds)

## Prerequisites
- MongoDB running locally or Docker
- Node.js v16+

## Run These Commands

### Terminal 1 - Setup & Seed
```powershell
cd backend
npm install
node scripts/seed.js
npm start
```
✓ Backend runs on http://localhost:5000

### Terminal 2 - Frontend
```powershell
cd frontend
npm install
npm run dev
```
✓ Frontend runs on http://localhost:5173

### Terminal 3 (Optional) - Check Backend
```powershell
curl http://localhost:5000/api/docs
```

---

## 🔐 Login Credentials

```
Email: admin@example.com
Password: Admin123!
```

Other accounts:
- analyst@example.com / Analyst123!
- viewer@example.com / Viewer123!

---

## Browser

Open: **http://localhost:5173**

---

## What Works

✅ Login/Authentication  
✅ Dashboard with real-time metrics  
✅ File upload (CSV/XLSX)  
✅ Record reconciliation  
✅ Audit trail  
✅ Modern responsive UI  
✅ Role-based access control  

---

## If Something Goes Wrong

### MongoDB not running?
```powershell
# Windows: If installed globally
mongod

# Or Docker:
docker run -d -p 27017:27017 mongo:latest
```

### Port 5000/5173 in use?
```powershell
# Kill process on port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change PORT in backend/uploads/.env
```

### Seed script failed?
```powershell
# Clear database and reseed
cd backend
node scripts/seed.js
```

### Still having issues?
- Check `backend/uploads/.env` has `MONGO_URI=mongodb://127.0.0.1:27017/reconciliation`
- Check `frontend/src/context/AuthContext.jsx` has `axios.defaults.baseURL = 'http://localhost:5000'`
- Restart both servers

---

Done! 🎉
