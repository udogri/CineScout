import {
    Box,
    Flex,
    Heading,
    Spacer,
    IconButton,
    useColorMode,
  } from "@chakra-ui/react";
  import { MoonIcon, SunIcon } from "@chakra-ui/icons";
  
  const Navbar = () => {
    const { colorMode, toggleColorMode } = useColorMode();
  
    return (
      <Box px={6} py={4} boxShadow="sm">
        <Flex align="center">
          <Heading size="md">🎬📚 Recommender</Heading>
          <Spacer />
          <IconButton
            aria-label="Toggle theme"
            onClick={toggleColorMode}
            icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
          />
        </Flex>
      </Box>
    );
  };
  
  export default Navbar;
  