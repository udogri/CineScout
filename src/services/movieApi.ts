const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

// TMDB genre mapping for category filtering
const GENRES: Record<string, number> = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  "science fiction": 878,
  thriller: 53,
  war: 10752,
  western: 37,
};

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
 * Get movies by category/genre
 */
export const getMoviesByCategory = async (category: string, page = 1) => {
  const genreId = GENRES[category.toLowerCase()];
  if (!genreId) return getPopularMovies(page);

  const res = await fetch(
    `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&with_genres=${genreId}&page=${page}`
  );

  const data = await res.json();

  return {
    results: Array.isArray(data.results) ? data.results : [],
    total_pages: data.total_pages || 1,
  };
};

/**
 * Movie details (for modal)
 */
export const getMovieDetails = async (id: number) => {
    const res = await fetch(
      `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US&append_to_response=videos`
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
