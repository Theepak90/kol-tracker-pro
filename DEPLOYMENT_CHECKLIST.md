# Render Deployment Checklist

## Pre-Deployment Setup

- [ ] **MongoDB Atlas Setup**
  - [ ] Create free MongoDB Atlas cluster
  - [ ] Create database user with read/write permissions
  - [ ] Whitelist all IP addresses (0.0.0.0/0)
  - [ ] Get connection string

- [ ] **Telegram Setup**
  - [ ] Get API_ID and API_HASH from my.telegram.org
  - [ ] Run local authentication (`python auth_setup.py`)
  - [ ] Save session file securely

- [ ] **Repository Setup**
  - [ ] Code pushed to GitHub
  - [ ] All sensitive data in environment variables
  - [ ] Dependencies properly configured

## Render Deployment

- [ ] **Backend Service**
  - [ ] Create new web service in Render
  - [ ] Connect GitHub repository
  - [ ] Set build command: `cd backend && npm ci && npm run build`
  - [ ] Set start command: `cd backend && npm run start:prod`
  - [ ] Configure environment variables:
    - [ ] NODE_ENV=production
    - [ ] PORT=3000
    - [ ] MONGODB_URI
    - [ ] JWT_SECRET
    - [ ] TELETHON_SERVICE_URL

- [ ] **Telethon Service**
  - [ ] Create new web service in Render
  - [ ] Connect GitHub repository
  - [ ] Set build command: `cd backend/telethon_service && pip install -r requirements.txt`
  - [ ] Set start command: `cd backend/telethon_service && python main.py`
  - [ ] Configure environment variables:
    - [ ] PYTHON_VERSION=3.9.16
    - [ ] API_ID
    - [ ] API_HASH
    - [ ] SESSION_NAME=telegram_session
    - [ ] MONGODB_URI
    - [ ] PORT=8000

## Post-Deployment Testing

- [ ] **Health Checks**
  - [ ] Backend: `https://kol-tracker-backend.onrender.com/api`
  - [ ] Telethon: `https://kol-tracker-telethon.onrender.com/health`

- [ ] **API Testing**
  - [ ] Test backend endpoints
  - [ ] Test Telethon endpoints
  - [ ] Verify database connectivity

- [ ] **Frontend Configuration**
  - [ ] Update API base URLs in frontend
  - [ ] Test frontend connectivity
  - [ ] Verify CORS configuration

## Monitoring & Maintenance

- [ ] **Service Monitoring**
  - [ ] Set up health check pings
  - [ ] Monitor service logs
  - [ ] Set up alerts for failures

- [ ] **Performance Optimization**
  - [ ] Implement keep-alive script
  - [ ] Monitor response times
  - [ ] Consider upgrading to paid tier

## Security Checklist

- [ ] **Environment Security**
  - [ ] No sensitive data in code
  - [ ] Strong database passwords
  - [ ] Secure session file storage

- [ ] **API Security**
  - [ ] CORS properly configured
  - [ ] Rate limiting implemented
  - [ ] Authentication working

## Troubleshooting

- [ ] **Common Issues Resolved**
  - [ ] Database connection issues
  - [ ] CORS errors
  - [ ] Service startup failures
  - [ ] Telegram authentication problems

---

**Service URLs**:
- Backend: `https://kol-tracker-backend.onrender.com`
- Telethon: `https://kol-tracker-telethon.onrender.com`

**Next Steps**:
1. Complete checklist items
2. Deploy services
3. Test thoroughly
4. Monitor performance
5. Update frontend configuration 