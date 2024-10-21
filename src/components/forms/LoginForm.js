import { Box, Button, FormControl, FormLabel, Input, Link, Text, VStack } from '@chakra-ui/react'
import React, { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function LoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const { login } = useAuthStore()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        try {
            await login(email, password)
        } catch (error) {
            setError(error.message)
        }
    }

    return (
        <Box maxWidth="400px" margin="auto" mt={8}>
            <form onSubmit={handleSubmit}>
                <VStack spacing={4}>
                    <FormControl>
                        <FormLabel>Email</FormLabel>
                        <Input
                            type="text" 
                            name="email"
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel>Password</FormLabel>
                        <Input
                            type="password" 
                            name="password"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </FormControl>
                    {error && <Text color="red.500">{JSON.stringify(error)}</Text>}
                    <Button type="submit" colorScheme="blue" width="full">Login</Button>
                </VStack>
            </form>
            <Text mt={4}>
                Don't have an account? <Link as={RouterLink} to="/register" color="blue.500">Register here</Link>
            </Text>
        </Box>
    )
}
