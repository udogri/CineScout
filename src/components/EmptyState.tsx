import { Center, VStack, Text, Box } from "@chakra-ui/react";

interface EmptyStateProps {
  message?: string;
  icon?: string;
}

const EmptyState = ({
  message = "Nothing to show yet",
  icon = "◈",
}: EmptyStateProps) => {
  return (
    <Center minH="50vh">
      <VStack spacing={4}>
        <Box
          w="60px"
          h="60px"
          border="1px solid rgba(212,175,55,0.2)"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize="xl" color="rgba(212,175,55,0.4)">
            {icon}
          </Text>
        </Box>
        <Text
          fontSize="10px"
          letterSpacing="0.3em"
          textTransform="uppercase"
          color="gray.600"
        >
          {message}
        </Text>
      </VStack>
    </Center>
  );
};

export default EmptyState;