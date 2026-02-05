import { useEffect, useState } from "react";
import { getPopularMovies } from "../services/movieApi";
import type { Movie } from "../types/Movie";
import { getPosterUrl } from "../utils/image";
import { Button, Input, useDisclosure } from "@chakra-ui/react";
import MovieModal from "../components/MovieModal";
import useDebounce from "../hooks/useDebounce";
import { searchMovies } from "../services/movieApi";
import { toggleWatchlist, getWatchlist, isInWatchlist } from "../utils/watchlist";
import { IconButton } from "@chakra-ui/react";
import { StarIcon } from "@chakra-ui/icons";



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
} from "@chakra-ui/react";

const Movies = () => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedMovie, setSelectedMovie] = useState<number | null>(null);
    const [query, setQuery] = useState("");
    const debouncedQuery = useDebounce(query, 500);
    const [watchlist, setWatchlist] = useState<number[]>([]);
    const [showOnlyWatchlist, setShowOnlyWatchlist] = useState(false);


    const openMovie = (id: number) => {
        setSelectedMovie(id);
        onOpen();
    };


    useEffect(() => {
        setWatchlist(getWatchlist());
        const fetch = async () => {
            setLoading(true);

            if (!debouncedQuery.trim()) {
                const data = await getPopularMovies();
                setMovies(data);
            } else {
                const data = await searchMovies(debouncedQuery);
                setMovies(data);
            }

            setLoading(false);
        };

        fetch();
    }, [debouncedQuery]);


    if (loading)
        return (
            <Center h="60vh">
                <Spinner size="xl" />
            </Center>
        );

    const displayedMovies = showOnlyWatchlist
        ? movies.filter((m) => watchlist.includes(m.id))
        : movies;


    return (
        <Box p={6}>
            <Heading mb={6}>🔥 Popular Movies</Heading>
            <Input
                mb={6}
                placeholder="Search movies..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />

            <Button
                mb={4}
                colorScheme={showOnlyWatchlist ? "yellow" : "gray"}
                onClick={() => setShowOnlyWatchlist(!showOnlyWatchlist)}
            >
                ⭐ Watchlist ({watchlist.length})
            </Button>

            <SimpleGrid
                columns={{ base: 2, sm: 2, md: 3, lg: 4, xl: 5 }}
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
                                const updated = toggleWatchlist(movie.id);
                                setWatchlist(updated);
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
            <MovieModal
                isOpen={isOpen}
                onClose={onClose}
                movieId={selectedMovie}
            />

        </Box>
    );
};

export default Movies;
