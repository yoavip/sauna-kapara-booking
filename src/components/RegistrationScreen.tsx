import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/userStore";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Zap, Users, Clock, CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { toast } from "sonner";
import { format, addDays, isSameDay, startOfDay } from "date-fns";
import { he } from "date-fns/locale";
import AddParticipantsSheet from "./AddParticipantsSheet";

interface RegistrationScreenProps {
  onBack: () => void;
}

interface HourCount {
  hour: number;
  count: number;
}

const RegistrationScreen = ({ onBack }: RegistrationScreenProps) => {
  const { name, phone } = useUserStore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [hourCounts, setHourCounts] = useState<HourCount[]>([]);
  const [isRegistering, setIsRegistering] = useState<number | null>(null);
  const [myRegistrations, setMyRegistrations] = useState<number[]>([]);
  const [showAddParticipants, setShowAddParticipants] = useState(false);
  const [pendingHour, setPendingHour] = useState<number | null>(null);

  const isToday = isSameDay(selectedDate, new Date());
  const currentHour = new Date().getHours();
  const hours = isToday 
    ? Array.from({ length: 24 - currentHour }, (_, i) => currentHour + i).filter(h => h <= 23)
    : Array.from({ length: 24 }, (_, i) => i);

  const fetchRegistrations = async () => {
    const dayStart = startOfDay(selectedDate);
    const dayEnd = addDays(dayStart, 1);

    const { data, error } = await supabase
      .from('registrations')
      .select('hour, name, phone')
      .gte('registered_at', dayStart.toISOString())
      .lt('registered_at', dayEnd.toISOString());

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
  }, [name, phone, selectedDate]);

  useEffect(() => {
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
  }, [selectedDate]);

  const handleRegister = async (hour: number, additionalNames: string[] = []) => {
    if (myRegistrations.includes(hour) && additionalNames.length === 0) {
      toast.error('כבר נרשמת לשעה זו');
      return;
    }

    setIsRegistering(hour);

    // Create the registration timestamp for the selected date
    const registrationDate = startOfDay(selectedDate);
    registrationDate.setHours(hour);

    // Register the main user if not already registered
    const registrations = [];
    
    if (!myRegistrations.includes(hour)) {
      registrations.push({
        name,
        phone,
        hour,
        registered_at: registrationDate.toISOString(),
      });
    }

    // Add additional participants
    additionalNames.forEach(participantName => {
      registrations.push({
        name: participantName,
        phone: phone, // Use the main user's phone
        hour,
        registered_at: registrationDate.toISOString(),
      });
    });

    if (registrations.length === 0) {
      setIsRegistering(null);
      return;
    }

    const { error } = await supabase
      .from('registrations')
      .insert(registrations);

    if (error) {
      console.error('Error registering:', error);
      toast.error('שגיאה בהרשמה, נסו שוב');
    } else {
      const dateLabel = isToday ? '' : ` ב-${format(selectedDate, 'dd/MM')}`;
      const count = registrations.length;
      toast.success(`${count > 1 ? `${count} אנשים נרשמו` : 'נרשמת'} בהצלחה לשעה ${hour}:00${dateLabel}!`);
    }

    setIsRegistering(null);
  };

  const handleAddParticipantsConfirm = (names: string[]) => {
    if (pendingHour !== null) {
      handleRegister(pendingHour, names);
      setPendingHour(null);
    }
  };

  const openAddParticipants = (hour: number) => {
    setPendingHour(hour);
    setShowAddParticipants(true);
  };

  const handleRegisterNow = () => {
    handleRegister(currentHour);
  };

  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const getDateLabel = (date: Date) => {
    const today = new Date();
    if (isSameDay(date, today)) return 'היום';
    if (isSameDay(date, addDays(today, 1))) return 'מחר';
    return format(date, 'EEEE, dd/MM', { locale: he });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      const prevDate = addDays(selectedDate, -1);
      if (prevDate >= startOfDay(new Date())) {
        setSelectedDate(prevDate);
      }
    } else {
      setSelectedDate(addDays(selectedDate, 1));
    }
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

        {/* Date Selector */}
        <div className="bg-card rounded-2xl p-4 mb-6 shadow-warm">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateDate('next')}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2 text-center">
              <CalendarDays className="w-5 h-5 text-primary" />
              <span className="text-lg font-bold text-foreground">{getDateLabel(selectedDate)}</span>
              {!isToday && (
                <span className="text-sm text-muted-foreground">({format(selectedDate, 'dd/MM')})</span>
              )}
            </div>
            
            <button
              onClick={() => navigateDate('prev')}
              className={`p-2 rounded-full transition-colors ${
                isSameDay(selectedDate, new Date()) 
                  ? 'opacity-30 cursor-not-allowed' 
                  : 'hover:bg-muted'
              }`}
              disabled={isSameDay(selectedDate, new Date())}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Register Now Button - only show for today */}
        {isToday && (
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
        )}

        {/* Hours List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {isToday ? 'שעות היום' : `שעות ${getDateLabel(selectedDate)}`}
          </h2>
          
          {hourCounts.map(({ hour, count }) => {
            const isMyRegistration = myRegistrations.includes(hour);
            const isCurrentHour = isToday && hour === currentHour;
            
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
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">{count}</span>
                  </div>
                  
                  <button
                    onClick={() => openAddParticipants(hour)}
                    className="p-2 rounded-full border border-border hover:border-primary hover:text-primary transition-colors"
                    title="הוסף משתתפים"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  
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

      <AddParticipantsSheet
        open={showAddParticipants}
        onOpenChange={setShowAddParticipants}
        onConfirm={handleAddParticipantsConfirm}
      />
    </div>
  );
};

export default RegistrationScreen;
