import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trophy, Users, User } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useUserStore } from "@/stores/userStore";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SnookerRegistrationProps {
  onBack: () => void;
}

const skillLevels = [
  { id: "beginner-minus", label: "מתחיל מינוס", emoji: "🐣" },
  { id: "hold-stick", label: "יודע להחזיק מקל", emoji: "🎱" },
  { id: "once-a-month", label: "מכניס כדור פעם בחודש", emoji: "🌙" },
  { id: "dangerous", label: "מסוכן על השולחן", emoji: "⚡" },
  { id: "experienced", label: "שחקן מנוסה", emoji: "🎯" },
  { id: "professional", label: "מקצוען", emoji: "🏆" },
  { id: "world-champion", label: "אלוף עולם אין עלי", emoji: "👑" },
];

const SnookerRegistration = ({ onBack }: SnookerRegistrationProps) => {
  const { name, phone, isRegistered } = useUserStore();
  const { toast } = useToast();
  const [gameType, setGameType] = useState<"solo" | "pairs" | null>(null);
  const [skillLevel, setSkillLevel] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegisteredToTournament, setIsRegisteredToTournament] = useState(false);

  const handleSubmit = async () => {
    if (!gameType || !skillLevel) {
      toast({
        title: "חסרים פרטים",
        description: "יש לבחור סוג משחק ורמה",
        variant: "destructive",
      });
      return;
    }

    if (!isRegistered()) {
      toast({
        title: "יש להירשם קודם",
        description: "חזור לדף הבית והירשם עם הפרטים שלך",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // For now, just show success - you can add DB table later
    setTimeout(() => {
      setIsSubmitting(false);
      setIsRegisteredToTournament(true);
      toast({
        title: "נרשמת בהצלחה! 🎱",
        description: "נתראה בטורניר הקרוב",
      });
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-green-950 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md border-b border-green-800/30">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-green-400 hover:text-green-300 hover:bg-green-900/30"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold text-green-400">🎱 טורניר סנוקר</h1>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Hero Banner */}
        <div className="bg-gradient-to-br from-green-800/50 to-green-900/50 rounded-2xl p-6 mb-6 border border-green-700/30 text-center">
          <div className="text-5xl mb-3">🎱</div>
          <h2 className="text-2xl font-bold text-green-300 mb-2">
            טורניר סנוקר בית קשת
          </h2>
          <p className="text-green-400/80 text-sm">
            כל יום חמישי ראשון של החודש
          </p>
          <p className="text-green-400/60 text-xs mt-1">
            במועדון הסנוקר של בית קשת
          </p>
        </div>

        {isRegisteredToTournament ? (
          <div className="bg-green-800/30 rounded-2xl p-8 text-center border border-green-600/30">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-bold text-green-300 mb-2">נרשמת בהצלחה!</h3>
            <p className="text-green-400/80 mb-4">
              {gameType === "solo" ? "משחק יחיד" : "משחק זוגות"} • {skillLevels.find(s => s.id === skillLevel)?.label}
            </p>
            <p className="text-green-400/60 text-sm">נתראה בטורניר הקרוב 🎱</p>
            <Button
              variant="outline"
              className="mt-6 border-green-600/50 text-green-400 hover:bg-green-800/30"
              onClick={onBack}
            >
              חזרה לדף הבית
            </Button>
          </div>
        ) : (
          <>
            {/* User Info */}
            {isRegistered() && (
              <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-700/30">
                <p className="text-slate-400 text-xs">משתתף</p>
                <p className="text-green-300 font-bold">{name}</p>
                <p className="text-slate-500 text-sm" dir="ltr">{phone}</p>
              </div>
            )}

            {/* Game Type Selection */}
            <div className="bg-slate-800/50 rounded-xl p-5 mb-6 border border-slate-700/30">
              <h3 className="text-green-300 font-bold mb-4 text-center">בחר סוג משחק</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setGameType("solo")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    gameType === "solo"
                      ? "border-green-500 bg-green-900/40"
                      : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                  }`}
                >
                  <User className={`w-8 h-8 mx-auto mb-2 ${gameType === "solo" ? "text-green-400" : "text-slate-500"}`} />
                  <p className={`font-bold ${gameType === "solo" ? "text-green-300" : "text-slate-400"}`}>סולו</p>
                  <p className="text-xs text-slate-500">משחק יחיד</p>
                </button>
                <button
                  onClick={() => setGameType("pairs")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    gameType === "pairs"
                      ? "border-green-500 bg-green-900/40"
                      : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                  }`}
                >
                  <Users className={`w-8 h-8 mx-auto mb-2 ${gameType === "pairs" ? "text-green-400" : "text-slate-500"}`} />
                  <p className={`font-bold ${gameType === "pairs" ? "text-green-300" : "text-slate-400"}`}>זוגות</p>
                  <p className="text-xs text-slate-500">משחק זוגי</p>
                </button>
              </div>
            </div>

            {/* Skill Level Selection */}
            <div className="bg-slate-800/50 rounded-xl p-5 mb-6 border border-slate-700/30">
              <h3 className="text-green-300 font-bold mb-4 text-center">מה הרמה שלך?</h3>
              <RadioGroup value={skillLevel || ""} onValueChange={setSkillLevel} className="space-y-2">
                {skillLevels.map((level) => (
                  <div
                    key={level.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                      skillLevel === level.id
                        ? "border-green-500 bg-green-900/30"
                        : "border-slate-700 hover:border-slate-600"
                    }`}
                    onClick={() => setSkillLevel(level.id)}
                  >
                    <RadioGroupItem value={level.id} id={level.id} className="border-green-600" />
                    <Label
                      htmlFor={level.id}
                      className={`flex-1 cursor-pointer flex items-center gap-2 ${
                        skillLevel === level.id ? "text-green-300" : "text-slate-400"
                      }`}
                    >
                      <span className="text-xl">{level.emoji}</span>
                      <span>{level.label}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={!gameType || !skillLevel || isSubmitting}
              className="w-full h-14 text-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold rounded-xl shadow-lg"
            >
              {isSubmitting ? (
                "נרשם..."
              ) : (
                <>
                  <Trophy className="w-5 h-5 ml-2" />
                  הרשמה לטורניר
                </>
              )}
            </Button>

            {!isRegistered() && (
              <p className="text-center text-amber-400/80 text-sm mt-4">
                ⚠️ יש להירשם קודם בדף הבית
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SnookerRegistration;
