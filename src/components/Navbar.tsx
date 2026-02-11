import {
  Box,
  Flex,
  Heading,
  Spacer,
  IconButton,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  const bg = useColorModeValue("black", "gray.800");
  const border = useColorModeValue("gray.200", "gray.700");

  return (
    <Box
      px={6}
      py={4}
      bg={bg}
      borderBottom="1px solid"
      borderColor={border}
      position="sticky"
      top="0"
      zIndex="1000"
    >
      <Flex align="center">
        <Heading size="md" > CineScout</Heading>
        <Spacer />
        <IconButton
  aria-label="Toggle theme"
  onClick={toggleColorMode}
  icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
  variant="ghost"
  size="md"
/>


      </Flex>
    </Box>
  );
};

export default Navbar;
