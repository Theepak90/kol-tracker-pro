module.exports = {
  apps: [
    {
      name: 'kol-backend',
      cwd: './backend',
      script: 'npm',
      args: 'run start:dev',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend.log',
      time: true,
      restart_delay: 5000,
      max_restarts: 10
    },
    {
      name: 'kol-telethon',
      cwd: './backend/telethon_service',
      script: 'python3',
      args: 'main.py',
      env: {
        API_ID: '28152923',
        API_HASH: '766760d2838474a5e6dd734d785aa7ad',
        SESSION_NAME: 'telegram_session',
        PORT: 8000
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      error_file: './logs/telethon-error.log',
      out_file: './logs/telethon-out.log',
      log_file: './logs/telethon.log',
      time: true,
      restart_delay: 10000,
      max_restarts: 5
    },
    {
      name: 'kol-frontend',
      cwd: './',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development',
        PORT: 5173
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend.log',
      time: true,
      restart_delay: 5000,
      max_restarts: 10
    }
  ]
}; 