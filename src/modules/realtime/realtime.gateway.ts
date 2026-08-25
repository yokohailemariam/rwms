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
import { JwtPayload } from '../../common/types/jwt-payload.type';
import { getErrorMessage } from '../../common/utils/error.util';

interface RealtimeSocketData {
  userId?: string;
  tenantId?: string | null;
  role?: string;
}

type RealtimeSocket = Socket<
  Record<string, unknown>,
  Record<string, unknown>,
  Record<string, unknown>,
  RealtimeSocketData
>;

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

  async handleConnection(client: RealtimeSocket) {
    try {
      const authToken =
        typeof client.handshake.auth.token === 'string'
          ? client.handshake.auth.token
          : undefined;
      const authHeader = client.handshake.headers.authorization;
      const headerToken =
        typeof authHeader === 'string'
          ? authHeader.replace('Bearer ', '')
          : undefined;
      const token = authToken || headerToken;
      if (!token) throw new Error('No token provided');

      const payload = this.jwtService.verify<JwtPayload>(token);
      client.data.userId = payload.sub;
      client.data.tenantId = payload.tenantId;
      client.data.role = payload.role;

      // Join tenant room for broadcasts
      if (payload.tenantId) {
        await client.join(`tenant:${payload.tenantId}`);
      }

      this.logger.log(`Client connected: ${client.id} (user: ${payload.sub})`);
    } catch (err) {
      this.logger.warn(
        `Client ${client.id} connection rejected: ${getErrorMessage(err)}`,
      );
      client.disconnect();
    }
  }

  handleDisconnect(client: RealtimeSocket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe:factory')
  handleFactorySubscription(client: RealtimeSocket, factoryId: string) {
    void client.join(`factory:${factoryId}`);
    return { subscribed: factoryId };
  }

  // Broadcast methods called from other services
  broadcastAttendanceEvent(
    tenantId: string,
    factoryId: string,
    event: unknown,
  ) {
    this.server.to(`factory:${factoryId}`).emit('attendance:update', event);
  }

  broadcastEmergencyAlert(
    tenantId: string,
    factoryId: string,
    incident: unknown,
  ) {
    this.server.to(`tenant:${tenantId}`).emit('emergency:alert', {
      factoryId,
      incident,
      timestamp: new Date().toISOString(),
    });
  }

  broadcastNotification(userId: string, notification: unknown) {
    this.server.to(`user:${userId}`).emit('notification:new', notification);
  }
}
