import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Users, Clock, User, CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { format, addDays, subDays, isSameDay, startOfDay, isBefore } from "date-fns";
import { he } from "date-fns/locale";
import { useSnookerUserStore } from "@/stores/snookerUserStore";
import { toast } from "sonner";

interface SnookerViewRegistrationsProps {
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

const SnookerViewRegistrations = ({ onBack }: SnookerViewRegistrationsProps) => {
  const { name, phone } = useSnookerUserStore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [hourGroups, setHourGroups] = useState<HourGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const isToday = isSameDay(selectedDate, new Date());
  const currentHour = new Date().getHours();
  const isPastDate = isBefore(startOfDay(selectedDate), startOfDay(new Date()));

  const fetchRegistrations = async () => {
    const dayStart = startOfDay(selectedDate);
    const dayEnd = addDays(dayStart, 1);

    const { data, error } = await supabase
      .from('snooker_registrations')
      .select('id, name, phone, hour')
      .gte('registered_at', dayStart.toISOString())
      .lt('registered_at', dayEnd.toISOString())
      .order('hour', { ascending: true });

    if (error) {
      console.error('Error fetching snooker registrations:', error);
      setLoading(false);
      return;
    }

    // Group by hour - only include hours with registrations
    const groups: Record<number, Registration[]> = {};
    
    data?.forEach((reg) => {
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
      .channel('snooker-view-registrations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'snooker_registrations'
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

  const handleCancelRegistration = async (regId: string, regName: string) => {
    const { error } = await supabase
      .from('snooker_registrations')
      .delete()
      .eq('id', regId);

    if (error) {
      console.error('Error canceling snooker registration:', error);
      toast.error('שגיאה בביטול ההרשמה');
    } else {
      toast.success(`ההרשמה של ${regName} בוטלה`);
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
      setSelectedDate(addDays(selectedDate, -1));
    } else {
      setSelectedDate(addDays(selectedDate, 1));
    }
  };

  const canCancelRegistration = (reg: Registration) => {
    // User can delete their own registrations (same phone)
    return reg.phone === phone;
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0c2418 0%, #0a3d24 25%, #0d4a2c 50%, #0a3d24 75%, #0c2418 100%)' }}>
      {/* Felt texture overlay */}
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-emerald-700/30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-emerald-400/70 hover:text-emerald-300 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            חזרה
          </button>
          <h1 className="text-lg font-bold text-emerald-200">מי בשולחן?</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Date Selector */}
        <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4 mb-6 border border-emerald-700/30">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateDate('next')}
              className="p-2 rounded-full hover:bg-emerald-900/50 transition-colors text-emerald-400"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2 text-center">
              <CalendarDays className="w-5 h-5 text-emerald-500" />
              <span className="text-lg font-bold text-emerald-200">{getDateLabel(selectedDate)}</span>
              {!isToday && (
                <span className="text-sm text-emerald-400/70">({format(selectedDate, 'dd/MM')})</span>
              )}
              {isPastDate && <span className="text-xs bg-emerald-900/50 text-emerald-400/70 px-2 py-1 rounded-full">עבר</span>}
            </div>
            
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 rounded-full hover:bg-emerald-900/50 transition-colors text-emerald-400"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-emerald-400/70">טוען...</p>
          </div>
        ) : hourGroups.length === 0 ? (
          <div className="text-center py-12 bg-black/60 backdrop-blur-md rounded-2xl border border-emerald-700/30">
            <Users className="w-12 h-12 mx-auto mb-4 text-emerald-600/50" />
            <p className="text-emerald-400/70">אין רשומים {isPastDate ? 'ליום זה' : 'עדיין'}</p>
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
                      ? 'border-amber-500/50 bg-amber-900/10' 
                      : 'border-emerald-700/30 bg-black/60'
                  }`}
                >
                  {/* Hour Header */}
                  <div className={`px-6 py-4 flex items-center justify-between ${
                    isCurrentHour ? 'bg-amber-900/20' : 'bg-emerald-900/30'
                  }`}>
                    <div className="flex items-center gap-3">
                      <Clock className={`w-5 h-5 ${isCurrentHour ? 'text-amber-400' : 'text-emerald-500'}`} />
                      <span className={`text-xl font-bold ${isCurrentHour ? 'text-amber-300' : 'text-emerald-200'}`}>
                        {formatHour(hour)}
                      </span>
                      {isCurrentHour && (
                        <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full font-medium">
                          עכשיו
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400/70">
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
                        
                          const handleNameClick = () => {
                            if (isMyRegistration) return;
                            const message = `שלום, ראיתי שנרשמתם לסנוקר בשעה ${formatHour(hour)}. האם אפשר להצטרף?`;
                            const phoneNumber = reg.phone.startsWith('0') ? '972' + reg.phone.slice(1) : reg.phone;
                            window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
                          };

                          return (
                          <div
                            key={reg.id}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
                              isMyRegistration 
                                ? 'bg-emerald-600/20 border-emerald-500' 
                                : 'bg-black/40 border-emerald-700/30 cursor-pointer hover:bg-emerald-900/30 active:scale-95 transition-all'
                            }`}
                            onClick={handleNameClick}
                          >
                            <User className={`w-4 h-4 ${isMyRegistration ? 'text-emerald-400' : 'text-emerald-500/70'}`} />
                            <span className={`font-medium ${isMyRegistration ? 'text-emerald-300' : 'text-emerald-200'}`}>
                              {reg.name}
                            </span>
                            {canCancel && !isPastDate && (
                              <button
                                onClick={() => handleCancelRegistration(reg.id, reg.name)}
                                className="p-1 hover:bg-red-500/20 rounded-full transition-colors mr-1"
                                title="ביטול הרשמה"
                              >
                                <X className="w-4 h-4 text-red-400" />
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
    </div>
  );
};

export default SnookerViewRegistrations;
