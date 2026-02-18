import { games, type Game, type CreateGameRequest } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  createGame(roomCode: string, hostId: string): Promise<Game>;
  getGameByCode(code: string): Promise<Game | undefined>;
  getGameById(id: number): Promise<Game | undefined>;
  updateGameState(id: number, state: any[], history: any[], turn: string, winner: string | null): Promise<Game>;
  joinGame(id: number, opponentId: string): Promise<Game>;
}

export class DatabaseStorage implements IStorage {
  async createGame(roomCode: string, hostId: string): Promise<Game> {
    const [game] = await db.insert(games).values({
      roomCode,
      state: Array(9).fill(null),
      history: [Array(9).fill(null)],
      turn: "X",
      playerX: hostId,
      playerO: null,
      winner: null
    }).returning();
    return game;
  }

  async getGameByCode(code: string): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.roomCode, code));
    return game;
  }

  async getGameById(id: number): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game;
  }

  async updateGameState(id: number, state: any[], history: any[], turn: string, winner: string | null): Promise<Game> {
    const [game] = await db.update(games)
      .set({ state, history, turn, winner })
      .where(eq(games.id, id))
      .returning();
    return game;
  }

  async joinGame(id: number, opponentId: string): Promise<Game> {
    const [game] = await db.update(games)
      .set({ playerO: opponentId })
      .where(eq(games.id, id))
      .returning();
    return game;
  }
}

export const storage = new DatabaseStorage();
