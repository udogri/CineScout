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
    : `https://via.placeholder.com/200x300/0E0E10/333?text=No+Cover`;

  return (
    <Box
      bg="#0E0E10"
      border="1px solid rgba(255,255,255,0.05)"
      overflow="hidden"
      position="relative"
      cursor="pointer"
      role="group"
      onClick={onClick}
      transition="all 0.35s cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={{
        transform: "translateY(-8px)",
        boxShadow: "0 24px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(212,175,55,0.25)",
        borderColor: "rgba(212,175,55,0.25)",
      }}
    >
      <Box position="relative" overflow="hidden">
        <Image
          src={coverUrl}
          alt={title}
          w="100%"
          h={{ base: "220px", md: "280px", lg: "320px" }}
          objectFit="cover"
          transition="transform 0.5s ease"
          _groupHover={{ transform: "scale(1.04)" }}
        />
        {/* Gradient overlay */}
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          h="50%"
          bg="linear-gradient(to top, rgba(14,14,16,0.95) 0%, transparent 100%)"
        />

        {/* Favorite button */}
        {onFavoriteToggle && (
          <IconButton
            icon={<StarIcon />}
            aria-label="Favorite"
            size="xs"
            position="absolute"
            top="2"
            right="2"
            borderRadius="none"
            bg="rgba(8,8,10,0.85)"
            backdropFilter="blur(8px)"
            border="1px solid"
            borderColor={isFavorite ? "rgba(212,175,55,0.5)" : "rgba(255,255,255,0.1)"}
            color={isFavorite ? "#D4AF37" : "gray.500"}
            _hover={{
              bg: "rgba(212,175,55,0.15)",
              borderColor: "#D4AF37",
              color: "#D4AF37",
            }}
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle();
            }}
          />
        )}
      </Box>

      <Stack spacing={0.5} px={3} py={3} mt={-1}>
        <Heading
          fontFamily="'Georgia', serif"
          fontWeight="400"
          fontSize={{ base: "sm", md: "sm" }}
          letterSpacing="0.01em"
          noOfLines={2}
          color="white"
        >
          {title}
        </Heading>
        <Text
          fontSize="10px"
          letterSpacing="0.1em"
          textTransform="uppercase"
          color="gray.500"
          noOfLines={1}
          mt={1}
        >
          {author}
        </Text>
        <Text fontSize="9px" letterSpacing="0.15em" color="rgba(212,175,55,0.5)">
          {year ?? "—"}
        </Text>
      </Stack>
    </Box>
  );
};

export default BookCard;