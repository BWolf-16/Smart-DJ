import { Server } from 'socket.io';
import { logger } from '../utils/logger';

export const setupSocketIO = (io: Server): void => {
  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.id}`);

    // Join user to their personal room
    socket.on('join_user_room', (userId: string) => {
      socket.join(`user_${userId}`);
      logger.info(`User ${userId} joined their room`);
    });

    // Handle music sync events
    socket.on('sync_playback', (data) => {
      // Broadcast to user's other devices
      socket.broadcast.emit('playback_sync', data);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.id}`);
    });

    // Send welcome message
    socket.emit('connected', {
      message: 'Connected to Smart DJ server',
      socketId: socket.id
    });
  });

  logger.info('Socket.IO server initialized');
};