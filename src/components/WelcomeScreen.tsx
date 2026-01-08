import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserStore } from "@/stores/userStore";
import { UserPlus, Users, Flame, Shield, Check, FileText } from "lucide-react";
import saunaHero from "@/assets/sauna-hero.jpg";
import RulesSheet from "./RulesSheet";
import { trackPageView } from "@/lib/analytics";

interface WelcomeScreenProps {
  onRegister: () => void;
  onViewRegistrations: () => void;
  onAdminUsers: () => void;
}

const WelcomeScreen = ({ onRegister, onViewRegistrations, onAdminUsers }: WelcomeScreenProps) => {
  const { name, lastName, phone, setUser, clearUser, isRegistered, checkAdminSync, isAdmin } = useUserStore();
  const [inputName, setInputName] = useState(name);
  const [inputLastName, setInputLastName] = useState(lastName);
  const [inputPhone, setInputPhone] = useState(phone);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [agreedToRules, setAgreedToRules] = useState(false);
  const [showRulesSheet, setShowRulesSheet] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(checkAdminSync());
  
  // Validation errors
  const [errors, setErrors] = useState<{name?: string; lastName?: string; phone?: string; rules?: string}>({});

  useEffect(() => {
    trackPageView('welcome', name, phone);
    // Check admin status on mount
    if (isRegistered()) {
      isAdmin().then(setIsAdminUser);
    }
  }, []);

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
    if (!agreedToRules) {
      newErrors.rules = 'לא קראת ואישרת את התקנון';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveUser = async () => {
    if (!validateFields()) {
      return;
    }
    
    await setUser(inputName.trim(), inputLastName.trim(), inputPhone.trim());
    setShowRegistrationForm(false);
    const adminStatus = await isAdmin();
    setIsAdminUser(adminStatus);
  };

  const handleRegisterClick = () => {
    if (!isRegistered()) {
      setShowRegistrationForm(true);
    } else {
      onRegister();
    }
  };

  const handleRulesConfirm = () => {
    setAgreedToRules(true);
    if (errors.rules) setErrors(prev => ({ ...prev, rules: undefined }));
  };

  const handleOpenRules = () => {
    setShowRulesSheet(true);
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
          
          {/* Registration Form - shown for first-time users or when editing */}
          {showRegistrationForm && (
            <div className="bg-card/95 backdrop-blur-md rounded-3xl p-8 shadow-warm mb-6">
              <div className="space-y-4">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    {isRegistered() ? 'עדכון פרטים' : 'איזה כיף שבאת! 🔥'}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {isRegistered() ? 'ניתן לעדכן את הפרטים שלך' : 'בשביל להירשם לסאונה, נצטרך ממך כמה פרטים קטנים'}
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
                    className={`h-14 text-base text-center ${errors.name ? 'border-destructive border-2' : ''}`}
                  />
                  {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
                </div>
                <div>
                  <Input
                    value={inputLastName}
                    onChange={(e) => {
                      setInputLastName(e.target.value);
                      if (errors.lastName) setErrors(prev => ({ ...prev, lastName: undefined }));
                    }}
                    placeholder="שם משפחה"
                    className={`h-14 text-base text-center ${errors.lastName ? 'border-destructive border-2' : ''}`}
                  />
                  {errors.lastName && <p className="text-destructive text-sm mt-1">{errors.lastName}</p>}
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
                    className={`h-14 text-base text-center ${errors.phone ? 'border-destructive border-2' : ''}`}
                  />
                  {errors.phone && <p className="text-destructive text-sm mt-1">{errors.phone}</p>}
                </div>
                
                {/* Rules Agreement */}
                <div className={`${errors.rules ? 'border-2 border-destructive rounded-lg' : ''}`}>
                  {!agreedToRules ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleOpenRules}
                      className="w-full h-14 gap-2"
                    >
                      <FileText className="w-5 h-5" />
                      לקריאה ואישור התקנון
                    </Button>
                  ) : (
                    <div className="flex items-center justify-center gap-2 py-4 px-4 bg-primary/10 rounded-lg">
                      <Check className="w-5 h-5 text-primary" />
                      <span className="text-primary font-medium">התקנון אושר</span>
                    </div>
                  )}
                </div>
                {errors.rules && <p className="text-destructive text-sm">{errors.rules}</p>}

                <Button 
                  onClick={handleSaveUser}
                  variant="warm"
                  size="lg"
                  className="w-full"
                >
                  שמור והמשך
                </Button>
              </div>
            </div>
          )}
          
          {/* User Info Card - shown when registered and not editing */}
          {isRegistered() && !showRegistrationForm && (
            <div className="bg-card/95 backdrop-blur-md rounded-3xl p-8 shadow-warm mb-6">
              <div>
                <p className="text-muted-foreground text-sm mb-2">שלום,</p>
                <p className="text-2xl font-bold text-foreground mb-1">{name} {lastName}</p>
                <p className="text-muted-foreground text-sm mb-4" dir="ltr">{phone}</p>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => {
                      setInputName(name);
                      setInputLastName(lastName);
                      setInputPhone(phone);
                      setShowRegistrationForm(true);
                      setAgreedToRules(true); // Already agreed before
                    }}
                    className="text-primary text-sm hover:underline"
                  >
                    שינוי פרטים
                  </button>
                  <button 
                    onClick={() => {
                      clearUser();
                      setInputName('');
                      setInputLastName('');
                      setInputPhone('');
                      setAgreedToRules(false);
                      setShowRegistrationForm(false);
                      setIsAdminUser(false);
                    }}
                    className="text-muted-foreground text-xs hover:underline"
                  >
                    לא אני? לחצו כאן
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex flex-col gap-4">
            <Button 
              variant="hero" 
              size="xl" 
              className="w-full"
              onClick={handleRegisterClick}
            >
              <UserPlus className="w-5 h-5 ml-2" />
              {isRegistered() ? 'תרשום אותי' : 'הרשמה'}
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
            
            {/* Admin Button */}
            {isAdminUser && (
              <Button 
                variant="outline" 
                size="xl" 
                className="w-full border-primary/50 text-primary hover:bg-primary/10"
                onClick={onAdminUsers}
              >
                <Shield className="w-5 h-5 ml-2" />
                ניהול משתמשים
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <RulesSheet 
        open={showRulesSheet}
        onOpenChange={setShowRulesSheet}
        onConfirm={handleRulesConfirm}
      />
    </div>
  );
};

export default WelcomeScreen;
