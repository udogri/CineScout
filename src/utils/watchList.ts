const KEY = "movie_watchlist";

export const getWatchlist = (): number[] => {
  const data = localStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
};

export const toggleWatchlist = (id: number): number[] => {
  const list = getWatchlist();

  const updated = list.includes(id)
    ? list.filter((m) => m !== id)
    : [...list, id];

  localStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
};

export const isInWatchlist = (id: number): boolean => {
  return getWatchlist().includes(id);
};
