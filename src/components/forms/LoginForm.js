import { Box, Button, FormControl, FormLabel, Input, Link, Text, VStack } from '@chakra-ui/react'
import React, { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function LoginForm() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        
        try {
            await login(username, password)
            navigate('/')
        } catch (error) {
            setError(error.message)
        }
    }

    return (
        <Box maxWidth="400px" margin="auto" mt={8}>
            <form onSubmit={handleSubmit}>
                <VStack spacing={4}>
                    <FormControl>
                        <FormLabel>Username</FormLabel>
                        <Input
                            type="text" 
                            name="username"
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
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
                    {error && <Text color="red.500">{error}</Text>}
                    <Button type="submit" colorScheme="blue" width="full">Login</Button>
                </VStack>
            </form>
            <Text mt={4}>
                Don't have an account? <Link as={RouterLink} to="/register" color="blue.500">Register here</Link>
            </Text>
        </Box>
    )
}
