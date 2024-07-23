"use client"

import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

export default function Home() {
  const [players, setPlayers] = useState({});
  const [columns, setColumns] = useState([]);
  const canvasRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io('http://localhost:4000');

    socketRef.current.on('connect', () => {
      console.log('Connected to server'); // Log when connected to server
    });

    socketRef.current.on('currentPlayers', (currentPlayers) => {
      console.log('Current players:', currentPlayers); // Log current players
      setPlayers(currentPlayers);
    });

    socketRef.current.on('currentColumns', (currentColumns) => {
      console.log('Current columns:', currentColumns); // Log current columns
      setColumns(currentColumns);
    });

    socketRef.current.on('newPlayer', (data) => {
      console.log('New player:', data); // Log new player
      setPlayers((prevPlayers) => ({ ...prevPlayers, [data.playerId]: data.playerInfo }));
    });

    socketRef.current.on('gameState', (gameState) => {
      console.log('Game state:', gameState); // Log game state
      setPlayers(gameState.players);
      setColumns(gameState.columns);
    });

    socketRef.current.on('playerDisconnected', (playerId) => {
      console.log('Player disconnected:', playerId); // Log player disconnection
      setPlayers((prevPlayers) => {
        const newPlayers = { ...prevPlayers };
        delete newPlayers[playerId];
        return newPlayers;
      });
    });

    return () => socketRef.current.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const drawGame = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      drawColumns(context);
      drawPlayers(context);
    };

    const drawPlayers = (context) => {
      Object.values(players).forEach((player) => {
        context.fillStyle = player.color;
        context.fillRect(player.x, player.y, 30, 30);
        context.fillText(player.score, player.x, player.y - 10);
      });
    };

    const drawColumns = (context) => {
      context.fillStyle = 'green';
      columns.forEach((column) => {
        context.fillRect(column.x, 0, column.width, column.y);
        context.fillRect(column.x, column.y + column.gap, column.width, canvas.height - column.y - column.gap);
      });
    };

    drawGame();
  }, [players, columns]);

  const handleKeyDown = (event) => {
    if (event.key === ' ') {
      socketRef.current.emit('playerJump');
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <canvas ref={canvasRef} width="800" height="600" className="canvas"></canvas>
  );
}
