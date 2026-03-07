import { Box, Flex, HStack, VStack, Text, Link, Divider, Spacer } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

const NAV_LINKS = [
  { label: "Movies", path: "/movies" },
  { label: "Books", path: "/books" },
  { label: "Favorites", path: "/favorites" },
];

const CREDITS = [
  { label: "TMDB", href: "https://www.themoviedb.org" },
  { label: "Open Library", href: "https://openlibrary.org" },
];

const Footer = () => {
  return (
    <Box
      as="footer"
      bg="rgba(8, 8, 10, 0.95)"
      borderTop="1px solid rgba(212, 175, 55, 0.1)"
      px={{ base: 6, md: 12 }}
      py={10}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")",
      }}
    >
      <Box maxW="1400px" mx="auto">
        {/* Top row */}
        <Flex
          direction={{ base: "column", md: "row" }}
          align={{ base: "start", md: "center" }}
          gap={8}
          mb={8}
        >
          {/* Logo */}
          <RouterLink to="/">
            <HStack spacing={2} _hover={{ opacity: 0.8 }} transition="0.2s">
              <Box
                w="5px"
                h="22px"
                bg="linear-gradient(to bottom, #D4AF37, #B8860B)"
                borderRadius="1px"
              />
              <Text
                fontFamily="'Georgia', serif"
                fontSize="md"
                letterSpacing="0.12em"
                textTransform="uppercase"
                color="white"
              >
                Cine
                <Box as="span" color="#D4AF37">
                  Scout
                </Box>
              </Text>
              <Text fontSize="11px">
                Powered by
                <Box as="span" color="#D4AF37">
                {" "}Oruaro
                </Box>
                </Text>
            </HStack>
          </RouterLink>

          <Spacer />

          {/* Nav links */}
          <HStack spacing={6}>
            {NAV_LINKS.map((link) => (
              <RouterLink to={link.path} key={link.path}>
                <Text
                  fontSize="10px"
                  letterSpacing="0.2em"
                  textTransform="uppercase"
                  color="gray.500"
                  _hover={{ color: "#D4AF37" }}
                  transition="color 0.2s"
                >
                  {link.label}
                </Text>
              </RouterLink>
            ))}
          </HStack>
        </Flex>

        <Divider borderColor="rgba(255,255,255,0.05)" mb={6} />

        {/* Bottom row */}
        <Flex
          direction={{ base: "column", sm: "row" }}
          align={{ base: "start", sm: "center" }}
          gap={3}
        >
          <Text fontSize="10px" letterSpacing="0.1em" color="gray.700">
            © {new Date().getFullYear()} CineScout. All rights reserved.
          </Text>

          <Spacer />

          <HStack spacing={1}>
            <Text fontSize="10px" letterSpacing="0.1em" color="gray.700">
              Data sourced from
            </Text>
            {CREDITS.map((credit, i) => (
              <HStack spacing={1} key={credit.label}>
                {i > 0 && (
                  <Text fontSize="10px" color="gray.700">&amp;</Text>
                )}
                <Link
                  href={credit.href}
                  isExternal
                  fontSize="10px"
                  letterSpacing="0.1em"
                  color="rgba(212,175,55,0.5)"
                  _hover={{ color: "#D4AF37", textDecoration: "none" }}
                  transition="color 0.2s"
                >
                  {credit.label}
                </Link>
              </HStack>
            ))}
          </HStack>
        </Flex>
      </Box>
    </Box>
  );
};

export default Footer;