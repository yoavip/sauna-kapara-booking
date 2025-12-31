import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Users, Clock, User, CalendarDays, ChevronLeft, ChevronRight, X, Shield } from "lucide-react";
import { format, addDays, subDays, isSameDay, startOfDay, isBefore } from "date-fns";
import { he } from "date-fns/locale";
import { useUserStore } from "@/stores/userStore";
import { toast } from "sonner";
import { trackPageView, trackCancellation } from "@/lib/analytics";
import ThermometerBackground from "./ThermometerBackground";
import ShareButton from "./ShareButton";

interface ViewRegistrationsProps {
  onBack: () => void;
}

interface Registration {
  id: string;
  name: string;
  phone: string;
  hour: number;
}

interface HourGroup {
  hour: number;
  registrations: Registration[];
}

const ViewRegistrations = ({ onBack }: ViewRegistrationsProps) => {
  const { name, phone, isAdmin } = useUserStore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [hourGroups, setHourGroups] = useState<HourGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const isToday = isSameDay(selectedDate, new Date());
  const currentHour = new Date().getHours();
  const isPastDate = isBefore(startOfDay(selectedDate), startOfDay(new Date()));
  const admin = isAdmin();

  useEffect(() => {
    trackPageView('view_registrations', name, phone);
  }, []);

  const fetchRegistrations = async () => {
    const dayStart = startOfDay(selectedDate);
    const dayEnd = addDays(dayStart, 1);

    const { data, error } = await supabase
      .from('registrations')
      .select('id, name, phone, hour')
      .gte('registered_at', dayStart.toISOString())
      .lt('registered_at', dayEnd.toISOString())
      .order('hour', { ascending: true });

    if (error) {
      console.error('Error fetching registrations:', error);
      setLoading(false);
      return;
    }

    // Group by hour - only include hours with registrations
    const groups: Record<number, Registration[]> = {};
    
    data?.forEach(reg => {
      if (!groups[reg.hour]) {
        groups[reg.hour] = [];
      }
      groups[reg.hour].push(reg);
    });

    // Create ordered array - only hours with registrations
    const result: HourGroup[] = Object.keys(groups)
      .map(Number)
      .sort((a, b) => a - b)
      .map(hour => ({
        hour,
        registrations: groups[hour]
      }));

    setHourGroups(result);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    fetchRegistrations();
  }, [selectedDate]);

  useEffect(() => {
    // Subscribe to realtime updates
    const channel = supabase
      .channel('view-registrations-changes')
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

  const handleCancelRegistration = async (regId: string, hour: number, regName: string) => {
    const { error } = await supabase
      .from('registrations')
      .delete()
      .eq('id', regId);

    if (error) {
      console.error('Error canceling registration:', error);
      toast.error('שגיאה בביטול ההרשמה');
    } else {
      toast.success(`ההרשמה של ${regName} בוטלה`);
      trackCancellation(hour, format(selectedDate, 'yyyy-MM-dd'), name, phone);
    }
  };

  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const getDateLabel = (date: Date) => {
    const today = new Date();
    if (isSameDay(date, today)) return 'היום';
    if (isSameDay(date, addDays(today, 1))) return 'מחר';
    if (isSameDay(date, subDays(today, 1))) return 'אתמול';
    return format(date, 'EEEE, dd/MM', { locale: he });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      const prevDate = addDays(selectedDate, -1);
      // Allow past dates only for admin
      if (admin || prevDate >= startOfDay(new Date())) {
        setSelectedDate(prevDate);
      }
    } else {
      setSelectedDate(addDays(selectedDate, 1));
    }
  };

  const canCancelRegistration = (reg: Registration) => {
    // Admin can delete anyone
    if (admin) return true;
    // User can delete their own registrations (same phone = registered by them)
    return reg.phone === phone;
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
          <div className="flex items-center gap-2">
            {admin && <Shield className="w-5 h-5 text-primary" />}
            <h1 className="text-lg font-bold text-foreground">מי פה?</h1>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
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
              {isPastDate && <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">עבר</span>}
            </div>
            
            <button
              onClick={() => navigateDate('prev')}
              className={`p-2 rounded-full transition-colors ${
                !admin && isSameDay(selectedDate, new Date()) 
                  ? 'opacity-30 cursor-not-allowed' 
                  : 'hover:bg-muted'
              }`}
              disabled={!admin && isSameDay(selectedDate, new Date())}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">טוען...</p>
          </div>
        ) : hourGroups.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-2xl">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">אין רשומים {isPastDate ? 'ליום זה' : 'עדיין'}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {hourGroups.map(({ hour, registrations }) => {
              const isCurrentHour = isToday && hour === currentHour;
              
              return (
                <div
                  key={hour}
                  className={`rounded-2xl border-2 overflow-hidden transition-all ${
                    isCurrentHour 
                      ? 'border-golden bg-golden/5' 
                      : 'border-border bg-card'
                  }`}
                >
                  {/* Hour Header */}
                  <div className={`px-6 py-4 flex items-center justify-between ${
                    isCurrentHour ? 'bg-golden/10' : 'bg-muted/30'
                  }`}>
                    <div className="flex items-center gap-3">
                      <Clock className={`w-5 h-5 ${isCurrentHour ? 'text-golden' : 'text-muted-foreground'}`} />
                      <span className={`text-xl font-bold ${isCurrentHour ? 'text-golden' : 'text-foreground'}`}>
                        {formatHour(hour)}
                      </span>
                      {isCurrentHour && (
                        <span className="text-xs bg-golden/20 text-golden px-2 py-1 rounded-full font-medium">
                          עכשיו
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span className="font-semibold">{registrations.length}</span>
                    </div>
                  </div>
                  
                  {/* Registrations */}
                  <div className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {registrations.map((reg) => {
                        const isMyRegistration = reg.name === name && reg.phone === phone;
                        const canCancel = canCancelRegistration(reg);
                        
                        return (
                          <div
                            key={reg.id}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
                              isMyRegistration 
                                ? 'bg-primary/10 border-primary' 
                                : 'bg-background border-border'
                            }`}
                          >
                            <User className={`w-4 h-4 ${isMyRegistration ? 'text-primary' : 'text-muted-foreground'}`} />
                            <span className={`font-medium ${isMyRegistration ? 'text-primary' : 'text-foreground'}`}>
                              {reg.name}
                            </span>
                            {canCancel && !isPastDate && (
                              <button
                                onClick={() => handleCancelRegistration(reg.id, hour, reg.name)}
                                className="p-1 hover:bg-destructive/20 rounded-full transition-colors mr-1"
                                title="ביטול הרשמה"
                              >
                                <X className="w-4 h-4 text-destructive" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <ShareButton />
    </div>
  );
};

export default ViewRegistrations;
