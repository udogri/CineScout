const FAVORITES_KEY = "book_favorites";

export const getFavorites = (): string[] => {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    // Deduplicate on read as a safety net
    return [...new Set<string>(parsed)];
  } catch {
    return [];
  }
};

export const toggleFavorite = (key: string): string[] => {
  const current = getFavorites();
  const exists = current.includes(key);
  const updated = exists
    ? current.filter((k) => k !== key)          // remove
    : [...new Set([...current, key])];           // add, deduped

  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  } catch {
    console.error("Failed to save favorites");
  }

  return updated;
};

export const isFavorite = (key: string): boolean => {
  return getFavorites().includes(key);
};