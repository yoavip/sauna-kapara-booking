import { supabase } from "@/integrations/supabase/client";

// Cache for display names to avoid repeated DB calls
let displayNameCache: Map<string, string> = new Map();
let lastCacheUpdate = 0;
const CACHE_TTL = 60000; // 1 minute

export const getDisplayName = async (firstName: string, lastName: string | null): Promise<string> => {
  // Refresh cache if needed
  if (Date.now() - lastCacheUpdate > CACHE_TTL) {
    await refreshDisplayNameCache();
  }
  
  const key = `${firstName}|${lastName || ''}`;
  return displayNameCache.get(key) || firstName;
};

export const refreshDisplayNameCache = async (): Promise<Map<string, string>> => {
  const { data: users } = await supabase
    .from('users')
    .select('name, last_name');
  
  if (!users) {
    return displayNameCache;
  }
  
  // Count first names
  const firstNameCounts: Record<string, number> = {};
  users.forEach(u => {
    firstNameCounts[u.name] = (firstNameCounts[u.name] || 0) + 1;
  });
  
  // Build display names
  displayNameCache = new Map();
  users.forEach(u => {
    const key = `${u.name}|${u.last_name || ''}`;
    if (firstNameCounts[u.name] > 1 && u.last_name) {
      // Multiple users with same first name - show first initial of last name
      displayNameCache.set(key, `${u.name} ${u.last_name.charAt(0)}`);
    } else {
      displayNameCache.set(key, u.name);
    }
  });
  
  lastCacheUpdate = Date.now();
  return displayNameCache;
};

// Synchronous version using cached data
export const getDisplayNameSync = (firstName: string, lastName: string | null): string => {
  const key = `${firstName}|${lastName || ''}`;
  return displayNameCache.get(key) || firstName;
};

// Get display names for a list of registrations
export const getDisplayNamesForRegistrations = async (
  registrations: { name: string; phone: string }[]
): Promise<Map<string, string>> => {
  // Get all phones to look up last names
  const phones = [...new Set(registrations.map(r => r.phone))];
  
  const { data: users } = await supabase
    .from('users')
    .select('name, last_name, phone')
    .in('phone', phones);
  
  const phoneToUser = new Map(users?.map(u => [u.phone, u]) || []);
  
  // Refresh the main cache
  await refreshDisplayNameCache();
  
  // Build display names for these specific registrations
  const result = new Map<string, string>();
  registrations.forEach(reg => {
    const user = phoneToUser.get(reg.phone);
    if (user) {
      result.set(`${reg.name}|${reg.phone}`, getDisplayNameSync(user.name, user.last_name));
    } else {
      // Fallback if user not found (e.g., additional participants)
      result.set(`${reg.name}|${reg.phone}`, reg.name);
    }
  });
  
  return result;
};
