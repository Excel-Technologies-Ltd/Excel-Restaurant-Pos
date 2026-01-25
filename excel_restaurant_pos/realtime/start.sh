#!/bin/bash
# Start custom Socket.IO server with Bearer token authentication

echo "Starting Excel Restaurant POS Socket.IO Server with Bearer Token Auth..."

# Path to custom socketio server
CUSTOM_SOCKETIO="/home/frappe/frappe-bench/apps/excel_restaurant_pos/excel_restaurant_pos/realtime/socketio.js"

# Check if custom server exists
if [ ! -f "$CUSTOM_SOCKETIO" ]; then
    echo "Error: Custom Socket.IO server not found at $CUSTOM_SOCKETIO"
    echo "Falling back to default Frappe Socket.IO server"
    exec node /home/frappe/frappe-bench/apps/frappe/socketio.js
fi

# Run custom server
echo "Using custom Socket.IO server: $CUSTOM_SOCKETIO"
exec node "$CUSTOM_SOCKETIO"
