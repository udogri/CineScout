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
    HStack,
    Spinner,
    Center,
    Divider,
    Box,
    Link,
    Button,
  } from "@chakra-ui/react";
  import { ExternalLinkIcon } from "@chakra-ui/icons";
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
    openLibraryKey?: string;
    isbn?: string | null;
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
          let isbn: string | null = null;
  
          if (bookKey.startsWith("/books/")) {
            const bookRes = await fetch(`https://openlibrary.org${bookKey}.json`);
            const bookData = await bookRes.json();
            if (bookData.works?.[0]?.key) workKey = bookData.works[0].key;
            // Try to get ISBN
            const isbns = bookData.isbn_13 ?? bookData.isbn_10 ?? [];
            if (isbns.length) isbn = isbns[0];
          }
  
          const res = await fetch(`https://openlibrary.org${workKey}.json`);
          if (!res.ok) throw new Error("Failed to fetch work");
          const data = await res.json();
  
          const coverId = data.covers?.[0] ?? null;
          const cover = coverId
            ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
            : null;
  
          const description =
            typeof data.description === "string"
              ? data.description
              : data.description?.value ?? "No description available.";
  
          let authors: string[] = ["Unknown"];
          if (data.authors) {
            authors = await Promise.all(
              data.authors.map(async (a: { author: { key: string } }) => {
                const authorRes = await fetch(`https://openlibrary.org${a.author.key}.json`);
                const authorData = await authorRes.json();
                return authorData.name;
              })
            );
          }
  
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
              // Grab ISBN from editions if we don't have it
              if (!isbn) {
                const isbns =
                  edition?.isbn_13 ?? edition?.isbn_10 ?? [];
                if (isbns.length) isbn = isbns[0];
              }
            }
          } catch {}
  
          let ratingData: any = null;
          try {
            const r = await fetch(`https://openlibrary.org${workKey}/ratings.json`);
            if (r.ok) ratingData = await r.json();
          } catch {}
  
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
            openLibraryKey: workKey,
            isbn,
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
  
    const subjects = book?.subjects ?? [];
  
    // Build access links
    const openLibraryUrl = book?.openLibraryKey
      ? `https://openlibrary.org${book.openLibraryKey}`
      : null;
    const internetArchiveUrl = book?.isbn
      ? `https://archive.org/search?query=isbn:${book.isbn}`
      : book?.openLibraryKey
      ? `https://archive.org/search?query=${encodeURIComponent(book.title ?? "")}&mediatype=texts`
      : null;
    const gutenbergUrl = book?.title
      ? `https://www.gutenberg.org/ebooks/search/?query=${encodeURIComponent(book.title)}`
      : null;
    const googleBooksUrl = book?.title
      ? `https://books.google.com/books?q=${encodeURIComponent(book.title)}`
      : null;
  
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
        <ModalOverlay bg="rgba(0,0,0,0.88)" backdropFilter="blur(12px)" />
        <ModalContent
          bg="#0A0A0C"
          border="1px solid rgba(212,175,55,0.12)"
          borderRadius="none"
          color="white"
        >
          <ModalHeader
            fontFamily="'Georgia', serif"
            fontWeight="400"
            fontSize="lg"
            letterSpacing="0.01em"
            borderBottom="1px solid rgba(255,255,255,0.05)"
            pb={4}
            pr={10}
          >
            {book?.title || "Loading…"}
          </ModalHeader>
          <ModalCloseButton color="gray.500" _hover={{ color: "#D4AF37" }} />
  
          <ModalBody px={6} py={6}>
            {loading || !book ? (
              <Center h="200px">
                <Box display="flex" gap="6px">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Box
                      key={i}
                      w="3px"
                      h="24px"
                      bg="#D4AF37"
                      style={{
                        animation: "cinePulse 1.2s ease-in-out infinite",
                        animationDelay: `${i * 0.15}s`,
                      }}
                    />
                  ))}
                </Box>
              </Center>
            ) : (
              <VStack spacing={5} align="stretch">
                {/* Cover */}
                {book.cover && (
                  <Box mx="auto">
                    <Image
                      src={book.cover}
                      alt={book.title}
                      maxH="340px"
                      borderRadius="none"
                      border="1px solid rgba(212,175,55,0.1)"
                      boxShadow="0 20px 60px rgba(0,0,0,0.7)"
                    />
                  </Box>
                )}
  
                {/* Author & Year */}
                <HStack justify="space-between" pt={1}>
                  <VStack align="start" spacing={0}>
                    <Text
                      fontSize="9px"
                      letterSpacing="0.25em"
                      textTransform="uppercase"
                      color="gray.600"
                    >
                      Author
                    </Text>
                    <Text fontFamily="'Georgia', serif" fontSize="sm" color="gray.200">
                      {book.authors.join(", ")}
                    </Text>
                  </VStack>
                  <VStack align="end" spacing={0}>
                    <Text
                      fontSize="9px"
                      letterSpacing="0.25em"
                      textTransform="uppercase"
                      color="gray.600"
                    >
                      First Published
                    </Text>
                    <Text fontSize="sm" color="rgba(212,175,55,0.7)">
                      {book.year}
                    </Text>
                  </VStack>
                </HStack>
  
                {/* Rating */}
                {book.rating && (
                  <HStack>
                    <Text fontSize="10px" color="#D4AF37">★</Text>
                    <Text fontSize="sm" color="#D4AF37" fontWeight="600">
                      {book.rating.toFixed(1)}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      ({book.ratingCount?.toLocaleString()} ratings)
                    </Text>
                  </HStack>
                )}
  
                {/* Subjects */}
                {subjects.length > 0 && (
                  <Stack spacing={2}>
                    <Text
                      fontSize="9px"
                      letterSpacing="0.25em"
                      textTransform="uppercase"
                      color="gray.600"
                    >
                      Subjects
                    </Text>
                    <HStack flexWrap="wrap" spacing={2}>
                      {subjects.slice(0, 7).map((subject) => (
                        <Box
                          key={subject}
                          px={2}
                          py={1}
                          border="1px solid rgba(212,175,55,0.15)"
                          bg="rgba(212,175,55,0.04)"
                        >
                          <Text
                            fontSize="9px"
                            letterSpacing="0.15em"
                            textTransform="uppercase"
                            color="rgba(212,175,55,0.6)"
                          >
                            {subject}
                          </Text>
                        </Box>
                      ))}
                    </HStack>
                  </Stack>
                )}
  
                <Divider borderColor="rgba(255,255,255,0.06)" />
  
                {/* Description */}
                <Stack spacing={2}>
                  <Text
                    fontSize="9px"
                    letterSpacing="0.25em"
                    textTransform="uppercase"
                    color="gray.600"
                  >
                    About
                  </Text>
                  <Text fontSize="sm" color="gray.400" lineHeight="1.8" whiteSpace="pre-wrap">
                    {book.description}
                  </Text>
                </Stack>
  
                {/* ── ACCESS LINKS ── */}
                <Divider borderColor="rgba(255,255,255,0.06)" />
  
                <Stack spacing={3}>
                  <HStack spacing={3}>
                    <Box w="3px" h="14px" bg="#D4AF37" />
                    <Text
                      fontSize="9px"
                      letterSpacing="0.25em"
                      textTransform="uppercase"
                      color="gray.400"
                      fontWeight="600"
                    >
                      Read or Download
                    </Text>
                  </HStack>
  
                  <Text fontSize="xs" color="gray.600" lineHeight="1.7">
                    Availability depends on copyright status. Public-domain titles
                    can often be read or downloaded for free.
                  </Text>
  
                  <Stack spacing={2}>
                    {openLibraryUrl && (
                      <Link href={openLibraryUrl} isExternal _hover={{ textDecoration: "none" }}>
                        <Button
                          w="full"
                          variant="outline"
                          size="sm"
                          borderRadius="none"
                          borderColor="rgba(212,175,55,0.25)"
                          color="#D4AF37"
                          bg="rgba(212,175,55,0.04)"
                          fontWeight="400"
                          fontSize="xs"
                          letterSpacing="0.1em"
                          justifyContent="space-between"
                          rightIcon={<ExternalLinkIcon />}
                          _hover={{
                            bg: "rgba(212,175,55,0.12)",
                            borderColor: "#D4AF37",
                          }}
                        >
                          Open Library — Read Online / Borrow
                        </Button>
                      </Link>
                    )}
  
                    {internetArchiveUrl && (
                      <Link href={internetArchiveUrl} isExternal _hover={{ textDecoration: "none" }}>
                        <Button
                          w="full"
                          variant="outline"
                          size="sm"
                          borderRadius="none"
                          borderColor="rgba(255,255,255,0.08)"
                          color="gray.300"
                          bg="transparent"
                          fontWeight="400"
                          fontSize="xs"
                          letterSpacing="0.1em"
                          justifyContent="space-between"
                          rightIcon={<ExternalLinkIcon />}
                          _hover={{
                            bg: "rgba(255,255,255,0.04)",
                            borderColor: "rgba(255,255,255,0.2)",
                          }}
                        >
                          Internet Archive — Free Download (PDF / EPUB)
                        </Button>
                      </Link>
                    )}
  
                    {gutenbergUrl && (
                      <Link href={gutenbergUrl} isExternal _hover={{ textDecoration: "none" }}>
                        <Button
                          w="full"
                          variant="outline"
                          size="sm"
                          borderRadius="none"
                          borderColor="rgba(255,255,255,0.08)"
                          color="gray.300"
                          bg="transparent"
                          fontWeight="400"
                          fontSize="xs"
                          letterSpacing="0.1em"
                          justifyContent="space-between"
                          rightIcon={<ExternalLinkIcon />}
                          _hover={{
                            bg: "rgba(255,255,255,0.04)",
                            borderColor: "rgba(255,255,255,0.2)",
                          }}
                        >
                          Project Gutenberg — Public Domain Texts
                        </Button>
                      </Link>
                    )}
  
                    {googleBooksUrl && (
                      <Link href={googleBooksUrl} isExternal _hover={{ textDecoration: "none" }}>
                        <Button
                          w="full"
                          variant="outline"
                          size="sm"
                          borderRadius="none"
                          borderColor="rgba(255,255,255,0.08)"
                          color="gray.300"
                          bg="transparent"
                          fontWeight="400"
                          fontSize="xs"
                          letterSpacing="0.1em"
                          justifyContent="space-between"
                          rightIcon={<ExternalLinkIcon />}
                          _hover={{
                            bg: "rgba(255,255,255,0.04)",
                            borderColor: "rgba(255,255,255,0.2)",
                          }}
                        >
                          Google Books — Preview &amp; Purchase
                        </Button>
                      </Link>
                    )}
                  </Stack>
                </Stack>
  
                {/* Reviews */}
                {book.reviews && book.reviews.length > 0 && (
                  <>
                    <Divider borderColor="rgba(255,255,255,0.06)" />
                    <Stack spacing={3}>
                      <HStack spacing={3}>
                        <Box w="3px" h="14px" bg="#D4AF37" />
                        <Text
                          fontSize="9px"
                          letterSpacing="0.25em"
                          textTransform="uppercase"
                          color="gray.400"
                          fontWeight="600"
                        >
                          Community Reviews
                        </Text>
                      </HStack>
                      {book.reviews.map((rev, i) => (
                        <Box
                          key={i}
                          p={4}
                          bg="rgba(255,255,255,0.02)"
                          border="1px solid rgba(255,255,255,0.05)"
                        >
                          <Text
                            fontSize="10px"
                            letterSpacing="0.1em"
                            textTransform="uppercase"
                            color="rgba(212,175,55,0.6)"
                            mb={2}
                          >
                            {rev.author}
                          </Text>
                          <Text fontSize="sm" color="gray.500" lineHeight="1.7">
                            {rev.text}
                          </Text>
                        </Box>
                      ))}
                    </Stack>
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