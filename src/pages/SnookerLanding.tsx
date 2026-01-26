import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, ArrowLeft, Check } from "lucide-react";
import { useSnookerUserStore } from "@/stores/snookerUserStore";
import SnookerRulesSheet from "@/components/SnookerRulesSheet";

// Billiard ball component with rolling animation
const BilliardBall = ({ 
  number, 
  color, 
  textColor = "white",
  size,
  initialX,
  initialY,
  duration,
  delay = 0
}: {
  number: number;
  color: string;
  textColor?: string;
  size: number;
  initialX: string;
  initialY: string;
  duration: number;
  delay?: number;
}) => (
  <div 
    className="absolute rounded-full shadow-lg"
    style={{
      width: size,
      height: size,
      left: initialX,
      top: initialY,
      background: color,
      animation: `roll-${number} ${duration}s linear ${delay}s infinite`,
    }}
  >
    <span 
      className="absolute inset-0 flex items-center justify-center font-bold"
      style={{ 
        color: textColor, 
        fontSize: size * 0.35,
        animation: `spin ${duration * 0.8}s linear ${delay}s infinite`
      }}
    >
      {number}
    </span>
  </div>
);

// Billiard balls container with animations
const BilliardBalls = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Smoke effect */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
    
    {/* Rolling balls with unique animations */}
    <BilliardBall number={1} color="linear-gradient(135deg, #fbbf24 0%, #d97706 100%)" textColor="black" size={48} initialX="5%" initialY="10%" duration={25} delay={0} />
    <BilliardBall number={2} color="linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" textColor="white" size={40} initialX="92%" initialY="20%" duration={30} delay={2} />
    <BilliardBall number={3} color="linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)" textColor="white" size={32} initialX="3%" initialY="45%" duration={22} delay={1} />
    <BilliardBall number={4} color="linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)" textColor="white" size={56} initialX="95%" initialY="65%" duration={28} delay={3} />
    <BilliardBall number={5} color="linear-gradient(135deg, #fb923c 0%, #ea580c 100%)" textColor="black" size={40} initialX="8%" initialY="75%" duration={20} delay={0.5} />
    <BilliardBall number={6} color="linear-gradient(135deg, #22c55e 0%, #15803d 100%)" textColor="white" size={24} initialX="97%" initialY="35%" duration={18} delay={1.5} />
    <BilliardBall number={7} color="linear-gradient(135deg, #92400e 0%, #78350f 100%)" textColor="white" size={36} initialX="90%" initialY="80%" duration={24} delay={2.5} />
    
    {/* Black 8-ball - prominent with special animation */}
    <div 
      className="absolute rounded-full shadow-2xl"
      style={{
        width: 64,
        height: 64,
        left: '85%',
        top: '55%',
        background: 'linear-gradient(135deg, #374151 0%, #000000 100%)',
        animation: 'roll-8 35s linear infinite',
      }}
    >
      <div className="absolute inset-2 flex items-center justify-center">
        <div 
          className="w-8 h-8 rounded-full bg-white flex items-center justify-center"
          style={{ animation: 'spin 28s linear infinite' }}
        >
          <span className="text-black font-bold">8</span>
        </div>
      </div>
    </div>
    
    {/* Cue stick decorations */}
    <div className="absolute bottom-[10%] left-[20%] w-1 h-32 bg-gradient-to-b from-amber-200 to-amber-600 rotate-45 opacity-20 rounded-full" />
    <div className="absolute bottom-[5%] right-[25%] w-1 h-40 bg-gradient-to-b from-amber-200 to-amber-600 -rotate-[30deg] opacity-15 rounded-full" />
    
    {/* CSS Keyframes for rolling animations */}
    <style>{`
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes roll-1 {
        0% { transform: translate(0, 0) rotate(0deg); opacity: 0.6; }
        25% { transform: translate(80px, 120px) rotate(180deg); opacity: 0.5; }
        50% { transform: translate(40px, 200px) rotate(360deg); opacity: 0.4; }
        75% { transform: translate(-30px, 100px) rotate(540deg); opacity: 0.5; }
        100% { transform: translate(0, 0) rotate(720deg); opacity: 0.6; }
      }
      @keyframes roll-2 {
        0% { transform: translate(0, 0) rotate(0deg); opacity: 0.5; }
        25% { transform: translate(-100px, 80px) rotate(-180deg); opacity: 0.4; }
        50% { transform: translate(-60px, 160px) rotate(-360deg); opacity: 0.35; }
        75% { transform: translate(-120px, 60px) rotate(-540deg); opacity: 0.4; }
        100% { transform: translate(0, 0) rotate(-720deg); opacity: 0.5; }
      }
      @keyframes roll-3 {
        0% { transform: translate(0, 0) rotate(0deg); opacity: 0.4; }
        33% { transform: translate(60px, -40px) rotate(240deg); opacity: 0.35; }
        66% { transform: translate(100px, 30px) rotate(480deg); opacity: 0.3; }
        100% { transform: translate(0, 0) rotate(720deg); opacity: 0.4; }
      }
      @keyframes roll-4 {
        0% { transform: translate(0, 0) rotate(0deg); opacity: 0.3; }
        25% { transform: translate(-80px, -60px) rotate(-120deg); opacity: 0.25; }
        50% { transform: translate(-40px, -120px) rotate(-240deg); opacity: 0.2; }
        75% { transform: translate(-100px, -40px) rotate(-360deg); opacity: 0.25; }
        100% { transform: translate(0, 0) rotate(-480deg); opacity: 0.3; }
      }
      @keyframes roll-5 {
        0% { transform: translate(0, 0) rotate(0deg); opacity: 0.4; }
        50% { transform: translate(70px, -80px) rotate(360deg); opacity: 0.35; }
        100% { transform: translate(0, 0) rotate(720deg); opacity: 0.4; }
      }
      @keyframes roll-6 {
        0% { transform: translate(0, 0) rotate(0deg); opacity: 0.5; }
        25% { transform: translate(-50px, 60px) rotate(180deg); opacity: 0.45; }
        50% { transform: translate(-80px, 30px) rotate(360deg); opacity: 0.4; }
        75% { transform: translate(-30px, 90px) rotate(540deg); opacity: 0.45; }
        100% { transform: translate(0, 0) rotate(720deg); opacity: 0.5; }
      }
      @keyframes roll-7 {
        0% { transform: translate(0, 0) rotate(0deg); opacity: 0.35; }
        33% { transform: translate(-60px, -50px) rotate(-240deg); opacity: 0.3; }
        66% { transform: translate(-90px, 20px) rotate(-480deg); opacity: 0.25; }
        100% { transform: translate(0, 0) rotate(-720deg); opacity: 0.35; }
      }
      @keyframes roll-8 {
        0% { transform: translate(0, 0) rotate(0deg); opacity: 0.5; }
        20% { transform: translate(-40px, 30px) rotate(72deg); opacity: 0.45; }
        40% { transform: translate(-70px, -20px) rotate(144deg); opacity: 0.4; }
        60% { transform: translate(-30px, -50px) rotate(216deg); opacity: 0.45; }
        80% { transform: translate(20px, -20px) rotate(288deg); opacity: 0.5; }
        100% { transform: translate(0, 0) rotate(360deg); opacity: 0.5; }
      }
    `}</style>
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
  const { name, phone, isRegistered, setUser, setAgreedToRules, clearUser, agreedToRules } = useSnookerUserStore();
  
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [inputName, setInputName] = useState(name);
  const [inputLastName, setInputLastName] = useState('');
  const [inputPhone, setInputPhone] = useState(phone);
  const [localAgreedToRules, setLocalAgreedToRules] = useState(agreedToRules);
  const [showRulesSheet, setShowRulesSheet] = useState(false);
  
  const [errors, setErrors] = useState<{name?: string; lastName?: string; phone?: string; rules?: string}>({});

  const validateFields = () => {
    const newErrors: {name?: string; lastName?: string; phone?: string; rules?: string} = {};
    
    if (!inputName.trim()) {
      newErrors.name = 'לא מילאת שם';
    }
    if (!inputLastName.trim()) {
      newErrors.lastName = 'לא מילאת שם משפחה';
    }
    if (!inputPhone.trim()) {
      newErrors.phone = 'לא מילאת טלפון';
    }
    if (!localAgreedToRules) {
      newErrors.rules = 'לא קראת ואישרת את התקנון';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveUser = () => {
    if (!validateFields()) {
      return;
    }
    
    setUser(inputName.trim(), inputLastName.trim(), inputPhone.trim());
    setAgreedToRules(true);
    setShowRegistrationForm(false);
  };

  const handleRegisterClick = () => {
    if (!isRegistered()) {
      setShowRegistrationForm(true);
    }
  };

  const handleRulesConfirm = () => {
    setLocalAgreedToRules(true);
    if (errors.rules) setErrors(prev => ({ ...prev, rules: undefined }));
  };

  const handleNotMe = () => {
    clearUser();
    setInputName('');
    setInputLastName('');
    setInputPhone('');
    setLocalAgreedToRules(false);
    setShowRegistrationForm(false);
  };

  const registered = isRegistered();

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
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-gray-800 to-black shadow-2xl flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                <span className="text-black font-bold text-xl">8</span>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-emerald-200 mb-2">
              חגיגה בסנוקר
            </h1>
            <p className="text-emerald-400/80 text-base">
              שולחן הביליארד | בית קשת
            </p>
          </div>

          {/* Registration Form - for new users */}
          {showRegistrationForm && (
            <div className="bg-black/60 backdrop-blur-md rounded-3xl p-6 shadow-2xl mb-6 border border-emerald-700/30">
              <div className="space-y-4">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-emerald-200 mb-2">
                    נעים להכיר! 🎱
                  </h2>
                  <p className="text-emerald-400/70 text-sm">
                    בשביל להירשם למשחק, נצטרך ממך כמה פרטים
                  </p>
                </div>
                <div>
                  <Input
                    value={inputName}
                    onChange={(e) => {
                      setInputName(e.target.value);
                      if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                    }}
                    placeholder="שם פרטי"
                    className={`h-12 text-base text-center bg-black/50 border-emerald-600/50 text-emerald-100 placeholder:text-emerald-600/50 ${errors.name ? 'border-red-500 border-2' : ''}`}
                  />
                  {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                </div>
                <div>
                  <Input
                    value={inputLastName}
                    onChange={(e) => {
                      setInputLastName(e.target.value);
                      if (errors.lastName) setErrors(prev => ({ ...prev, lastName: undefined }));
                    }}
                    placeholder="שם משפחה"
                    className={`h-12 text-base text-center bg-black/50 border-emerald-600/50 text-emerald-100 placeholder:text-emerald-600/50 ${errors.lastName ? 'border-red-500 border-2' : ''}`}
                  />
                  {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
                </div>
                <div>
                  <Input
                    value={inputPhone}
                    onChange={(e) => {
                      setInputPhone(e.target.value);
                      if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
                    }}
                    placeholder="טלפון"
                    type="tel"
                    dir="ltr"
                    className={`h-12 text-base text-center bg-black/50 border-emerald-600/50 text-emerald-100 placeholder:text-emerald-600/50 ${errors.phone ? 'border-red-500 border-2' : ''}`}
                  />
                  {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
                </div>
                
                {/* Rules Agreement */}
                <div className={`${errors.rules ? 'border-2 border-red-500 rounded-lg' : ''}`}>
                  {!localAgreedToRules ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowRulesSheet(true)}
                      className="w-full h-12 gap-2 border-emerald-600/50 text-emerald-300 hover:bg-emerald-900/50"
                    >
                      <FileText className="w-5 h-5" />
                      לקריאה ואישור התקנון
                    </Button>
                  ) : (
                    <div className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-900/50 rounded-lg border border-emerald-600/30">
                      <Check className="w-5 h-5 text-emerald-400" />
                      <span className="text-emerald-300 font-medium">התקנון אושר</span>
                    </div>
                  )}
                </div>
                {errors.rules && <p className="text-red-400 text-sm">{errors.rules}</p>}

                <Button 
                  onClick={handleSaveUser}
                  size="lg"
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white"
                >
                  שמור והמשך
                </Button>
              </div>
            </div>
          )}

          {/* User Info Card - shown when registered */}
          {registered && !showRegistrationForm && (
            <div className="bg-black/60 backdrop-blur-md rounded-xl p-4 shadow-xl mb-4 border border-emerald-700/30">
              <div>
                <p className="text-emerald-500/70 text-xs">שלום</p>
                <p className="text-xl font-bold text-emerald-200">{name}</p>
                <p className="text-emerald-400/70 text-sm mb-1" dir="ltr">{phone}</p>
                <button
                  onClick={handleNotMe}
                  className="text-emerald-500/60 text-xs hover:underline hover:text-emerald-400"
                >
                  לא אני? לחצו כאן
                </button>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          {!showRegistrationForm && (
            <div className="space-y-3">
              {registered ? (
                <Link to="/snooker/register">
                  <Button
                    size="lg"
                    className="w-full h-14 text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-xl"
                  >
                    הרשמה למשחק
                    <ArrowLeft className="w-6 h-6 mr-2" />
                  </Button>
                </Link>
              ) : (
                <Button
                  size="lg"
                  className="w-full h-14 text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-xl"
                  onClick={handleRegisterClick}
                >
                  נעים להכיר
                </Button>
              )}
              
              {/* Rules Link */}
              <Button
                variant="outline"
                size="lg"
                className="w-full h-12 text-base border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/50 hover:text-emerald-200"
                onClick={() => window.open('https://docs.google.com/document/d/10-buDfV_FiHRjLG8Y2FO07W9Qiz2c3Dac41USrrJMOU/edit?usp=drivesdk', '_blank')}
              >
                <FileText className="w-5 h-5 ml-2" />
                תקנון שימוש
              </Button>
            </div>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="relative z-10 py-6 text-center">
        <p className="text-emerald-600/50 text-sm">
          רדיו בר | בית קשת
        </p>
      </footer>

      <SnookerRulesSheet 
        open={showRulesSheet}
        onOpenChange={setShowRulesSheet}
        onConfirm={handleRulesConfirm}
      />
    </div>
  );
};

export default SnookerLanding;
