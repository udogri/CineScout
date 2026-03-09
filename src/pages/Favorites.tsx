import { useEffect, useState } from "react";
import { Box, SimpleGrid, Text, VStack, HStack, Center, useDisclosure } from "@chakra-ui/react";
import type { Movie } from "../types/Movie";
import MovieCard from "../components/MovieCard";
import MovieModal from "../components/MovieModal";
import { getPosterUrl } from "../utils/image";
import { getMovieDetails } from "../services/movieApi";

const FAVORITES_KEY = "favorite_movies";

const Favorites = () => {
  const [movies, setMovies]         = useState<Movie[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [loading, setLoading]       = useState(true); // starts true until first read
  const [selectedMovie, setSelectedMovie] = useState<number | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const init = async () => {
      try {
        const stored = localStorage.getItem(FAVORITES_KEY);
        const ids: number[] = stored ? JSON.parse(stored) : [];
        const uniqueIds = [...new Set(ids)] as number[];
        setFavoriteIds(uniqueIds);

        if (uniqueIds.length === 0) {
          // Nothing to fetch — stop loading immediately
          setLoading(false);
          return;
        }

        const results = await Promise.allSettled(
          uniqueIds.map((id) => getMovieDetails(id))
        );
        const fetched = results
          .filter((r): r is PromiseFulfilledResult<Movie> => r.status === "fulfilled")
          .map((r) => r.value);

        setMovies(fetched);
      } catch {
        // Parse error or network failure — stop spinner regardless
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const openMovie = (id: number) => {
    setSelectedMovie(id);
    onOpen();
  };

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

        {/* ── Header ── */}
        <HStack spacing={3} mb={8}>
          <Box w="3px" h="28px" bg="linear-gradient(to bottom, #D4AF37, #B8860B)" />
          <VStack align="start" spacing={0}>
            <Text fontSize="9px" letterSpacing="0.3em" textTransform="uppercase" color="gray.600">
              Your Collection
            </Text>
            <Text
              fontFamily="'Georgia', serif"
              fontSize={{ base: "xl", md: "2xl" }}
              fontWeight="400"
              color="white"
            >
              Favorites
            </Text>
          </VStack>
          {favoriteIds.length > 0 && (
            <Box ml="auto" px={3} py={1} border="1px solid rgba(212,175,55,0.2)" bg="rgba(212,175,55,0.04)">
              <Text fontSize="10px" letterSpacing="0.2em" textTransform="uppercase" color="rgba(212,175,55,0.6)">
                {favoriteIds.length} titles
              </Text>
            </Box>
          )}
        </HStack>

        {/* ── States ── */}
        {loading ? (
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
        ) : favoriteIds.length === 0 ? (
          <Center h="60vh">
            <VStack spacing={5}>
              <Box
                w="80px"
                h="80px"
                border="1px solid rgba(212,175,55,0.15)"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize="2xl" color="rgba(212,175,55,0.25)">★</Text>
              </Box>
              <VStack spacing={1}>
                <Text fontSize="10px" letterSpacing="0.3em" textTransform="uppercase" color="gray.600">
                  No favorites yet
                </Text>
                <Text fontSize="xs" color="gray.700">
                  Star a movie to save it here
                </Text>
              </VStack>
            </VStack>
          </Center>
        ) : (
          <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing={4}>
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                title={movie.title}
                poster={getPosterUrl(movie.poster_path)}
                rating={movie.vote_average}
                releaseDate={movie.release_date}
                onClick={() => openMovie(movie.id)}
              />
            ))}
          </SimpleGrid>
        )}
      </Box>

      <MovieModal isOpen={isOpen} onClose={onClose} movieId={selectedMovie} />
    </Box>
  );
};

export default Favorites;