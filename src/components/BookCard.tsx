import { Box, Image, Stack, Text, Heading, IconButton } from "@chakra-ui/react";
import { StarIcon } from "@chakra-ui/icons";

interface Props {
  bookKey: string;
  title: string;
  author?: string;
  cover?: number | null;
  year?: number | string;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
  onClick: () => void;
}

const BookCard = ({
  title,
  author,
  cover,
  year,
  isFavorite = false,
  onFavoriteToggle,
  onClick,
}: Props) => {
  const coverUrl = cover
    ? `https://covers.openlibrary.org/b/id/${cover}-M.jpg`
    : `https://via.placeholder.com/200x300?text=No+Cover`;

  return (
    <Box
      bg="gray.800"
      borderRadius="xl"
      overflow="hidden"
      boxShadow="lg"
      transition="0.25s"
      _hover={{ transform: "translateY(-6px) scale(1.02)" }}
      cursor="pointer"
      position="relative"
      onClick={onClick}
    >
      <Image
        src={coverUrl}
        alt={title}
        w="100%"
        h={{ base: "180px", sm: "220px", md: "260px", lg: "300px" }}
        objectFit="cover"
      />

      {/* Favorite button */}
      {onFavoriteToggle && (
        <IconButton
          icon={<StarIcon />}
          aria-label="Favorite"
          size="sm"
          position="absolute"
          top="2"
          right="2"
          borderRadius="full"
          colorScheme={isFavorite ? "yellow" : "gray"}
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle();
          }}
        />
      )}

      <Stack spacing={1} p={{ base: 2, md: 3 }}>
        <Heading fontSize={{ base: "sm", md: "md" }} noOfLines={2}>
          {title}
        </Heading>

        <Text fontSize={{ base: "xs", md: "sm" }} color="gray.400" noOfLines={1}>
          {author}
        </Text>

        <Text fontSize="xs" color="gray.500">
          {year ?? "—"}
        </Text>
      </Stack>
    </Box>
  );
};

export default BookCard;
