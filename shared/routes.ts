import { z } from 'zod';
import { games } from './schema';

export const api = {
  games: {
    create: {
      method: 'POST' as const,
      path: '/api/games' as const,
      input: z.object({
        playerId: z.string()
      }),
      responses: {
        201: z.custom<typeof games.$inferSelect>(),
        500: z.object({ message: z.string() })
      }
    },
    join: {
      method: 'POST' as const,
      path: '/api/games/join' as const,
      input: z.object({
        roomCode: z.string(),
        playerId: z.string()
      }),
      responses: {
        200: z.custom<typeof games.$inferSelect>(),
        404: z.object({ message: z.string() }),
        400: z.object({ message: z.string() })
      }
    },
    get: {
      method: 'GET' as const,
      path: '/api/games/:code' as const,
      responses: {
        200: z.custom<typeof games.$inferSelect>(),
        404: z.object({ message: z.string() })
      }
    },
    move: {
      method: 'POST' as const,
      path: '/api/games/:id/move' as const,
      input: z.object({
        playerId: z.string(),
        index: z.number().min(0).max(8)
      }),
      responses: {
        200: z.custom<typeof games.$inferSelect>(),
        400: z.object({ message: z.string() }),
        404: z.object({ message: z.string() })
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
