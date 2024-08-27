import React, { useEffect, useRef, useState } from 'react';
import { Button, Typography, Box } from '@mui/material';
import { backend } from 'declarations/backend';
import * as THREE from 'three';

type GameState = {
  level: number;
  score: number;
  isGameOver: boolean;
  playerPosition: { x: number; y: number };
  platforms: { x: number; y: number; width: number }[];
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [highScore, setHighScore] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const playerRef = useRef<THREE.Mesh | null>(null);
  const platformsRef = useRef<THREE.Mesh[]>([]);

  const GAME_WIDTH = 800;
  const GAME_HEIGHT = 600;

  useEffect(() => {
    const fetchHighScore = async () => {
      try {
        const score = await backend.getHighScore();
        setHighScore(Number(score));
      } catch (error) {
        console.error('Error fetching high score:', error);
      }
    };
    fetchHighScore();
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      // Initialize Three.js scene
      sceneRef.current = new THREE.Scene();
      cameraRef.current = new THREE.OrthographicCamera(0, GAME_WIDTH, 0, GAME_HEIGHT, 0.1, 1000);
      rendererRef.current = new THREE.WebGLRenderer({ canvas: canvasRef.current });
      rendererRef.current.setSize(GAME_WIDTH, GAME_HEIGHT);

      // Create player
      const playerGeometry = new THREE.BoxGeometry(30, 30, 1);
      const playerMaterial = new THREE.MeshBasicMaterial({ color: 0xF5A623 });
      playerRef.current = new THREE.Mesh(playerGeometry, playerMaterial);
      sceneRef.current.add(playerRef.current);

      // Set up camera
      cameraRef.current.position.z = 5;

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
      };
      animate();
    }
  }, []);

  useEffect(() => {
    if (gameState?.playerPosition && sceneRef.current && playerRef.current) {
      // Update player position
      playerRef.current.position.set(
        gameState.playerPosition.x,
        GAME_HEIGHT - gameState.playerPosition.y,
        0
      );

      // Update platforms
      platformsRef.current.forEach((platform) => sceneRef.current?.remove(platform));
      platformsRef.current = [];

      gameState.platforms.forEach((platform) => {
        const platformGeometry = new THREE.BoxGeometry(platform.width, 10, 1);
        const platformMaterial = new THREE.MeshBasicMaterial({ color: 0x50E3C2 });
        const platformMesh = new THREE.Mesh(platformGeometry, platformMaterial);
        platformMesh.position.set(platform.x, GAME_HEIGHT - platform.y, 0);
        sceneRef.current?.add(platformMesh);
        platformsRef.current.push(platformMesh);
      });
    }
  }, [gameState]);

  const startGame = async () => {
    try {
      await backend.startGame();
      updateGameState();
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const updateGameState = async () => {
    try {
      const newState = await backend.updateGameState({ jump: false });
      if (newState) {
        setGameState({
          level: Number(newState.level),
          score: Number(newState.score),
          isGameOver: newState.isGameOver,
          playerPosition: {
            x: Number(newState.playerPosition.x),
            y: Number(newState.playerPosition.y),
          },
          platforms: newState.platforms.map((p) => ({
            x: Number(p.x),
            y: Number(p.y),
            width: Number(p.width),
          })),
        });
      }
    } catch (error) {
      console.error('Error updating game state:', error);
    }
  };

  useEffect(() => {
    if (gameState && !gameState.isGameOver) {
      const interval = setInterval(updateGameState, 16); // 60 FPS
      return () => clearInterval(interval);
    }
  }, [gameState]);

  useEffect(() => {
    const handleKeyPress = async (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        try {
          await backend.updateGameState({ jump: true });
          updateGameState();
        } catch (error) {
          console.error('Error handling jump:', error);
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <Box sx={{ textAlign: 'center', p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Platformer Game
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">High Score: {highScore}</Typography>
        {gameState && (
          <>
            <Typography variant="h6">Level: {gameState.level}</Typography>
            <Typography variant="h6">Score: {gameState.score}</Typography>
          </>
        )}
      </Box>
      <canvas ref={canvasRef} style={{ border: '1px solid black' }} />
      {(!gameState || gameState.isGameOver) && (
        <Button variant="contained" color="primary" onClick={startGame} sx={{ mt: 2 }}>
          {gameState ? 'Restart Game' : 'Start Game'}
        </Button>
      )}
    </Box>
  );
};

export default App;
