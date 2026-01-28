// Use socket.io from Frappe's node_modules
// Resolve path relative to this file's location
const path = require("path");
const frappePath = path.resolve(__dirname, "../../../frappe");
const { Server } = require(path.join(frappePath, "node_modules/socket.io"));
const http = require("node:http");
const { get_conf, get_redis_subscriber } = require(path.join(frappePath, "node_utils"));
const authenticate = require("./middlewares/authenticate");
const conf = get_conf();

const server = http.createServer();

// Create Socket.IO server with CORS support
// When behind Traefik with path prefix, Socket.IO handles paths automatically
let io = new Server(server, {
	cors: {
		origin: true, // Allow all origins (you can restrict this)
		credentials: false, // No cookies needed for bearer token auth
		methods: ["GET", "POST"],
	},
	cleanupEmptyChildNamespaces: true,
	// Allow Socket.IO to work behind reverse proxy (Traefik)
	allowEIO3: true,
	transports: ["websocket", "polling"],
});

// Support both Frappe's standard namespaces and custom app namespaces
// This allows the server to receive all Frappe events
const frappeNamespace = io.of(/^\/.*$/); // Matches all namespaces like Frappe does
const appNamespace = io.of(/^\/excel_restaurant_pos\/.*$/); // Custom app namespace

// Apply authentication middleware to all namespaces
frappeNamespace.use(authenticate);
appNamespace.use(authenticate);

// Handle connections on Frappe namespaces (receives all Frappe events)
frappeNamespace.on("connection", (socket) => {
	console.log(`[Frappe] Client connected: ${socket.id}, User: ${socket.user}, Namespace: ${socket.nsp.name}`);

	// Load app-specific handlers for Frappe namespace too
	const handlers = require("./handlers");
	if (handlers && typeof handlers === "function") {
		handlers(socket);
	}

	// Handle disconnection
	socket.on("disconnect", (reason) => {
		console.log(`[Frappe] Client disconnected: ${socket.id}, Reason: ${reason}`);
	});

	// Handle errors
	socket.on("error", (error) => {
		console.error(`[Frappe] Socket error for ${socket.id}:`, error);
	});
});

// Handle connections on custom app namespace
appNamespace.on("connection", (socket) => {
	console.log(`[App] Client connected: ${socket.id}, User: ${socket.user}, Namespace: ${socket.nsp.name}`);

	// Load app-specific handlers
	const handlers = require("./handlers");
	if (handlers && typeof handlers === "function") {
		handlers(socket);
	}

	// Handle disconnection
	socket.on("disconnect", (reason) => {
		console.log(`[App] Client disconnected: ${socket.id}, Reason: ${reason}`);
	});

	// Handle errors
	socket.on("error", (error) => {
		console.error(`[App] Socket error for ${socket.id}:`, error);
	});
});

// Consume events from Python via Redis pub-sub
// Subscribe to BOTH Frappe's standard "events" channel AND custom app events
const subscriber = get_redis_subscriber();

// Handle Redis messages (synchronous, like Frappe's socketio.js)
subscriber.on("message", function (_channel, message) {
	try {
		const data = JSON.parse(message);
		const room = data.room;
		const event = data.event;
		const payload = data.message;

		// Frappe sends namespace as null, but includes site name in room
		// Room format: "{site}:doc:{doctype}/{name}" or "{site}:doctype:{doctype}" or "{site}:user:{email}"
		// Extract site name from room to determine namespace
		let namespace = data.namespace;
		if (!namespace && room) {
			// Extract site name from room (first part before ":")
			const roomParts = room.split(":");
			if (roomParts.length >= 2) {
				namespace = roomParts[0]; // e.g., "arcpos.aninda.me"
			}
		}

		// Build namespace path
		const namespacePath = "/" + (namespace || "");

		console.log(`[Redis] Event: ${event}, Namespace: ${namespacePath}, Room: ${room || "broadcast"}`);

		// Forward to the site-specific namespace
		const targetNs = io.of(namespacePath);
		if (room) {
			targetNs.to(room).emit(event, payload);
		} else {
			targetNs.emit(event, payload);
		}

		// Also forward to custom app namespace (if clients are connected there)
		if (namespace) {
			const appNs = io.of(`/excel_restaurant_pos/${namespace}`);
			if (room) {
				appNs.to(room).emit(event, payload);
			} else {
				appNs.emit(event, payload);
			}
		}
	} catch (err) {
		console.error("Error processing Redis message:", err);
	}
});

// Subscribe to Frappe's standard "events" channel (receives all Frappe realtime events)
subscriber.subscribe("events");

console.log("Redis subscriber connected for 'events' channel");

// Start server
const port = conf.excel_restaurant_pos_socketio_port || conf.socketio_port || 9000; // Default to 9000 (same as Frappe)
const uds = conf.excel_restaurant_pos_socketio_uds;

server.listen(uds || port, () => {
	if (uds) {
		console.log(`Excel Restaurant POS Socket.IO listening on UDS: ${uds}`);
	} else {
		console.log(`Excel Restaurant POS Socket.IO listening on: ws://0.0.0.0:${port}`);
	}
});

// Graceful shutdown
process.on("SIGTERM", () => {
	console.log("SIGTERM received, shutting down gracefully");
	server.close(() => {
		subscriber.quit();
		process.exit(0);
	});
});

process.on("SIGINT", () => {
	console.log("SIGINT received, shutting down gracefully");
	server.close(() => {
		subscriber.quit();
		process.exit(0);
	});
});

module.exports = { io, appNamespace };
