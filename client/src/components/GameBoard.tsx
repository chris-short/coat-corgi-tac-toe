import { motion } from "framer-motion";
import { GamePiece } from "./GamePiece";
import { cn } from "@/lib/utils";

interface GameBoardProps {
  board: (string | null)[];
  onTileClick: (index: number) => void;
  disabled?: boolean;
  winningIndices?: number[] | null;
}

const CELL_NAMES = [
  "Top left", "Top center", "Top right",
  "Middle left", "Middle center", "Middle right",
  "Bottom left", "Bottom center", "Bottom right",
];

export function GameBoard({ board, onTileClick, disabled, winningIndices }: GameBoardProps) {
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="game-grid mx-auto"
      role="group"
      aria-label="Tic-tac-toe board"
    >
      {board.map((cell, i) => {
        const isWinningTile = winningIndices?.includes(i);
        const cellContent = cell === "X" ? "Capybara" : cell === "O" ? "Corgi" : "empty";
        const isWinner = winningIndices !== null && winningIndices !== undefined;

        return (
          <motion.button
            key={i}
            variants={item}
            disabled={disabled || cell !== null}
            onClick={() => onTileClick(i)}
            whileHover={{ scale: cell === null && !disabled ? 0.95 : 1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={`${CELL_NAMES[i]}, ${cellContent}${isWinningTile ? ", winning square" : ""}`}
            className={cn(
              "tile aspect-square",
              isWinningTile && "ring-4 ring-green-400 bg-green-100/50 scale-105 z-10",
              disabled && !isWinner && "cursor-default opacity-90"
            )}
          >
            {cell === "X" && <GamePiece type="X" />}
            {cell === "O" && <GamePiece type="O" />}
          </motion.button>
        );
      })}
    </motion.div>
  );
}
