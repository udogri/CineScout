export const getPosterUrl = (path: string | null) => {
    if (!path) {
      return "https://via.placeholder.com/500x750?text=No+Image";
    }
  
    return `https://image.tmdb.org/t/p/w500${path}`;
  };
  