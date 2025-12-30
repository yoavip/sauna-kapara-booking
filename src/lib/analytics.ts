import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export type AnalyticsEventType = 
  | 'page_view' 
  | 'registration' 
  | 'cancellation' 
  | 'share';

interface AnalyticsEvent {
  event_type: AnalyticsEventType;
  event_data?: Json;
  user_name?: string;
  user_phone?: string;
}

export const trackEvent = async (event: AnalyticsEvent) => {
  try {
    const { error } = await supabase
      .from('analytics')
      .insert([{
        event_type: event.event_type,
        event_data: event.event_data || {},
        user_name: event.user_name,
        user_phone: event.user_phone,
      }]);

    if (error) {
      console.error('Analytics error:', error);
    }
  } catch (err) {
    console.error('Analytics error:', err);
  }
};

export const trackPageView = (pageName: string, userName?: string, userPhone?: string) => {
  trackEvent({
    event_type: 'page_view',
    event_data: { page: pageName },
    user_name: userName,
    user_phone: userPhone,
  });
};

export const trackRegistration = (hour: number, date: string, userName: string, userPhone: string, additionalCount?: number) => {
  trackEvent({
    event_type: 'registration',
    event_data: { hour, date, additional_participants: additionalCount || 0 },
    user_name: userName,
    user_phone: userPhone,
  });
};

export const trackCancellation = (hour: number, date: string, userName: string, userPhone: string) => {
  trackEvent({
    event_type: 'cancellation',
    event_data: { hour, date },
    user_name: userName,
    user_phone: userPhone,
  });
};

export const trackShare = (method: string, userName?: string, userPhone?: string) => {
  trackEvent({
    event_type: 'share',
    event_data: { method },
    user_name: userName,
    user_phone: userPhone,
  });
};
