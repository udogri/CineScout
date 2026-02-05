import {
    Box,
    Image,
    Text,
    Badge,
    Stack,
  } from "@chakra-ui/react";
  
  interface MovieCardProps {
    title: string;
    poster: string;
    rating: number;
    releaseDate: string;
  }
  
  const MovieCard = ({
    title,
    poster,
    rating,
    releaseDate,
  }: MovieCardProps) => {
    return (
      <Box
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        maxW="250px"
        _hover={{ transform: "scale(1.03)" }}
        transition="0.2s"
      >
        <Image
          src={poster}
          alt={title}
          h="350px"
          w="100%"
          objectFit="cover"
        />
  
        <Stack p={4} spacing={2}>
          <Text fontWeight="bold" noOfLines={1}>
            {title}
          </Text>
  
          <Text fontSize="sm" color="gray.500">
            {releaseDate}
          </Text>
  
          <Badge w="fit-content" colorScheme="green">
            ⭐ {rating}
          </Badge>
        </Stack>
      </Box>
    );
  };
  
  export default MovieCard;
  