import { supabase } from "@/integrations/supabase/client";

// Cache for display names to avoid repeated DB calls
let displayNameCache: Map<string, string> = new Map();
let lastCacheUpdate = 0;
const CACHE_TTL = 60000; // 1 minute

// Refresh cache from database display_name column
export const refreshDisplayNameCache = async (): Promise<Map<string, string>> => {
  const { data: users } = await supabase
    .from('users')
    .select('name, last_name, display_name');
  
  if (!users) {
    return displayNameCache;
  }
  
  // Build cache using the DB-stored display_name
  displayNameCache = new Map();
  users.forEach(u => {
    const key = `${u.name}|${u.last_name || ''}`;
    displayNameCache.set(key, u.display_name || u.name);
  });
  
  lastCacheUpdate = Date.now();
  return displayNameCache;
};

// Get display name for a user (uses cached data)
export const getDisplayName = async (firstName: string, lastName: string | null): Promise<string> => {
  if (Date.now() - lastCacheUpdate > CACHE_TTL) {
    await refreshDisplayNameCache();
  }
  
  const key = `${firstName}|${lastName || ''}`;
  return displayNameCache.get(key) || firstName;
};

// Synchronous version using cached data
export const getDisplayNameSync = (firstName: string, lastName: string | null): string => {
  const key = `${firstName}|${lastName || ''}`;
  return displayNameCache.get(key) || firstName;
};

// Get display name for a participant by looking up their name
export const getDisplayNameForParticipant = async (participantName: string): Promise<string> => {
  if (Date.now() - lastCacheUpdate > CACHE_TTL) {
    await refreshDisplayNameCache();
  }
  
  // Look up user by name to get their display_name
  const { data: user } = await supabase
    .from('users')
    .select('name, last_name, display_name')
    .eq('name', participantName)
    .maybeSingle();
  
  if (user) {
    return user.display_name || participantName;
  }
  
  return participantName;
};

// Get display names for a list of participant names
export const getDisplayNamesForParticipants = async (
  participantNames: string[]
): Promise<string[]> => {
  await refreshDisplayNameCache();
  
  const uniqueNames = [...new Set(participantNames)];
  
  // Look up all users by name
  const { data: users } = await supabase
    .from('users')
    .select('name, last_name, display_name')
    .in('name', uniqueNames);
  
  // Create a map from name to display_name
  const nameToDisplayName = new Map<string, string>();
  users?.forEach(u => {
    if (!nameToDisplayName.has(u.name)) {
      nameToDisplayName.set(u.name, u.display_name || u.name);
    }
  });
  
  // Return display names in original order
  return participantNames.map(name => nameToDisplayName.get(name) || name);
};
