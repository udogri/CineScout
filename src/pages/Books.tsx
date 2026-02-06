import { useEffect, useState } from "react";
import {
  Box,
  Input,
  SimpleGrid,
  Spinner,
  Center,
  HStack,
  Button,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { searchBooks } from "../services/bookApi";
import type { Book } from "../types/Book";
import BookCard from "../components/BookCard";
import BookModal from "../components/BookModal";
import useDebounce from "../hooks/useDebounce";

const RESULTS_PER_PAGE = 12;

const Books = () => {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedBookKey, setSelectedBookKey] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, 700);

  useEffect(() => {
    const fetchBooks = async () => {
      if (!debouncedQuery || debouncedQuery.length < 3) {
        setBooks([]);
        setTotalPages(1);
        return;
      }

      setLoading(true);

      try {
        const data = await searchBooks(debouncedQuery, page);

        setBooks(data.items);

        const pages = Math.ceil(data.totalItems / RESULTS_PER_PAGE);
        setTotalPages(Math.max(pages, 1));
      } catch (err) {
        console.error(err);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [debouncedQuery, page]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);

  const noResults = !loading && debouncedQuery.length >= 3 && books.length === 0;

  return (
    <Box p={{ base: 4, md: 6 }}>
      <VStack spacing={4} align="stretch" mb={6}>
        <Input
          placeholder="Search books (min 3 letters)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </VStack>

      {loading ? (
        <Center h="40vh">
          <Spinner size="xl" />
        </Center>
      ) : noResults ? (
        <Center h="40vh">
          <Text>No books found 📚</Text>
        </Center>
      ) : (
        <SimpleGrid
          columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
          spacing={{ base: 4, sm: 6 }}
        >
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onClick={() => {
                setSelectedBookKey(book.id);
                onOpen();
              }}
            />
          ))}
        </SimpleGrid>
      )}

      {debouncedQuery.length >= 3 && totalPages > 1 && (
        <HStack mt={8} justify="center" spacing={6} flexWrap="wrap">
          <Button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            isDisabled={page === 1}
          >
            Prev
          </Button>

          <Text fontWeight="bold">
            Page {page} / {totalPages}
          </Text>

          <Button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            isDisabled={page === totalPages}
          >
            Next
          </Button>
        </HStack>
      )}

      <BookModal
        bookKey={selectedBookKey}
        isOpen={isOpen}
        onClose={onClose}
      />
    </Box>
  );
};

export default Books;
