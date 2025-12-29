import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Users, Clock, User } from "lucide-react";

interface ViewRegistrationsProps {
  onBack: () => void;
}

interface Registration {
  id: string;
  name: string;
  hour: number;
}

interface HourGroup {
  hour: number;
  registrations: Registration[];
}

const ViewRegistrations = ({ onBack }: ViewRegistrationsProps) => {
  const [hourGroups, setHourGroups] = useState<HourGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const currentHour = new Date().getHours();

  const fetchRegistrations = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data, error } = await supabase
      .from('registrations')
      .select('id, name, hour')
      .gte('registered_at', today.toISOString())
      .lt('registered_at', tomorrow.toISOString())
      .order('hour', { ascending: true });

    if (error) {
      console.error('Error fetching registrations:', error);
      setLoading(false);
      return;
    }

    // Group by hour
    const groups: Record<number, Registration[]> = {};
    
    data?.forEach(reg => {
      if (!groups[reg.hour]) {
        groups[reg.hour] = [];
      }
      groups[reg.hour].push(reg);
    });

    // Create ordered array from current hour onwards
    const hours = Array.from({ length: 24 - currentHour }, (_, i) => currentHour + i).filter(h => h <= 23);
    
    const result: HourGroup[] = hours.map(hour => ({
      hour,
      registrations: groups[hour] || []
    }));

    setHourGroups(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchRegistrations();

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
  }, []);

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
          <h1 className="text-lg font-bold text-foreground">מי פה היום?</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">טוען...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {hourGroups.map(({ hour, registrations }) => {
              const isCurrentHour = hour === currentHour;
              
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
                  {registrations.length > 0 ? (
                    <div className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {registrations.map((reg) => (
                          <div
                            key={reg.id}
                            className="flex items-center gap-2 bg-background px-4 py-2 rounded-full border border-border"
                          >
                            <User className="w-4 h-4 text-primary" />
                            <span className="font-medium text-foreground">{reg.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      אין רשומים עדיין
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default ViewRegistrations;
