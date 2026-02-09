import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Input,
  SimpleGrid,
  Spinner,
  Center,
  Text,
  VStack,
  Select,
  useDisclosure,
  Button,
  HStack,
} from "@chakra-ui/react";
import { searchBooks, getRandomBooks } from "../services/bookApi";
import { getFavorites, toggleFavorite, isFavorite } from "../utils/Favorites";
import type { Book } from "../types/Book";
import BookCard from "../components/BookCard";
import BookModal from "../components/BookModal";
import useDebounce from "../hooks/useDebounce";
import useInfiniteScroll from "../hooks/useInfiniteScroll";

const RESULTS_PER_PAGE = 12;

const Books = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [books, setBooks] = useState<Book[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [discoverTitle, setDiscoverTitle] = useState("Explore");
  const [hasMore, setHasMore] = useState(true);
  const [favorites, setFavorites] = useState<string[]>(() => getFavorites());
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedBookKey, setSelectedBookKey] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, 600);

  // BUILD SEARCH TERM CORRECTLY (OpenLibrary is picky)
  const buildSearchTerm = () => {
    if (category === "all") return debouncedQuery;

    if (!debouncedQuery) return `subject:${category}`;

    // nonfiction must be forced filter
    if (category === "nonfiction")
      return `${debouncedQuery} subject:nonfiction`;

    return `${debouncedQuery} subject:${category}`;
  };

  // LOAD BOOKS
  const fetchBooks = useCallback(async () => {
    if (loading || !hasMore) return;
  
    setLoading(true);
  
    try {
      let data: any = { items: [] };
  
      // ===== 1. SEARCH MODE =====
      if (debouncedQuery.length >= 3) {
        data = await searchBooks(debouncedQuery, page);
  
        setBooks(prev => [...prev, ...(data.items ?? [])]);
  
        if ((data.items ?? []).length < RESULTS_PER_PAGE) {
          setHasMore(false);
        }
  
        return;
      }
  
      // ===== 2. CATEGORY / DISCOVER MODE =====
      // categories should NEVER use searchBooks
      data = await getRandomBooks(category, page);
  
      setDiscoverTitle(`Trending in ${data.subject.replace("_", " ")}`);
  
      setBooks(prev => [...prev, ...(data.items ?? [])]);
  
      if (!data.items?.length) setHasMore(false);
  
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, page, category, hasMore, loading]);
  

  // FAVORITES
  const handleFavoriteToggle = (key: string) => {
    const updated = toggleFavorite(key);
    setFavorites(updated);
  };

  const displayedBooks = showOnlyFavorites
    ? books.filter((b) => favorites.includes(b.key))
    : books;

  // RESET WHEN FILTERS CHANGE
  useEffect(() => {
    setBooks([]);
    setPage(1);
    setHasMore(true);
  }, [debouncedQuery, category]);

  // LOAD PAGE
  useEffect(() => {
    fetchBooks();
  }, [page, debouncedQuery, category]);

  // INFINITE SCROLL
  const loadMore = () => setPage((p) => p + 1);
  const bottomRef = useInfiniteScroll(loadMore, hasMore && !loading);

  return (
    <Box p={{ base: 4, md: 6 }}>
      <VStack spacing={4} align="stretch" mb={6}>
        <Input
          placeholder="Search books... (leave empty to explore)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All Categories</option>
          <option value="fantasy">Fantasy</option>
          <option value="romance">Romance</option>
          <option value="mystery">Mystery</option>
          <option value="science_fiction">Sci-Fi</option>
          <option value="history">History</option>
          <option value="horror">Horror</option>
          <option value="nonfiction">Non-Fiction</option>
        </Select>

        <HStack>
          <Button
            colorScheme={showOnlyFavorites ? "yellow" : "gray"}
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
          >
            ⭐ Favorites ({favorites.length})
          </Button>
        </HStack>
      </VStack>

      {!query && (
        <Text fontSize="xl" fontWeight="bold" mb={4}>
          {discoverTitle}
        </Text>
      )}

      <SimpleGrid
        columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 6 }}
        spacing={{ base: 3, sm: 4, md: 6 }}
      >
        {displayedBooks.map((book: any, index) => (
          <BookCard
            key={`${book.key}-${index}`}
            bookKey={book.key}
            title={book.title}
            author={
              book.author_name?.[0] ??
              book.authors?.[0]?.name ??
              "Unknown"
            }
            cover={book.cover_i ?? book.cover_id ?? null}
            year={book.first_publish_year ?? book.first_publish_date ?? "—"}
            isFavorite={isFavorite(book.key)}
            onFavoriteToggle={() => handleFavoriteToggle(book.key)}
            onClick={() => {
              setSelectedBookKey(book.key);
              onOpen();
            }}
          />
        ))}
      </SimpleGrid>

      {/* LOADER */}
      <Center ref={bottomRef} h="120px">
        {loading && <Spinner size="lg" />}
        {!hasMore && <Text color="gray.500">You've reached the end 📚</Text>}
      </Center>

      <BookModal bookKey={selectedBookKey} isOpen={isOpen} onClose={onClose} />
    </Box>
  );
};

export default Books;
