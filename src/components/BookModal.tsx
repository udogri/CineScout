import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Image,
    Text,
    Stack,
    Badge,
    VStack,
    Spinner,
    Center,
    Divider,
  } from "@chakra-ui/react";
  import { useEffect, useState } from "react";
  
  interface BookDetails {
    title: string;
    authors: string[];
    year?: number | string;
    subjects?: string[];
    cover?: string | null;
    description?: string;
    rating?: number;
    ratingCount?: number;
    reviews?: { author: string; text: string }[];
  }
  
  interface BookModalProps {
    bookKey: string | null;
    isOpen: boolean;
    onClose: () => void;
  }
  
  const BookModal = ({ bookKey, isOpen, onClose }: BookModalProps) => {
    const [book, setBook] = useState<BookDetails | null>(null);
    const [loading, setLoading] = useState(false);
  
    useEffect(() => {
      if (!bookKey || !isOpen) return;
  
      const fetchBook = async () => {
        setLoading(true);
        setBook(null);
  
        try {
          let workKey = bookKey;
  
          // Convert /books/ → /works/
          if (bookKey.startsWith("/books/")) {
            const bookRes = await fetch(`https://openlibrary.org${bookKey}.json`);
            const bookData = await bookRes.json();
            if (bookData.works?.[0]?.key) {
              workKey = bookData.works[0].key;
            }
          }
  
          // MAIN WORK DATA
          const res = await fetch(`https://openlibrary.org${workKey}.json`);
          if (!res.ok) throw new Error("Failed to fetch work");
          const data = await res.json();
  
          // COVER
          const coverId = data.covers?.[0] ?? null;
          const cover = coverId
            ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
            : null;
  
          // DESCRIPTION
          const description =
            typeof data.description === "string"
              ? data.description
              : data.description?.value ?? "No description available.";
  
          // AUTHORS
          let authors: string[] = ["Unknown"];
          if (data.authors) {
            authors = await Promise.all(
              data.authors.map(async (a: { author: { key: string } }) => {
                const authorRes = await fetch(
                  `https://openlibrary.org${a.author.key}.json`
                );
                const authorData = await authorRes.json();
                return authorData.name;
              })
            );
          }
  
          // YEAR (robust)
          let publishYear: string | number = "—";
  
          if (data.first_publish_date) publishYear = data.first_publish_date;
  
          try {
            const editionsRes = await fetch(
              `https://openlibrary.org${workKey}/editions.json?limit=1`
            );
            if (editionsRes.ok) {
              const editionsData = await editionsRes.json();
              const edition = editionsData.entries?.[0];
              if (edition?.publish_date) publishYear = edition.publish_date;
            }
          } catch {}
  
          // RATINGS
          let ratingData: any = null;
          try {
            const r = await fetch(
              `https://openlibrary.org${workKey}/ratings.json`
            );
            if (r.ok) ratingData = await r.json();
          } catch {}
  
          // REVIEWS (404 = normal)
          let reviews: { author: string; text: string }[] = [];
          try {
            const reviewRes = await fetch(
              `https://openlibrary.org${workKey}/reviews.json?limit=3`
            );
  
            if (reviewRes.status === 200) {
              const j = await reviewRes.json();
              reviews =
                j.entries?.map((rev: any) => ({
                  author: rev.author?.display_name || "Anonymous",
                  text: rev.review || "No text",
                })) ?? [];
            }
          } catch {}
  
          setBook({
            title: data.title,
            authors,
            year: publishYear,
            subjects: data.subjects ?? [],
            cover,
            description,
            rating: ratingData?.summary?.average,
            ratingCount: ratingData?.summary?.count,
            reviews,
          });
        } catch (err) {
          console.error(err);
          setBook({
            title: "Failed to load book",
            authors: [],
            description: "OpenLibrary returned incomplete data.",
            reviews: [],
          });
        } finally {
          setLoading(false);
        }
      };
  
      fetchBook();
    }, [bookKey, isOpen]);
  
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent bg="gray.900" color="white">
          <ModalHeader>{book?.title || "Loading..."}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {loading || !book ? (
              <Center h="200px">
                <Spinner size="xl" />
              </Center>
            ) : (
              <VStack spacing={5} align="stretch">
                {book.cover && (
                  <Image
                    src={book.cover}
                    alt={book.title}
                    borderRadius="md"
                    maxH="400px"
                    objectFit="cover"
                    mx="auto"
                  />
                )}
  
                <Stack spacing={1}>
                  <Text fontWeight="bold">Authors:</Text>
                  <Text>{book.authors.join(", ")}</Text>
                </Stack>
  
                <Stack spacing={1}>
                  <Text fontWeight="bold">First Published:</Text>
                  <Text>{book.year}</Text>
                </Stack>
  
                {book.rating && (
                  <Stack spacing={1}>
                    <Text fontWeight="bold">Rating:</Text>
                    <Text>
                      ⭐ {book.rating.toFixed(1)} ({book.ratingCount ?? 0} votes)
                    </Text>
                  </Stack>
                )}
  
                {(book.subjects ?? []).length > 0 && (
                  <Stack spacing={1}>
                    <Text fontWeight="bold">Subjects:</Text>
                    <Stack direction="row" wrap="wrap">
                      {book.subjects.slice(0, 8).map((subject) => (
                        <Badge key={subject}>{subject}</Badge>
                      ))}
                    </Stack>
                  </Stack>
                )}
  
                <Stack spacing={1}>
                  <Text fontWeight="bold">Description:</Text>
                  <Text whiteSpace="pre-wrap">{book.description}</Text>
                </Stack>
  
                {book.reviews && book.reviews.length > 0 && (
                  <>
                    <Divider />
                    <Text fontWeight="bold" fontSize="lg">
                      Community Reviews
                    </Text>
  
                    <VStack align="stretch" spacing={3}>
                      {book.reviews.map((rev, i) => (
                        <Stack key={i} p={3} bg="gray.800" borderRadius="md">
                          <Text fontWeight="bold">{rev.author}</Text>
                          <Text fontSize="sm" color="gray.300">
                            {rev.text}
                          </Text>
                        </Stack>
                      ))}
                    </VStack>
                  </>
                )}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  };
  
  export default BookModal;
  