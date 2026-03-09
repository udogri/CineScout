import { useEffect, useRef, useState, useCallback } from "react";
import {
  Box,
  SimpleGrid,
  Image,
  Text,
  Stack,
  Center,
  Button,
  IconButton,
  VStack,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  useDisclosure,
} from "@chakra-ui/react";
import { StarIcon, SearchIcon, CloseIcon } from "@chakra-ui/icons";
import MovieModal from "../components/MovieModal";
import useDebounce from "../hooks/useDebounce";
import {
  getPopularMovies,
  searchMovies,
  getMoviesByCategory,
  getMovieDetails,
} from "../services/movieApi";
import { getPosterUrl } from "../utils/image";
import { toggleWatchlist, getWatchlist, isInWatchlist } from "../utils/watchList";
import type { Movie } from "../types/Movie";

// ── Constants ──────────────────────────────────────────────────────────────

const GENRE_PILLS = [
  { label: "All",       value: "" },
  { label: "Action",    value: "action" },
  { label: "Comedy",    value: "comedy" },
  { label: "Drama",     value: "drama" },
  { label: "Horror",    value: "horror" },
  { label: "Sci-Fi",    value: "science fiction" },
  { label: "Thriller",  value: "thriller" },
  { label: "Romance",   value: "romance" },
  { label: "Animation", value: "animation" },
  { label: "Crime",     value: "crime" },
  { label: "Fantasy",   value: "fantasy" },
  { label: "Mystery",   value: "mystery" },
  { label: "War",       value: "war" },
  { label: "Western",   value: "western" },
];

const SORT_OPTIONS = [
  { label: "Popularity",   value: "popularity" },
  { label: "Rating ↑",     value: "rating_asc" },
  { label: "Rating ↓",     value: "rating_desc" },
  { label: "Newest first", value: "newest" },
  { label: "Oldest first", value: "oldest" },
];

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E\")";

// ── Helpers ────────────────────────────────────────────────────────────────

const sortMovies = (movies: Movie[], sort: string): Movie[] => {
  const copy = [...movies];
  switch (sort) {
    case "rating_asc":  return copy.sort((a, b) => a.vote_average - b.vote_average);
    case "rating_desc": return copy.sort((a, b) => b.vote_average - a.vote_average);
    case "newest":      return copy.sort((a, b) => (b.release_date ?? "").localeCompare(a.release_date ?? ""));
    case "oldest":      return copy.sort((a, b) => (a.release_date ?? "").localeCompare(b.release_date ?? ""));
    default:            return copy;
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

const Movies = () => {
  const [movies, setMovies]                       = useState<Movie[]>([]);
  const [loading, setLoading]                     = useState(false);
  const [query, setQuery]                         = useState("");
  const [category, setCategory]                   = useState("");
  const [sort, setSort]                           = useState("popularity");
  const [watchlist, setWatchlist]                 = useState<number[]>(() => getWatchlist());
  const [showOnlyWatchlist, setShowOnlyWatchlist] = useState(false);
  const [watchlistMovies, setWatchlistMovies]     = useState<Movie[]>([]);
  const [watchlistLoading, setWatchlistLoading]   = useState(false);
  const [selectedMovie, setSelectedMovie]         = useState<number | null>(null);

  const pageRef       = useRef(1);
  const totalPagesRef = useRef(1);
  const isFetchingRef = useRef(false);
  // Keep a stable ref to `loading` so the scroll handler never captures a stale value
  const loadingRef    = useRef(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const debouncedQuery = useDebounce(query, 500);

  const activeFilterCount = [
    category !== "",
    sort !== "popularity",
    showOnlyWatchlist,
  ].filter(Boolean).length;

  // ── Keep loadingRef in sync ───────────────────────────────────────────────
  useEffect(() => { loadingRef.current = loading; }, [loading]);

  // ── Fetch browse / search movies ──────────────────────────────────────────
  // `loading` intentionally NOT in deps — use isFetchingRef instead
  const loadMovies = useCallback(async (reset = false) => {
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
  }, [debouncedQuery, category]); // `loading` removed

  // Reset + reload when query/category changes
  useEffect(() => {
    pageRef.current = 1;
    totalPagesRef.current = 1;
    loadMovies(true);
  }, [debouncedQuery, category]);

  // ── Infinite scroll — uses loadingRef, not loading state ─────────────────
  useEffect(() => {
    const handleScroll = () => {
      if (loadingRef.current) return; // stable ref, no stale closure
      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.body.offsetHeight - 800;
      if (scrollPosition >= threshold && pageRef.current <= totalPagesRef.current) {
        loadMovies();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMovies]); // `loading` removed from deps — ref handles it

  // ── Fetch watchlist movies by ID when toggled on ──────────────────────────
  useEffect(() => {
    if (!showOnlyWatchlist) return;
    if (watchlist.length === 0) {
      setWatchlistMovies([]);
      return;
    }

    const load = async () => {
      setWatchlistLoading(true);
      try {
        const results = await Promise.allSettled(watchlist.map((id) => getMovieDetails(id)));
        const fetched = results
          .filter((r): r is PromiseFulfilledResult<Movie> => r.status === "fulfilled")
          .map((r) => r.value);
        setWatchlistMovies(fetched);
      } finally {
        setWatchlistLoading(false);
      }
    };

    load();
  }, [showOnlyWatchlist, watchlist]);

  // ── Derived display list ──────────────────────────────────────────────────
  const clearAllFilters = () => {
    setCategory("");
    setSort("popularity");
    setShowOnlyWatchlist(false);
    setQuery("");
  };

  const isLoadingNow    = showOnlyWatchlist ? watchlistLoading : loading && movies.length === 0;
  const baseMovies      = showOnlyWatchlist ? watchlistMovies : movies;
  const displayedMovies = sortMovies(baseMovies, sort);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box minH="100vh" bg="#08080A" p={{ base: 4, md: 8 }} style={{ backgroundImage: GRAIN }}>
      <Box maxW="1400px" mx="auto">

        {/* ── Page header ── */}
        <HStack spacing={3} mb={8}>
          <Box w="3px" h="28px" bg="linear-gradient(to bottom, #D4AF37, #B8860B)" />
          <VStack align="start" spacing={0}>
            <Text fontSize="9px" letterSpacing="0.3em" textTransform="uppercase" color="gray.600">
              {showOnlyWatchlist ? "Your Saved Movies" : "Browse"}
            </Text>
            <Text fontFamily="'Georgia', serif" fontSize={{ base: "xl", md: "2xl" }} fontWeight="400" color="white">
              Movies
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
            <Input placeholder="Search movies…" value={query} onChange={(e) => setQuery(e.target.value)} {...inputStyles} />
          </InputGroup>

          <HStack spacing={2} ml="auto" flexShrink={0}>
            <Text fontSize="9px" letterSpacing="0.2em" textTransform="uppercase" color="gray.600" whiteSpace="nowrap">Sort by</Text>
            <Select value={sort} onChange={(e) => setSort(e.target.value)} w="160px" size="sm" {...inputStyles}>
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} style={{ background: "#0E0E10" }}>{o.label}</option>
              ))}
            </Select>
          </HStack>

          <Button
            size="sm" px={4} flexShrink={0} borderRadius="none" variant="outline"
            borderColor={showOnlyWatchlist ? "rgba(212,175,55,0.5)" : "rgba(255,255,255,0.08)"}
            color={showOnlyWatchlist ? "#D4AF37" : "gray.500"}
            bg={showOnlyWatchlist ? "rgba(212,175,55,0.08)" : "transparent"}
            fontWeight="400" fontSize="xs" letterSpacing="0.1em"
            onClick={() => setShowOnlyWatchlist((v) => !v)}
            _hover={{ borderColor: "rgba(212,175,55,0.4)", color: "#D4AF37" }}
          >
            ★ Watchlist ({watchlist.length})
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

        {/* ── Genre pill bar (hidden in watchlist mode) ── */}
        {!showOnlyWatchlist && (
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
        ) : displayedMovies.length === 0 ? (
          <Center h="60vh">
            <VStack spacing={4}>
              <Box w="60px" h="60px" border="1px solid rgba(212,175,55,0.2)" display="flex" alignItems="center" justifyContent="center">
                <Text fontSize="xl" color="rgba(212,175,55,0.4)">◈</Text>
              </Box>
              <Text fontSize="10px" letterSpacing="0.3em" textTransform="uppercase" color="gray.600">
                {showOnlyWatchlist ? "No movies in watchlist" : "No movies found"}
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
          <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing={4}>
            {displayedMovies.map((movie) => (
              <Box
                key={movie.id}
                onClick={() => { setSelectedMovie(movie.id); onOpen(); }}
                cursor="pointer"
                bg="#0E0E10"
                border="1px solid rgba(255,255,255,0.05)"
                overflow="hidden"
                position="relative"
                role="group"
                transition="all 0.35s cubic-bezier(0.4, 0, 0.2, 1)"
                _hover={{
                  transform: "translateY(-8px)",
                  boxShadow: "0 24px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(212,175,55,0.25)",
                  borderColor: "rgba(212,175,55,0.25)",
                }}
              >
                <IconButton
                  aria-label="watchlist"
                  icon={<StarIcon />}
                  size="xs"
                  position="absolute" top={2} right={2} zIndex={2}
                  borderRadius="none"
                  bg="rgba(8,8,10,0.85)"
                  backdropFilter="blur(8px)"
                  border="1px solid"
                  borderColor={isInWatchlist(movie.id) ? "rgba(212,175,55,0.5)" : "rgba(255,255,255,0.08)"}
                  color={isInWatchlist(movie.id) ? "#D4AF37" : "gray.600"}
                  _hover={{ color: "#D4AF37", borderColor: "#D4AF37" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setWatchlist(toggleWatchlist(movie.id));
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
                  <Box position="absolute" bottom={0} left={0} right={0} h="50%"
                    bg="linear-gradient(to top, rgba(14,14,16,0.95) 0%, transparent 100%)"
                  />
                </Box>

                <Stack px={3} py={3} spacing={1} mt={-1}>
                  <Text fontFamily="'Georgia', serif" fontWeight="400" fontSize="sm" color="white" noOfLines={1}>
                    {movie.title}
                  </Text>
                  <HStack justify="space-between">
                    <Text fontSize="9px" letterSpacing="0.15em" textTransform="uppercase" color="gray.600">
                      {movie.release_date?.slice(0, 4)}
                    </Text>
                    <HStack spacing={1}>
                      <Text fontSize="9px" color="#D4AF37">★</Text>
                      <Text fontSize="10px" color="gray.400">{movie.vote_average.toFixed(1)}</Text>
                    </HStack>
                  </HStack>
                </Stack>
              </Box>
            ))}
          </SimpleGrid>
        )}

        {/* Bottom loader — browse mode only */}
        {!showOnlyWatchlist && loading && movies.length > 0 && (
          <Center mt={8}>
            <Box display="flex" gap="6px">
              {[0, 1, 2].map((i) => (
                <Box key={i} w="3px" h="20px" bg="#D4AF37"
                  style={{ animation: "cinePulse 1.2s ease-in-out infinite", animationDelay: `${i * 0.15}s` }}
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