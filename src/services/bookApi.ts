const BASE_URL = "https://openlibrary.org/search.json";

// simple cache (prevents repeat requests while paging back & forth)
const cache = new Map<string, any>();

export const searchBooks = async (query: string, page = 1) => {
  if (!query || query.length < 3) {
    return { items: [], totalItems: 0 };
  }

  const key = `${query}-${page}`;
  if (cache.has(key)) return cache.get(key);

  const res = await fetch(
    `${BASE_URL}?q=${encodeURIComponent(query)}&page=${page}`
  );

  if (!res.ok) throw new Error("Failed to fetch books");

  const data = await res.json();

  // normalize data → match your existing UI
  const normalized = {
    totalItems: data.numFound ?? 0,
    items: (data.docs || []).map((book: any) => ({
      id: book.key, // unique id
      title: book.title,
      authors: book.author_name ?? ["Unknown author"],
      year: book.first_publish_year ?? "—",
      cover: book.cover_i
        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
        : null,
    })),
  };

  cache.set(key, normalized);
  return normalized;
};
