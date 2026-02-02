/**
 * Socket.IO server with token-only authentication.
 * Same behavior as Frappe realtime: multitenancy (namespace = site), Redis events,
 * doctype/doc subscribe, ping/pong. Accepts only Authorization: Bearer <token>.
 */
const { Server } = require("socket.io");
const http = require("node:http");
const path = require("path");

const bench_path = process.env.FRAPPE_BENCH_ROOT || path.resolve(__dirname, "..", "..", "..");
const { get_conf, get_redis_subscriber } = require(path.join(bench_path, "apps", "frappe", "node_utils.js"));
const conf = get_conf();

const server = http.createServer();

// path: when behind a reverse proxy (e.g. /socket-token), set socketio_token_path in common_site_config so client path matches
const socketPath = conf.socketio_token_path || "/socket.io";
const io = new Server(server, {
	path: socketPath,
	cors: {
		origin: true,
		credentials: true,
	},
	cleanupEmptyChildNamespaces: true,
});

// Multitenancy: namespace = site name (same as Frappe)
const realtime = io.of(/^\/.*$/);

const authenticate_token = require("./middlewares/authenticate_token");
realtime.use(authenticate_token);

const frappe_handlers = require("./handlers/frappe_handlers");

function on_connection(socket) {
	frappe_handlers(realtime, socket);

	socket.on("open_in_editor", async (data) => {
		if (typeof subscriber.connect === "function") await subscriber.connect();
		subscriber.publish("open_in_editor", JSON.stringify(data));
	});
}

realtime.on("connection", on_connection);

// Same Redis channel as Frappe: receive events from Python (frappe.publish_realtime)
const subscriber = get_redis_subscriber();

(async () => {
	// Support both @redis/client (has .connect()) and older redis clients (auto-connect)
	if (typeof subscriber.connect === "function") {
		await subscriber.connect();
	}
	// node-redis v4: subscribe(channel, (message) => {}); older redis v3: on("message", (channel, message) => {})
	const onMessage = (messageOrChannel, message) => {
		const raw = typeof message === "string" ? message : messageOrChannel;
		let messageObj;
		try {
			messageObj = JSON.parse(raw);
		} catch {
			return;
		}
		const namespace = "/" + messageObj.namespace;
		if (messageObj.room) {
			io.of(namespace).to(messageObj.room).emit(messageObj.event, messageObj.message);
		} else {
			realtime.emit(messageObj.event, messageObj.message);
		}
	};
	if (subscriber.subscribe.length >= 2) {
		subscriber.subscribe("events", onMessage);
	} else {
		subscriber.subscribe("events");
		subscriber.on("message", (channel, message) => onMessage(channel, message));
	}
})();

const port = conf.socketio_token_port || 9001;
server.listen(port, () => {
	console.log(`Realtime (token auth) listening on: ws://0.0.0.0:${port} path: ${socketPath}`);
});
