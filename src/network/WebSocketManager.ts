// ../network/WebSocketManager.ts

import { GameMessage, MessageType, InitWithIdMessage } from './messages';

type Callback = (msg: GameMessage) => void;

export class WebSocketManager {
  private static instance: WebSocketManager;
  private socket: WebSocket | null = null;

  private callbacks: { [K in MessageType]?: ((msg: GameMessage) => void)[] } = {};
  private messageQueue: GameMessage[] = [];
  private isConnected = false;

  private constructor() {}

  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  public connect(url: string): void {
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
    console.log('[WebSocket] Connected');
    this.isConnected = true;

    // Siempre envía init_with_id, aunque no haya ID guardado
    const storedId = localStorage.getItem('playerId') || '';
    const initMsg: InitWithIdMessage = {
      type: 'init_with_id',
      id: storedId,
    };
    this.send(initMsg);
    console.log('[WebSocket] Sent init_with_id:', storedId);

    while (this.messageQueue.length > 0) {
      const msg = this.messageQueue.shift();
      if (msg) this.send(msg);
    }
};

    this.socket.onmessage = (event) => {
      try {
        const msg: GameMessage = JSON.parse(event.data);
        this.dispatchMessage(msg);
      } catch (error) {
        console.error('[WebSocket] Invalid message received:', event.data);
      }
    };

    this.socket.onclose = () => {
      console.warn('[WebSocket] Disconnected');
      this.isConnected = false;
    };

    this.socket.onerror = (error) => {
      console.error('[WebSocket] Error:', error);
    };
  }

  public send(message: GameMessage): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN && this.isConnected) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('[WebSocket] Not ready, message enqueued.');
      this.messageQueue.push(message);
    }
  }

  public on(type: MessageType, callback: Callback): void {
    if (!this.callbacks[type]) {
      this.callbacks[type] = [];
    }
    this.callbacks[type]!.push(callback);
  }

  public off(type: MessageType, callback: Callback): void {
    const handlers = this.callbacks[type];
    if (handlers) {
      this.callbacks[type] = handlers.filter(cb => cb !== callback);
    }
  }

  private dispatchMessage(message: GameMessage): void {
    const type = message.type;
    console.log('[WebSocket] dispatchMessage', type);
    const handlers = this.callbacks[type];
    if (handlers && handlers.length > 0) {
      handlers.forEach((cb) => cb(message));
    } else if (!(type in this.callbacks)) {
      console.warn('[WebSocket] Unhandled message type:', type, message);
    }
  }
}
