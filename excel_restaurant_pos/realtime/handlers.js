/**
 * Socket event handlers for Excel Restaurant POS
 * Add your custom socket event handlers here
 */

function setupHandlers(socket) {
	console.log(`Setting up handlers for user: ${socket.user}`);

	// Example: Handle order updates
	socket.on("order:update", async (data) => {
		try {
			// Validate user has permission
			// You can add permission checks here

			// Broadcast to relevant rooms (e.g., kitchen, waiter, etc.)
			if (data.room) {
				socket.to(data.room).emit("order:updated", {
					order_id: data.order_id,
					status: data.status,
					updated_by: socket.user,
					timestamp: new Date().toISOString(),
				});
			}
		} catch (error) {
			socket.emit("error", { message: error.message });
		}
	});

	// Example: Join room for order updates
	socket.on("room:join", (room) => {
		socket.join(room);
		socket.emit("room:joined", { room });
		console.log(`User ${socket.user} joined room: ${room}`);
	});

	// Example: Leave room
	socket.on("room:leave", (room) => {
		socket.leave(room);
		socket.emit("room:left", { room });
		console.log(`User ${socket.user} left room: ${room}`);
	});

	// Example: Ping/Pong for connection health check
	socket.on("ping", () => {
		socket.emit("pong", { timestamp: Date.now() });
	});

	// Add more handlers as needed
}

module.exports = setupHandlers;
