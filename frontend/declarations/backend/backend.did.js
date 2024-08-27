export const idlFactory = ({ IDL }) => {
  const Platform = IDL.Record({
    'x' : IDL.Float64,
    'y' : IDL.Float64,
    'width' : IDL.Float64,
  });
  const Position = IDL.Record({ 'x' : IDL.Float64, 'y' : IDL.Float64 });
  const GameState = IDL.Record({
    'isGameOver' : IDL.Bool,
    'level' : IDL.Nat,
    'score' : IDL.Nat,
    'platforms' : IDL.Vec(Platform),
    'playerPosition' : Position,
  });
  return IDL.Service({
    'getGameState' : IDL.Func([], [IDL.Opt(GameState)], ['query']),
    'getHighScore' : IDL.Func([], [IDL.Nat], ['query']),
    'startGame' : IDL.Func([], [], []),
    'updateGameState' : IDL.Func(
        [IDL.Record({ 'jump' : IDL.Bool })],
        [IDL.Opt(GameState)],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
