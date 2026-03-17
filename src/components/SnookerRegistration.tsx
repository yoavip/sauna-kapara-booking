import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSnookerUserStore } from "@/stores/snookerUserStore";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Zap, Users, Clock, CalendarDays, ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { format, addDays, isSameDay, startOfDay } from "date-fns";
import { he } from "date-fns/locale";
import AddSingleParticipantSheet from "./AddSingleParticipantSheet";
import { refreshDisplayNameCache, getDisplayName } from "@/lib/displayName";
import { trackPageView, trackRegistration, trackCancellation } from "@/lib/analytics";

interface SnookerRegistrationProps {
  onBack: () => void;
}

interface HourCount {
  hour: number;
  count: number;
  displayNames: string[];
  participants: { displayName: string; phone: string }[];
}

interface MyRegistration {
  id: string;
  hour: number;
}

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

const SnookerRegistration = ({ onBack }: SnookerRegistrationProps) => {
  const { name, lastName, phone, isRegistered: isUserRegistered } = useSnookerUserStore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [hourCounts, setHourCounts] = useState<HourCount[]>([]);
  const [isRegistering, setIsRegistering] = useState<number | null>(null);
  const [myRegistrations, setMyRegistrations] = useState<MyRegistration[]>([]);
  const [showAddParticipants, setShowAddParticipants] = useState(false);
  const [pendingHour, setPendingHour] = useState<number | null>(null);
  const [displayName, setDisplayName] = useState<string>(name);
  const isAdminUser = false; // Admin check not implemented for snooker yet
  
  // State for cancel confirmation dialog
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [pendingCancelHour, setPendingCancelHour] = useState<number | null>(null);
  const [pendingParticipants, setPendingParticipants] = useState<{id: string, name: string}[]>([]);
  const [pendingRegId, setPendingRegId] = useState<string | null>(null);

  const isToday = isSameDay(selectedDate, new Date());
  const currentHour = new Date().getHours();
  
  const getHours = () => {
    if (isToday) {
      return Array.from({ length: 24 - currentHour }, (_, i) => currentHour + i).filter(h => h <= 23);
    }
    return Array.from({ length: 24 }, (_, i) => i);
  };

  const isRegisteredForHour = (hour: number) => myRegistrations.some(r => r.hour === hour);
  const getMyRegistrationId = (hour: number) => myRegistrations.find(r => r.hour === hour)?.id;

  const fetchRegistrations = async () => {
    const dayStart = startOfDay(selectedDate);
    const dayEnd = addDays(dayStart, 1);
    const hours = getHours();

    const { data, error } = await supabase
      .from('snooker_registrations')
      .select('id, hour, name, phone')
      .gte('registered_at', dayStart.toISOString())
      .lt('registered_at', dayEnd.toISOString());

    if (error) {
      console.error('Error fetching registrations:', error);
      return;
    }

    await refreshDisplayNameCache();

    const phones = [...new Set(data?.map(r => r.phone) || [])];
    const { data: users } = await supabase
      .from('users')
      .select('name, last_name, phone')
      .in('phone', phones);

    const phoneToUser = new Map(users?.map(u => [u.phone, u]) || []);

    const counts: Record<number, number> = {};
    const registrationsByHour: Record<number, {name: string, phone: string}[]> = {};
    const myRegs: MyRegistration[] = [];
    
    data?.forEach(reg => {
      counts[reg.hour] = (counts[reg.hour] || 0) + 1;
      if (!registrationsByHour[reg.hour]) registrationsByHour[reg.hour] = [];
      registrationsByHour[reg.hour].push({ name: reg.name, phone: reg.phone });
      
      if (reg.name === name && reg.phone === phone) {
        myRegs.push({ id: reg.id, hour: reg.hour });
      }
    });

    const allPhones = [...new Set(data?.map(r => r.phone) || [])];
    const { data: allUsers } = await supabase
      .from('users')
      .select('name, phone, display_name')
      .in('phone', allPhones);
    
    const phoneNameToDisplayName = new Map<string, string>();
    allUsers?.forEach(u => {
      phoneNameToDisplayName.set(`${u.phone}|${u.name}`, u.display_name || u.name);
    });
    
    const resolvedHourCounts = hours.map((h) => {
      const regs = registrationsByHour[h] || [];
      const displayNames = regs.map(r => 
        phoneNameToDisplayName.get(`${r.phone}|${r.name}`) || r.name
      );
      return { hour: h, count: counts[h] || 0, displayNames };
    });

    setHourCounts(resolvedHourCounts);
    setMyRegistrations(myRegs);
  };

  useEffect(() => {
    trackPageView('snooker-registration', name, phone);
    getDisplayName(name, lastName).then(setDisplayName);
  }, [name, lastName]);

  useEffect(() => {
    fetchRegistrations();
  }, [selectedDate]);

  useEffect(() => {
    const channel = supabase
      .channel('snooker-registrations-changes')
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

  const handleRegister = async (hour: number, additionalNames: string[] = []) => {
    if (isRegisteredForHour(hour) && additionalNames.length === 0) {
      toast.error('כבר נרשמת לשעה זו');
      return;
    }

    setIsRegistering(hour);

    const registrationDate = startOfDay(selectedDate);
    registrationDate.setHours(hour);

    const registrations = [];
    
    if (!isRegisteredForHour(hour)) {
      registrations.push({
        name,
        phone,
        hour,
        registered_at: registrationDate.toISOString(),
      });
    }

    additionalNames.forEach(participantName => {
      registrations.push({
        name: participantName,
        phone: phone,
        hour,
        registered_at: registrationDate.toISOString(),
      });
    });

    if (registrations.length === 0) {
      setIsRegistering(null);
      return;
    }

    const { error } = await supabase
      .from('snooker_registrations')
      .insert(registrations);

    if (error) {
      console.error('Error registering:', error);
      toast.error('שגיאה בהרשמה, נסו שוב');
    } else {
      const dateLabel = isToday ? '' : ` ב-${format(selectedDate, 'dd/MM')}`;
      const count = registrations.length;
      toast.success(`${count > 1 ? `${count} אנשים נרשמו` : 'נרשמת'} בהצלחה לשעה ${hour}:00${dateLabel}! 🎱`);
      trackRegistration(hour, format(selectedDate, 'yyyy-MM-dd'), name, phone, lastName, additionalNames.length, additionalNames);
    }

    setIsRegistering(null);
  };

  const handleCancelRegistration = async (hour: number, deleteAll: boolean = false) => {
    const regId = getMyRegistrationId(hour);
    if (!regId) return;

    const dayStart = startOfDay(selectedDate);
    const dayEnd = addDays(dayStart, 1);
    
    const { data: otherParticipants } = await supabase
      .from('snooker_registrations')
      .select('id, name')
      .eq('phone', phone)
      .eq('hour', hour)
      .neq('name', name)
      .gte('registered_at', dayStart.toISOString())
      .lt('registered_at', dayEnd.toISOString());

    const hasOtherParticipants = otherParticipants && otherParticipants.length > 0;

    if (hasOtherParticipants) {
      setPendingCancelHour(hour);
      setPendingParticipants(otherParticipants);
      setPendingRegId(regId);
      setCancelDialogOpen(true);
      return;
    }

    await deleteRegistration(regId, hour);
  };

  const deleteRegistration = async (regId: string, hour: number, includeParticipants: boolean = false) => {
    if (includeParticipants && pendingParticipants.length > 0) {
      const allIds = [regId, ...pendingParticipants.map(p => p.id)];
      const { error } = await supabase
        .from('snooker_registrations')
        .delete()
        .in('id', allIds);

      if (error) {
        console.error('Error canceling registrations:', error);
        toast.error('שגיאה בביטול ההרשמות');
      } else {
        toast.success(`${allIds.length} הרשמות בוטלו`);
        trackCancellation(hour, format(selectedDate, 'yyyy-MM-dd'), name, phone, lastName);
      }
    } else {
      const { error } = await supabase
        .from('snooker_registrations')
        .delete()
        .eq('id', regId);

      if (error) {
        console.error('Error canceling registration:', error);
        toast.error('שגיאה בביטול ההרשמה');
      } else {
        toast.success('ההרשמה בוטלה');
        trackCancellation(hour, format(selectedDate, 'yyyy-MM-dd'), name, phone, lastName);
      }
    }
  };

  const handleCancelDialogConfirm = async (deleteAll: boolean) => {
    if (pendingRegId && pendingCancelHour !== null) {
      await deleteRegistration(pendingRegId, pendingCancelHour, deleteAll);
    }
    setCancelDialogOpen(false);
    setPendingCancelHour(null);
    setPendingParticipants([]);
    setPendingRegId(null);
  };

  const handleAddParticipantConfirm = (participantName: string) => {
    if (pendingHour !== null) {
      handleRegister(pendingHour, [participantName]);
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

  // If user not registered in the system
  if (!isUserRegistered()) {
    return (
      <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0c2418 0%, #0a3d24 25%, #0d4a2c 50%, #0a3d24 75%, #0c2418 100%)' }}>
        {/* Felt texture overlay */}
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
        <BilliardBalls />
        <SmokeEffect />
        
        <header className="sticky top-0 z-50 bg-emerald-950/95 backdrop-blur-md border-b border-emerald-700/30">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
              חזרה
            </button>
            <h1 className="text-lg font-bold text-emerald-300">🎱 סנוקר</h1>
            <div className="w-20" />
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 relative z-10 flex items-center justify-center min-h-[70vh]">
          <div className="bg-emerald-900/60 backdrop-blur-sm rounded-2xl p-8 text-center border border-emerald-600/30 max-w-md">
            <div className="text-6xl mb-4">🎱</div>
            <h2 className="text-2xl font-bold text-emerald-200 mb-4">יש להירשם קודם</h2>
            <p className="text-emerald-400/80 mb-6">
              כדי להירשם לסנוקר, יש קודם להירשם במערכת דרך דף הבית
            </p>
            <Button
              onClick={onBack}
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold"
            >
              חזרה לדף הבית
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0c2418 0%, #0a3d24 25%, #0d4a2c 50%, #0a3d24 75%, #0c2418 100%)' }}>
      {/* Felt texture overlay */}
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
      <BilliardBalls />
      <SmokeEffect />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-emerald-950/95 backdrop-blur-md border-b border-emerald-700/30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            חזרה
          </button>
          <h1 className="text-lg font-bold text-emerald-300 flex items-center gap-2">
            🎱 הרשמה לסנוקר
          </h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* User Info */}
        <div className="bg-emerald-900/60 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-emerald-600/30">
          <p className="text-emerald-500 text-sm">נרשם בשם:</p>
          <p className="text-xl font-bold text-emerald-200">{displayName}</p>
          <p className="text-sm text-emerald-600">{phone}</p>
        </div>

        {/* Date Selector */}
        <div className="bg-emerald-900/60 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-emerald-600/30">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateDate('next')}
              className="p-2 rounded-full hover:bg-emerald-800/50 transition-colors text-emerald-400"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2 text-center">
              <CalendarDays className="w-5 h-5 text-emerald-400" />
              <span className="text-lg font-bold text-emerald-200">{getDateLabel(selectedDate)}</span>
              {!isToday && (
                <span className="text-sm text-emerald-500">({format(selectedDate, 'dd/MM')})</span>
              )}
            </div>
            
            <button
              onClick={() => navigateDate('prev')}
              className={`p-2 rounded-full transition-colors text-emerald-400 ${
                isSameDay(selectedDate, new Date()) 
                  ? 'opacity-30 cursor-not-allowed' 
                  : 'hover:bg-emerald-800/50'
              }`}
              disabled={isSameDay(selectedDate, new Date())}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Register Now Button - only show for today, hide for admin */}
        {isToday && !isAdminUser && (
          <Button
            className="w-full mb-8 h-14 text-lg bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/50"
            onClick={handleRegisterNow}
            disabled={isRegistering === currentHour || isRegisteredForHour(currentHour)}
          >
            <Zap className="w-5 h-5 ml-2" />
            {isRegisteredForHour(currentHour) ? 'כבר רשום לעכשיו' : 'כאן עכשיו! 🎱'}
          </Button>
        )}

        {/* Hours List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-emerald-200 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            {isToday ? 'שעות היום' : `שעות ${getDateLabel(selectedDate)}`}
          </h2>
          
          {hourCounts.map(({ hour, count, displayNames: hourDisplayNames }) => {
            const isMyRegistration = isRegisteredForHour(hour);
            const isCurrentHour = isToday && hour === currentHour;
            
            return (
              <div
                key={hour}
                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all backdrop-blur-sm ${
                  isMyRegistration 
                    ? 'bg-emerald-700/40 border-emerald-400' 
                    : isCurrentHour 
                      ? 'bg-yellow-900/30 border-yellow-600/50'
                      : 'bg-emerald-900/40 border-emerald-700/30 hover:border-emerald-500/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`text-2xl font-bold ${isCurrentHour ? 'text-yellow-400' : 'text-emerald-200'}`}>
                    {formatHour(hour)}
                  </span>
                  {isCurrentHour && (
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full font-medium">
                      עכשיו
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="flex items-center gap-1 text-emerald-500 hover:text-emerald-300 transition-colors">
                        <Users className="w-4 h-4" />
                        <span className="font-medium">{count}</span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-3 bg-emerald-900 border-emerald-700" side="top">
                      <div className="space-y-1">
                        {count > 0 ? (
                          <>
                            <p className="font-semibold text-sm mb-2 text-emerald-200">רשומים לשעה {formatHour(hour)}:</p>
                            {hourDisplayNames.map((n, i) => (
                              <p key={i} className="text-sm text-emerald-400">{n}</p>
                            ))}
                          </>
                        ) : (
                          <p className="text-sm text-emerald-500">אין כאן אף אחד בינתיים</p>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  <button
                    onClick={() => openAddParticipants(hour)}
                    className="p-2 rounded-full border border-emerald-600/50 hover:border-emerald-400 hover:text-emerald-300 text-emerald-500 transition-colors"
                    title="הוסף משתתפים"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  
                  {isMyRegistration ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 border-red-500/50 text-red-400 hover:bg-red-900/30 hover:text-red-300"
                      onClick={() => handleCancelRegistration(hour)}
                    >
                      <X className="w-4 h-4" />
                      בטל
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="gap-1 bg-emerald-600 hover:bg-emerald-500 text-white"
                      onClick={() => handleRegister(hour)}
                      disabled={isRegistering === hour}
                    >
                      {isRegistering === hour ? (
                        "..."
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          הרשמה
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Add Participant Sheet */}
      <AddSingleParticipantSheet
        open={showAddParticipants}
        onOpenChange={setShowAddParticipants}
        onConfirm={handleAddParticipantConfirm}
        existingRegistrations={pendingHour !== null ? hourCounts.find(h => h.hour === pendingHour)?.displayNames || [] : []}
      />

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent className="bg-emerald-900 border-emerald-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-emerald-200">ביטול הרשמה</AlertDialogTitle>
            <AlertDialogDescription className="text-emerald-400">
              רשמת גם את {pendingParticipants.map(p => p.name).join(', ')} לשעה זו.
              <br />
              האם לבטל גם את ההרשמות שלהם?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogAction 
              onClick={() => handleCancelDialogConfirm(true)}
              className="bg-red-600 hover:bg-red-500"
            >
              בטל את כולם
            </AlertDialogAction>
            <AlertDialogAction 
              onClick={() => handleCancelDialogConfirm(false)}
              className="bg-emerald-600 hover:bg-emerald-500"
            >
              בטל רק אותי
            </AlertDialogAction>
            <AlertDialogCancel className="border-emerald-600 text-emerald-400 hover:bg-emerald-800">ביטול</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SnookerRegistration;
