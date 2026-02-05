import {
    Box,
    Image,
    Text,
    Stack,
    Badge,
  } from "@chakra-ui/react";
  
  interface BookCardProps {
    title: string;
    author: string;
    thumbnail?: string;
    publishedDate?: string;
  }
  
  const BookCard = ({
    title,
    author,
    thumbnail,
    publishedDate,
  }: BookCardProps) => {
    return (
      <Box
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        maxW="250px"
      >
        <Image
          src={thumbnail || "https://via.placeholder.com/250x350"}
          alt={title}
          h="350px"
          w="100%"
          objectFit="cover"
        />
  
        <Stack p={4} spacing={2}>
          <Text fontWeight="bold" noOfLines={2}>
            {title}
          </Text>
  
          <Text fontSize="sm" color="gray.500">
            {author}
          </Text>
  
          {publishedDate && (
            <Badge w="fit-content">{publishedDate}</Badge>
          )}
        </Stack>
      </Box>
    );
  };
  
  export default BookCard;
  