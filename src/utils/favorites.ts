const STORAGE_KEY = "book_favorites";

export const getFavorites = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

export const isFavorite = (key: string) => {
  return getFavorites().includes(key);
};

export const toggleFavorite = (key: string) => {
  const favorites = getFavorites();

  let updated: string[];

  if (favorites.includes(key)) {
    updated = favorites.filter((k) => k !== key);
  } else {
    updated = [...favorites, key];
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};
