import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { GamePiece } from "@/components/GamePiece";
import { Users, Smartphone, Trophy } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[url('/images/pattern-bg.png')] bg-repeat">
      <div className="w-full max-w-md space-y-8">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6"
        >
          <Logo />
          
          <div className="flex justify-center gap-8 py-4" aria-hidden="true">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="w-24 h-24"
            >
              <GamePiece type="X" />
            </motion.div>

            <div className="text-4xl font-chewy flex items-center text-muted-foreground">VS</div>

            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 }}
              className="w-24 h-24"
            >
              <GamePiece type="O" />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-6 md:p-8 shadow-xl border-2 border-orange-100 bg-white/90 backdrop-blur-sm rounded-3xl space-y-4">
            <Button
              asChild
              className="w-full h-16 text-xl font-chewy bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 shadow-lg shadow-orange-200 hover:shadow-xl hover:-translate-y-1 transition-all rounded-2xl"
            >
              <Link href="/local">
                <Smartphone className="mr-2 h-6 w-6" aria-hidden="true" />
                Pass &amp; Play (Offline)
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full h-16 text-xl font-chewy border-2 border-yellow-400 text-yellow-600 hover:bg-yellow-50 hover:border-yellow-500 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all rounded-2xl"
            >
              <Link href="/lobby">
                <Users className="mr-2 h-6 w-6" aria-hidden="true" />
                Play Online
              </Link>
            </Button>

            <div className="pt-4 text-center">
              <p className="text-xs text-muted-foreground font-medium">
                <Trophy className="w-3 h-3 inline mr-1" aria-hidden="true" />
                No login required • Instant play
              </p>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Decorative footer */}
      <div className="fixed bottom-4 text-center text-xs text-muted-foreground opacity-50">
        Created with <span aria-hidden="true">❤️</span><span className="sr-only">love</span> for kids &amp; parents
      </div>
    </div>
  );
}
