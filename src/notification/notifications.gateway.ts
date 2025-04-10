import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { NotificationService } from './notification.service';

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
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    // Remove disconnected socket from the map
    for (const [userId, socketId] of this.connectedClients.entries()) {
      if (socketId === client.id) {
        this.connectedClients.delete(userId);
        break;
      }
    }
  }

  // Register user with their socket ID
  @SubscribeMessage('register-user')
  handleRegisterUser(client: Socket, payload: any) {
    this.connectedClients.set(payload.userId, client.id);
    this.logger.log(`User registered: ${payload.userId} with socket: ${client.id}`);
  }

  @SubscribeMessage('apply-job')
  async handleApplyJob(client: Socket, payload: any) {
    try {
      const userId = payload.userId;
      const jobId = payload.jobId
      const applicationId = payload.applicationId;
      const clientId = payload.clientId
      const freelancerId = payload.freelancerId

      const notification = await this.notificationService.notificationCount(userId);
      const targetSocketId = this.connectedClients.get(userId);
      if (targetSocketId) {
        this.server.emit('apply-job', {
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
