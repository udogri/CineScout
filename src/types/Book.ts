export interface Book {
    key: string; // <-- THIS is the real id (/works/OLxxxxW)
    bookKey: string;
    subjects: string[]; // <- remove ?
    title: string;
    author_name?: string[];
    first_publish_year?: number;
    cover_i?: number;
  }
  