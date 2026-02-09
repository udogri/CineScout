// src/services/bookApi.ts

export const searchBooks = async (query: string, page = 1) => {
    const res = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&page=${page}&limit=12`
    );
  
    const data = await res.json();
  
    return {
      items: data.docs || [],
    };
  };
  
  
  
  // RANDOM DISCOVERY BOOKS
  export const getRandomBooks = async (category = "all", page = 1) => {
    const SUBJECTS = [
      "fantasy",
      "romance",
      "mystery",
      "science_fiction",
      "history",
      "horror",
      "nonfiction",
    ];
  
    const subject =
      category === "all"
        ? SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)]
        : category;
  
    // OpenLibrary uses offset not page
    const offset = (page - 1) * 12;
  
    const res = await fetch(
      `https://openlibrary.org/subjects/${subject}.json?limit=12&offset=${offset}`
    );
  
    const data = await res.json();
  
    return {
      items: data.works || [],
      subject,
    };
  };
  
  