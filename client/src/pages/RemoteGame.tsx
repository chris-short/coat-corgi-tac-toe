import { useEffect, useMemo, useState } from "react";
import { useRoute, Link } from "wouter";
import { useGame, useMakeMove, getPlayerId } from "@/hooks/use-game";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { GameBoard } from "@/components/GameBoard";
import { PlayerCard } from "@/components/PlayerCard";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Copy, Share2, Home } from "lucide-react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";

// Helper to determine winning indices from server state (if server doesn't send them)
// For simplicity, we can reuse client logic, but ideally server sends this.
const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

export default function RemoteGame() {
  const [match, params] = useRoute("/game/:code");
  const roomCode = params?.code || "";
  const { data: game, isLoading, error } = useGame(roomCode);
  const makeMove = useMakeMove();
  const { toast } = useToast();
  const playerId = getPlayerId();
  const [hasCelebrated, setHasCelebrated] = useState(false);

  // Derived state
  const isPlayerX = game?.playerX === playerId;
  const isPlayerO = game?.playerO === playerId;
  const isSpectator = !isPlayerX && !isPlayerO;
  const isMyTurn = (game?.turn === "X" && isPlayerX) || (game?.turn === "O" && isPlayerO);
  const waitingForOpponent = !game?.playerO;

  // Calculate winning indices locally for highlighting
  const winningIndices = useMemo(() => {
    if (!game?.winner || game.winner === "DRAW") return null;
    const board = game.state as (string|null)[];
    for (const [a, b, c] of WIN_LINES) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return [a, b, c];
      }
    }
    return null;
  }, [game?.winner, game?.state]);

  // Handle celebration
  useEffect(() => {
    if (game?.winner && game.winner !== "DRAW" && !hasCelebrated) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
      setHasCelebrated(true);
    }
  }, [game?.winner, hasCelebrated]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    toast({ title: "Copied!", description: "Room code copied to clipboard." });
  };

  const handleTileClick = async (index: number) => {
    if (!game || game.winner || !isMyTurn || makeMove.isPending) return;
    await makeMove.mutateAsync({ gameId: game.id, index });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-bounce">
          <Logo />
        </div>
        <p className="mt-4 text-slate-400 font-chewy">Loading Game...</p>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Game Not Found</h2>
        <p className="text-muted-foreground mb-8">The room code might be incorrect or expired.</p>
        <Link href="/">
          <Button>Back Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-slate-50 p-4">
      {/* Header */}
      <div className="w-full max-w-lg flex justify-between items-center mb-6 pt-2">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-6 w-6 text-slate-500" />
          </Button>
        </Link>
        
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Room Code</span>
          <span className="font-mono text-lg font-bold text-slate-800">{roomCode}</span>
          <button onClick={handleCopyCode} className="ml-2 text-slate-400 hover:text-slate-600">
            <Copy className="h-4 w-4" />
          </button>
        </div>

        <div className="w-10" />
      </div>

      {/* Waiting State */}
      {waitingForOpponent ? (
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md animate-in fade-in zoom-in duration-500">
          <div className="bg-white p-8 rounded-3xl shadow-xl border-2 border-dashed border-slate-300 text-center space-y-6 w-full">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Share2 className="h-10 w-10 text-slate-400" />
            </div>
            <div>
              <h2 className="text-2xl font-chewy text-slate-800 mb-2">Waiting for Opponent</h2>
              <p className="text-slate-500 text-sm">
                Share this room code with a friend so they can join!
              </p>
            </div>
            
            <div className="bg-slate-100 p-4 rounded-xl flex items-center justify-between group cursor-pointer" onClick={handleCopyCode}>
              <span className="text-3xl font-mono font-bold tracking-widest text-slate-700">{roomCode}</span>
              <Copy className="h-5 w-5 text-slate-400 group-hover:text-slate-600" />
            </div>

            <p className="text-xs text-slate-400">
              The game will start automatically when they join.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Active Game */}
          <div className="flex justify-between w-full max-w-md mb-8 gap-4">
            <PlayerCard 
              type="X" 
              isActive={game.turn === "X" && !game.winner} 
              isWinner={game.winner === "X"}
              name={isPlayerX ? "You" : "Opponent"}
            />
            <PlayerCard 
              type="O" 
              isActive={game.turn === "O" && !game.winner} 
              isWinner={game.winner === "O"}
              name={isPlayerO ? "You" : "Opponent"}
            />
          </div>

          <div className="mb-8 w-full flex justify-center relative">
            {/* Turn Indicator Overlay */}
            {!game.winner && !isMyTurn && !isSpectator && (
              <div className="absolute -top-12 bg-slate-800/80 text-white px-4 py-1 rounded-full text-sm font-bold animate-pulse">
                Opponent is thinking...
              </div>
            )}
            
            <GameBoard 
              board={game.state as (string|null)[]} 
              onTileClick={handleTileClick}
              disabled={!isMyTurn || !!game.winner || makeMove.isPending}
              winningIndices={winningIndices}
            />
          </div>

          {/* Game Over */}
          {game.winner && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-4 mb-8"
            >
              <h2 className="text-4xl font-chewy text-slate-800">
                {game.winner === "DRAW" ? "It's a Tie!" : 
                 (game.winner === "X" ? "Capybara Wins!" : "Corgi Wins!")}
              </h2>
              <p className="text-slate-500">
                {game.winner === "DRAW" ? "Well played both!" :
                 (game.winner === "X" && isPlayerX) || (game.winner === "O" && isPlayerO) 
                 ? "You are the champion!" 
                 : "Better luck next time!"}
              </p>
              
              <Link href="/">
                <Button size="lg" className="rounded-full mt-4">
                  <Home className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
