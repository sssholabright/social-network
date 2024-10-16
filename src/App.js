import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Box, ChakraProvider, Flex } from '@chakra-ui/react'
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import Home from './pages/Home'
import theme from './styles/theme'
import Footer from './components/layout/Footer'
import LoginForm from './components/forms/LoginForm'
import RegisterForm from './components/forms/RegisterForm'
import { AuthProvider, useAuth } from './hooks/useAuth'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>;

  if (user) return <Navigate to="/" replace />;

  return children;
}

function AppContent() {
  const { user } = useAuth()

  return (
    <Flex flexDirection="column" minHeight="100vh">
      <Header />
      <Flex flex="1" pt="60px">
        {user && <Sidebar />}
        <Box flex="1" ml={user ? { base: '60px', md: '200px' } : 0} p={4}>
          <Routes>
            <Route path="/login" element={
              <PublicRoute>
                <LoginForm />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <RegisterForm />
              </PublicRoute>
            } />
            <Route path="/" element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            } />
          </Routes>
        </Box>
      </Flex>
      <Footer />
    </Flex>
  )
}

export default function App() {

  return (
     <ChakraProvider theme={theme}>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ChakraProvider>
  )
}