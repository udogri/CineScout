import { Box, Heading, Text, Button, Stack, HStack, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { keyframes } from "@emotion/react";

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const Home = () => {
  const navigate = useNavigate();

  return (
    <Box
      minH="calc(100vh - 64px)"
      bg="#08080A"
      position="relative"
      overflow="hidden"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {/* Background radial glow */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w="800px"
        h="800px"
        bg="radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 65%)"
        pointerEvents="none"
      />

      {/* Grid lines decoration */}
      <Box
        position="absolute"
        inset={0}
        opacity={0.03}
        backgroundImage="linear-gradient(rgba(212,175,55,1) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,1) 1px, transparent 1px)"
        backgroundSize="80px 80px"
        pointerEvents="none"
      />

      <VStack
        spacing={0}
        textAlign="center"
        px={6}
        maxW="700px"
        animation={`${fadeUp} 0.9s ease both`}
      >
        {/* Eyebrow label */}
        <HStack spacing={3} mb={6}>
          <Box h="1px" w="40px" bg="rgba(212,175,55,0.5)" />
          <Text
            fontSize="10px"
            letterSpacing="0.3em"
            textTransform="uppercase"
            color="#D4AF37"
            fontFamily="'Georgia', serif"
          >
            Your Entertainment Hub
          </Text>
          <Box h="1px" w="40px" bg="rgba(212,175,55,0.5)" />
        </HStack>

        <Heading
          fontSize={{ base: "4xl", md: "6xl", lg: "7xl" }}
          fontFamily="'Georgia', serif"
          fontWeight="400"
          letterSpacing="-0.02em"
          lineHeight="1.05"
          color="white"
          mb={6}
        >
          Discover Stories
          <br />
          <Box
            as="span"
            bgGradient="linear(90deg, #D4AF37 0%, #F5E07A 40%, #D4AF37 80%)"
            backgroundSize="200% auto"
            bgClip="text"
            animation={`${shimmer} 4s linear infinite`}
          >
            Worth Exploring
          </Box>
        </Heading>

        <Text
          fontSize={{ base: "sm", md: "md" }}
          color="gray.500"
          maxW="460px"
          lineHeight="1.8"
          mb={10}
          letterSpacing="0.02em"
        >
          Browse thousands of films and books. Build your watchlist, track
          your favorites, and never miss a great story.
        </Text>

        <HStack spacing={4} flexWrap="wrap" justify="center">
          <Button
            onClick={() => navigate("/movies")}
            px={8}
            py={6}
            fontSize="xs"
            letterSpacing="0.2em"
            textTransform="uppercase"
            bg="#D4AF37"
            color="black"
            fontWeight="700"
            borderRadius="none"
            _hover={{ bg: "#F5E07A", transform: "translateY(-2px)" }}
            transition="all 0.2s"
          >
            Explore Movies
          </Button>
          <Button
            onClick={() => navigate("/books")}
            px={8}
            py={6}
            fontSize="xs"
            letterSpacing="0.2em"
            textTransform="uppercase"
            bg="transparent"
            color="white"
            fontWeight="400"
            borderRadius="none"
            border="1px solid rgba(255,255,255,0.2)"
            _hover={{
              borderColor: "#D4AF37",
              color: "#D4AF37",
              transform: "translateY(-2px)",
            }}
            transition="all 0.2s"
          >
            Browse Books
          </Button>
        </HStack>

        {/* Stats row */}
        <HStack spacing={10} mt={16} pt={10} borderTop="1px solid rgba(255,255,255,0.06)">
          {[
            { num: "10K+", label: "Films" },
            { num: "500K+", label: "Books" },
            { num: "∞", label: "Stories" },
          ].map(({ num, label }) => (
            <VStack spacing={0} key={label}>
              <Text
                fontSize="xl"
                fontFamily="'Georgia', serif"
                color="#D4AF37"
                fontWeight="400"
              >
                {num}
              </Text>
              <Text fontSize="9px" letterSpacing="0.25em" textTransform="uppercase" color="gray.600">
                {label}
              </Text>
            </VStack>
          ))}
        </HStack>
      </VStack>
    </Box>
  );
};

export default Home;