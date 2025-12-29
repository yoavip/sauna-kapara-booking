import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/userStore";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Zap, Users, Clock } from "lucide-react";
import { toast } from "sonner";

interface RegistrationScreenProps {
  onBack: () => void;
}

interface HourCount {
  hour: number;
  count: number;
}

const RegistrationScreen = ({ onBack }: RegistrationScreenProps) => {
  const { name, phone } = useUserStore();
  const [hourCounts, setHourCounts] = useState<HourCount[]>([]);
  const [isRegistering, setIsRegistering] = useState<number | null>(null);
  const [myRegistrations, setMyRegistrations] = useState<number[]>([]);

  const currentHour = new Date().getHours();
  const hours = Array.from({ length: 24 - currentHour }, (_, i) => currentHour + i).filter(h => h <= 23);

  const fetchRegistrations = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data, error } = await supabase
      .from('registrations')
      .select('hour, name, phone')
      .gte('registered_at', today.toISOString())
      .lt('registered_at', tomorrow.toISOString());

    if (error) {
      console.error('Error fetching registrations:', error);
      return;
    }

    // Count per hour
    const counts: Record<number, number> = {};
    const myRegs: number[] = [];
    
    data?.forEach(reg => {
      counts[reg.hour] = (counts[reg.hour] || 0) + 1;
      if (reg.name === name && reg.phone === phone) {
        myRegs.push(reg.hour);
      }
    });

    setHourCounts(hours.map(h => ({ hour: h, count: counts[h] || 0 })));
    setMyRegistrations(myRegs);
  };

  useEffect(() => {
    fetchRegistrations();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('registrations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'registrations'
        },
        () => {
          fetchRegistrations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [name, phone]);

  const handleRegister = async (hour: number) => {
    if (myRegistrations.includes(hour)) {
      toast.error('כבר נרשמת לשעה זו');
      return;
    }

    setIsRegistering(hour);

    const { error } = await supabase
      .from('registrations')
      .insert({
        name,
        phone,
        hour,
      });

    if (error) {
      console.error('Error registering:', error);
      toast.error('שגיאה בהרשמה, נסו שוב');
    } else {
      toast.success(`נרשמת בהצלחה לשעה ${hour}:00!`);
    }

    setIsRegistering(null);
  };

  const handleRegisterNow = () => {
    handleRegister(currentHour);
  };

  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            חזרה
          </button>
          <h1 className="text-lg font-bold text-foreground">הרשמה לסאונה</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* User Info */}
        <div className="bg-card rounded-2xl p-6 mb-6 shadow-warm">
          <p className="text-muted-foreground text-sm">נרשם בשם:</p>
          <p className="text-xl font-bold text-foreground">{name}</p>
          <p className="text-muted-foreground text-sm" dir="ltr">{phone}</p>
        </div>

        {/* Register Now Button */}
        <Button
          variant="hero"
          size="xl"
          className="w-full mb-8"
          onClick={handleRegisterNow}
          disabled={isRegistering === currentHour || myRegistrations.includes(currentHour)}
        >
          <Zap className="w-5 h-5 ml-2" />
          {myRegistrations.includes(currentHour) ? 'כבר רשום לעכשיו' : 'כאן עכשיו!'}
        </Button>

        {/* Hours List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            שעות היום
          </h2>
          
          {hourCounts.map(({ hour, count }) => {
            const isMyRegistration = myRegistrations.includes(hour);
            const isCurrentHour = hour === currentHour;
            
            return (
              <div
                key={hour}
                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  isMyRegistration 
                    ? 'bg-primary/10 border-primary' 
                    : isCurrentHour 
                      ? 'bg-golden/10 border-golden'
                      : 'bg-card border-border hover:border-primary/30'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`text-2xl font-bold ${isCurrentHour ? 'text-golden' : 'text-foreground'}`}>
                    {formatHour(hour)}
                  </span>
                  {isCurrentHour && (
                    <span className="text-xs bg-golden/20 text-golden px-2 py-1 rounded-full font-medium">
                      עכשיו
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">{count}</span>
                  </div>
                  
                  <Button
                    variant={isMyRegistration ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleRegister(hour)}
                    disabled={isRegistering === hour || isMyRegistration}
                  >
                    {isRegistering === hour ? '...' : isMyRegistration ? 'רשום ✓' : 'הירשם'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default RegistrationScreen;
