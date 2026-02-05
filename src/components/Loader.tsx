import { Center, Spinner } from "@chakra-ui/react";

const Loader = () => {
  return (
    <Center minH="60vh">
      <Spinner size="xl" thickness="4px" />
    </Center>
  );
};

export default Loader;
