import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, addDays } from "date-fns";

const ThermometerBackground = () => {
  const [temperature, setTemperature] = useState(22);
  const [targetTemp, setTargetTemp] = useState(22);
  const [lastActiveTime, setLastActiveTime] = useState<Date | null>(null);

  const fetchCurrentRegistrations = async () => {
    const now = new Date();
    const currentHour = now.getHours();
    const dayStart = startOfDay(now);
    const dayEnd = addDays(dayStart, 1);

    const { data, error } = await supabase
      .from('registrations')
      .select('hour')
      .gte('registered_at', dayStart.toISOString())
      .lt('registered_at', dayEnd.toISOString())
      .eq('hour', currentHour);

    if (error) {
      console.error('Error fetching registrations:', error);
      return;
    }

    const count = data?.length || 0;
    
    if (count > 0) {
      setTargetTemp(80);
      setLastActiveTime(new Date());
    } else if (lastActiveTime) {
      // Calculate how long since last activity
      const timeSinceActive = (now.getTime() - lastActiveTime.getTime()) / 1000 / 60; // in minutes
      const cooldownMinutes = 60; // 1 hour to cool down
      const cooledTemp = Math.max(22, 80 - (timeSinceActive / cooldownMinutes) * (80 - 22));
      setTargetTemp(cooledTemp);
    } else {
      setTargetTemp(22);
    }
  };

  useEffect(() => {
    fetchCurrentRegistrations();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('thermometer-registrations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'registrations'
        },
        () => {
          fetchCurrentRegistrations();
        }
      )
      .subscribe();

    // Update temperature every second
    const interval = setInterval(() => {
      fetchCurrentRegistrations();
    }, 10000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [lastActiveTime]);

  // Animate temperature towards target
  useEffect(() => {
    const animationInterval = setInterval(() => {
      setTemperature(prev => {
        const diff = targetTemp - prev;
        const step = targetTemp > prev ? 0.5 : -0.1; // Fast heat up (2 min), slow cool down (1 hour)
        
        if (Math.abs(diff) < 0.5) return targetTemp;
        return prev + step;
      });
    }, 100);

    return () => clearInterval(animationInterval);
  }, [targetTemp]);

  // Calculate gradient based on temperature
  const getGradientColor = () => {
    const ratio = (temperature - 22) / (80 - 22);
    // From blue (cold) to orange/red (hot)
    const hue = 200 - (ratio * 180); // 200 (blue) to 20 (orange)
    const saturation = 30 + (ratio * 40); // More saturated when hot
    const lightness = 90 - (ratio * 20); // Darker when hot
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  const gradientOpacity = Math.min(0.6, (temperature - 22) / (80 - 22) * 0.6);

  return (
    <div className="fixed inset-x-0 top-0 h-48 pointer-events-none z-0 overflow-hidden">
      {/* Temperature gradient */}
      <div 
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: `linear-gradient(180deg, ${getGradientColor()} 0%, transparent 100%)`,
          opacity: 0.3 + gradientOpacity,
        }}
      />
      
      {/* Heat waves effect when hot */}
      {temperature > 40 && (
        <>
          <div 
            className="absolute inset-0 animate-steam opacity-20"
            style={{
              background: `radial-gradient(ellipse at 30% 0%, hsl(${20 + Math.random() * 20}, 70%, 50%) 0%, transparent 50%)`,
            }}
          />
          <div 
            className="absolute inset-0 animate-steam opacity-15"
            style={{
              background: `radial-gradient(ellipse at 70% 0%, hsl(${30 + Math.random() * 20}, 60%, 55%) 0%, transparent 50%)`,
              animationDelay: '1s',
            }}
          />
        </>
      )}

      {/* Temperature indicator */}
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
        <div 
          className="w-3 h-3 rounded-full transition-colors duration-500"
          style={{
            backgroundColor: temperature < 40 
              ? 'hsl(200, 50%, 50%)' 
              : temperature < 60 
                ? 'hsl(45, 70%, 50%)' 
                : 'hsl(15, 80%, 50%)',
          }}
        />
        <span className="text-sm font-medium text-foreground">
          {Math.round(temperature)}°C
        </span>
      </div>
    </div>
  );
};

export default ThermometerBackground;
