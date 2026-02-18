import { Link } from "wouter";

export function Logo() {
  return (
    <Link href="/" className="group cursor-pointer no-underline">
      <div className="flex flex-col items-center">
        <h1 className="text-4xl md:text-6xl font-chewy text-transparent bg-clip-text bg-gradient-to-r from-[--capy-primary] to-[--corgi-primary] drop-shadow-sm group-hover:scale-105 transition-transform duration-300">
          Tic Tac Toe
        </h1>
        <p className="text-sm md:text-base font-medium text-muted-foreground -mt-1 md:-mt-2">
          Capybaras vs Corgis
        </p>
      </div>
    </Link>
  );
}
