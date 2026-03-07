import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Image,
  Text,
  Box,
  Center,
  HStack,
  VStack,
  Divider,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { getMovieDetails } from "../services/movieApi";
import { getPosterUrl } from "../utils/image";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  movieId: number | null;
}

interface Movie {
  backdrop_path: string;
  title: string;
  vote_average: number;
  release_date: string;
  runtime: number;
  overview: string;
  genres?: { id: number; name: string }[];
  videos?: {
    results: { type: string; site: string; key: string }[];
  };
}

const MovieModal = ({ isOpen, onClose, movieId }: Props) => {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!movieId) return;
    const fetchDetails = async () => {
      setLoading(true);
      const data = await getMovieDetails(movieId);
      setMovie(data);
      setLoading(false);
    };
    fetchDetails();
  }, [movieId]);

  const trailer = movie?.videos?.results?.find(
    (vid) => vid.site === "YouTube" && (vid.type === "Trailer" || vid.type === "Teaser")
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered scrollBehavior="inside">
      <ModalOverlay bg="rgba(0,0,0,0.88)" backdropFilter="blur(12px)" />
      <ModalContent
        bg="#0A0A0C"
        border="1px solid rgba(212,175,55,0.12)"
        borderRadius="none"
        overflow="hidden"
        maxH="90vh"
      >
        <ModalCloseButton
          color="gray.500"
          _hover={{ color: "#D4AF37" }}
          top={4}
          right={4}
          zIndex={10}
        />

        <ModalBody p={0}>
          {loading || !movie ? (
            <Center h="400px">
              <VStack spacing={4}>
                <Box display="flex" gap="6px">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Box
                      key={i}
                      w="3px"
                      h="24px"
                      bg="#D4AF37"
                      style={{
                        animation: `cinePulse 1.2s ease-in-out infinite`,
                        animationDelay: `${i * 0.15}s`,
                      }}
                    />
                  ))}
                </Box>
              </VStack>
            </Center>
          ) : (
            <Box>
              {/* Backdrop */}
              <Box position="relative">
                <Image
                  src={getPosterUrl(movie.backdrop_path)}
                  w="100%"
                  h={{ base: "200px", md: "300px" }}
                  objectFit="cover"
                />
                <Box
                  position="absolute"
                  inset={0}
                  bg="linear-gradient(to bottom, transparent 0%, rgba(10,10,12,0.6) 60%, rgba(10,10,12,1) 100%)"
                />
              </Box>

              <Box px={{ base: 5, md: 8 }} pb={8} mt={-6} position="relative">
                {/* Title block */}
                <Text
                  fontFamily="'Georgia', serif"
                  fontSize={{ base: "xl", md: "3xl" }}
                  fontWeight="400"
                  color="white"
                  letterSpacing="-0.01em"
                  mb={3}
                >
                  {movie.title}
                </Text>

                {/* Meta row */}
                <HStack spacing={4} mb={4} flexWrap="wrap">
                  <HStack spacing={1}>
                    <Text fontSize="10px" color="#D4AF37">★</Text>
                    <Text fontSize="xs" color="#D4AF37" fontWeight="600">
                      {movie.vote_average.toFixed(1)}
                    </Text>
                  </HStack>
                  <Box w="1px" h="12px" bg="rgba(255,255,255,0.1)" />
                  <Text fontSize="10px" letterSpacing="0.15em" color="gray.500" textTransform="uppercase">
                    {movie.release_date?.slice(0, 4)}
                  </Text>
                  <Box w="1px" h="12px" bg="rgba(255,255,255,0.1)" />
                  <Text fontSize="10px" letterSpacing="0.15em" color="gray.500" textTransform="uppercase">
                    {movie.runtime} min
                  </Text>
                </HStack>

                {/* Genres */}
                {movie.genres && movie.genres.length > 0 && (
                  <HStack spacing={2} mb={5} flexWrap="wrap">
                    {movie.genres.map((g) => (
                      <Box
                        key={g.id}
                        px={3}
                        py={1}
                        border="1px solid rgba(212,175,55,0.2)"
                        bg="rgba(212,175,55,0.05)"
                      >
                        <Text fontSize="9px" letterSpacing="0.2em" textTransform="uppercase" color="rgba(212,175,55,0.7)">
                          {g.name}
                        </Text>
                      </Box>
                    ))}
                  </HStack>
                )}

                <Divider borderColor="rgba(255,255,255,0.06)" mb={5} />

                <Text fontSize="sm" color="gray.400" lineHeight="1.8">
                  {movie.overview}
                </Text>

                {/* Trailer */}
                {trailer && (
                  <Box mt={7}>
                    <HStack spacing={3} mb={4}>
                      <Box w="3px" h="16px" bg="#D4AF37" borderRadius="1px" />
                      <Text
                        fontSize="10px"
                        letterSpacing="0.25em"
                        textTransform="uppercase"
                        color="gray.400"
                        fontWeight="600"
                      >
                        Official Trailer
                      </Text>
                    </HStack>
                    <Box
                      as="iframe"
                      width="100%"
                      height={{ base: "220px", md: "360px" }}
                      src={`https://www.youtube.com/embed/${trailer.key}`}
                      border="1px solid rgba(212,175,55,0.1)"
                      allowFullScreen
                    />
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default MovieModal;