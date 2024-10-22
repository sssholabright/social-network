import React, { useEffect } from 'react'
import { Box, Heading, Text, VStack, Spinner, Container, Avatar, Flex, useColorModeValue } from '@chakra-ui/react'
import PostForm from '../components/forms/PostForm'
import PostCard from '../components/common/PostCard'
import { useAuthStore } from '../store/authStore'
import { usePostStore } from '../store/postStore'
import { useProfileStore } from '../store/userStore'

export default function Home() {
  const { posts, fetchPosts, isLoading: postsLoading } = usePostStore()
  const { user } = useAuthStore()
  const { profile, fetchProfile, isLoading: profileLoading } = useProfileStore()

  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBgColor = useColorModeValue('white', 'gray.800')

  useEffect(() => {
    if (posts.length === 0) {
      fetchPosts()
    }
  }, [fetchPosts, posts.length])

  useEffect(() => {
    if (user && !profile) {
      fetchProfile(user.uid)
    }
  }, [user, profile, fetchProfile])

  if (postsLoading || profileLoading) return <Spinner size="xl" />

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="800px">
        <Flex align="center" mb={6}>
          <Avatar 
            size="lg" 
            name={profile?.username || user.email} 
            src={profile?.profile_picture} 
            mr={4}
          />
          <VStack align="start" spacing={1}>
            <Heading as="h1" size="lg">
              Welcome, {profile?.username || user.email}!
            </Heading>
            {profile?.bio && (
              <Text color="gray.500" fontSize="sm">
                {profile.bio}
              </Text>
            )}
          </VStack>
        </Flex>

        <Box bg={cardBgColor} p={6} borderRadius="md" boxShadow="md" mb={8}>
          <PostForm />
        </Box>

        <VStack spacing={4} align="stretch">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} bgColor={cardBgColor} />
          ))}
          {postsLoading && <Spinner />}
          {!postsLoading && posts.length > 0 && (
            <Text textAlign="center" mt={4}>No more posts to load.</Text>
          )}
          {!postsLoading && posts.length === 0 && (
            <Text textAlign="center" mt={4}>No Posts Yet. Be the first to create one!</Text>
          )}
        </VStack>
      </Container>
    </Box>
  )
}
