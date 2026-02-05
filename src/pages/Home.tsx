import { Box, Heading, Text, Button, Stack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <Box p={10} textAlign="center">
      <Stack spacing={4} align="center">
        <Heading>Welcome 🎬📚</Heading>
        <Text color="gray.500">
          Discover movies, search titles, and save your favorites.
        </Text>
        <Button colorScheme="blue" onClick={() => navigate("/movies")}>
          Explore Movies
        </Button>
      </Stack>
    </Box>
  );
};

export default Home;
