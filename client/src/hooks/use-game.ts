import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { nanoid } from "nanoid";

// Helper to get or create a persistent player ID
export function getPlayerId() {
  let id = localStorage.getItem("tictactoe_player_id");
  if (!id) {
    id = nanoid();
    localStorage.setItem("tictactoe_player_id", id);
  }
  return id;
}

// Helper to parse errors safely
async function parseError(res: Response) {
  try {
    const data = await res.json();
    return data.message || "An error occurred";
  } catch {
    return res.statusText;
  }
}

// --- Hooks ---

export function useCreateGame() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async () => {
      const playerId = getPlayerId();
      const res = await fetch(api.games.create.path, {
        method: api.games.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      });

      if (!res.ok) throw new Error(await parseError(res));
      return api.games.create.responses[201].parse(await res.json());
    },
    onError: (err) => {
      toast({
        title: "Failed to create game",
        description: err.message,
        variant: "destructive",
      });
    },
  });
}

export function useJoinGame() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (roomCode: string) => {
      const playerId = getPlayerId();
      const res = await fetch(api.games.join.path, {
        method: api.games.join.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomCode, playerId }),
      });

      if (!res.ok) throw new Error(await parseError(res));
      return api.games.join.responses[200].parse(await res.json());
    },
    onError: (err) => {
      toast({
        title: "Failed to join game",
        description: err.message,
        variant: "destructive",
      });
    },
  });
}

export function useGame(roomCode: string) {
  return useQuery({
    queryKey: ["game", roomCode],
    queryFn: async () => {
      const url = buildUrl(api.games.get.path, { code: roomCode });
      const res = await fetch(url);
      
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch game");
      
      return api.games.get.responses[200].parse(await res.json());
    },
    refetchInterval: (query) => {
      // Stop polling if game is over
      if (query.state.data?.winner) return false;
      return 2000; // Poll every 2s
    },
  });
}

export function useMakeMove() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ gameId, index }: { gameId: number; index: number }) => {
      const playerId = getPlayerId();
      const url = buildUrl(api.games.move.path, { id: gameId });
      
      const res = await fetch(url, {
        method: api.games.move.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, index }),
      });

      if (!res.ok) throw new Error(await parseError(res));
      return api.games.move.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      // Invalidate the game query to refresh the board immediately
      queryClient.invalidateQueries({ queryKey: ["game", data.roomCode] });
    },
    onError: (err) => {
      toast({
        title: "Invalid Move",
        description: err.message,
        variant: "destructive",
      });
    },
  });
}
