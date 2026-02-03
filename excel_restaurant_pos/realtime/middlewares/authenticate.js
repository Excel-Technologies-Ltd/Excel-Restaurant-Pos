/**
 * Authentication middleware for Excel Restaurant POS Socket.IO server
 * Supports bearer token authentication from multiple sources:
 * 1. socket.handshake.auth.token - For browser WebSocket connections
 * 2. Authorization header - For polling or proxied requests
 */
function authenticate(socket, next) {
	// Extract namespace (remove leading `/`)
	let namespace = socket.nsp.name.slice(1);

	// Get site name from namespace or handshake auth
	let site_name = socket.handshake.auth?.site || namespace;

	// Handle custom app namespace: /excel_restaurant_pos/{site_name}
	if (namespace.startsWith("excel_restaurant_pos/")) {
		const parts = namespace.split("/");
		if (parts.length >= 2) {
			site_name = parts[1];
		}
	}

	// Get bearer token from multiple sources (in order of preference):
	// 1. socket.handshake.auth.token (browser WebSocket - recommended)
	// 2. Authorization header (polling/proxied requests)
	let bearer_token = null;

	// Check handshake auth first (works with browser WebSocket)
	if (socket.handshake.auth?.token) {
		bearer_token = socket.handshake.auth.token;
		// Add "Bearer " prefix if not present
		if (!bearer_token.toLowerCase().startsWith("bearer ")) {
			bearer_token = `Bearer ${bearer_token}`;
		}
	}
	// Fallback to Authorization header
	else if (socket.request.headers.authorization) {
		bearer_token = socket.request.headers.authorization;
	}

	// Validate token exists
	if (!bearer_token) {
		next(new Error("Authentication required. Provide token via auth option or Authorization header."));
		return;
	}

	// Validate bearer token format
	if (!/^Bearer\s+.+$/i.test(bearer_token)) {
		next(new Error("Invalid token format. Expected: 'Bearer <token>'"));
		return;
	}

	// Store authorization and site name on socket
	socket.authorization_header = bearer_token;
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

		// Use site_name to build the API URL (don't use origin - it's the client domain for external connections)
		const baseUrl = `https://${socket.site_name}`;

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


module.exports = authenticate;
