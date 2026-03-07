import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Center,
  Text,
  VStack,
  Select,
  useDisclosure,
  Button,
  HStack,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { searchBooks, getRandomBooks } from "../services/bookApi";
import { getFavorites, toggleFavorite, isFavorite } from "../utils/favorites";
import type { Book } from "../types/Book";
import BookCard from "../components/BookCard";
import BookModal from "../components/BookModal";
import useDebounce from "../hooks/useDebounce";
import useInfiniteScroll from "../hooks/useInfiniteScroll";

const RESULTS_PER_PAGE = 12;

const inputStyles = {
  bg: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "white",
  borderRadius: "none",
  fontSize: "sm",
  _placeholder: { color: "gray.600" },
  _focus: {
    bg: "rgba(212,175,55,0.04)",
    borderColor: "rgba(212,175,55,0.3)",
    boxShadow: "none",
  },
  _hover: { borderColor: "rgba(255,255,255,0.15)" },
};

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

  const fetchBooks = useCallback(async () => {
    if (loading || !hasMore) return;
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
      setDiscoverTitle(data.subject?.replace("_", " ") ?? "Explore");
      setBooks((prev) => [...prev, ...(data.items ?? [])]);
      if (!data.items?.length) setHasMore(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, page, category, hasMore, loading]);

  const handleFavoriteToggle = (key: string) => {
    const updated = toggleFavorite(key);
    setFavorites(updated);
  };

  const displayedBooks = showOnlyFavorites
    ? books.filter((b) => favorites.includes(b.key))
    : books;

  useEffect(() => {
    setBooks([]);
    setPage(1);
    setHasMore(true);
  }, [debouncedQuery, category]);

  useEffect(() => {
    fetchBooks();
  }, [page, debouncedQuery, category]);

  const loadMore = () => setPage((p) => p + 1);
  const bottomRef = useInfiniteScroll(loadMore, hasMore && !loading);

  return (
    <Box
      minH="100vh"
      bg="#08080A"
      p={{ base: 4, md: 8 }}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E\")",
      }}
    >
      <Box maxW="1400px" mx="auto">
        {/* Page header */}
        <HStack spacing={3} mb={8}>
          <Box w="3px" h="28px" bg="linear-gradient(to bottom, #D4AF37, #B8860B)" />
          <VStack align="start" spacing={0}>
            <Text
              fontSize="9px"
              letterSpacing="0.3em"
              textTransform="uppercase"
              color="gray.600"
            >
              {query ? "Search Results" : `Trending · ${discoverTitle}`}
            </Text>
            <Text
              fontFamily="'Georgia', serif"
              fontSize={{ base: "xl", md: "2xl" }}
              fontWeight="400"
              color="white"
            >
              Books
            </Text>
          </VStack>
        </HStack>

        {/* Filters */}
        <HStack
          spacing={3}
          mb={8}
          flexWrap="wrap"
          p={4}
          bg="rgba(255,255,255,0.02)"
          border="1px solid rgba(255,255,255,0.05)"
        >
          <InputGroup maxW="300px" flex={1}>
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

          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            maxW="200px"
            flex={1}
            {...inputStyles}
          >
            <option value="all" style={{ background: "#0E0E10" }}>All Categories</option>
            <option value="fantasy" style={{ background: "#0E0E10" }}>Fantasy</option>
            <option value="romance" style={{ background: "#0E0E10" }}>Romance</option>
            <option value="mystery" style={{ background: "#0E0E10" }}>Mystery</option>
            <option value="science_fiction" style={{ background: "#0E0E10" }}>Sci-Fi</option>
            <option value="history" style={{ background: "#0E0E10" }}>History</option>
            <option value="horror" style={{ background: "#0E0E10" }}>Horror</option>
            <option value="nonfiction" style={{ background: "#0E0E10" }}>Non-Fiction</option>
          </Select>

          <Button
            size="sm"
            px={5}
            borderRadius="none"
            variant="outline"
            borderColor={showOnlyFavorites ? "rgba(212,175,55,0.5)" : "rgba(255,255,255,0.08)"}
            color={showOnlyFavorites ? "#D4AF37" : "gray.500"}
            bg={showOnlyFavorites ? "rgba(212,175,55,0.08)" : "transparent"}
            fontWeight="400"
            fontSize="xs"
            letterSpacing="0.1em"
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            _hover={{ borderColor: "rgba(212,175,55,0.4)", color: "#D4AF37" }}
          >
            ★ Favorites ({favorites.length})
          </Button>
        </HStack>

        {/* Grid */}
        <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }} spacing={4}>
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

        {/* Loader / end */}
        <Center ref={bottomRef} h="120px">
          {loading && (
            <Box display="flex" gap="6px">
              {[0, 1, 2].map((i) => (
                <Box
                  key={i}
                  w="3px"
                  h="20px"
                  bg="#D4AF37"
                  style={{
                    animation: "cinePulse 1.2s ease-in-out infinite",
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </Box>
          )}
          {!hasMore && !loading && (
            <Text
              fontSize="9px"
              letterSpacing="0.3em"
              textTransform="uppercase"
              color="gray.700"
            >
              End of collection
            </Text>
          )}
        </Center>
      </Box>

      <BookModal bookKey={selectedBookKey} isOpen={isOpen} onClose={onClose} />
    </Box>
  );
};

export default Books;