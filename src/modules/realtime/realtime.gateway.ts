import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/realtime',
})
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  afterInit() {
    this.logger.log('Realtime WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) throw new Error('No token provided');

      const payload = this.jwtService.verify(token);
      client.data.userId = payload.sub;
      client.data.tenantId = payload.tenantId;
      client.data.role = payload.role;

      // Join tenant room for broadcasts
      await client.join(`tenant:${payload.tenantId}`);

      this.logger.log(`Client connected: ${client.id} (user: ${payload.sub})`);
    } catch (err: any) {
      this.logger.warn(
        `Client ${client.id} connection rejected: ${err.message}`,
      );
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe:factory')
  handleFactorySubscription(client: Socket, factoryId: string) {
    client.join(`factory:${factoryId}`);
    return { subscribed: factoryId };
  }

  // Broadcast methods called from other services
  broadcastAttendanceEvent(tenantId: string, factoryId: string, event: any) {
    this.server.to(`factory:${factoryId}`).emit('attendance:update', event);
  }

  broadcastEmergencyAlert(tenantId: string, factoryId: string, incident: any) {
    this.server.to(`tenant:${tenantId}`).emit('emergency:alert', {
      factoryId,
      incident,
      timestamp: new Date().toISOString(),
    });
  }

  broadcastNotification(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification:new', notification);
  }
}
