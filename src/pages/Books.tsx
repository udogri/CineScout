import { useEffect, useRef, useState, useCallback } from "react";
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Center,
  Text,
  VStack,
  useDisclosure,
  Button,
  HStack,
  Select,
} from "@chakra-ui/react";
import { SearchIcon, CloseIcon } from "@chakra-ui/icons";
import { searchBooks, getRandomBooks } from "../services/bookApi";
import { getFavorites, toggleFavorite, isFavorite } from "../utils/favorites";
import type { Book } from "../types/Book";
import BookCard from "../components/BookCard";
import BookModal from "../components/BookModal";
import useDebounce from "../hooks/useDebounce";
import useInfiniteScroll from "../hooks/useInfiniteScroll";

// ── Constants ──────────────────────────────────────────────────────────────

const RESULTS_PER_PAGE = 12;

const GENRE_PILLS = [
  { label: "All",         value: "all" },
  { label: "Fantasy",     value: "fantasy" },
  { label: "Romance",     value: "romance" },
  { label: "Mystery",     value: "mystery" },
  { label: "Sci-Fi",      value: "science_fiction" },
  { label: "History",     value: "history" },
  { label: "Horror",      value: "horror" },
  { label: "Non-Fiction", value: "nonfiction" },
  { label: "Biography",   value: "biography" },
  { label: "Philosophy",  value: "philosophy" },
  { label: "Psychology",  value: "psychology" },
  { label: "Science",     value: "science" },
  { label: "Travel",      value: "travel" },
  { label: "Art",         value: "art" },
];

const SORT_OPTIONS = [
  { label: "Default",      value: "default" },
  { label: "Title A–Z",    value: "title_asc" },
  { label: "Title Z–A",    value: "title_desc" },
  { label: "Newest first", value: "newest" },
  { label: "Oldest first", value: "oldest" },
];

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E\")";

// ── Helpers ────────────────────────────────────────────────────────────────

const sortBooks = (books: Book[], sort: string): Book[] => {
  const copy = [...books];
  switch (sort) {
    case "title_asc":  return copy.sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""));
    case "title_desc": return copy.sort((a, b) => (b.title ?? "").localeCompare(a.title ?? ""));
    case "newest":     return copy.sort((a, b) => Number(b.first_publish_year ?? 0) - Number(a.first_publish_year ?? 0));
    case "oldest":     return copy.sort((a, b) => Number(a.first_publish_year ?? 0) - Number(b.first_publish_year ?? 0));
    default:           return copy;
  }
};

// Fetch a single work from Open Library and normalise it into a Book shape
const fetchBookByKey = async (workKey: string): Promise<Book | null> => {
  try {
    const res = await fetch(`https://openlibrary.org${workKey}.json`);
    if (!res.ok) return null;
    const data = await res.json();

    // Resolve author name
    let authorName = "Unknown";
    if (data.authors?.[0]?.author?.key) {
      try {
        const aRes = await fetch(`https://openlibrary.org${data.authors[0].author.key}.json`);
        if (aRes.ok) {
          const aData = await aRes.json();
          authorName = aData.name ?? "Unknown";
        }
      } catch { /* ignore */ }
    }

    return {
      key: workKey,
      title: data.title ?? "Unknown Title",
      author_name: [authorName],
      cover_i: data.covers?.[0] ?? null,
      first_publish_year: data.first_publish_date
        ? parseInt(data.first_publish_date)
        : undefined,
    } as Book;
  } catch {
    return null;
  }
};

const inputStyles = {
  bg: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "white",
  borderRadius: "none",
  fontSize: "sm",
  _placeholder: { color: "gray.600" },
  _focus: { bg: "rgba(212,175,55,0.04)", borderColor: "rgba(212,175,55,0.3)", boxShadow: "none" },
  _hover: { borderColor: "rgba(255,255,255,0.15)" },
};

// ── Component ──────────────────────────────────────────────────────────────

const Books = () => {
  const [query, setQuery]                         = useState("");
  const [category, setCategory]                   = useState("all");
  const [sort, setSort]                           = useState("default");
  const [books, setBooks]                         = useState<Book[]>([]);
  const [page, setPage]                           = useState(1);
  const [loading, setLoading]                     = useState(false);
  const [discoverTitle, setDiscoverTitle]         = useState("Explore");
  const [hasMore, setHasMore]                     = useState(true);
  const [favorites, setFavorites]                 = useState<string[]>(() => getFavorites());
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [favoriteBooks, setFavoriteBooks]         = useState<Book[]>([]);
  const [favLoading, setFavLoading]               = useState(false);

  // ── Use a ref to track in-flight fetches — removing `loading` from deps ──
  const isFetchingRef = useRef(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedBookKey, setSelectedBookKey] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, 600);

  const activeFilterCount = [
    category !== "all",
    sort !== "default",
    showOnlyFavorites,
  ].filter(Boolean).length;

  // ── Fetch browse/search books ─────────────────────────────────────────────
  // NOTE: `loading` intentionally excluded from deps — tracked via ref instead
  const fetchBooks = useCallback(async () => {
    if (isFetchingRef.current || !hasMore) return;
    isFetchingRef.current = true;
    setLoading(true);
    try {
      let data: any = { items: [] };
      if (debouncedQuery.length >= 3) {
        data = await searchBooks(debouncedQuery, page);
        setBooks((prev) => [...prev, ...(data.items ?? [])]);
        if ((data.items ?? []).length < RESULTS_PER_PAGE) setHasMore(false);
        return;
      }
      data = await getRandomBooks(category, page);
      setDiscoverTitle(data.subject?.replace(/_/g, " ") ?? "Explore");
      setBooks((prev) => [...prev, ...(data.items ?? [])]);
      if (!data.items?.length) setHasMore(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [debouncedQuery, page, category, hasMore]); // `loading` removed from deps

  // ── Fetch favorite books from Open Library by their saved work keys ───────
  useEffect(() => {
    if (!showOnlyFavorites) return;
    if (favorites.length === 0) {
      setFavoriteBooks([]);
      return;
    }

    const load = async () => {
      setFavLoading(true);
      try {
        const results = await Promise.allSettled(favorites.map(fetchBookByKey));
        const fetched = results
          .filter((r): r is PromiseFulfilledResult<Book> => r.status === "fulfilled" && r.value !== null)
          .map((r) => r.value);
        setFavoriteBooks(fetched);
      } finally {
        setFavLoading(false);
      }
    };

    load();
  }, [showOnlyFavorites, favorites]);

  // ── Reset on filter/query change ──────────────────────────────────────────
  useEffect(() => {
    setBooks([]);
    setPage(1);
    setHasMore(true);
  }, [debouncedQuery, category]);

  useEffect(() => {
    fetchBooks();
  }, [page, debouncedQuery, category]);

  // ── Derived list ──────────────────────────────────────────────────────────
  const clearAllFilters = () => {
    setCategory("all");
    setSort("default");
    setShowOnlyFavorites(false);
    setQuery("");
  };

  const handleFavoriteToggle = (key: string) => {
    setFavorites(toggleFavorite(key));
  };

  const baseBooks   = showOnlyFavorites ? favoriteBooks : books;
  const isLoadingNow = showOnlyFavorites ? favLoading : loading && books.length === 0;
  const displayedBooks = sortBooks(baseBooks, sort);

  // ── Infinite scroll (only in browse mode) ────────────────────────────────
  const loadMore = () => { if (!showOnlyFavorites) setPage((p) => p + 1); };
  const bottomRef = useInfiniteScroll(loadMore, !showOnlyFavorites && hasMore && !loading);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box minH="100vh" bg="#08080A" p={{ base: 4, md: 8 }} style={{ backgroundImage: GRAIN }}>
      <Box maxW="1400px" mx="auto">

        {/* ── Page header ── */}
        <HStack spacing={3} mb={8}>
          <Box w="3px" h="28px" bg="linear-gradient(to bottom, #D4AF37, #B8860B)" />
          <VStack align="start" spacing={0}>
            <Text fontSize="9px" letterSpacing="0.3em" textTransform="uppercase" color="gray.600">
              {showOnlyFavorites ? "Your Saved Books" : query ? "Search Results" : `Trending · ${discoverTitle}`}
            </Text>
            <Text fontFamily="'Georgia', serif" fontSize={{ base: "xl", md: "2xl" }} fontWeight="400" color="white">
              Books
            </Text>
          </VStack>
          {activeFilterCount > 0 && (
            <Box ml="auto" px={3} py={1} border="1px solid rgba(212,175,55,0.2)" bg="rgba(212,175,55,0.04)">
              <Text fontSize="10px" letterSpacing="0.2em" textTransform="uppercase" color="rgba(212,175,55,0.6)">
                {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active
              </Text>
            </Box>
          )}
        </HStack>

        {/* ── Search + sort row ── */}
        <HStack spacing={3} mb={4} p={4} bg="rgba(255,255,255,0.02)" border="1px solid rgba(255,255,255,0.05)" flexWrap="wrap">
          <InputGroup flex={1} minW="180px" maxW="340px">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.600" boxSize={3} />
            </InputLeftElement>
            <Input
              placeholder="Search books…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              {...inputStyles}
            />
          </InputGroup>

          <HStack spacing={2} ml="auto" flexShrink={0}>
            <Text fontSize="9px" letterSpacing="0.2em" textTransform="uppercase" color="gray.600" whiteSpace="nowrap">
              Sort by
            </Text>
            <Select value={sort} onChange={(e) => setSort(e.target.value)} w="160px" size="sm" {...inputStyles}>
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} style={{ background: "#0E0E10" }}>{o.label}</option>
              ))}
            </Select>
          </HStack>

          <Button
            size="sm" px={4} flexShrink={0} borderRadius="none" variant="outline"
            borderColor={showOnlyFavorites ? "rgba(212,175,55,0.5)" : "rgba(255,255,255,0.08)"}
            color={showOnlyFavorites ? "#D4AF37" : "gray.500"}
            bg={showOnlyFavorites ? "rgba(212,175,55,0.08)" : "transparent"}
            fontWeight="400" fontSize="xs" letterSpacing="0.1em"
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            _hover={{ borderColor: "rgba(212,175,55,0.4)", color: "#D4AF37" }}
          >
            ★ Favorites ({favorites.length})
          </Button>

          {activeFilterCount > 0 && (
            <Button
              size="sm" px={3} flexShrink={0} borderRadius="none" variant="ghost"
              color="gray.600" fontSize="xs" letterSpacing="0.1em"
              leftIcon={<CloseIcon boxSize="8px" />}
              onClick={clearAllFilters} _hover={{ color: "white" }}
            >
              Clear
            </Button>
          )}
        </HStack>

        {/* ── Genre pill bar (hidden in favorites mode) ── */}
        {!showOnlyFavorites && (
          <Box
            mb={8} overflowX="auto" pb={2}
            css={{
              "&::-webkit-scrollbar": { height: "2px" },
              "&::-webkit-scrollbar-track": { background: "transparent" },
              "&::-webkit-scrollbar-thumb": { background: "rgba(212,175,55,0.3)", borderRadius: "2px" },
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(212,175,55,0.3) transparent",
            }}
          >
            <HStack spacing={2} w="max-content">
              {GENRE_PILLS.map((g) => {
                const isActive = category === g.value;
                return (
                  <Box
                    key={g.value} as="button" onClick={() => setCategory(g.value)}
                    px={4} py={2} border="1px solid" flexShrink={0}
                    borderColor={isActive ? "rgba(212,175,55,0.6)" : "rgba(255,255,255,0.07)"}
                    bg={isActive ? "rgba(212,175,55,0.1)" : "rgba(255,255,255,0.02)"}
                    transition="all 0.2s"
                    _hover={{ borderColor: "rgba(212,175,55,0.4)", bg: "rgba(212,175,55,0.06)" }}
                  >
                    <Text
                      fontSize="10px" letterSpacing="0.15em" textTransform="uppercase"
                      color={isActive ? "#D4AF37" : "gray.500"}
                      fontWeight={isActive ? "700" : "400"}
                    >
                      {g.label}
                    </Text>
                  </Box>
                );
              })}
            </HStack>
          </Box>
        )}

        {/* ── Grid ── */}
        {isLoadingNow ? (
          <Center h="60vh">
            <Box display="flex" gap="6px">
              {[0, 1, 2, 3, 4].map((i) => (
                <Box key={i} w="3px" h="28px" bg="#D4AF37"
                  style={{ animation: "cinePulse 1.2s ease-in-out infinite", animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </Box>
          </Center>
        ) : displayedBooks.length === 0 ? (
          <Center h="60vh">
            <VStack spacing={4}>
              <Box w="60px" h="60px" border="1px solid rgba(212,175,55,0.2)" display="flex" alignItems="center" justifyContent="center">
                <Text fontSize="xl" color="rgba(212,175,55,0.4)">◈</Text>
              </Box>
              <Text fontSize="10px" letterSpacing="0.3em" textTransform="uppercase" color="gray.600">
                {showOnlyFavorites ? "No favorites saved yet" : "No books found"}
              </Text>
              {activeFilterCount > 0 && (
                <Button size="sm" variant="ghost" color="gray.600" fontSize="xs" letterSpacing="0.1em"
                  onClick={clearAllFilters} _hover={{ color: "#D4AF37" }}>
                  Clear filters
                </Button>
              )}
            </VStack>
          </Center>
        ) : (
          <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }} spacing={4}>
            {displayedBooks.map((book: any, index) => (
              <BookCard
                key={`${book.key}-${index}`}
                bookKey={book.key}
                title={book.title}
                author={book.author_name?.[0] ?? book.authors?.[0]?.name ?? "Unknown"}
                cover={book.cover_i ?? book.cover_id ?? null}
                year={book.first_publish_year ?? book.first_publish_date ?? "—"}
                isFavorite={isFavorite(book.key)}
                onFavoriteToggle={() => handleFavoriteToggle(book.key)}
                onClick={() => { setSelectedBookKey(book.key); onOpen(); }}
              />
            ))}
          </SimpleGrid>
        )}

        {/* ── Loader / end (browse mode only) ── */}
        {!showOnlyFavorites && (
          <Center ref={bottomRef} h="120px">
            {loading && books.length > 0 && (
              <Box display="flex" gap="6px">
                {[0, 1, 2].map((i) => (
                  <Box key={i} w="3px" h="20px" bg="#D4AF37"
                    style={{ animation: "cinePulse 1.2s ease-in-out infinite", animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </Box>
            )}
            {!hasMore && !loading && displayedBooks.length > 0 && (
              <Text fontSize="9px" letterSpacing="0.3em" textTransform="uppercase" color="gray.700">
                End of collection
              </Text>
            )}
          </Center>
        )}
      </Box>

      <BookModal bookKey={selectedBookKey} isOpen={isOpen} onClose={onClose} />
    </Box>
  );
};

export default Books;