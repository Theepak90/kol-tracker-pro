#!/bin/bash

# Monitor script to keep Telethon service running
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$SCRIPT_DIR/telethon_monitor.log"
PID_FILE="$SCRIPT_DIR/telethon.pid"

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

start_telethon() {
    cd "$SCRIPT_DIR"
    log_message "Starting Telethon service..."
    python3 main.py &
    echo $! > "$PID_FILE"
    log_message "Telethon service started with PID $(cat $PID_FILE)"
}

stop_telethon() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            log_message "Stopping Telethon service (PID: $PID)..."
            kill "$PID"
            sleep 2
            if kill -0 "$PID" 2>/dev/null; then
                kill -9 "$PID"
            fi
        fi
        rm -f "$PID_FILE"
    fi
}

check_service() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            # Check if the service is responding
            if curl -s http://localhost:8000/health > /dev/null 2>&1; then
                return 0  # Service is running and healthy
            else
                log_message "Service is running but not responding to health checks"
                return 1
            fi
        else
            log_message "PID file exists but process is not running"
            rm -f "$PID_FILE"
            return 1
        fi
    else
        return 1  # No PID file
    fi
}

case "$1" in
    start)
        log_message "Start command received"
        stop_telethon
        start_telethon
        ;;
    stop)
        log_message "Stop command received"
        stop_telethon
        ;;
    restart)
        log_message "Restart command received"
        stop_telethon
        sleep 2
        start_telethon
        ;;
    monitor)
        log_message "Starting monitor mode..."
        while true; do
            if ! check_service; then
                log_message "Service is down, restarting..."
                stop_telethon
                sleep 5
                start_telethon
                sleep 10  # Give it time to start
            else
                log_message "Service is healthy"
            fi
            sleep 30  # Check every 30 seconds
        done
        ;;
    status)
        if check_service; then
            echo "Telethon service is running and healthy"
        else
            echo "Telethon service is not running"
        fi
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|monitor|status}"
        exit 1
        ;;
esac 