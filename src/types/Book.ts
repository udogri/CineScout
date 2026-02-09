export interface Book {
    key: string; // <-- THIS is the real id (/works/OLxxxxW)
    bookKey: string;
    title: string;
    author_name?: string[];
    first_publish_year?: number;
    cover_i?: number;
  }
  