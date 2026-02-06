// src/components/BookModal.tsx
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
  } from "@chakra-ui/react";
  import { useEffect, useState } from "react";
  
  interface BookDetails {
    title: string;
    authors: string[];
    year?: number | string;
    subjects?: string[];
    cover?: string | null;
    description?: string;
  }
  
  interface BookModalProps {
    bookKey: string | null; // OpenLibrary key
    isOpen: boolean;
    onClose: () => void;
  }
  
  const BookModal = ({ bookKey, isOpen, onClose }: BookModalProps) => {
    const [book, setBook] = useState<BookDetails | null>(null);
    const [loading, setLoading] = useState(false);
  
    useEffect(() => {
      if (!bookKey) return;
  
      const fetchBook = async () => {
        setLoading(true);
        try {
          const res = await fetch(`https://openlibrary.org${bookKey}.json`);
          if (!res.ok) throw new Error("Failed to fetch book details");
  
          const data = await res.json();
  
          const coverId = data.covers?.[0] ?? null;
          const cover = coverId
            ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
            : null;
  
          const description =
            typeof data.description === "string"
              ? data.description
              : data.description?.value ?? "No description available.";
  
          const authors = data.authors
            ? await Promise.all(
                data.authors.map(async (a: any) => {
                  const authorRes = await fetch(`https://openlibrary.org${a.author.key}.json`);
                  const authorData = await authorRes.json();
                  return authorData.name;
                })
              )
            : ["Unknown"];
  
          setBook({
            title: data.title,
            authors,
            year: data.first_publish_date ?? data.created?.value ?? "—",
            subjects: data.subjects || [],
            cover,
            description,
          });
        } catch (err) {
          console.error(err);
          setBook(null);
        } finally {
          setLoading(false);
        }
      };
  
      fetchBook();
    }, [bookKey]);
  
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
              <VStack spacing={4} align="stretch">
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
  
                {book.subjects.length > 0 && (
                  <Stack spacing={1}>
                    <Text fontWeight="bold">Subjects:</Text>
                    <Stack direction="row" wrap="wrap" spacing={2}>
                      {book.subjects.map((s, i) => (
                        <Badge key={i} colorScheme="green">
                          {s}
                        </Badge>
                      ))}
                    </Stack>
                  </Stack>
                )}
  
                <Stack spacing={1}>
                  <Text fontWeight="bold">Description:</Text>
                  <Text>{book.description}</Text>
                </Stack>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  };
  
  export default BookModal;
  