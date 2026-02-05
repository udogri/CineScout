import { useEffect, useState } from "react";
import { Box, Grid, Text } from "@chakra-ui/react";

import type { Movie } from "../types/Movie";
import MovieCard from "../components/MovieCard";
import EmptyState from "../components/EmptyState";
import { getPosterUrl } from "../utils/image";
import { getPopularMovies } from "../services/movieApi";

const FAVORITES_KEY = "favorite_movies";

const Favorites = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      const ids = JSON.parse(stored);
      setFavoriteIds(ids);
      loadFavorites(ids);
    }
  }, []);

  const loadFavorites = async (ids: number[]) => {
    const allMovies = await getPopularMovies(); // simple approach
    const filtered = allMovies.filter((m: Movie) =>
      ids.includes(m.id)
    );
    setMovies(filtered);
  };

  if (favoriteIds.length === 0) {
    return <EmptyState message="No favorites yet ⭐" />;
  }

  return (
    <Box p={6}>
      <Text mb={4} fontWeight="bold">
        Your Favorites ❤️
      </Text>

      <Grid templateColumns="repeat(auto-fill, minmax(220px, 1fr))" gap={6}>
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            title={movie.title}
            poster={getPosterUrl(movie.poster_path)}
            rating={movie.vote_average}
            releaseDate={movie.release_date}
          />
        ))}
      </Grid>
    </Box>
  );
};

export default Favorites;
