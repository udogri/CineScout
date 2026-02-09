import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
    ModalCloseButton,
    Image,
    Heading,
    Text,
    Badge,
    Stack,
    Box,
    Spinner,
    Center,
  } from "@chakra-ui/react";
  import { useEffect, useState } from "react";
  import { getMovieDetails } from "../services/movieApi";
  import { getPosterUrl } from "../utils/image"; 
  
  interface Props {
    isOpen: boolean;
    onClose: () => void;
    movieId: number | null;
  }
  
  const MovieModal = ({ isOpen, onClose, movieId }: Props) => {
    interface Movie {
      backdrop_path: string;
      title: string;
      vote_average: number;
      release_date: string;
      runtime: number;
      overview: string;
      videos?: {
        results: { type: string; site: string; key: string }[];
      };
    }
  
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
        (vid) =>
          vid.site === "YouTube" &&
          (vid.type === "Trailer" ||
           vid.type === "Teaser"
        //    vid.name.toLowerCase().includes("trailer")
        )
      );
      
  
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered>
        <ModalOverlay />
        <ModalContent bg="gray.900">
          <ModalCloseButton />
  
          <ModalBody p={6}>
            {loading || !movie ? (
              <Center h="400px">
                <Spinner size="xl" />
              </Center>
            ) : (
              <Stack spacing={4}>
                <Image
                  src={getPosterUrl(movie.backdrop_path)}
                  borderRadius="md"
                />
  
                <Heading>{movie.title}</Heading>
  
                <Stack direction="row" spacing={3}>
                  <Badge colorScheme="yellow">
                    ⭐ {movie.vote_average.toFixed(1)}
                  </Badge>
  
                  <Badge colorScheme="blue">
                    {movie.release_date?.slice(0, 4)}
                  </Badge>
  
                  <Badge colorScheme="purple">
                    {movie.runtime} min
                  </Badge>
                </Stack>
  
                <Text color="gray.300">{movie.overview}</Text>
  
                {trailer && (
                  <Box pt={4}>
                    <Heading size="md" mb={2}>
                      Trailer
                    </Heading>
  
                    <Box
                      as="iframe"
                      width="100%"
                      height="400px"
                      src={`https://www.youtube.com/embed/${trailer.key}`}
                      borderRadius="md"
                      allowFullScreen
                    />
                  </Box>
                )}
              </Stack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  };
  
  export default MovieModal;
  