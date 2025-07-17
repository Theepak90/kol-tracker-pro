#!/bin/bash

# KOL Tracker Pro - Service Management Script

show_help() {
    echo "🔧 KOL Tracker Pro Service Management"
    echo ""
    echo "Usage: ./manage-services.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start     - Start all services"
    echo "  stop      - Stop all services"
    echo "  restart   - Restart all services"
    echo "  status    - Show service status"
    echo "  logs      - Show logs for all services"
    echo "  logs-be   - Show backend logs"
    echo "  logs-tel  - Show telethon logs"
    echo "  logs-fe   - Show frontend logs"
    echo "  monitor   - Monitor services in real-time"
    echo "  auth      - Setup Telegram authentication"
    echo "  cleanup   - Clean up and reset all services"
    echo "  help      - Show this help message"
    echo ""
}

start_services() {
    echo "🚀 Starting all services..."
    ./start-services.sh
}

stop_services() {
    echo "🛑 Stopping all services..."
    pm2 stop all
    echo "✅ All services stopped"
}

restart_services() {
    echo "🔄 Restarting all services..."
    pm2 restart all
    echo "✅ All services restarted"
}

show_status() {
    echo "📊 Service Status:"
    pm2 status
    echo ""
    echo "🌐 Service URLs:"
    echo "Frontend: http://localhost:5173"
    echo "Backend:  http://localhost:3000"
    echo "Telethon: http://localhost:8000"
}

show_logs() {
    echo "📋 Showing logs for all services..."
    pm2 logs
}

show_backend_logs() {
    echo "📋 Backend logs:"
    pm2 logs kol-backend
}

show_telethon_logs() {
    echo "📋 Telethon logs:"
    pm2 logs kol-telethon
}

show_frontend_logs() {
    echo "📋 Frontend logs:"
    pm2 logs kol-frontend
}

monitor_services() {
    echo "📈 Monitoring services..."
    pm2 monit
}

setup_auth() {
    echo "🔐 Setting up authentication..."
    ./setup-auth.sh
}

cleanup_services() {
    echo "🧹 Cleaning up services..."
    pm2 stop all 2>/dev/null || true
    pm2 delete all 2>/dev/null || true
    
    # Kill any remaining processes
    lsof -ti:3000,8000,5173 | xargs kill -9 2>/dev/null || true
    
    # Clean up session files
    rm -f backend/telethon_service/telegram_session.session* 2>/dev/null || true
    rm -f backend/telethon_service/telethon.pid 2>/dev/null || true
    
    echo "✅ Cleanup complete"
}

case "$1" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    logs-be)
        show_backend_logs
        ;;
    logs-tel)
        show_telethon_logs
        ;;
    logs-fe)
        show_frontend_logs
        ;;
    monitor)
        monitor_services
        ;;
    auth)
        setup_auth
        ;;
    cleanup)
        cleanup_services
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "❌ Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac 