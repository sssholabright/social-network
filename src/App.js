import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { Box, ChakraProvider, Flex, Spinner } from '@chakra-ui/react'
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import Home from './pages/Home'
import theme from './styles/theme'
import Footer from './components/layout/Footer'
import LoginForm from './components/forms/LoginForm'
import RegisterForm from './components/forms/RegisterForm'
import Profile from './pages/Profile'
import { useAuthStore } from './store/authStore'
import Friends from './pages/Friends'
import Messages from './pages/Messages'

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  if (isLoading) return <Spinner />;
  return isAuthenticated ? children : <Navigate to="/login" />;
}

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  if (isLoading) return <Spinner />;
  return !isAuthenticated ? children : <Navigate to="/" replace />;
}

const ProfileWrapper = () => {
  const { userId } = useParams();
  console.log('profile userId', userId)
  return <Profile userId={userId} />;
}

export default function App() {
    const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

    useEffect(() => {
        checkAuth() 
    }, [checkAuth]);

    if (isLoading) return <Spinner />;

    return (
      <ChakraProvider theme={theme}>
        <Router>
          <Flex flexDirection="column" minHeight="100vh">
            <Header />
            <Flex flex="1" pt="60px">
              {isAuthenticated && <Sidebar />}
              <Box flex="1" ml={isAuthenticated ? { base: '60px', md: '200px' } : 0} p={4}>
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
                  <Route path="/profile/:userId" element={
                    <PrivateRoute>
                      <ProfileWrapper />
                    </PrivateRoute>
                  } />
                  <Route path="/friends" element={
                    <PrivateRoute>
                      <Friends />
                    </PrivateRoute>
                  } />
                  <Route path="/messages" element={
                    <PrivateRoute>
                      <Messages />
                    </PrivateRoute>
                  } />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Box>
            </Flex>
            <Footer />
          </Flex>
        </Router>
      </ChakraProvider>
    )
}