import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { GameBoard } from "@/components/GameBoard";
import { PlayerCard } from "@/components/PlayerCard";
import { RotateCcw } from "lucide-react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";

// Winning combinations indices
const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

export default function LocalGame() {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [history, setHistory] = useState<(string | null)[][]>([Array(9).fill(null)]);
  const [turn, setTurn] = useState<"X" | "O">("X");
  const [winner, setWinner] = useState<"X" | "O" | "DRAW" | null>(null);
  const [winningIndices, setWinningIndices] = useState<number[] | null>(null);

  const [startingPlayer, setStartingPlayer] = useState<"X" | "O">("X");

  const checkWinner = (newBoard: (string | null)[]) => {
    for (const [a, b, c] of WIN_LINES) {
      if (newBoard[a] && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]) {
        return { winner: newBoard[a] as "X" | "O", indices: [a, b, c] };
      }
    }
    if (!newBoard.includes(null)) return { winner: "DRAW", indices: null };
    return null;
  };

  const handleTileClick = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = turn;
    
    const newHistory = [...history, newBoard];
    const newTurn = turn === "X" ? "O" : "X";
    
    setBoard(newBoard);
    setHistory(newHistory);
    setTurn(newTurn);

    const result = checkWinner(newBoard);

    if (result) {
      setWinner(result.winner as any);
      if (result.winner !== "DRAW") {
        setWinningIndices(result.indices);
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: result.winner === "X" ? ['#f97316', '#ea580c'] : ['#eab308', '#ca8a04']
          });
        }
      }
    }
  };

  const undoMove = () => {
    if (history.length <= 1 || winner) return;
    
    const newHistory = [...history];
    newHistory.pop();
    const prevState = newHistory[newHistory.length - 1];
    const prevTurn = turn === "X" ? "O" : "X";
    
    setHistory(newHistory);
    setBoard(prevState);
    setTurn(prevTurn);
  };

  const resetGame = () => {
    const initialBoard = Array(9).fill(null);
    const nextStarter = startingPlayer === "X" ? "O" : "X";
    
    setStartingPlayer(nextStarter);
    setBoard(initialBoard);
    setHistory([initialBoard]);
    setTurn(nextStarter);
    setWinner(null);
    setWinningIndices(null);
  };

  const statusMessage = winner
    ? winner === "DRAW"
      ? "It's a tie!"
      : `${winner === "X" ? "Capybara" : "Corgi"} wins!`
    : `${turn === "X" ? "Capybara" : "Corgi"}'s turn`;

  return (
    <div className="min-h-screen flex flex-col items-center bg-slate-50 p-4">
      {/* Screen-reader live region for turn/game announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {statusMessage}
      </div>

      {/* Header */}
      <header className="w-full max-w-lg flex justify-center items-center mb-8 pt-4">
        <Logo />
      </header>

      <main className="flex flex-col items-center w-full">
      {/* Players */}
      <div
        className="flex justify-between w-full max-w-md mb-8 gap-4"
      >
        <PlayerCard
          type="X"
          isActive={turn === "X" && !winner}
          isWinner={winner === "X"}
          name="Player 1"
        />
        <PlayerCard
          type="O"
          isActive={turn === "O" && !winner}
          isWinner={winner === "O"}
          name="Player 2"
        />
      </div>

      {/* Board */}
      <div className="mb-8 w-full flex justify-center">
        <GameBoard 
          board={board} 
          onTileClick={handleTileClick}
          disabled={!!winner}
          winningIndices={winningIndices}
        />
      </div>

      {/* Game Over State */}
      {winner && (
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-4 mb-8"
        >
          <h2 className="text-4xl font-chewy text-slate-800">
            {winner === "DRAW" ? "It's a Tie!" : `${winner === "X" ? "Capybara" : "Corgi"} Wins!`}
          </h2>
          <Button
            onClick={resetGame}
            size="lg"
            className="rounded-full text-lg font-bold px-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            <RotateCcw className="mr-2 h-5 w-5" aria-hidden="true" />
            Play Again
          </Button>
        </motion.div>
      )}

      {/* Reset button if game in progress but no winner */}
      {!winner && board.some(cell => cell !== null) && (
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={undoMove}
            className="rounded-full text-slate-500 hover:text-slate-700"
          >
            Undo Move
          </Button>
          <Button 
            variant="outline" 
            onClick={resetGame}
            className="rounded-full text-slate-500 hover:text-slate-700"
          >
            Reset Board
          </Button>
        </div>
      )}
      </main>
    </div>
  );
}
