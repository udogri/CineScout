import { useEffect, useState, useRef, useCallback } from "react";
import {
  Box,
  SimpleGrid,
  Image,
  Text,
  Heading,
  Badge,
  Stack,
  Spinner,
  Center,
  Button,
  Select,
  IconButton,
  VStack,
  useDisclosure,
  Input,
} from "@chakra-ui/react";
import { StarIcon } from "@chakra-ui/icons";
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
  
        setMovies(prev => reset ? data.results : [...prev, ...data.results]);
  
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
  

  // Initial + load on query/category change
  useEffect(() => {
    pageRef.current = 1;
    totalPagesRef.current = 1;
    loadMovies(true);
  }, [debouncedQuery, category]);
  
  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || loading) return;
  
      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.body.offsetHeight - 800;
  
      if (
        scrollPosition >= threshold &&
        pageRef.current <= totalPagesRef.current
      ) {
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
    <Box p={6} ref={containerRef}>
      <VStack spacing={4} align="stretch" mb={6}>
        {/* <Heading>🎬 Movies</Heading> */}

        <Select
        color="grey"
          placeholder="Filter by category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map((cat) => (
            <option  key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </Select>

        <Input
        color="grey"
          placeholder="Search movies..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <Button
          colorScheme={showOnlyWatchlist ? "yellow" : "gray"}
          onClick={() => setShowOnlyWatchlist(!showOnlyWatchlist)}
        >
          ⭐ Watchlist ({watchlist.length})
        </Button>
      </VStack>

      {loading && movies.length === 0 ? (
        <Center h="60vh">
          <Spinner size="xl" />
        </Center>
      ) : displayedMovies.length === 0 ? (
        <Center h="60vh">
          <Text>No movies found 🎬</Text>
        </Center>
      ) : (
        <SimpleGrid
          columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
          spacing={6}
        >
          {displayedMovies.map((movie) => (
            <Box
              key={movie.id}
              onClick={() => openMovie(movie.id)}
              cursor="pointer"
              bg="gray.800"
              borderRadius="lg"
              overflow="hidden"
              _hover={{ transform: "scale(1.04)" }}
              transition="0.2s ease"
              boxShadow="lg"
              position="relative"
            >
              <IconButton
                aria-label="watchlist"
                icon={<StarIcon />}
                size="sm"
                colorScheme={isInWatchlist(movie.id) ? "yellow" : "gray"}
                position="absolute"
                top={2}
                right={2}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMovieWatchlist(movie.id);
                }}
              />

              <Image
                src={getPosterUrl(movie.poster_path)}
                alt={movie.title}
                w="100%"
                h="380px"
                objectFit="cover"
              />

              <Stack p={3} spacing={2}>
                <Heading size="sm" noOfLines={1}>
                  {movie.title}
                </Heading>

                <Text fontSize="sm" color="gray.400">
                  {movie.release_date?.slice(0, 4)}
                </Text>

                <Badge colorScheme="yellow" w="fit-content">
                  ⭐ {movie.vote_average.toFixed(1)}
                </Badge>

                <Text fontSize="xs" noOfLines={3} color="gray.300">
                  {movie.overview}
                </Text>
              </Stack>
            </Box>
          ))}
        </SimpleGrid>
      )}

      {loading && movies.length > 0 && (
        <Center mt={4}>
          <Spinner size="lg" />
        </Center>
      )}

      <MovieModal isOpen={isOpen} onClose={onClose} movieId={selectedMovie} />
    </Box>
  );
};

export default Movies;
