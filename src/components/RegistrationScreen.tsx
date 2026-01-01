import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useUserStore } from "@/stores/userStore";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Zap, Users, Clock, CalendarDays, ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { format, addDays, isSameDay, startOfDay } from "date-fns";
import { he } from "date-fns/locale";
import AddParticipantsSheet from "./AddParticipantsSheet";
import ThermometerBackground from "./ThermometerBackground";

import { trackPageView, trackRegistration, trackCancellation } from "@/lib/analytics";

interface RegistrationScreenProps {
  onBack: () => void;
}

interface HourCount {
  hour: number;
  count: number;
  names: string[];
}

interface MyRegistration {
  id: string;
  hour: number;
}

const RegistrationScreen = ({ onBack }: RegistrationScreenProps) => {
  const { name, phone } = useUserStore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [hourCounts, setHourCounts] = useState<HourCount[]>([]);
  const [isRegistering, setIsRegistering] = useState<number | null>(null);
  const [myRegistrations, setMyRegistrations] = useState<MyRegistration[]>([]);
  const [showAddParticipants, setShowAddParticipants] = useState(false);
  const [pendingHour, setPendingHour] = useState<number | null>(null);

  const isToday = isSameDay(selectedDate, new Date());
  const currentHour = new Date().getHours();
  
  const getHours = () => {
    if (isToday) {
      return Array.from({ length: 24 - currentHour }, (_, i) => currentHour + i).filter(h => h <= 23);
    }
    // Future dates: show all hours starting from 0
    return Array.from({ length: 24 }, (_, i) => i);
  };

  const isRegisteredForHour = (hour: number) => myRegistrations.some(r => r.hour === hour);
  const getMyRegistrationId = (hour: number) => myRegistrations.find(r => r.hour === hour)?.id;

  const fetchRegistrations = async () => {
    const dayStart = startOfDay(selectedDate);
    const dayEnd = addDays(dayStart, 1);
    const hours = getHours();

    const { data, error } = await supabase
      .from('registrations')
      .select('id, hour, name, phone')
      .gte('registered_at', dayStart.toISOString())
      .lt('registered_at', dayEnd.toISOString());

    if (error) {
      console.error('Error fetching registrations:', error);
      return;
    }

    // Count per hour
    const counts: Record<number, number> = {};
    const names: Record<number, string[]> = {};
    const myRegs: MyRegistration[] = [];
    
    data?.forEach(reg => {
      counts[reg.hour] = (counts[reg.hour] || 0) + 1;
      if (!names[reg.hour]) names[reg.hour] = [];
      names[reg.hour].push(reg.name);
      if (reg.name === name && reg.phone === phone) {
        myRegs.push({ id: reg.id, hour: reg.hour });
      }
    });

    setHourCounts(hours.map(h => ({ hour: h, count: counts[h] || 0, names: names[h] || [] })));
    setMyRegistrations(myRegs);
  };

  useEffect(() => {
    trackPageView('registration', name, phone);
  }, []);

  useEffect(() => {
    fetchRegistrations();
  }, [selectedDate]);

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
    if (isRegisteredForHour(hour) && additionalNames.length === 0) {
      toast.error('כבר נרשמת לשעה זו');
      return;
    }

    setIsRegistering(hour);

    // Create the registration timestamp for the selected date
    const registrationDate = startOfDay(selectedDate);
    registrationDate.setHours(hour);

    // Register the main user if not already registered
    const registrations = [];
    
    if (!isRegisteredForHour(hour)) {
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
      trackRegistration(hour, format(selectedDate, 'yyyy-MM-dd'), name, phone, additionalNames.length);
    }

    setIsRegistering(null);
  };

  const handleCancelRegistration = async (hour: number, deleteAll: boolean = false) => {
    const regId = getMyRegistrationId(hour);
    if (!regId) return;

    // Check if there are other participants registered by this user for this hour
    const dayStart = startOfDay(selectedDate);
    const dayEnd = addDays(dayStart, 1);
    
    const { data: otherParticipants } = await supabase
      .from('registrations')
      .select('id, name')
      .eq('phone', phone)
      .eq('hour', hour)
      .neq('name', name)
      .gte('registered_at', dayStart.toISOString())
      .lt('registered_at', dayEnd.toISOString());

    const hasOtherParticipants = otherParticipants && otherParticipants.length > 0;

    // If there are other participants and we haven't confirmed yet, ask for confirmation
    if (hasOtherParticipants && !deleteAll) {
      const confirmed = window.confirm(
        `הוספת ${otherParticipants.length} משתתפים נוספים לשעה זו:\n${otherParticipants.map(p => p.name).join(', ')}\n\nהאם לבטל גם את ההרשמות שלהם?`
      );
      
      if (confirmed) {
        // Delete all registrations including other participants
        const allIds = [regId, ...otherParticipants.map(p => p.id)];
        const { error } = await supabase
          .from('registrations')
          .delete()
          .in('id', allIds);

        if (error) {
          console.error('Error canceling registrations:', error);
          toast.error('שגיאה בביטול ההרשמות');
        } else {
          toast.success(`${allIds.length} הרשמות בוטלו`);
          trackCancellation(hour, format(selectedDate, 'yyyy-MM-dd'), name, phone);
        }
      } else {
        // Only delete the user's own registration
        const { error } = await supabase
          .from('registrations')
          .delete()
          .eq('id', regId);

        if (error) {
          console.error('Error canceling registration:', error);
          toast.error('שגיאה בביטול ההרשמה');
        } else {
          toast.success('ההרשמה שלך בוטלה');
          trackCancellation(hour, format(selectedDate, 'yyyy-MM-dd'), name, phone);
        }
      }
      return;
    }

    // No other participants, just delete own registration
    const { error } = await supabase
      .from('registrations')
      .delete()
      .eq('id', regId);

    if (error) {
      console.error('Error canceling registration:', error);
      toast.error('שגיאה בביטול ההרשמה');
    } else {
      toast.success('ההרשמה בוטלה');
      trackCancellation(hour, format(selectedDate, 'yyyy-MM-dd'), name, phone);
    }
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
    <div className="min-h-screen bg-background relative">
      <ThermometerBackground />
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

      <main className="container mx-auto px-4 py-8 relative z-10">
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
            disabled={isRegistering === currentHour || isRegisteredForHour(currentHour)}
          >
            <Zap className="w-5 h-5 ml-2" />
            {isRegisteredForHour(currentHour) ? 'כבר רשום לעכשיו' : 'כאן עכשיו!'}
          </Button>
        )}

        {/* Hours List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {isToday ? 'שעות היום' : `שעות ${getDateLabel(selectedDate)}`}
          </h2>
          
          {hourCounts.map(({ hour, count, names: hourNames }) => {
            const isMyRegistration = isRegisteredForHour(hour);
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
                  {count > 0 ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                          <Users className="w-4 h-4" />
                          <span className="font-medium">{count}</span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-3" side="top">
                        <div className="space-y-1">
                          <p className="font-semibold text-sm mb-2">רשומים לשעה {formatHour(hour)}:</p>
                          {hourNames.map((n, i) => (
                            <p key={i} className="text-sm text-muted-foreground">{n}</p>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span className="font-medium">0</span>
                    </div>
                  )}
                  
                  <button
                    onClick={() => openAddParticipants(hour)}
                    className="p-2 rounded-full border border-border hover:border-primary hover:text-primary transition-colors"
                    title="הוסף משתתפים"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  
                  {isMyRegistration ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelRegistration(hour)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <X className="w-4 h-4 ml-1" />
                      בטל
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleRegister(hour)}
                      disabled={isRegistering === hour}
                    >
                      {isRegistering === hour ? '...' : 'הירשם'}
                    </Button>
                  )}
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
