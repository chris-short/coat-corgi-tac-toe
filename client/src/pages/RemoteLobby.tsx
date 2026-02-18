import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useCreateGame, useJoinGame } from "@/hooks/use-game";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";

export default function RemoteLobby() {
  const [_, setLocation] = useLocation();
  const [roomCode, setRoomCode] = useState("");
  
  const createGame = useCreateGame();
  const joinGame = useJoinGame();

  const handleCreate = async () => {
    try {
      const game = await createGame.mutateAsync();
      setLocation(`/game/${game.roomCode}`);
    } catch (e) {
      // Error handled in hook
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.length !== 4) return;
    
    try {
      const game = await joinGame.mutateAsync(roomCode.toUpperCase());
      setLocation(`/game/${game.roomCode}`);
    } catch (e) {
      // Error handled in hook
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md space-y-6">
        {/* Navigation */}
        <div className="absolute top-4 left-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-6 w-6 text-slate-500" />
            </Button>
          </Link>
        </div>

        <div className="text-center mb-8 pt-8">
          <Logo />
        </div>

        {/* Create Game */}
        <Card className="border-2 border-orange-100 shadow-lg overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[--capy-primary] to-[--corgi-primary]" />
          <CardHeader>
            <CardTitle className="text-2xl font-chewy text-center">Start a New Game</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleCreate}
              disabled={createGame.isPending}
              className="w-full h-14 text-lg rounded-xl bg-orange-500 hover:bg-orange-600 transition-all shadow-md hover:shadow-lg"
            >
              {createGame.isPending ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-5 w-5" />
              )}
              Create Room
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-3">
              You'll get a code to share with a friend.
            </p>
          </CardContent>
        </Card>

        <div className="flex items-center gap-4">
          <div className="h-px bg-slate-200 flex-1" />
          <span className="text-slate-400 font-chewy text-lg">OR</span>
          <div className="h-px bg-slate-200 flex-1" />
        </div>

        {/* Join Game */}
        <Card className="border-2 border-yellow-100 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-chewy text-center">Join a Friend</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoin} className="space-y-4">
              <Input
                placeholder="Enter 4-letter code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={4}
                className="text-center text-2xl tracking-widest uppercase font-mono h-14 rounded-xl border-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
              <Button 
                type="submit" 
                disabled={roomCode.length !== 4 || joinGame.isPending}
                className="w-full h-14 text-lg rounded-xl bg-yellow-400 hover:bg-yellow-500 text-yellow-900 transition-all shadow-md hover:shadow-lg"
              >
                {joinGame.isPending ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  "Join Room"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
