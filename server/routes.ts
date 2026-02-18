import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Helper to check for a win
  function checkWin(state: (string | null)[]): string | null {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
      [0, 4, 8], [2, 4, 6]             // Diags
    ];

    for (const [a, b, c] of lines) {
      if (state[a] && state[a] === state[b] && state[a] === state[c]) {
        return state[a];
      }
    }
    
    if (state.every(cell => cell !== null)) return "DRAW";
    
    return null;
  }

  app.post(api.games.create.path, async (req, res) => {
    const { playerId } = req.body;
    // Generate simple 4-char code
    const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const game = await storage.createGame(roomCode, playerId);
    res.status(201).json(game);
  });

  app.post(api.games.join.path, async (req, res) => {
    const { roomCode, playerId } = req.body;
    const game = await storage.getGameByCode(roomCode);
    
    if (!game) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (game.playerO) {
      // Re-joining logic could go here, but for now just fail if full
      if (game.playerO !== playerId && game.playerX !== playerId) {
         return res.status(400).json({ message: "Room is full" });
      }
      return res.json(game);
    }

    // New joiner
    const updated = await storage.joinGame(game.id, playerId);
    res.json(updated);
  });

  app.get('/api/games/:code', async (req, res) => {
    const game = await storage.getGameByCode(req.params.code);
    if (!game) return res.status(404).json({ message: "Not found" });
    res.json(game);
  });

  app.post('/api/games/:id/move', async (req, res) => {
    const gameId = parseInt(req.params.id);
    const { playerId, index } = req.body;

    const game = await storage.getGameById(gameId);
    if (!game) return res.status(404).json({ message: "Game not found" });

    // Validate turn
    const isPlayerX = game.playerX === playerId;
    const isPlayerO = game.playerO === playerId;

    if (!isPlayerX && !isPlayerO) {
      return res.status(400).json({ message: "You are not in this game" });
    }

    if (game.winner) {
      return res.status(400).json({ message: "Game is over" });
    }

    if ((game.turn === "X" && !isPlayerX) || (game.turn === "O" && !isPlayerO)) {
      return res.status(400).json({ message: "Not your turn" });
    }

    const state = game.state as (string | null)[];
    if (state[index]) {
      return res.status(400).json({ message: "Cell occupied" });
    }

    // Apply move
    const newState = [...state];
    newState[index] = game.turn;

    const winner = checkWin(newState);
    const nextTurn = game.turn === "X" ? "O" : "X";
    const newHistory = [...(game.history as any[]), newState];

    const updated = await storage.updateGameState(gameId, newState, newHistory, nextTurn, winner);
    res.json(updated);
  });

  app.post('/api/games/:id/undo', async (req, res) => {
    const gameId = parseInt(req.params.id);
    const { playerId } = req.body;

    const game = await storage.getGameById(gameId);
    if (!game) return res.status(404).json({ message: "Game not found" });

    const history = game.history as any[];
    if (history.length <= 1) {
      return res.status(400).json({ message: "Nothing to undo" });
    }

    // Only allow undoing if it was the player's last turn or if it's currently their turn (for local/pass-and-play logic we handle differently, but for remote:)
    // For simplicity in a casual app, we'll allow anyone in the game to undo if they are playerX or playerO
    if (game.playerX !== playerId && game.playerO !== playerId) {
      return res.status(400).json({ message: "Not in this game" });
    }

    const newHistory = [...history];
    newHistory.pop(); // Remove current state
    const prevState = newHistory[newHistory.length - 1];
    
    // Toggle turn back
    const prevTurn = game.turn === "X" ? "O" : "X";
    
    const updated = await storage.updateGameState(gameId, prevState, newHistory, prevTurn, null);
    res.json(updated);
  });

  return httpServer;
}
