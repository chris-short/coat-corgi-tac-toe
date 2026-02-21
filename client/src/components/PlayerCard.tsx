import { cn } from "@/lib/utils";
import { GamePiece } from "./GamePiece";

interface PlayerCardProps {
  type: "X" | "O";
  isActive: boolean;
  isWinner?: boolean;
  name?: string;
  score?: number; // Optional if we want to add scoring later
  className?: string;
}

export function PlayerCard({ type, isActive, isWinner, name, className }: PlayerCardProps) {
  const isCapy = type === "X";
  const defaultName = isCapy ? "Capybara" : "Corgi";

  return (
    <div
      aria-current={isActive ? "true" : undefined}
      className={cn(
        "relative p-4 rounded-2xl border-2 transition-all duration-300 w-32 md:w-40 flex flex-col items-center gap-3 bg-white shadow-sm",
        isActive && isCapy && "border-[--capy-primary] ring-2 ring-[--capy-primary]/20 shadow-lg scale-105",
        isActive && !isCapy && "border-[--corgi-primary] ring-2 ring-[--corgi-primary]/20 shadow-lg scale-105",
        !isActive && "border-transparent opacity-60 grayscale-[0.5]",
        isWinner && "ring-4 ring-green-400 bg-green-50 animate-bounce",
        className
      )}
    >
      <div className="w-16 h-16 md:w-20 md:h-20 relative">
        <GamePiece type={type} />
        
        {isActive && (
          <span className="absolute -top-2 -right-2 flex h-4 w-4" aria-hidden="true">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
          </span>
        )}
      </div>
      
      <div className="text-center">
        <p className="font-chewy text-lg md:text-xl leading-none mb-1">
          {name || defaultName}
        </p>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          {isWinner ? "Winner!" : isActive ? "Turn" : "Waiting"}
        </p>
      </div>
    </div>
  );
}
