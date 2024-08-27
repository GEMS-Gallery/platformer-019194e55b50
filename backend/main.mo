import Bool "mo:base/Bool";

import Float "mo:base/Float";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Int "mo:base/Int";

actor {
  // Types
  type Position = { x : Float; y : Float };
  type Platform = { x : Float; y : Float; width : Float };
  type GameState = {
    level : Nat;
    score : Nat;
    isGameOver : Bool;
    playerPosition : Position;
    platforms : [Platform];
  };

  // Stable variables
  stable var highScore : Nat = 0;

  // Mutable variables
  var gameState : ?GameState = null;

  // Constants
  let GAME_WIDTH : Float = 800.0;
  let GAME_HEIGHT : Float = 600.0;
  let PLAYER_SIZE : Float = 30.0;
  let JUMP_VELOCITY : Float = 10.0;
  let GRAVITY : Float = 0.5;
  let PLATFORM_SPEED : Float = 2.0;

  // Helper functions
  func generatePlatform(y : Float) : Platform {
    {
      x = GAME_WIDTH;
      y = y;
      width = 100.0 + Float.fromInt(Nat.abs(Int.abs(Float.toInt(y))) % 100);
    }
  };

  func generatePlatforms() : [Platform] {
    Array.tabulate<Platform>(5, func(i : Nat) : Platform {
      generatePlatform(Float.fromInt(i) * 100.0)
    })
  };

  func updatePlatforms(platforms : [Platform]) : [Platform] {
    Array.map<Platform, Platform>(platforms, func(p : Platform) : Platform {
      {
        x = p.x - PLATFORM_SPEED;
        y = p.y;
        width = p.width;
      }
    })
  };

  func checkCollision(player : Position, platform : Platform) : Bool {
    player.x < platform.x + platform.width and
    player.x + PLAYER_SIZE > platform.x and
    player.y + PLAYER_SIZE >= platform.y and
    player.y <= platform.y + 10.0
  };

  // Public functions
  public func startGame() : async GameState {
    let initialState = {
      level = 1;
      score = 0;
      isGameOver = false;
      playerPosition = { x = 50.0; y = GAME_HEIGHT / 2.0 };
      platforms = generatePlatforms();
    };
    gameState := ?initialState;
    initialState
  };

  public func updateGameState(input : { jump : Bool }) : async GameState {
    switch (gameState) {
      case (null) {
        // If there's no game state, start a new game
        await startGame()
      };
      case (?state) {
        var newState = state;

        // Update player position
        var newY = state.playerPosition.y + GRAVITY;
        if (input.jump and newY >= GAME_HEIGHT - PLAYER_SIZE) {
          newY -= JUMP_VELOCITY;
        };

        newState := {
          level = state.level;
          score = state.score + 1;
          isGameOver = newY > GAME_HEIGHT;
          playerPosition = { x = state.playerPosition.x; y = Float.max(0.0, Float.min(newY, GAME_HEIGHT - PLAYER_SIZE)) };
          platforms = updatePlatforms(state.platforms);
        };

        // Check collisions
        for (platform in Iter.fromArray(newState.platforms)) {
          if (checkCollision(newState.playerPosition, platform)) {
            newState := {
              level = newState.level;
              score = newState.score;
              isGameOver = newState.isGameOver;
              playerPosition = { x = newState.playerPosition.x; y = platform.y - PLAYER_SIZE };
              platforms = newState.platforms;
            };
          };
        };

        // Update high score
        if (newState.score > highScore) {
          highScore := newState.score;
        };

        // Progress level
        if (newState.score % 1000 == 0) {
          newState := {
            level = newState.level + 1;
            score = newState.score;
            isGameOver = newState.isGameOver;
            playerPosition = newState.playerPosition;
            platforms = generatePlatforms();
          };
        };

        gameState := ?newState;
        newState
      };
    }
  };

  public query func getGameState() : async ?GameState {
    gameState
  };

  public query func getHighScore() : async Nat {
    highScore
  };
}
