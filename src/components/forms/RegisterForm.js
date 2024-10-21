import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, FormControl, FormLabel, Input, VStack, Text, Link } from '@chakra-ui/react';
import { useAuthStore } from '../../store/authStore';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';

export default function RegisterForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const { register, error } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      const user = await register(email, password);
      if (user) {
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          uid: auth.currentUser.uid,
          username: username,
          email: email, 
          profilePicture: null,
          bio: '',
          followers: [],
          following: [],
        });
        console.log('user saved');
      }
    } catch (err) {
      console.error('RegisterForm error', err);
      setErrors({ error: err.message });
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
            {errors.username && <Text color="red.500">{errors.username}</Text>}
          </FormControl>
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
            {errors.email && <Text color="red.500">{errors.email}</Text>}
          </FormControl>
          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
            {errors.password && <Text color="red.500">{errors.password}</Text>}
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