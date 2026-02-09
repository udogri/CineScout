export interface Movie {
  backdrop_path: string;
  title: string;
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
