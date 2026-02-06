import { Box, Image, Stack, Text, Heading } from "@chakra-ui/react";
import type { Book } from "../types/Book";

interface Props {
  book: Book;
  onClick?: () => void;
}

const BookCard = ({ book, onClick }: Props) => {
  return (
    <Box
      bg="gray.800"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="lg"
      _hover={{ transform: onClick ? "scale(1.04)" : "none" }}
      transition="0.2s"
      cursor={onClick ? "pointer" : "default"}
    >
      <Image
        src={book.cover || "https://via.placeholder.com/200x300?text=No+Cover"}
        alt={book.title}
        h={{ base: "200px", sm: "220px", md: "260px" }}
        w="100%"
        objectFit="cover"
      />

      <Stack p={3}>
        <Heading size="sm" noOfLines={2}>
          {book.title}
        </Heading>

        <Text fontSize={{ base: "xs", sm: "sm" }} color="gray.400">
          {book.authors.join(", ")}
        </Text>

        <Text fontSize="xs" color="gray.500">
          {book.year}
        </Text>
      </Stack>
    </Box>
  );
};

export default BookCard;
