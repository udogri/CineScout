import { Box, Image, Text, Badge, Stack } from "@chakra-ui/react";

interface MovieCardProps {
  title: string;
  poster: string;
  rating: number;
  releaseDate: string;
}

const MovieCard = ({ title, poster, rating, releaseDate }: MovieCardProps) => {
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      maxW={{ base: "100%", sm: "200px", md: "220px", lg: "250px" }}
      _hover={{ transform: "scale(1.03)" }}
      transition="0.2s"
    >
      <Image
        src={poster}
        alt={title}
        h={{ base: "250px", sm: "280px", md: "320px", lg: "350px" }}
        w="100%"
        objectFit="cover"
      />

      <Stack p={{ base: 2, sm: 3, md: 4 }} spacing={{ base: 1, sm: 2 }}>
        <Text fontWeight="bold" fontSize={{ base: "sm", sm: "md" }} noOfLines={1}>
          {title}
        </Text>

        <Text fontSize={{ base: "xs", sm: "sm" }} color="gray.500">
          {releaseDate}
        </Text>

        <Badge
          w="fit-content"
          colorScheme="green"
          fontSize={{ base: "xs", sm: "sm" }}
        >
          ⭐ {rating}
        </Badge>
      </Stack>
    </Box>
  );
};

export default MovieCard;
