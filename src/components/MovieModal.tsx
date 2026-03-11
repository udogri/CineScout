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
  Divider,
  Link,
  SimpleGrid,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
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
  imdb_id?: string;
  genres?: { id: number; name: string }[];
  videos?: {
    results: { type: string; site: string; key: string }[];
  };
}

// ── Google search query builder ───────────────────────────────────────────

const googleSearch = (title: string, suffix: string) =>
  `https://www.google.com/search?q=${encodeURIComponent(`${title} ${suffix}`)}`;

// ── Watch/download buttons config ─────────────────────────────────────────

interface ActionLink {
  label: string;
  sublabel: string;
  query: string; // Google search suffix
  accent: string;
  borderColor: string;
  bg: string;
  hoverBg: string;
  hoverBorder: string;
}

const buildActionLinks = (): ActionLink[] => [
  {
    label: "Stream Online",
    sublabel: "Find where to watch free or subscription",
    query: `watch online streaming`,
    accent: "#D4AF37",
    borderColor: "rgba(212,175,55,0.2)",
    bg: "rgba(212,175,55,0.04)",
    hoverBg: "rgba(212,175,55,0.1)",
    hoverBorder: "rgba(212,175,55,0.5)",
  },
  
  
  {
    label: "Netflix",
    sublabel: "Search on Netflix",
    query: `Netflix`,
    accent: "#ef4444",
    borderColor: "rgba(239,68,68,0.2)",
    bg: "rgba(239,68,68,0.03)",
    hoverBg: "rgba(239,68,68,0.08)",
    hoverBorder: "rgba(239,68,68,0.4)",
  },
  {
    label: "Prime Video",
    sublabel: "Search on Amazon Prime",
    query: `Amazon Prime Video`,
    accent: "#38bdf8",
    borderColor: "rgba(56,189,248,0.2)",
    bg: "rgba(56,189,248,0.03)",
    hoverBg: "rgba(56,189,248,0.08)",
    hoverBorder: "rgba(56,189,248,0.4)",
  },
  
  {
    label: "Download",
    sublabel: "Legal digital download options",
    query: `download digital buy HD`,
    accent: "#a78bfa",
    borderColor: "rgba(167,139,250,0.2)",
    bg: "rgba(167,139,250,0.03)",
    hoverBg: "rgba(167,139,250,0.08)",
    hoverBorder: "rgba(167,139,250,0.4)",
  },
  
];

// ── Component ─────────────────────────────────────────────────────────────

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

  const actionLinks = movie ? buildActionLinks(movie.title, movie.imdb_id) : [];

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
        <ModalCloseButton color="gray.500" _hover={{ color: "#D4AF37" }} top={4} right={4} zIndex={10} />

        <ModalBody p={0}>
          {loading || !movie ? (
            <Center h="400px">
              <Box display="flex" gap="6px">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Box
                    key={i}
                    w="3px"
                    h="24px"
                    bg="#D4AF37"
                    style={{ animation: "cinePulse 1.2s ease-in-out infinite", animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </Box>
            </Center>
          ) : (
            <Box>
              {/* ── Backdrop ── */}
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

                {/* ── Title ── */}
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

                {/* ── Meta row ── */}
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

                {/* ── Genres ── */}
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

                {/* ── Overview ── */}
                <Text fontSize="sm" color="gray.400" lineHeight="1.8">
                  {movie.overview}
                </Text>

                {/* ── Trailer ── */}
                {trailer && (
                  <Box mt={7}>
                    <HStack spacing={3} mb={4}>
                      <Box w="3px" h="16px" bg="#D4AF37" borderRadius="1px" />
                      <Text fontSize="10px" letterSpacing="0.25em" textTransform="uppercase" color="gray.400" fontWeight="600">
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

                {/* ── Where to watch — BELOW trailer ── */}
                <Box mt={8}>
                  <Divider borderColor="rgba(255,255,255,0.06)" mb={6} />

                  <HStack spacing={3} mb={2}>
                    <Box w="3px" h="16px" bg="#D4AF37" borderRadius="1px" />
                    <Text fontSize="10px" letterSpacing="0.25em" textTransform="uppercase" color="gray.400" fontWeight="600">
                      Watch or Download
                    </Text>
                  </HStack>

                  <Text fontSize="xs" color="gray.700" mb={5} lineHeight="1.7">
                    Each button searches Google for that platform — results reflect real-time
                    availability in your region.
                  </Text>

                  <SimpleGrid columns={{ base: 2, sm: 2, md: 4 }} spacing={3}>
                    {actionLinks.map((link) => (
                      <Link
                        key={link.label}
                        href={googleSearch(movie.title, link.query)}
                        isExternal
                        _hover={{ textDecoration: "none" }}
                      >
                        <Box
                          px={3}
                          py={4}
                          border="1px solid"
                          borderColor={link.borderColor}
                          bg={link.bg}
                          display="flex"
                          flexDirection="column"
                          gap="6px"
                          transition="all 0.2s"
                          h="100%"
                          role="group"
                          _hover={{ bg: link.hoverBg, borderColor: link.hoverBorder }}
                        >
                          <HStack justify="space-between" align="start">
                            <Box
                              w="7px"
                              h="7px"
                              borderRadius="full"
                              bg={link.accent}
                              mt="2px"
                              flexShrink={0}
                            />
                            <ExternalLinkIcon
                              boxSize="10px"
                              color="gray.700"
                              transition="color 0.2s"
                              sx={{ "& [role=group]:hover &": { color: link.accent } }}
                            />
                          </HStack>
                          <Text
                            fontSize="xs"
                            fontWeight="600"
                            color="white"
                            letterSpacing="0.02em"
                            lineHeight="1.3"
                          >
                            {link.label}
                          </Text>
                          <Text
                            fontSize="9px"
                            letterSpacing="0.08em"
                            color="gray.600"
                            lineHeight="1.4"
                          >
                            {link.sublabel}
                          </Text>
                        </Box>
                      </Link>
                    ))}
                  </SimpleGrid>
                </Box>

              </Box>
            </Box>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default MovieModal;