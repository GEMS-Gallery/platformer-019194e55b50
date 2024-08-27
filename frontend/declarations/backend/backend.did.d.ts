import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface GameState {
  'isGameOver' : boolean,
  'level' : bigint,
  'score' : bigint,
  'platforms' : Array<Platform>,
  'playerPosition' : Position,
}
export interface Platform { 'x' : number, 'y' : number, 'width' : number }
export interface Position { 'x' : number, 'y' : number }
export interface _SERVICE {
  'getGameState' : ActorMethod<[], [] | [GameState]>,
  'getHighScore' : ActorMethod<[], bigint>,
  'startGame' : ActorMethod<[], undefined>,
  'updateGameState' : ActorMethod<[{ 'jump' : boolean }], [] | [GameState]>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
