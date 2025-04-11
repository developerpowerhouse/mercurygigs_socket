import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { NotificationService } from './notification.service';
import * as jwt from 'jsonwebtoken';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('NotificationsGateway');
  private connectedClients: Map<string, string> = new Map(); // userId -> socketId

  constructor(private readonly notificationService: NotificationService) { }

  afterInit() {
    this.logger.log('WebSocket Initialized');
  }

  handleConnection(client: Socket) {
    const token = client.handshake.query?.token as string;
    if (!token) {
      this.logger.warn(`Missing token for socket ${client.id}`);
      client.disconnect();
      return;
    }

    try {
      const decoded: any = jwt.verify(token, process.env.AUTH_SECRET);
      const userId = decoded.sub || decoded.userId;
      if (!userId) {
        throw new UnauthorizedException('Invalid token');
      }

      this.connectedClients.set(userId, client.id);
      this.logger.log(`User connected: ${userId} with socket: ${client.id}`);
    } catch (error) {
      this.logger.error(`Socket authentication failed: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.connectedClients.entries()) {
      if (socketId === client.id) {
        this.connectedClients.delete(userId);
        this.logger.log(`User disconnected: ${userId}`);
        break;
      }
    }
  }

  @SubscribeMessage('notification-count')
  async handleApplyJob(client: Socket, payload: any) {
    try {
      const userId = payload.userId
      const jobId = payload.jobId
      const applicationId = payload.applicationId;
      const clientId = payload.clientId
      const freelancerId = payload.freelancerId

      this.connectedClients.set(userId, client.id);

      const notification = await this.notificationService.notificationCount(userId);
      const targetSocketId = this.connectedClients.get(userId);
      if (targetSocketId) {
        this.server.to(targetSocketId).emit('notification-count', {
          ...notification,
          jobId,
          applicationId,
          clientId,
          freelancerId,
        });
      } else {
        this.logger.warn(`No socket found for user: ${userId}`);
      }

    } catch (err) {
      this.logger.error(`Error:${JSON.stringify(err)}`);
      if (err?.response?.statusCode) throw err;
      throw new InternalServerErrorException();
    }

  }
}
