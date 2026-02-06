import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import Movies from "./pages/Movies";
import Books from "./pages/Books";

const App = () => {
  return (
    <Tabs variant="soft-rounded" colorScheme="purple">
      <TabList justifyContent="center" mt={4}>
        <Tab>🎬 Movies</Tab>
        <Tab>📚 Books</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <Movies />
        </TabPanel>
        <TabPanel>
          <Books />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default App;
