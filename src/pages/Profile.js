import React, { useEffect, useState, useCallback } from 'react';
import { Box, HStack, VStack, Avatar, Text, Heading, Button, useToast, Spinner, Tabs, TabList, Tab, TabPanels, TabPanel, SimpleGrid, Stat, StatLabel, StatNumber, Divider, useColorModeValue, Image, Container, Flex, useDisclosure } from '@chakra-ui/react';
import { FaUserFriends, FaImage, FaBookmark, FaEdit, FaUserPlus, FaUserMinus } from 'react-icons/fa';
import { useProfileStore } from '../store/userStore';
import { useAuthStore } from '../store/authStore';
import { useFriendStore } from '../store/friendStore';
import { useParams, Link } from 'react-router-dom';
import { usePostStore } from '../store/postStore';
import EditProfileModal from '../components/common/EditProfileModal';
import PostModal from '../components/common/PostModal';

export default function Profile() {
    const { userId } = useParams();
    const { profile, isLoading, error, fetchProfile, updateProfile } = useProfileStore();
    const { posts, isLoading: postsLoading, error: postsError, fetchPosts } = usePostStore();
    const { user, isLoading: authLoading } = useAuthStore();
    const { friends, sendFriendRequest, removeFriend, fetchFriends } = useFriendStore();
    const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();
    const { isOpen: isPostModalOpen, onOpen: onPostModalOpen, onClose: onPostModalClose } = useDisclosure();
    const [selectedPost, setSelectedPost] = useState(null);
    const toast = useToast();
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    useEffect(() => {
        if (userId && userId !== 'undefined') {
            fetchProfile(userId);
            fetchPosts(userId);
            fetchFriends(userId);
        }
    }, [userId, fetchProfile, fetchPosts, fetchFriends]);

    const handleEditProfile = async (updatedProfile) => {
        try {
            await updateProfile(userId, updatedProfile);
            onEditModalClose();
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

    const handleFriendAction = useCallback(async () => {
        if (!user) return;
        try {
            if (friends.some(friend => friend.friendId === userId)) {
                await removeFriend(user.uid, userId);
                toast({
                    title: 'Friend removed',
                    status: 'info',
                    duration: 3000,
                    isClosable: true,
                });
            } else {
                await sendFriendRequest(user.uid, userId, profile.username);
                toast({
                    title: 'Friend request sent',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
            }
            fetchFriends(user.uid);
        } catch (error) {
            toast({
                title: 'Error',
                description: error.message,
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    }, [user, userId, profile, friends, removeFriend, sendFriendRequest, fetchFriends, toast]);

    const openPostModal = (post) => {
        setSelectedPost(post);
        onPostModalOpen();
    };

    if (isLoading || authLoading || postsLoading) return <Spinner size="xl" />
    if (error) return <Text>Error: {error.message || JSON.stringify(error)}</Text>
    if (!profile) return <Text>Profile not found</Text>
    if (postsError) return <Text>Error: {postsError.message || JSON.stringify(postsError)}</Text>

    return (
        <Container maxW="container.xl" py={8}>
            <VStack spacing={8} align="stretch">
                <Box bg={bgColor} borderRadius="lg" p={6} boxShadow="md" borderWidth={1} borderColor={borderColor}>
                    <Flex direction={{ base: 'column', md: 'row' }} align="start" justify="space-between">
                        <HStack spacing={8} align="start" mb={{ base: 4, md: 0 }}>
                            <Avatar size="2xl" name={profile.username} src={profile.profile_picture} />
                            <VStack spacing={4} align="start">
                                <Heading as="h1" size="xl">{profile.username}</Heading>
                                <Text fontSize="lg" color="gray.500">@{profile.username}</Text>
                                <Text fontSize="md">{profile.bio}</Text>
                            </VStack>
                        </HStack>
                        <VStack>
                            {user && user.uid === profile.uid ? (
                                <Button leftIcon={<FaEdit />} onClick={onEditModalOpen} colorScheme="blue">Edit Profile</Button>
                            ) : (
                                <Button
                                    leftIcon={friends.some(friend => friend.friendId === userId) ? <FaUserMinus /> : <FaUserPlus />}
                                    onClick={handleFriendAction}
                                    colorScheme={friends.some(friend => friend.friendId === userId) ? "red" : "green"}
                                >
                                    {friends.some(friend => friend.friendId === userId) ? "Remove Friend" : "Add Friend"}
                                </Button>
                            )}
                        </VStack>
                    </Flex>
                    <Divider my={6} />
                    <Flex justify="space-around" wrap="wrap">
                        <Stat textAlign="center">
                            <StatLabel>Posts</StatLabel>
                            <StatNumber>{posts.filter(post => post.user === userId).length || 0}</StatNumber>
                        </Stat>
                        <Stat textAlign="center">
                            <StatLabel>Followers</StatLabel>
                            <StatNumber>{profile.followers?.length || 0}</StatNumber>
                        </Stat>
                        <Stat textAlign="center">
                            <StatLabel>Following</StatLabel>
                            <StatNumber>{profile.following?.length || 0}</StatNumber>
                        </Stat>
                    </Flex>
                </Box>

                <Tabs isFitted variant="enclosed">
                    <TabList mb="1em">
                        <Tab><FaImage /> Posts</Tab>
                        <Tab><FaUserFriends /> Friends</Tab>
                        <Tab><FaBookmark /> Saved</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
                                {posts.filter(post => post.user === userId).map((post) => (
                                    <Box key={post.id} onClick={() => openPostModal(post)} cursor="pointer">
                                        <Image src={post.image} alt={post.caption} objectFit="cover" w="100%" h="200px" borderRadius="md" />
                                    </Box>
                                ))}
                            </SimpleGrid>
                        </TabPanel>
                        <TabPanel>
                            <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
                                {friends.map((friend) => (
                                    <Box key={friend.id} p={4} borderWidth={1} borderRadius="lg" borderColor={borderColor}>
                                        <VStack>
                                            <Avatar size="lg" name={friend.username} src={friend.profilePicture} />
                                            <Text fontWeight="bold">{friend.username}</Text>
                                            <Button as={Link} to={`/profile/${friend.friendId}`} size="sm" colorScheme="blue">View Profile</Button>
                                        </VStack>
                                    </Box>
                                ))}
                            </SimpleGrid>
                        </TabPanel>
                        <TabPanel>
                            <Text>Saved posts coming soon...</Text>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </VStack>
            
            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={onEditModalClose}
                onSubmit={handleEditProfile}
                initialProfile={profile}
            />

            <PostModal
                isOpen={isPostModalOpen}
                onClose={onPostModalClose}
                post={selectedPost}
            />
        </Container>
    );
}
