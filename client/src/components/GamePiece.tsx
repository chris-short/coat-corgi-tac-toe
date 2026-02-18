import { motion } from "framer-motion";

interface GamePieceProps {
  type: "X" | "O";
  className?: string;
}

export function GamePiece({ type, className = "" }: GamePieceProps) {
  // Capybara = X
  // Corgi = O

  const isCapy = type === "X";
  const imageSrc = isCapy ? "/images/capybara.png" : "/images/corgi.png";
  const label = isCapy ? "Capybara" : "Corgi";
  const fallbackColor = isCapy ? "text-orange-600" : "text-yellow-500";

  return (
    <motion.div
      initial={{ scale: 0, rotate: -45 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`w-full h-full flex items-center justify-center p-2 ${className}`}
    >
      <img
        src={imageSrc}
        alt={label}
        className="w-full h-full object-contain drop-shadow-md"
        onError={(e) => {
          e.currentTarget.style.display = "none";
          e.currentTarget.parentElement!.classList.add(fallbackColor, "font-chewy");
          e.currentTarget.parentElement!.innerText = isCapy ? "CAPY" : "CORGI";
        }}
      />
    </motion.div>
  );
}
