import React, { useEffect, useState } from 'react';
import { Box, HStack, VStack, Avatar, Text, Heading, Button, useToast, Spinner, Tabs, TabList, Tab, TabPanels, TabPanel, Grid, Stat, StatLabel, StatNumber, Divider, useColorModeValue, Image } from '@chakra-ui/react';
import PostCard from '../components/common/PostCard';
import EditProfileModal from '../components/common/EditProfileModal';
import { useProfileStore } from '../store/userStore';
import { useAuthStore } from '../store/authStore';
import { useParams, Link } from 'react-router-dom';
import { FaUserFriends, FaImage, FaBookmark } from 'react-icons/fa';
import { usePostStore } from '../store/postStore';

export default function Profile() {
    const { userId } = useParams();
    const { profile, isLoading, error, fetchProfile, updateProfile } = useProfileStore();
    const { posts, isLoading: postsLoading, error: postsError, fetchPosts } = usePostStore();
    const { user, isLoading: authLoading } = useAuthStore();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const toast = useToast();
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    useEffect(() => {
        if (userId && userId !== 'undefined') {
            fetchProfile(userId);
            fetchPosts(userId);
        }
    }, [userId, fetchProfile, fetchPosts]);



    const handleEditProfile = async (updatedProfile) => {
        try {
            await updateProfile(userId, updatedProfile);
            setIsEditModalOpen(false);
            toast({
                title: 'Profile updated',
                description: 'Your profile has been updated successfully',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: 'Error updating profile',
                description: error.message,
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    if (isLoading || authLoading) return <Spinner size="xl" />
    if (error) return <Text>Error: {error.message || JSON.stringify(error)}</Text>
    if (!profile) return <Text>Profile not found</Text>
    if (postsError) return <Text>Error: {postsError.message || JSON.stringify(postsError)}</Text>
    if (postsLoading) return <Spinner size="xl" />


    return (
        <Box maxW="1000px" margin="0 auto" p={4}>
            <VStack spacing={8} align="stretch">
                <Box bg={bgColor} borderRadius="lg" p={6} boxShadow="md" borderWidth={1} borderColor={borderColor}>
                    <HStack spacing={8} align="start">
                        <Avatar size="2xl" name={profile.username} src={profile.profile_picture} />
                        <VStack spacing={4} align="start" flex={1}>
                            <HStack justify="space-between" width="100%">
                                <Heading as="h1" size="xl">{profile.username}</Heading>
                                {user && user.uid === profile.uid && (
                                    <Button onClick={() => setIsEditModalOpen(true)} colorScheme="blue">Edit Profile</Button>
                                )}
                            </HStack>
                            <Text fontSize="lg" color="gray.500">@{profile.username}</Text>
                            <Text fontSize="md">{profile.bio}</Text>
                            <HStack spacing={8}>
                                <Stat>
                                    <StatLabel>Posts</StatLabel>
                                    <StatNumber>{posts.filter(post => post.user === userId).length || 0}</StatNumber>
                                </Stat>
                                <Stat>
                                    <StatLabel>Followers</StatLabel>
                                    <StatNumber>{profile.followers?.length || 0}</StatNumber>
                                </Stat>
                                <Stat>
                                    <StatLabel>Following</StatLabel>
                                    <StatNumber>{profile.following?.length || 0}</StatNumber>
                                </Stat>
                            </HStack>
                        </VStack>
                    </HStack>
                </Box>

                <Tabs isFitted variant="enclosed">
                    <TabList mb="1em">
                        <Tab><FaImage /> Posts</Tab>
                        <Tab><FaUserFriends /> Friends</Tab>
                        <Tab><FaBookmark /> Saved</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                                {profile.posts && profile.posts.map((post) => (
                                    <Box key={post.id} as={Link} to={`/post/${post.id}`}>
                                        <Image src={post.image} alt={post.caption} objectFit="cover" w="100%" h="200px" />
                                    </Box>
                                ))}
                            </Grid>
                        </TabPanel>
                        <TabPanel>
                            <Text>Friends list coming soon...</Text>
                        </TabPanel>
                        <TabPanel>
                            <Text>Saved posts coming soon...</Text>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </VStack>
            
            {isEditModalOpen && (
                <EditProfileModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSubmit={handleEditProfile}
                    initialProfile={profile}
                />
            )}
        </Box>
    )
}