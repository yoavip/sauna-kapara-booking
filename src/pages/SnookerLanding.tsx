import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft } from "lucide-react";

// Billiard ball colors for decoration
const BilliardBalls = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Smoke effect */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
    
    {/* Floating balls */}
    <div className="absolute top-[10%] left-[5%] w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg opacity-60 animate-pulse" style={{ animationDelay: '0s' }}>
      <span className="absolute inset-0 flex items-center justify-center text-black font-bold text-sm">1</span>
    </div>
    <div className="absolute top-[20%] right-[8%] w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg opacity-50" style={{ animationDelay: '0.5s' }}>
      <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs">2</span>
    </div>
    <div className="absolute top-[45%] left-[3%] w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-lg opacity-40">
      <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs">3</span>
    </div>
    <div className="absolute top-[65%] right-[5%] w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-800 shadow-lg opacity-30">
      <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">4</span>
    </div>
    <div className="absolute bottom-[25%] left-[8%] w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg opacity-40">
      <span className="absolute inset-0 flex items-center justify-center text-black font-bold text-xs">5</span>
    </div>
    <div className="absolute top-[35%] right-[3%] w-6 h-6 rounded-full bg-gradient-to-br from-green-600 to-green-800 shadow-lg opacity-50">
      <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-[10px]">6</span>
    </div>
    <div className="absolute bottom-[40%] right-[10%] w-9 h-9 rounded-full bg-gradient-to-br from-amber-700 to-amber-900 shadow-lg opacity-35">
      <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs">7</span>
    </div>
    
    {/* Black 8-ball - prominent */}
    <div className="absolute top-[55%] left-[85%] w-16 h-16 rounded-full bg-gradient-to-br from-gray-800 to-black shadow-2xl opacity-50">
      <div className="absolute inset-2 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
          <span className="text-black font-bold">8</span>
        </div>
      </div>
    </div>
    
    {/* Cue stick decorations */}
    <div className="absolute bottom-[10%] left-[20%] w-1 h-32 bg-gradient-to-b from-amber-200 to-amber-600 rotate-45 opacity-20 rounded-full" />
    <div className="absolute bottom-[5%] right-[25%] w-1 h-40 bg-gradient-to-b from-amber-200 to-amber-600 -rotate-30 opacity-15 rounded-full" />
  </div>
);

// Smoke effect component
const SmokeEffect = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-gray-900/30 via-gray-800/10 to-transparent" />
    <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gray-400/5 blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
    <div className="absolute top-1/2 right-1/4 w-64 h-64 rounded-full bg-gray-500/5 blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
  </div>
);

const SnookerLanding = () => {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col" style={{ background: 'linear-gradient(180deg, #0c2418 0%, #0a3d24 25%, #0d4a2c 50%, #0a3d24 75%, #0c2418 100%)' }}>
      {/* Felt texture overlay */}
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
      <BilliardBalls />
      <SmokeEffect />
      
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 flex flex-col items-center justify-center relative z-10">
        <div className="text-center max-w-md mx-auto">
          {/* Logo */}
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-gray-800 to-black shadow-2xl flex items-center justify-center mb-6">
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
                <span className="text-black font-bold text-2xl">8</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-emerald-200 mb-3">
              חגיגה בסנוקר
            </h1>
            <p className="text-emerald-400/80 text-lg">
              שולחן הביליארד | בית קשת
            </p>
          </div>
          
          {/* Main CTA */}
          <Link to="/snooker/register">
            <Button
              size="lg"
              className="w-full h-16 text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-xl mb-4"
            >
              הרשמה למשחק
              <ArrowLeft className="w-6 h-6 mr-2" />
            </Button>
          </Link>
          
          {/* Rules Link */}
          <Button
            variant="outline"
            size="lg"
            className="w-full h-14 text-lg border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/50 hover:text-emerald-200"
            onClick={() => window.open('https://docs.google.com/document/d/10-buDfV_FiHRjLG8Y2FO07W9Qiz2c3Dac41USrrJMOU/edit?usp=drivesdk', '_blank')}
          >
            <FileText className="w-5 h-5 ml-2" />
            תקנון שימוש
          </Button>
          
          {/* Back to Home */}
          <Link to="/" className="block mt-8">
            <span className="text-emerald-500/70 hover:text-emerald-400 text-sm transition-colors">
              חזרה לדף הבית
            </span>
          </Link>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="relative z-10 py-6 text-center">
        <p className="text-emerald-600/50 text-sm">
          רדיו בר | בית קשת
        </p>
      </footer>
    </div>
  );
};

export default SnookerLanding;
