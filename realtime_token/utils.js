/**
 * Utils for token-authenticated Socket.IO server.
 * All API requests use Authorization header only (no cookie/sid).
 */
const request = require("superagent");

function get_url(socket, path) {
	if (!path) {
		path = "";
	}
	return socket.request.headers.origin + path;
}

/**
 * Create a superagent request with Authorization: Bearer <token>.
 * Used for can_subscribe_doctype, can_subscribe_doc (token-only auth).
 */
function frappe_request(path, socket) {
	const partial_req = request.get(get_url(socket, path));
	if (socket.authorization_header) {
		return partial_req.set("Authorization", socket.authorization_header);
	}
	throw new Error("Token socket: authorization_header required");
}

module.exports = {
	get_url,
	frappe_request,
};
