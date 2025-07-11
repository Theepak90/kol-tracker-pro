# 🍃 MongoDB Atlas Setup Guide

## Free Cloud Database for 24/7 Operation

### Step 1: Create MongoDB Atlas Account
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Sign up for free
3. Create a new project: "KOL Tracker"

### Step 2: Create Database Cluster
1. **Build a Database** → **FREE (M0 Sandbox)**
2. **Cloud Provider**: AWS
3. **Region**: Choose closest to your location
4. **Cluster Name**: `kol-tracker-cluster`
5. **Create Cluster**

### Step 3: Configure Database Access
1. **Database Access** → **Add New Database User**
2. **Username**: `kol-admin`
3. **Password**: Generate secure password (save it!)
4. **Role**: `Atlas Admin`
5. **Add User**

### Step 4: Configure Network Access
1. **Network Access** → **Add IP Address**
2. **Access List Entry**: `0.0.0.0/0` (Allow access from anywhere)
3. **Comment**: "Allow all IPs for deployment"
4. **Confirm**

### Step 5: Get Connection String
1. **Database** → **Connect** → **Connect your application**
2. **Driver**: Node.js
3. **Copy connection string**:
   ```
   mongodb+srv://kol-admin:<password>@kol-tracker-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. **Replace `<password>`** with your actual password

### Step 6: Import Your Data (Optional)
If you want to keep your existing KOL data:

1. **Export local data**:
   ```bash
   mongodump --db kol_tracker --out ./backup
   ```

2. **Import to Atlas**:
   ```bash
   mongorestore --uri "your-atlas-connection-string" ./backup/kol_tracker
   ```

### Step 7: Update Environment Variables
Use this connection string in your deployment:

```bash
MONGODB_URI=mongodb+srv://kol-admin:YOUR_PASSWORD@kol-tracker-cluster.xxxxx.mongodb.net/kol_tracker?retryWrites=true&w=majority
```

## ✅ Database Ready!

Your MongoDB Atlas database is now ready for 24/7 operation with:
- ✅ **Free tier** (512MB storage, 100 connections)
- ✅ **Global access** (works from any deployment platform)
- ✅ **Automatic backups**
- ✅ **99.95% uptime SLA**

---

**Next**: Deploy your backend using this connection string! 🚀 