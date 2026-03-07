import { useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Spacer,
  IconButton,
  HStack,
  Text,
  useColorMode,
  Collapse,
  VStack,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon, HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { Link, NavLink, useNavigate } from "react-router-dom";

const NAV_LINKS = [
  { label: "Movies", path: "/movies" },
  { label: "Books", path: "/books" },
  // { label: "Favorites", path: "/favorites" },
];

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")";

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleMobileNav = (path: string) => {
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <Box
      as="nav"
      position="sticky"
      top="0"
      zIndex="1000"
      bg="rgba(8, 8, 10, 0.96)"
      backdropFilter="blur(18px)"
      borderBottom="1px solid"
      borderColor="rgba(212, 175, 55, 0.15)"
      style={{ backgroundImage: GRAIN }}
    >
      {/* ── Main bar ── */}
      <Flex
        align="center"
        maxW="1400px"
        mx="auto"
        px={{ base: 5, md: 10 }}
        py={4}
      >
        {/* Logo */}
        <Link to="/" onClick={() => setMenuOpen(false)}>
          <HStack spacing={2} _hover={{ opacity: 0.85 }} transition="0.2s">
            <Box
              w="7px"
              h="28px"
              bg="linear-gradient(to bottom, #D4AF37, #B8860B)"
              borderRadius="2px"
            />
            <Heading
              size="md"
              letterSpacing="0.12em"
              fontFamily="'Georgia', serif"
              color="white"
              textTransform="uppercase"
            >
              Cine
              <Box as="span" color="#D4AF37">Scout</Box>
            </Heading>
          </HStack>
        </Link>

        <Spacer />

        {/* Desktop links */}
        <HStack spacing={1} mr={4} display={{ base: "none", md: "flex" }}>
          {NAV_LINKS.map((link) => (
            <NavLink to={link.path} key={link.path}>
              {({ isActive }) => (
                <Box
                  px={4}
                  py={2}
                  position="relative"
                  _hover={{ color: "#D4AF37" }}
                  transition="color 0.2s"
                >
                  <Text
                    fontSize="xs"
                    letterSpacing="0.15em"
                    textTransform="uppercase"
                    fontWeight={isActive ? "700" : "400"}
                    color={isActive ? "#D4AF37" : "gray.300"}
                  >
                    {link.label}
                  </Text>
                  {isActive && (
                    <Box
                      position="absolute"
                      bottom="0"
                      left="50%"
                      transform="translateX(-50%)"
                      w="20px"
                      h="1.5px"
                      bg="#D4AF37"
                      borderRadius="full"
                    />
                  )}
                </Box>
              )}
            </NavLink>
          ))}
        </HStack>

        {/* Theme toggle */}
        {/* <IconButton
          aria-label="Toggle theme"
          onClick={toggleColorMode}
          icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
          variant="ghost"
          size="sm"
          color="gray.400"
          _hover={{ color: "#D4AF37", bg: "rgba(212,175,55,0.08)" }}
        /> */}

        {/* Hamburger — mobile only */}
        <IconButton
          aria-label="Toggle menu"
          display={{ base: "flex", md: "none" }}
          ml={2}
          onClick={() => setMenuOpen((o) => !o)}
          icon={menuOpen ? <CloseIcon boxSize={3} /> : <HamburgerIcon boxSize={4} />}
          variant="ghost"
          size="sm"
          color={menuOpen ? "#D4AF37" : "gray.400"}
          _hover={{ color: "#D4AF37", bg: "rgba(212,175,55,0.08)" }}
        />
      </Flex>

      {/* ── Mobile drawer ── */}
      <Collapse in={menuOpen} animateOpacity>
        <Box
          borderTop="1px solid rgba(212,175,55,0.1)"
          bg="rgba(8,8,10,0.98)"
          style={{ backgroundImage: GRAIN }}
        >
          <VStack
            align="stretch"
            spacing={0}
            maxW="1400px"
            mx="auto"
            px={5}
            py={3}
          >
            {NAV_LINKS.map((link, i) => (
              <NavLink to={link.path} key={link.path}>
                {({ isActive }) => (
                  <Box
                    onClick={() => handleMobileNav(link.path)}
                    px={3}
                    py={4}
                    borderBottom={
                      i < NAV_LINKS.length - 1
                        ? "1px solid rgba(255,255,255,0.04)"
                        : "none"
                    }
                    cursor="pointer"
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    _hover={{ bg: "rgba(212,175,55,0.04)" }}
                    transition="background 0.15s"
                  >
                    <Text
                      fontSize="xs"
                      letterSpacing="0.2em"
                      textTransform="uppercase"
                      fontWeight={isActive ? "700" : "400"}
                      color={isActive ? "#D4AF37" : "gray.300"}
                    >
                      {link.label}
                    </Text>
                    {isActive && (
                      <Box
                        w="5px"
                        h="5px"
                        borderRadius="full"
                        bg="#D4AF37"
                      />
                    )}
                  </Box>
                )}
              </NavLink>
            ))}
          </VStack>
        </Box>
      </Collapse>
    </Box>
  );
};

export default Navbar;