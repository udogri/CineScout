import { useEffect, useState } from "react";
import { getPopularMovies } from "./services/movieApi";
import type { Movie } from "./types/Movie";

const Movies = () => {
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    const fetchMovies = async () => {
      const data = await getPopularMovies();
      setMovies(data.results);
    };

    fetchMovies();
  }, []);

  return (
    <>
      {movies.map((movie) => (
        <p key={movie.id}>{movie.title}</p>
      ))}
    </>
  );
};

export default Movies;
