import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Box, Flex } from "@chakra-ui/react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Movies from "./pages/Movies";
import Books from "./pages/Books";
import Home from "./pages/Home";
import Favorites from "./pages/Favorites";

const App = () => {
  return (
    <BrowserRouter>
      <Flex direction="column" minH="100vh" bg="#08080A" color="white">
        <Navbar />
        <Box flex={1}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/books" element={<Books />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
        <Footer />
      </Flex>
    </BrowserRouter>
  );
};

export default App;