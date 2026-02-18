import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  roomCode: text("room_code").notNull().unique(), // 4-char code
  state: jsonb("state").notNull(), // Board state: ["X", null, "O", ...]
  history: jsonb("history").notNull().default([]), // Array of board states for undo
  turn: text("turn").notNull(), // "X" (Capybara) or "O" (Corgi)
  winner: text("winner"), // "X", "O", "DRAW", or null
  playerX: text("player_x"), // Session ID of host
  playerO: text("player_o"), // Session ID of joiner
  createdAt: timestamp("created_at").defaultNow(),
});

// === SCHEMAS ===
export const insertGameSchema = createInsertSchema(games).omit({ 
  id: true, 
  createdAt: true,
  state: true, // we set this on server
  history: true,
  turn: true,
  winner: true
});

// === EXPLICIT API TYPES ===
export type Game = typeof games.$inferSelect;

export type CreateGameRequest = {
  playerId: string; // Identifying the host
};

export type JoinGameRequest = {
  roomCode: string;
  playerId: string;
};

export type MakeMoveRequest = {
  gameId: number;
  playerId: string;
  index: number; // 0-8
};

export type GameStateResponse = Game;
