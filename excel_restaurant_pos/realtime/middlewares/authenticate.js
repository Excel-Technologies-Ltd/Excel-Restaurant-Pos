const { get_conf } = require("../../../../frappe/node_utils");
const { get_url } = require("../../../../frappe/realtime/utils");
const conf = get_conf();

/**
 * Authentication middleware for Excel Restaurant POS Socket.IO server
 * Supports bearer token authentication without requiring cookies
 * Handles both Frappe standard namespaces and custom app namespaces
 */
function authenticate(socket, next) {
	// Extract namespace and validate site name (similar to Frappe's approach)
	let namespace = socket.nsp.name;
	namespace = namespace.slice(1, namespace.length); // remove leading `/`

	// Extract site name from namespace
	let site_name = get_site_name(socket, namespace);

	// Validate namespace matches site name (for Frappe namespaces)
	if (namespace.startsWith("excel_restaurant_pos/")) {
		// Custom app namespace: /excel_restaurant_pos/{site_name}
		const parts = namespace.split("/");
		if (parts.length >= 2) {
			site_name = parts[1];
		}
	} else if (namespace !== site_name) {
		// For standard Frappe namespaces, validate they match
		next(new Error("Invalid namespace"));
		return;
	}

	// Validate origin (similar to Frappe)
	if (get_hostname(socket.request.headers.host) != get_hostname(socket.request.headers.origin)) {
		next(new Error("Invalid origin"));
		return;
	}

	const authorization_header = socket.request.headers.authorization;

	// Validate that authorization header is provided
	if (!authorization_header) {
		next(new Error("Missing Authorization header. Bearer token required."));
		return;
	}

	// Validate bearer token format
	const bearerPattern = /^Bearer\s+.+$/i;
	if (!bearerPattern.test(authorization_header)) {
		next(
			new Error(
				"Invalid Authorization header format. Expected format: 'Bearer <token>'"
			)
		);
		return;
	}

	// Store authorization header and site name
	socket.authorization_header = authorization_header;
	socket.site_name = site_name;

	// Create frappe_request function for API calls
	socket.frappe_request = (path, args = {}, opts = {}) => {
		let query_args = new URLSearchParams(args);
		if (query_args.toString()) {
			path = path + "?" + query_args.toString();
		}

		const headers = {
			Authorization: socket.authorization_header,
		};

		// Get the base URL from origin or use default
		const baseUrl = socket.request.headers.origin || get_default_url(socket);

		return fetch(baseUrl + path, {
			...opts,
			headers,
		});
	};

	// Authenticate by calling Frappe's get_user_info endpoint
	socket
		.frappe_request("/api/method/frappe.realtime.get_user_info")
		.then((res) => {
			if (!res.ok) {
				throw new Error(`Authentication failed: ${res.status} ${res.statusText}`);
			}
			return res.json();
		})
		.then(({ message }) => {
			if (!message || !message.user) {
				throw new Error("Invalid user info response from server");
			}

			// Store user information on socket
			socket.user = message.user;
			socket.user_type = message.user_type;
			socket.installed_apps = message.installed_apps || [];

			// Authentication successful
			next();
		})
		.catch((e) => {
			console.error("Authentication error:", e);
			next(new Error(`Unauthorized: ${e.message || e}`));
		});
}

function get_site_name(socket, namespace) {
	if (socket.site_name) {
		return socket.site_name;
	} else if (socket.request.headers["x-frappe-site-name"]) {
		socket.site_name = get_hostname(socket.request.headers["x-frappe-site-name"]);
	} else if (
		conf.default_site &&
		["localhost", "127.0.0.1"].indexOf(get_hostname(socket.request.headers.host)) !== -1
	) {
		socket.site_name = conf.default_site;
	} else if (socket.request.headers.origin) {
		socket.site_name = get_hostname(socket.request.headers.origin);
	} else if (namespace && !namespace.startsWith("excel_restaurant_pos/")) {
		// Use namespace as site name for Frappe standard namespaces
		socket.site_name = namespace;
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

function get_default_url(socket) {
	// Try to get URL from headers
	if (socket.request.headers.origin) {
		return socket.request.headers.origin;
	}

	if (socket.request.headers.host) {
		const protocol = socket.request.headers["x-forwarded-proto"] || "http";
		return `${protocol}://${socket.request.headers.host}`;
	}

	// Fallback to configured webserver
	if (conf.webserver_port) {
		return `http://localhost:${conf.webserver_port}`;
	}

	return "http://localhost:8000";
}

module.exports = authenticate;
