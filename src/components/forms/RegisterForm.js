import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Button, FormControl, FormLabel, Input, VStack, Text, Link } from '@chakra-ui/react';
import { useAuth } from '../../hooks/useAuth';

export default function RegisterForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const {register} = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(username, email, password);
      navigate('/');
    } catch (err) {
      setError('Failed to register. Please try again.');
    }
  };

  return (
    <Box maxWidth="400px" margin="auto" mt={8}>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl>
            <FormLabel>Username</FormLabel>
            <Input 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
          </FormControl>
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </FormControl>
          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </FormControl>
          {error && <Text color="red.500">{error}</Text>}
          <Button type="submit" colorScheme="blue" width="full">Register</Button>
        </VStack>
      </form>
      <Text mt={4}>
        Already have an account? <Link as={RouterLink} to="/login" color="blue.500">Login here</Link>
      </Text>
    </Box>
  );
}