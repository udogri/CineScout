import { useEffect, useState, useRef, useCallback } from "react";
import {
  Box,
  SimpleGrid,
  Image,
  Text,
  Stack,
  Spinner,
  Center,
  Button,
  Select,
  IconButton,
  VStack,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  useDisclosure,
} from "@chakra-ui/react";
import { StarIcon, SearchIcon } from "@chakra-ui/icons";
import MovieModal from "../components/MovieModal";
import useDebounce from "../hooks/useDebounce";
import {
  getPopularMovies,
  searchMovies,
  getMoviesByCategory,
} from "../services/movieApi";
import { getPosterUrl } from "../utils/image";
import { toggleWatchlist, getWatchlist, isInWatchlist } from "../utils/watchList";
import type { Movie } from "../types/Movie";

const CATEGORIES = [
  { label: "All", value: "" },
  { label: "Action", value: "action" },
  { label: "Comedy", value: "comedy" },
  { label: "Drama", value: "drama" },
  { label: "Horror", value: "horror" },
  { label: "Sci-Fi", value: "science fiction" },
];

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

const Movies = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const pageRef = useRef(1);
  const totalPagesRef = useRef(1);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [watchlist, setWatchlist] = useState<number[]>(() => getWatchlist());
  const [showOnlyWatchlist, setShowOnlyWatchlist] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<number | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const debouncedQuery = useDebounce(query, 500);
  const containerRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);

  const openMovie = (id: number) => {
    setSelectedMovie(id);
    onOpen();
  };

  const loadMovies = useCallback(
    async (reset = false) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      setLoading(true);
      try {
        const currentPage = reset ? 1 : pageRef.current;
        let data: { results: Movie[]; total_pages: number } = { results: [], total_pages: 1 };
        if (debouncedQuery.length >= 3) {
          data = await searchMovies(debouncedQuery, currentPage);
        } else if (category) {
          data = await getMoviesByCategory(category, currentPage);
        } else {
          data = await getPopularMovies(currentPage);
        }
        setMovies((prev) => (reset ? data.results : [...prev, ...data.results]));
        totalPagesRef.current = data.total_pages;
        pageRef.current = currentPage + 1;
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    },
    [debouncedQuery, category]
  );

  useEffect(() => {
    pageRef.current = 1;
    totalPagesRef.current = 1;
    loadMovies(true);
  }, [debouncedQuery, category]);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || loading) return;
      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.body.offsetHeight - 800;
      if (scrollPosition >= threshold && pageRef.current <= totalPagesRef.current) {
        loadMovies();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMovies, loading]);

  const toggleMovieWatchlist = (movieId: number) => {
    const updated = toggleWatchlist(movieId);
    setWatchlist(updated);
  };

  const displayedMovies = showOnlyWatchlist
    ? movies.filter((m) => watchlist.includes(m.id))
    : movies;

  return (
    <Box
      minH="100vh"
      bg="#08080A"
      p={{ base: 4, md: 8 }}
      ref={containerRef}
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
              Browse
            </Text>
            <Text
              fontFamily="'Georgia', serif"
              fontSize={{ base: "xl", md: "2xl" }}
              fontWeight="400"
              color="white"
            >
              Movies
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
              placeholder="Search movies…"
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
            {CATEGORIES.map((cat) => (
              <option
                key={cat.value}
                value={cat.value}
                style={{ background: "#0E0E10" }}
              >
                {cat.label}
              </option>
            ))}
          </Select>

          <Button
            size="sm"
            px={5}
            borderRadius="none"
            variant="outline"
            borderColor={showOnlyWatchlist ? "rgba(212,175,55,0.5)" : "rgba(255,255,255,0.08)"}
            color={showOnlyWatchlist ? "#D4AF37" : "gray.500"}
            bg={showOnlyWatchlist ? "rgba(212,175,55,0.08)" : "transparent"}
            fontWeight="400"
            fontSize="xs"
            letterSpacing="0.1em"
            onClick={() => setShowOnlyWatchlist(!showOnlyWatchlist)}
            _hover={{ borderColor: "rgba(212,175,55,0.4)", color: "#D4AF37" }}
          >
            ★ Watchlist ({watchlist.length})
          </Button>
        </HStack>

        {/* Grid */}
        {loading && movies.length === 0 ? (
          <Center h="60vh">
            <Box display="flex" gap="6px">
              {[0, 1, 2, 3, 4].map((i) => (
                <Box
                  key={i}
                  w="3px"
                  h="28px"
                  bg="#D4AF37"
                  style={{
                    animation: "cinePulse 1.2s ease-in-out infinite",
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </Box>
          </Center>
        ) : displayedMovies.length === 0 ? (
          <Center h="60vh">
            <VStack spacing={4}>
              <Box
                w="60px"
                h="60px"
                border="1px solid rgba(212,175,55,0.2)"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize="xl" color="rgba(212,175,55,0.4)">
                  ◈
                </Text>
              </Box>
              <Text
                fontSize="10px"
                letterSpacing="0.3em"
                textTransform="uppercase"
                color="gray.600"
              >
                No movies found
              </Text>
            </VStack>
          </Center>
        ) : (
          <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing={4}>
            {displayedMovies.map((movie) => (
              <Box
                key={movie.id}
                onClick={() => openMovie(movie.id)}
                cursor="pointer"
                bg="#0E0E10"
                border="1px solid rgba(255,255,255,0.05)"
                overflow="hidden"
                position="relative"
                role="group"
                transition="all 0.35s cubic-bezier(0.4, 0, 0.2, 1)"
                _hover={{
                  transform: "translateY(-8px)",
                  boxShadow:
                    "0 24px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(212,175,55,0.25)",
                  borderColor: "rgba(212,175,55,0.25)",
                }}
              >
                {/* Star btn */}
                <IconButton
                  aria-label="watchlist"
                  icon={<StarIcon />}
                  size="xs"
                  position="absolute"
                  top={2}
                  right={2}
                  zIndex={2}
                  borderRadius="none"
                  bg="rgba(8,8,10,0.85)"
                  backdropFilter="blur(8px)"
                  border="1px solid"
                  borderColor={
                    isInWatchlist(movie.id)
                      ? "rgba(212,175,55,0.5)"
                      : "rgba(255,255,255,0.08)"
                  }
                  color={isInWatchlist(movie.id) ? "#D4AF37" : "gray.600"}
                  _hover={{ color: "#D4AF37", borderColor: "#D4AF37" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMovieWatchlist(movie.id);
                  }}
                />

                <Box overflow="hidden" position="relative">
                  <Image
                    src={getPosterUrl(movie.poster_path)}
                    alt={movie.title}
                    w="100%"
                    h={{ base: "200px", sm: "240px", md: "300px" }}
                    objectFit="cover"
                    transition="transform 0.5s ease"
                    _groupHover={{ transform: "scale(1.04)" }}
                  />
                  <Box
                    position="absolute"
                    bottom={0}
                    left={0}
                    right={0}
                    h="50%"
                    bg="linear-gradient(to top, rgba(14,14,16,0.95) 0%, transparent 100%)"
                  />
                </Box>

                <Stack px={3} py={3} spacing={1} mt={-1}>
                  <Text
                    fontFamily="'Georgia', serif"
                    fontWeight="400"
                    fontSize="sm"
                    color="white"
                    noOfLines={1}
                  >
                    {movie.title}
                  </Text>
                  <HStack justify="space-between">
                    <Text
                      fontSize="9px"
                      letterSpacing="0.15em"
                      textTransform="uppercase"
                      color="gray.600"
                    >
                      {movie.release_date?.slice(0, 4)}
                    </Text>
                    <HStack spacing={1}>
                      <Text fontSize="9px" color="#D4AF37">★</Text>
                      <Text fontSize="10px" color="gray.400">
                        {movie.vote_average.toFixed(1)}
                      </Text>
                    </HStack>
                  </HStack>
                </Stack>
              </Box>
            ))}
          </SimpleGrid>
        )}

        {loading && movies.length > 0 && (
          <Center mt={8}>
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
          </Center>
        )}
      </Box>

      <MovieModal isOpen={isOpen} onClose={onClose} movieId={selectedMovie} />
    </Box>
  );
};

export default Movies;