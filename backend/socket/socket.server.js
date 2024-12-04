import { Server } from "socket.io";

let io;

const connectedUsers = new Map();

export const initializeSocket = (httpServer) => {
	io = new Server(httpServer, {
		cors: {
            origin: 'http://localhost:3000', 
            credentials: true,
            allowedHeaders: ['Authorization', 'Content-Type'], 
		},
	});

	io.use((socket, next) => {
		const userId = socket.handshake.auth.userId;
        
		if (!userId) return next(new Error("Invalid user ID"));

		socket.userId = userId;
		next();
	});

	io.on("connection", (socket) => {
        console.log(`User connected with socket id: ${socket.id}`);
        console.log(`User ID: ${socket.userId}`);
        connectedUsers.set(socket.userId, socket.id);
        
        // Add error logging
        socket.on("connect_error", (error) => {
            console.error("Connection error:", error);
        });
    
        socket.on("disconnect", () => {
            console.log(`User disconnected with socket id: ${socket.id}`);
            connectedUsers.delete(socket.userId);
        });
    });
};

export const getIO = () => {
	if (!io) {
		throw new Error("Socket.io not initialized!");
	}
	return io;
};

export const getConnectedUsers = () => connectedUsers;