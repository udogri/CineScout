const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

/**
 * Popular movies
 */
export const getPopularMovies = async () => {
  const res = await fetch(
    `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`
  );

  const data = await res.json();
  return data.results;
};

/**
 * Search movies
 */
export const searchMovies = async (query: string) => {
  const res = await fetch(
    `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(
      query
    )}&page=1&include_adult=false`
  );

  const data = await res.json();
  return data.results;
};

/**
 * Movie details (for modal later)
 */
export const getMovieDetails = async (id: number) => {
  const res = await fetch(
    `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US`
  );

  return await res.json();
};

/**
 * Movie videos (trailers)
 */
export const getMovieVideos = async (id: number) => {
  const res = await fetch(
    `${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}&language=en-US`
  );

  const data = await res.json();
  return data.results;
};
