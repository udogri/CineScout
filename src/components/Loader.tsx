import { Center, VStack, Box, Text } from "@chakra-ui/react";

const pulse = `
  @keyframes cinePulse {
    0%, 100% { opacity: 0.2; transform: scaleX(0.3); }
    50%       { opacity: 1;   transform: scaleX(1); }
  }
`;

const Loader = () => {
  return (
    <>
      <style>{pulse}</style>
      <Center minH="60vh">
        <VStack spacing={5}>
          {/* Film-strip inspired loader */}
          <Box display="flex" gap="6px" alignItems="center">
            {[0, 1, 2, 3, 4].map((i) => (
              <Box
                key={i}
                w="3px"
                h="28px"
                bg="#D4AF37"
                borderRadius="1px"
                style={{
                  animation: `cinePulse 1.2s ease-in-out infinite`,
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </Box>
          <Text
            fontSize="9px"
            letterSpacing="0.35em"
            textTransform="uppercase"
            color="gray.700"
          >
            Loading
          </Text>
        </VStack>
      </Center>
    </>
  );
};

export default Loader;