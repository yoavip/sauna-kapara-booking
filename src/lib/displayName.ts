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

// Get display name for a specific name (looks up user by name to get last_name)
export const getDisplayNameForParticipant = async (participantName: string): Promise<string> => {
  // Refresh cache if needed
  if (Date.now() - lastCacheUpdate > CACHE_TTL) {
    await refreshDisplayNameCache();
  }
  
  // Look up user by name to get their last_name
  const { data: users } = await supabase
    .from('users')
    .select('name, last_name')
    .eq('name', participantName);
  
  if (users && users.length > 0) {
    const user = users[0];
    const key = `${user.name}|${user.last_name || ''}`;
    return displayNameCache.get(key) || participantName;
  }
  
  return participantName;
};

// Get display names for a list of participant names
export const getDisplayNamesForParticipants = async (
  participantNames: string[]
): Promise<string[]> => {
  // Refresh cache
  await refreshDisplayNameCache();
  
  // Get unique names
  const uniqueNames = [...new Set(participantNames)];
  
  // Look up all users by name
  const { data: users } = await supabase
    .from('users')
    .select('name, last_name')
    .in('name', uniqueNames);
  
  // Create a map from name to user data
  const nameToUser = new Map<string, { name: string; last_name: string | null }>();
  users?.forEach(u => {
    // If multiple users have same first name, just use the first one found
    if (!nameToUser.has(u.name)) {
      nameToUser.set(u.name, u);
    }
  });
  
  // Build display names in original order
  return participantNames.map(name => {
    const user = nameToUser.get(name);
    if (user) {
      const key = `${user.name}|${user.last_name || ''}`;
      return displayNameCache.get(key) || name;
    }
    return name;
  });
};
