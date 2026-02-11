import { Tabs, TabList, TabPanels, Tab, TabPanel, Text, Box, Container, HStack, useBreakpointValue } from "@chakra-ui/react";
import Movies from "./pages/Movies";
import Books from "./pages/Books";
import Navbar from "./components/Navbar";

const App = () => {
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Box minH="100vh" bg="gray.950" color="white">
      {/* HEADER */}
      <Navbar />

      {/* CONTENT */}
      <Container maxW="7xl" py={{ base: 4, md: 6 }}>
        <Tabs
          variant="soft-rounded"
          colorScheme="purple"
          isFitted={!isMobile}
          isLazy
        >
          <TabList
            gap={2}
            overflowX="auto"
            pb={2}
            css={{ scrollbarWidth: "none" }}
          >
            <Tab flexShrink={0}>
              <HStack spacing={2}>
                <Text display={{ base: "none", sm: "block" }}>Movies</Text>
              </HStack>
            </Tab>

            <Tab flexShrink={0}>
              <HStack spacing={2}>
                <Text display={{ base: "none", sm: "block" }}>Books</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels mt={4}>
            <TabPanel px={0}>
              <Movies />
            </TabPanel>
            <TabPanel px={0}>
              <Books />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Box>
  );
};

export default App;
