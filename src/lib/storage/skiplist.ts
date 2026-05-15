/**
 * TON Shield — Skiplist (Trust/Block List)
 * =========================================
 * Stores user's trusted and blocked addresses/URLs in localStorage.
 * Integrated with Risk Engine results — users can add entries
 * directly from scan results.
 */

export type SkiplistAction = 'trust' | 'block';

export interface SkiplistEntry {
  id: string;
  type: 'address' | 'link' | 'jetton';
  target: string;         // Address or URL
  action: SkiplistAction; // trust = whitelist, block = blacklist
  label?: string;         // User-friendly label (e.g., "My friend's wallet")
  addedAt: string;        // ISO timestamp
}

const SKIPLIST_KEY = 'ton_shield_skiplist';

/**
 * Get the full skiplist for a user
 */
export function getSkiplist(userId: string): SkiplistEntry[] {
  if (typeof window === 'undefined') return [];

  try {
    const key = `${SKIPLIST_KEY}_${userId}`;
    const data = localStorage.getItem(key);
    if (!data) return [];
    return JSON.parse(data) as SkiplistEntry[];
  } catch {
    return [];
  }
}

/**
 * Add an entry to the skiplist
 */
export function addToSkiplist(
  userId: string,
  entry: Omit<SkiplistEntry, 'id' | 'addedAt'>
): SkiplistEntry {
  const list = getSkiplist(userId);

  // Remove existing entry for same target (update)
  const filtered = list.filter(
    (e) => !(e.target.toLowerCase() === entry.target.toLowerCase() && e.type === entry.type)
  );

  const newEntry: SkiplistEntry = {
    ...entry,
    id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    addedAt: new Date().toISOString(),
  };

  filtered.unshift(newEntry);

  const key = `${SKIPLIST_KEY}_${userId}`;
  localStorage.setItem(key, JSON.stringify(filtered));

  return newEntry;
}

/**
 * Remove an entry from the skiplist
 */
export function removeFromSkiplist(userId: string, entryId: string): void {
  const list = getSkiplist(userId);
  const filtered = list.filter((e) => e.id !== entryId);
  const key = `${SKIPLIST_KEY}_${userId}`;
  localStorage.setItem(key, JSON.stringify(filtered));
}

/**
 * Check if a target is in the skiplist
 */
export function checkSkiplist(
  userId: string,
  target: string,
  type: 'address' | 'link' | 'jetton'
): SkiplistEntry | null {
  const list = getSkiplist(userId);
  return (
    list.find(
      (e) => e.target.toLowerCase() === target.toLowerCase() && e.type === type
    ) || null
  );
}

/**
 * Get trusted entries only
 */
export function getTrustedList(userId: string): SkiplistEntry[] {
  return getSkiplist(userId).filter((e) => e.action === 'trust');
}

/**
 * Get blocked entries only
 */
export function getBlockedList(userId: string): SkiplistEntry[] {
  return getSkiplist(userId).filter((e) => e.action === 'block');
}

/**
 * Clear entire skiplist
 */
export function clearSkiplist(userId: string): void {
  if (typeof window === 'undefined') return;
  const key = `${SKIPLIST_KEY}_${userId}`;
  localStorage.removeItem(key);
}
