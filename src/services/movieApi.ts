const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

/**
 * Popular movies
 */
export const getPopularMovies = async (page = 1) => {
  const res = await fetch(
    `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=${page}`
  );

  const data = await res.json();

  return {
    results: Array.isArray(data.results) ? data.results : [],
    total_pages: data.total_pages || 1,
  };
};

/**
 * Search movies
 */
export const searchMovies = async (query: string, page = 1) => {
  const res = await fetch(
    `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(
      query
    )}&page=${page}&include_adult=false`
  );

  const data = await res.json();

  return {
    results: Array.isArray(data.results) ? data.results : [],
    total_pages: data.total_pages || 1,
  };
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
  return data.results || [];
};
