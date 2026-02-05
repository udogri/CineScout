import { Center, Text } from "@chakra-ui/react";

interface EmptyStateProps {
  message?: string;
}

const EmptyState = ({ message = "Nothing to show yet 👀" }: EmptyStateProps) => {
  return (
    <Center minH="40vh">
      <Text fontSize="lg" color="gray.500">
        {message}
      </Text>
    </Center>
  );
};

export default EmptyState;
