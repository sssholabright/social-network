import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Box, ChakraProvider, Flex } from '@chakra-ui/react'
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import Home from './pages/Home'
import theme from './styles/theme'
import Footer from './components/layout/Footer'

export default function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Flex direction="column" minH="100vh">
          <Header />
          <Flex flex="1" pt="60px">
            <Sidebar />
            <Box flex="1" ml={{ base: '60px', md: '200px' }}>
              <Routes>
                <Route path="/" element={<Home />} />
              </Routes>
            </Box>
          </Flex>
          <Footer />
        </Flex>
      </Router>
    </ChakraProvider>
  )
}