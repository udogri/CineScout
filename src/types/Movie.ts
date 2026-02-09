export interface Movie {
    id: number;
  backdrop_path: string;
  title: string;
  poster_path: string | null;

  vote_average: number;
  release_date: string;
  runtime: number;
  overview: string;
  videos?: {
    results: {
      id: string;
      key: string;
      name: string;
      site: string;
      type: string;
      official: boolean;
    }[];
  };
}
