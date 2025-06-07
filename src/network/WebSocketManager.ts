import { GameMessage, MessageType } from './messages';

type MessageCallback = (msg: GameMessage) => void;

export class WebSocketManager {
  private static instance: WebSocketManager;
  private socket: WebSocket | null = null;
  private callbacks: Partial<Record<MessageType, MessageCallback[]>> = {};
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

      // Enviar mensajes pendientes
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
      this.messageQueue.push(message); //  En cola hasta que se abra
    }
  }

  public on<T extends GameMessage>(type: T['type'], callback: (msg: T) => void): void {
    if (!this.callbacks[type]) {
      this.callbacks[type] = [];
    }
    this.callbacks[type]!.push(callback as any);
  }

  public off<T extends GameMessage>(type: T['type'], callback: (msg: T) => void): void {
    const handlers = this.callbacks[type];
    if (handlers) {
      this.callbacks[type] = handlers.filter(cb => cb !== callback);
    }
  }

  private dispatchMessage(message: GameMessage): void {
    const handlers = this.callbacks[message.type];
    if (handlers) {
      handlers.forEach((cb) => cb(message));
    }
  }
}