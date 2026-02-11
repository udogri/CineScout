import type { Movie } from "../types/Movie";

export const normalizeMovie = (raw: any): Movie => {
  return {
    id: raw.id,
    title: raw.title || raw.name || "Untitled",
    poster_path: raw.poster_path,
    backdrop_path: raw.backdrop_path,
    vote_average: raw.vote_average ?? 0,
    release_date: raw.release_date || raw.first_air_date || "—",
    runtime: raw.runtime ?? 0,
    overview: raw.overview ?? "",
    videos: raw.videos,
  };
};
