// src/network/messages.ts
export type MessageType =
  | 'join_request'
  | 'join_response'
  | 'move'
  | 'start_game'
  | 'error';

export interface MessageBase {
  type: MessageType;
}

export interface JoinRequestMessage extends MessageBase {
  type: 'join_request';
  fromId: string;
  toId: string;
}

export interface JoinResponseMessage extends MessageBase {
  type: 'join_response';
  accepted: boolean;
  fromId: string;
}

export interface StartGameMessage extends MessageBase {
  type: 'start_game';
  whiteId: string;
  blackId: string;
}

export interface MoveMessage extends MessageBase {
  type: 'move';
  from: { row: number; col: number };
  to: { row: number; col: number };
  playerId: string;
}

export interface ErrorMessage extends MessageBase {
  type: 'error';
  message: string;
}

export type GameMessage =
  | JoinRequestMessage
  | JoinResponseMessage
  | StartGameMessage
  | MoveMessage
  | ErrorMessage;
