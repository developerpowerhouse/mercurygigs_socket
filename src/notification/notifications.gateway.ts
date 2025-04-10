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
  }

  @SubscribeMessage('apply-job')
  async handleApplyJob(client: Socket, payload: any) {
    try {
      // TODO:
      // payload
      // jobId, applicationId, clientId,freelancerId

      const userId = payload.userId;
      const notification = await this.notificationService.notificationCount(userId)
      this.server.emit('notification', notification);
    } catch (err) {
      this.logger.error(`Error:${JSON.stringify(err)}`);
      if (err?.response?.statusCode) throw err;
      throw new InternalServerErrorException();
    }

  }
}
