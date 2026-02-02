/**
 * Token-only authentication for Socket.IO.
 * Requires Authorization: Bearer <token>. No cookie/sid.
 * Validates token by calling Frappe's get_user_info API with the token.
 */
const request = require("superagent");
const path = require("path");

// Resolve Frappe's node_utils from bench (apps/frappe/node_utils.js)
const bench_path = process.env.FRAPPE_BENCH_ROOT || path.resolve(__dirname, "..", "..", "..", "..");
const { get_conf } = require(path.join(bench_path, "apps", "frappe", "node_utils.js"));
const conf = get_conf();
const { get_url } = require("../utils");

function get_site_name(socket) {
	if (socket.site_name) {
		return socket.site_name;
	}
	if (socket.request.headers["x-frappe-site-name"]) {
		socket.site_name = get_hostname(socket.request.headers["x-frappe-site-name"]);
	} else if (
		conf.default_site &&
		["localhost", "127.0.0.1"].indexOf(get_hostname(socket.request.headers.host)) !== -1
	) {
		socket.site_name = conf.default_site;
	} else if (socket.request.headers.origin) {
		socket.site_name = get_hostname(socket.request.headers.origin);
	} else {
		socket.site_name = get_hostname(socket.request.headers.host);
	}
	return socket.site_name;
}

function get_hostname(url) {
	if (!url) return undefined;
	if (url.indexOf("://") > -1) {
		url = url.split("/")[2];
	}
	return url.match(/:/g) ? url.slice(0, url.indexOf(":")) : url;
}

function authenticate_token(socket, next) {
	const namespace = socket.nsp.name.slice(1);

	if (namespace !== get_site_name(socket)) {
		next(new Error("Invalid namespace"));
		return;
	}

	if (get_hostname(socket.request.headers.host) !== get_hostname(socket.request.headers.origin)) {
		next(new Error("Invalid origin"));
		return;
	}

	const authorization_header = socket.handshake.auth?.token ?? socket.handshake.query?.token;	
	if (!authorization_header || !authorization_header.toLowerCase().startsWith("bearer ")) {
		next(new Error("Missing or invalid Authorization header. Use: Authorization: Bearer <token>"));
		return;
	}

	const auth_req = request
		.get(get_url(socket, "/api/method/frappe.realtime.get_user_info"))
		.set("Authorization", authorization_header);

	auth_req
		.type("form")
		.then((res) => {
			socket.user = res.body.message.user;
			socket.user_type = res.body.message.user_type;
			socket.authorization_header = authorization_header;
			next();
		})
		.catch((e) => {
			next(new Error(`Unauthorized: ${e.message || e}`));
		});
}

module.exports = authenticate_token;
