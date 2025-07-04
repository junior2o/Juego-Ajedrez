// src/network/messages.ts
export type MessageType =
  | 'join_request'
  | 'join_response'
  | 'move'
  | 'start_game'
  | 'error'
  | 'opponent_disconnected'
  | 'init'
  | 'init_with_id'
  | 'find_random_opponent'; 

export interface InitMessage {
  type: 'init';
  id: string;
}


export interface InitWithIdMessage {
  type: 'init_with_id';
  id: string;
}

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
  toId: string;
  reason?: 'not_found' | 'in_game' | 'rejected';
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

export interface OpponentDisconnectedMessage extends MessageBase {
  type: 'opponent_disconnected';
  playerId: string;
}

export interface FindRandomOpponentMessage extends MessageBase {
  type: 'find_random_opponent';
  id: string;
}

export type GameMessage =
  | InitMessage
  | InitWithIdMessage 
  | JoinRequestMessage
  | JoinResponseMessage
  | StartGameMessage
  | ErrorMessage
  | OpponentDisconnectedMessage
  | MoveMessage
  | FindRandomOpponentMessage;

export type MessageMap = {
  join_request: JoinRequestMessage;
  join_response: JoinResponseMessage;
  start_game: StartGameMessage;
  opponent_disconnected: OpponentDisconnectedMessage;
  init: InitMessage;
  init_with_id: InitWithIdMessage;
  find_random_opponent: FindRandomOpponentMessage; 
};
