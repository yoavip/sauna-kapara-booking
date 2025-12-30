import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useUserStore } from "@/stores/userStore";
import { UserPlus, Users, Flame } from "lucide-react";
import saunaHero from "@/assets/sauna-hero.jpg";
import RulesSheet from "./RulesSheet";

interface WelcomeScreenProps {
  onRegister: () => void;
  onViewRegistrations: () => void;
}

const WelcomeScreen = ({ onRegister, onViewRegistrations }: WelcomeScreenProps) => {
  const { name, phone, setUser, isRegistered } = useUserStore();
  const [inputName, setInputName] = useState(name);
  const [inputPhone, setInputPhone] = useState(phone);
  const [showInputs, setShowInputs] = useState(!isRegistered());
  const [agreedToRules, setAgreedToRules] = useState(false);

  const handleSaveUser = () => {
    if (inputName.trim() && inputPhone.trim()) {
      setUser(inputName.trim(), inputPhone.trim());
      setShowInputs(false);
    }
  };

  const handleRegisterClick = () => {
    if (!isRegistered() && inputName.trim() && inputPhone.trim()) {
      setUser(inputName.trim(), inputPhone.trim());
    }
    if (isRegistered() || (inputName.trim() && inputPhone.trim())) {
      onRegister();
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${saunaHero})` }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/50 to-foreground/80" />
      
      {/* Steam Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-steam/20 rounded-full blur-3xl animate-steam" />
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-steam/15 rounded-full blur-3xl animate-steam" style={{ animationDelay: '1s' }} />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="animate-fade-up max-w-md mx-auto">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-16 h-16 rounded-full bg-golden flex items-center justify-center shadow-glow">
              <Flame className="w-8 h-8 text-foreground" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-steam mb-4">
            סאונה בית קשת
          </h1>
          <p className="text-lg text-steam/80 mb-10">
            ברוכים הבאים לסאונה הקהילתית
          </p>
          
          {/* User Info Card */}
          <div className="bg-card/95 backdrop-blur-md rounded-3xl p-8 shadow-warm mb-6">
            {showInputs ? (
              <div className="space-y-4">
                <p className="text-foreground font-medium mb-4">הזינו את הפרטים שלכם</p>
                <Input
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  placeholder="שם"
                  className="h-14 text-base text-center"
                />
                <Input
                  value={inputPhone}
                  onChange={(e) => setInputPhone(e.target.value)}
                  placeholder="טלפון"
                  type="tel"
                  dir="ltr"
                  className="h-14 text-base text-center"
                />
                
                {/* Rules Agreement */}
                <div className="flex items-center gap-3 py-2">
                  <Checkbox
                    id="rules"
                    checked={agreedToRules}
                    onCheckedChange={(checked) => setAgreedToRules(checked === true)}
                  />
                  <label htmlFor="rules" className="text-sm text-muted-foreground">
                    קראתי ומסכים/ה ל
                    <RulesSheet 
                      trigger={
                        <button type="button" className="text-primary hover:underline mr-1">
                          חוקים וכללים
                        </button>
                      }
                    />
                  </label>
                </div>

                <Button 
                  onClick={handleSaveUser}
                  variant="warm"
                  size="lg"
                  className="w-full"
                  disabled={!inputName.trim() || !inputPhone.trim() || !agreedToRules}
                >
                  שמור
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-muted-foreground text-sm mb-2">שלום,</p>
                <p className="text-2xl font-bold text-foreground mb-1">{name}</p>
                <p className="text-muted-foreground text-sm mb-4" dir="ltr">{phone}</p>
                <button 
                  onClick={() => setShowInputs(true)}
                  className="text-primary text-sm hover:underline"
                >
                  לא אני? לחצו כאן
                </button>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col gap-4">
            <Button 
              variant="hero" 
              size="xl" 
              className="w-full"
              onClick={handleRegisterClick}
              disabled={!inputName.trim() && !isRegistered()}
            >
              <UserPlus className="w-5 h-5 ml-2" />
              תרשום אותי
            </Button>
            <Button 
              variant="outline" 
              size="xl" 
              className="w-full border-steam/30 text-steam hover:bg-steam/10 hover:text-steam"
              onClick={onViewRegistrations}
            >
              <Users className="w-5 h-5 ml-2" />
              בוא נראה מי פה
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
