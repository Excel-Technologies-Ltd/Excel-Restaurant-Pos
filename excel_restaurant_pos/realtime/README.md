# Excel Restaurant POS Custom Socket.IO Server

This directory contains a separate Socket.IO server for the Excel Restaurant POS app with bearer token authentication support.

## Features

- ✅ **Bearer Token Authentication** - No cookies required
- ✅ **Separate from Frappe Core** - Runs independently on port 9001
- ✅ **Receives ALL Frappe Events** - Subscribes to Frappe's "events" Redis channel
- ✅ **Custom App Events** - Also supports custom app-specific events
- ✅ **Redis Integration** - Receives events from Python via Redis pub-sub
- ✅ **Room-based Messaging** - Support for targeted messaging to specific rooms/users
- ✅ **Dual Namespace Support** - Works with both Frappe standard namespaces and custom app namespaces

## Architecture

```
Client (Bearer Token)
    ↓
Custom Socket.IO Server (Port 9001)
    ↓
Authentication Middleware (Validates Bearer Token)
    ↓
Frappe API (/api/method/frappe.realtime.get_user_info)
    ↓
Event Handlers
    ↑
Redis "events" channel (Frappe events)
Redis "excel_restaurant_pos_events" channel (Custom events)
```

## How It Works

This server is an **extension** of Frappe's default socket server:

1. **Receives ALL Frappe Events**: Subscribes to Frappe's standard "events" Redis channel
2. **Site Namespace Support**: Works with Frappe's site-based namespaces (e.g., `/site1.localhost`)
3. **Custom App Namespace**: Also supports custom namespaces (e.g., `/excel_restaurant_pos/site1.localhost`)
4. **Bearer Token Only**: Uses bearer token authentication (no cookies required)
5. **Runs Alongside Frappe Server**: Works in parallel with Frappe's default socketio server

## Configuration

The server runs on port **9001** by default (different from Frappe's default 9000).

You can configure the port in `bench/config.json`:
```json
{
  "excel_restaurant_pos_socketio_port": 9001
}
```

## Starting the Server

The server is automatically started via Procfile:
```bash
bench start
```

Or start it manually:
```bash
node apps/excel_restaurant_pos/excel_restaurant_pos/realtime/socketio.js
```

## Client Connection

### JavaScript/TypeScript

#### Connect to Frappe Standard Namespace (receives all Frappe events)

```javascript
import { io } from 'socket.io-client';

// Connect to site namespace (receives all Frappe realtime events)
const socket = io('http://your-frappe-site:9001/site1.localhost', {
  extraHeaders: {
    'Authorization': 'Bearer your-jwt-token-here'
  },
  withCredentials: false
});

// Listen to Frappe events
socket.on('list_update', (data) => {
  console.log('Frappe list update:', data);
});

socket.on('docinfo_update', (data) => {
  console.log('Frappe doc update:', data);
});

socket.on('task_progress', (data) => {
  console.log('Frappe task progress:', data);
});
```

#### Connect to Custom App Namespace (receives both Frappe and custom events)

```javascript
// Connect to custom app namespace
const socket = io('http://your-frappe-site:9001/excel_restaurant_pos/site1.localhost', {
  extraHeaders: {
    'Authorization': 'Bearer your-jwt-token-here'
  },
  withCredentials: false
});

// Listen to both Frappe events AND custom app events
socket.on('list_update', (data) => {
  console.log('Frappe list update:', data);
});

socket.on('order:updated', (data) => {
  console.log('Custom order update:', data);
});

// Join a room
socket.emit('room:join', 'kitchen');

// Leave a room
socket.emit('room:leave', 'kitchen');
```

### Python (Publishing Events)

```python
from excel_restaurant_pos.realtime.utils import publish_event, publish_to_room, publish_to_user

# Publish to all clients in namespace
publish_event('order:updated', {
    'order_id': 'ORD-001',
    'status': 'preparing'
})

# Publish to a specific room
publish_to_room('kitchen', 'order:new', {
    'order_id': 'ORD-001',
    'items': [...]
})

# Publish to a specific user
publish_to_user('waiter@example.com', 'notification', {
    'message': 'New order received'
})
```

## Custom Event Handlers

Edit `handlers.js` to add your custom event handlers:

```javascript
socket.on("your:event", async (data) => {
  // Your handler logic
  socket.emit("your:response", { result: "success" });
});
```

## Namespaces

The server uses namespaces for multi-tenancy:
- Default: `/excel_restaurant_pos/default`
- Site-specific: `/excel_restaurant_pos/{site_name}`

## Authentication Flow

1. Client connects with `Authorization: Bearer <token>` header
2. Middleware validates token format
3. Middleware calls Frappe API with bearer token
4. Your `auth.py` validates the JWT token
5. User info is stored on socket
6. Connection is established

## Troubleshooting

### Server won't start
- Check if port 9001 is available
- Verify Node.js version matches Frappe requirements
- Check logs for errors

### Authentication fails
- Verify bearer token is valid
- Check that `auth.py` is properly validating tokens
- Ensure token format is `Bearer <token>`

### Events not received
- Verify Redis connection
- Check Redis channel name matches (`excel_restaurant_pos_events`)
- Ensure client is connected to correct namespace

## Development

To test locally:
```bash
# Terminal 1: Start the socket server
node apps/excel_restaurant_pos/excel_restaurant_pos/realtime/socketio.js

# Terminal 2: Test connection (using a tool like wscat or your client)
```

## Production

In production, the server runs via Procfile with process managers like:
- systemd
- supervisor
- PM2
- Docker

Make sure to configure proper logging and monitoring.
