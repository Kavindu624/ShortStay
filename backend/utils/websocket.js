/**
 * websocket.js — Socket.IO real-time notification service
 *
 * Usage:
 *   const { initSocket, emitToUser } = require('./utils/websocket');
 *   initSocket(httpServer);                      // call once in server.js
 *   emitToUser(user_id, 'notification', data);   // call anywhere
 */

let io = null;

// Map: user_id (string) → Set of socket IDs
const userSockets = new Map();

/**
 * Initialise Socket.IO on an existing http.Server instance.
 * Call this ONCE after app.listen() returns the server handle.
 */
function initSocket(httpServer) {
  const { Server } = require('socket.io');

  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    // Client must emit 'register' with their user_id to receive targeted events
    socket.on('register', (user_id) => {
      const uid = String(user_id);
      if (!userSockets.has(uid)) userSockets.set(uid, new Set());
      userSockets.get(uid).add(socket.id);
      socket.join(`user:${uid}`);
      console.log(`[WS] User ${uid} connected (socket ${socket.id})`);
    });

    socket.on('disconnect', () => {
      // Clean up mapping on disconnect
      for (const [uid, sids] of userSockets.entries()) {
        if (sids.has(socket.id)) {
          sids.delete(socket.id);
          if (sids.size === 0) userSockets.delete(uid);
          break;
        }
      }
    });
  });

  console.log('[WS] Socket.IO initialised');
  return io;
}

/**
 * Emit an event to a specific user (all their active connections).
 * Safe to call even before Socket.IO is initialised.
 *
 * @param {number|string} user_id
 * @param {string}        event     e.g. 'notification'
 * @param {object}        data      payload
 */
function emitToUser(user_id, event, data) {
  if (!io) return; // WS not initialised yet — silently skip
  io.to(`user:${String(user_id)}`).emit(event, data);
}

/**
 * Broadcast an event to ALL connected clients.
 */
function broadcast(event, data) {
  if (!io) return;
  io.emit(event, data);
}

module.exports = { initSocket, emitToUser, broadcast };
