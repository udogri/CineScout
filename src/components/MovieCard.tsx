import { Box, Image, Text, Stack, HStack } from "@chakra-ui/react";

interface MovieCardProps {
  title: string;
  poster: string;
  rating: number;
  releaseDate: string;
  onClick?: () => void;
}

const MovieCard = ({ title, poster, rating, releaseDate, onClick }: MovieCardProps) => {
  return (
    <Box
      onClick={onClick}
      cursor={onClick ? "pointer" : "default"}
      position="relative"
      overflow="hidden"
      borderRadius="none"
      bg="#0E0E10"
      border="1px solid rgba(255,255,255,0.05)"
      role="group"
      transition="all 0.35s cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={{
        transform: "translateY(-8px)",
        boxShadow: "0 24px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(212,175,55,0.25)",
        borderColor: "rgba(212,175,55,0.25)",
      }}
    >
      {/* Poster */}
      <Box overflow="hidden" position="relative">
        <Image
          src={poster}
          alt={title}
          w="100%"
          h={{ base: "260px", sm: "300px", md: "340px" }}
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
          h="60%"
          bg="linear-gradient(to top, rgba(14,14,16,1) 0%, transparent 100%)"
        />
        {/* Rating badge - top right */}
        <Box position="absolute" top={3} right={3}>
          <HStack
            spacing={1}
            bg="rgba(8,8,10,0.85)"
            backdropFilter="blur(8px)"
            px={2}
            py={1}
            border="1px solid rgba(212,175,55,0.3)"
          >
            <Text fontSize="9px" color="#D4AF37">★</Text>
            <Text fontSize="10px" letterSpacing="0.05em" color="white" fontWeight="600">
              {rating.toFixed(1)}
            </Text>
          </HStack>
        </Box>
      </Box>

      {/* Info */}
      <Stack spacing={1} px={3} py={3} mt={-2}>
        <Text
          fontFamily="'Georgia', serif"
          fontWeight="400"
          fontSize="sm"
          color="white"
          noOfLines={1}
          letterSpacing="0.01em"
        >
          {title}
        </Text>
        <Text
          fontSize="10px"
          letterSpacing="0.15em"
          textTransform="uppercase"
          color="gray.600"
        >
          {releaseDate?.slice(0, 4) ?? "—"}
        </Text>
      </Stack>
    </Box>
  );
};

export default MovieCard;