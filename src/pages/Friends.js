import React, { useEffect, useState, useCallback } from 'react';
import { Box, VStack, HStack, Text, Avatar, Button, Input, InputGroup, InputLeftElement, Spinner, Tabs, TabList, Tab, TabPanels, TabPanel, useToast, Heading, useColorModeValue, Badge, IconButton, Tooltip } from '@chakra-ui/react';
import { FaSearch, FaUserPlus, FaUserFriends, FaUserMinus } from 'react-icons/fa';
import { useAuthStore } from '../store/authStore';
import { useFriendStore } from '../store/friendStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useProfileStore } from '../store/userStore';

const MotionBox = motion(Box);

export default function Friends() {
    const { user } = useAuthStore();
    const { friends, friendRequests, searchUsers, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend, isLoading, error } = useFriendStore();
    const { profile } = useProfileStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const toast = useToast();
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    const fetchFriendsData = useCallback(() => {
        if (user) {
            useFriendStore.getState().fetchFriends(user.uid);
            useFriendStore.getState().fetchFriendRequests(user.uid);
        }
    }, [user]);

    useEffect(() => {
        fetchFriendsData();
    }, [fetchFriendsData]);

    const handleSearch = async () => {
        if (searchQuery.trim()) {
            setIsSearching(true);
            try {
                const results = await searchUsers(searchQuery);
                setSearchResults(results);
            } catch (error) {
                toast({
                    title: "Error searching users",
                    description: error.message,
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            } finally {
                setIsSearching(false);
            }
        }
    };

    

    const handleSendRequest = async (friendId) => {
        try {
            await sendFriendRequest(user.uid, friendId, profile.username );
            toast({
                title: "Friend request sent",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            fetchFriendsData();
        } catch (error) {
            toast({
                title: "Error sending friend request",
                description: error.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleAcceptRequest = async (friendId) => {
        try {
            await acceptFriendRequest(user.uid, friendId);
            toast({
                title: "Friend request accepted",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            fetchFriendsData();
        } catch (error) {
            toast({
                title: "Error accepting friend request",
                description: error.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleRejectRequest = async (friendId) => {
        try {
            await rejectFriendRequest(user.uid, friendId);
            toast({
                title: "Friend request rejected",
                status: "info",
                duration: 3000,
                isClosable: true,
            });
            fetchFriendsData();
        } catch (error) {
            toast({
                title: "Error rejecting friend request",
                description: error.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleRemoveFriend = async (friendId) => {
        try {
            console.log('Attempting to remove friend. User:', user, 'FriendId:', friendId);
            if (!user || !user.uid) {
                throw new Error('User is not authenticated');
            }
            if (!friendId) {
                throw new Error('friendId is undefined');
            }
            await removeFriend(user.uid, friendId);
            toast({
                title: "Friend removed",
                status: "info",
                duration: 3000,
                isClosable: true,
            });
            fetchFriendsData();
        } catch (error) {
            console.error("Error in handleRemoveFriend:", error);
            toast({
                title: "Error removing friend",
                description: error.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    if (isLoading) return <Spinner size="xl" />;
    if (error) return <Text>Error: {error.message}</Text>;

    return (
        <Box maxW="800px" margin="0 auto" p={4}>
            <VStack spacing={8} align="stretch">
                <Heading as="h1" size="xl" textAlign="center">Friends</Heading>
                <InputGroup>
                    <InputLeftElement pointerEvents="none" children={<FaSearch color="gray.300" />} />
                    <Input 
                        placeholder="Search for friends" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button ml={2} onClick={handleSearch} isLoading={isSearching}>Search</Button>
                </InputGroup>

                <Tabs isFitted variant="enclosed">
                    <TabList mb="1em">
                        <Tab><FaUserFriends /> Friends ({friends.length})</Tab>
                        <Tab><FaUserPlus /> Requests ({friendRequests.length})</Tab>
                        <Tab><FaSearch /> Search Results</Tab>
                    </TabList>

                    <TabPanels>
                        <TabPanel>
                            <AnimatePresence>
                                {friends && friends.length > 0 ? (
                                    friends.map((friend) => {
                                        console.log('Rendering friend:', friend);
                                        return (
                                            <MotionBox
                                                as={Link}
                                                to={`/profile/${friend.friendId}`}
                                                key={friend.id}  // Use friend.id as the key
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <HStack justify="space-between" p={3} bg={bgColor} borderRadius="md" boxShadow="sm" borderWidth={1} borderColor={borderColor}>
                                                    <HStack>
                                                        <Avatar name={friend.username} src={friend.profilePicture} />
                                                        <Text fontWeight="bold">{friend.username}</Text>
                                                    </HStack>
                                                    <HStack>
                                                        <Badge colorScheme="green">Friends</Badge>
                                                        <Tooltip label="Remove friend" aria-label="Remove friend">
                                                            <IconButton
                                                                icon={<FaUserMinus />}
                                                                onClick={() => handleRemoveFriend(friend.friendId)}  // Use friend.friendId here
                                                                colorScheme="red"
                                                                variant="ghost"
                                                                size="sm"
                                                            />
                                                        </Tooltip>
                                                    </HStack>
                                                </HStack>
                                            </MotionBox>
                                        );
                                    })
                                ) : (
                                    <Text textAlign="center">No friends yet. Start by searching for friends!</Text>
                                )}
                            </AnimatePresence>
                        </TabPanel>

                        <TabPanel>
                            <AnimatePresence>
                                {friendRequests && friendRequests.length > 0 ? (
                                    friendRequests.map((request) => (
                                        <MotionBox
                                            key={request.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <HStack justify="space-between" p={3} bg={bgColor} borderRadius="md" boxShadow="sm" borderWidth={1} borderColor={borderColor}>
                                                <HStack>
                                                    <Avatar name={request.username} src={request.profilePicture} />
                                                    <Text fontWeight="bold">{request.username}</Text>
                                                </HStack>
                                                <HStack>
                                                    <Button onClick={() => handleAcceptRequest(request.from)} colorScheme="green" size="sm">Accept</Button>
                                                    <Button onClick={() => handleRejectRequest(request.from)} colorScheme="red" size="sm">Reject</Button>
                                                </HStack>
                                            </HStack>
                                        </MotionBox>
                                    ))
                                ) : (
                                    <Text textAlign="center">No friend requests at the moment.</Text>
                                )}
                            </AnimatePresence>
                        </TabPanel>

                        <TabPanel>
                            <AnimatePresence>
                                {searchResults && searchResults.length > 0 ? (
                                    searchResults.map((result) => (
                                        <MotionBox
                                            key={result.uid}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <HStack justify="space-between" p={3} bg={bgColor} borderRadius="md" boxShadow="sm" borderWidth={1} borderColor={borderColor}>
                                                <HStack>
                                                    <Avatar name={result.username} src={result.profilePicture} />
                                                    <Text fontWeight="bold">{result.username}</Text>
                                                </HStack>
                                                {friends.some(friend => friend.userId === result.uid) ? (
                                                    <Badge colorScheme="green">Friends</Badge>
                                                ) : (
                                                    <Button 
                                                        leftIcon={<FaUserPlus />} 
                                                        onClick={() => handleSendRequest(result.uid)}
                                                        colorScheme="blue"
                                                        size="sm"
                                                    >
                                                        Add Friend
                                                    </Button>
                                                )}
                                            </HStack>
                                        </MotionBox>
                                    ))
                                ) : (
                                    <Text textAlign="center">No search results. Try searching for a username!</Text>
                                )}
                            </AnimatePresence>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </VStack>
        </Box>
    );
}