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

const io = new Server(server, {
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
		await subscriber.connect();
		subscriber.publish("open_in_editor", JSON.stringify(data));
	});
}

realtime.on("connection", on_connection);

// Same Redis channel as Frappe: receive events from Python (frappe.publish_realtime)
const subscriber = get_redis_subscriber();

(async () => {
	await subscriber.connect();
	subscriber.subscribe("events", (message) => {
		message = JSON.parse(message);
		const namespace = "/" + message.namespace;
		if (message.room) {
			io.of(namespace).to(message.room).emit(message.event, message.message);
		} else {
			realtime.emit(message.event, message.message);
		}
	});
})();

const port = conf.socketio_token_port || 9001;
server.listen(port, () => {
	console.log(`Realtime (token auth) listening on: ws://0.0.0.0:${port}`);
});
