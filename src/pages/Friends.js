import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Box, VStack, HStack, Text, Avatar, Button, Input, InputGroup, InputLeftElement, Spinner, Tabs, TabList, Tab, TabPanels, TabPanel, useToast, Heading, useColorModeValue, Badge, IconButton, Tooltip, Flex, useBreakpointValue, Container, SimpleGrid } from '@chakra-ui/react';
import { FaSearch, FaUserPlus, FaUserFriends, FaUserMinus, FaUserCheck, FaEnvelope } from 'react-icons/fa';
import { useAuthStore } from '../store/authStore';
import { useFriendStore } from '../store/friendStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useProfileStore } from '../store/userStore';

const MotionBox = motion(Box);

const FriendItem = React.memo(({ friend, onRemoveFriend, bgColor, borderColor }) => (
    <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
    >
        <Box p={4} bg={bgColor} borderRadius="lg" boxShadow="md" borderWidth={1} borderColor={borderColor}>
            <VStack align="start" spacing={2}>
                <HStack w="100%" justify="space-between">
                    <HStack as={Link} to={`/profile/${friend.id}`}>
                        <Avatar size="md" name={friend.username} src={friend.profilePicture} />
                        <VStack align="start" spacing={0}>
                            <Text fontWeight="bold">{friend.username}</Text>
                            <Text fontSize="sm" color="gray.500">{friend.email}</Text>
                        </VStack>
                    </HStack>
                    <HStack>
                        <Tooltip label="Send message" aria-label="Send message">
                            <IconButton
                                icon={<FaEnvelope />}
                                as={Link}
                                to={`/messages/${friend.id}`}
                                colorScheme="blue"
                                variant="ghost"
                                size="sm"
                            />
                        </Tooltip>
                        <Tooltip label="Remove friend" aria-label="Remove friend">
                            <IconButton
                                icon={<FaUserMinus />}
                                onClick={(e) => {
                                    e.preventDefault();
                                    onRemoveFriend(friend.id);
                                }}
                                colorScheme="red"
                                variant="ghost"
                                size="sm"
                            />
                        </Tooltip>
                    </HStack>
                </HStack>
            </VStack>
        </Box>
    </MotionBox>
));

const Friends = () => {
    const { user } = useAuthStore();
    const { friends, friendRequests, searchUsers, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend, isLoading, error, fetchFriends, fetchFriendRequests, fetchFriendProfiles } = useFriendStore();
    const { profile, fetchProfile } = useProfileStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [friendProfiles, setFriendProfiles] = useState([]);
    const toast = useToast();
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const tabSize = useBreakpointValue({ base: "sm", md: "md" });

    const fetchFriendsData = useCallback(async () => {
        if (user) {
            await fetchFriends(user.uid);
            await fetchFriendRequests(user.uid);
        }
    }, [user, fetchFriends, fetchFriendRequests]);

    useEffect(() => {
        fetchFriendsData();
        if (user && !profile) {
            fetchProfile(user.uid);
        }
    }, [fetchFriendsData, user, profile, fetchProfile]);

    useEffect(() => {
        const loadFriendProfiles = async () => {
            if (friends.length > 0) {
                const friendIds = friends.map(friend => friend.friendId);
                const profiles = await fetchFriendProfiles(friendIds);
                setFriendProfiles(profiles);
            }
        };
        loadFriendProfiles();
    }, [friends, fetchFriendProfiles]);

    const handleSearch = useCallback(async () => {
        if (searchQuery.trim()) {
            setIsSearching(true);
            try {
                const results = await searchUsers(searchQuery);
                setSearchResults(results.filter(result => result.uid !== user.uid));
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
    }, [searchQuery, searchUsers, user, toast]);

    const handleSendRequest = useCallback(async (friendId) => {
        if (!profile) {
            toast({
                title: "Error",
                description: "Your profile is not loaded. Please try again.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        try {
            await sendFriendRequest(user.uid, friendId, profile.username);
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
    }, [profile, user, sendFriendRequest, toast, fetchFriendsData]);

    const handleAcceptRequest = useCallback(async (friendId) => {
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
    }, [user, acceptFriendRequest, toast, fetchFriendsData]);

    const handleRejectRequest = useCallback(async (friendId) => {
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
    }, [user, rejectFriendRequest, toast, fetchFriendsData]);

    const handleRemoveFriend = useCallback(async (friendId) => {
        try {
            await removeFriend(user.uid, friendId);
            toast({
                title: "Friend removed",
                status: "info",
                duration: 3000,
                isClosable: true,
            });
            fetchFriendsData();
        } catch (error) {
            toast({
                title: "Error removing friend",
                description: error.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    }, [user, removeFriend, toast, fetchFriendsData]);

    const friendsList = useMemo(() => (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            <AnimatePresence>
                {friendProfiles.map((friend) => (
                    <FriendItem
                        key={friend.id}
                        friend={friend}
                        onRemoveFriend={handleRemoveFriend}
                        bgColor={bgColor}
                        borderColor={borderColor}
                    />
                ))}
            </AnimatePresence>
        </SimpleGrid>
    ), [friendProfiles, handleRemoveFriend, bgColor, borderColor]);

    if (isLoading) return (
        <Flex height="100vh" alignItems="center" justifyContent="center">
            <Spinner size="xl" />
        </Flex>
    );
    if (error) return (
        <Flex height="100vh" alignItems="center" justifyContent="center">
            <Text>Error: {error.message}</Text>
        </Flex>
    );

    return (
        <Container maxW="container.xl" py={8}>
            <VStack spacing={8} align="stretch">
                <Flex justify="space-between" align="center" wrap="wrap">
                    <Heading as="h1" size="xl">Friends</Heading>
                    {profile && (
                        <HStack>
                            <Avatar size="sm" name={profile.username} src={profile.profilePicture} />
                            <Text fontWeight="bold">{profile.username}</Text>
                        </HStack>
                    )}
                </Flex>
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
                        <Tab fontSize={tabSize}><FaUserFriends /> Friends ({friendProfiles.length})</Tab>
                        <Tab fontSize={tabSize}><FaUserPlus /> Requests ({friendRequests.length})</Tab>
                        <Tab fontSize={tabSize}><FaSearch /> Search Results</Tab>
                    </TabList>

                    <TabPanels>
                        <TabPanel>
                            {friendsList}
                        </TabPanel>

                        <TabPanel>
                            <AnimatePresence>
                                {friendRequests && friendRequests.length > 0 ? (
                                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                                        {friendRequests.map((request) => (
                                            <MotionBox
                                                key={request.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <Box p={4} bg={bgColor} borderRadius="lg" boxShadow="md" borderWidth={1} borderColor={borderColor}>
                                                    <VStack align="start" spacing={2}>
                                                        <HStack w="100%" justify="space-between">
                                                            <HStack>
                                                                <Avatar size="md" name={request.username} src={request.profilePicture} />
                                                                <VStack align="start" spacing={0}>
                                                                    <Text fontWeight="bold">{request.username}</Text>
                                                                    <Text fontSize="sm" color="gray.500">{request.email}</Text>
                                                                </VStack>
                                                            </HStack>
                                                            <HStack>
                                                                <Tooltip label="Accept">
                                                                    <IconButton
                                                                        icon={<FaUserCheck />}
                                                                        onClick={() => handleAcceptRequest(request.from)}
                                                                        colorScheme="green"
                                                                        size="sm"
                                                                    />
                                                                </Tooltip>
                                                                <Tooltip label="Reject">
                                                                    <IconButton
                                                                        icon={<FaUserMinus />}
                                                                        onClick={() => handleRejectRequest(request.from)}
                                                                        colorScheme="red"
                                                                        size="sm"
                                                                    />
                                                                </Tooltip>
                                                            </HStack>
                                                        </HStack>
                                                    </VStack>
                                                </Box>
                                            </MotionBox>
                                        ))}
                                    </SimpleGrid>
                                ) : (
                                    <Text textAlign="center">No friend requests at the moment.</Text>
                                )}
                            </AnimatePresence>
                        </TabPanel>

                        <TabPanel>
                            <AnimatePresence>
                                {searchResults && searchResults.length > 0 ? (
                                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                                        {searchResults.map((result) => (
                                            <MotionBox
                                                key={result.uid}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <Box p={4} bg={bgColor} borderRadius="lg" boxShadow="md" borderWidth={1} borderColor={borderColor}>
                                                    <VStack align="start" spacing={2}>
                                                        <HStack w="100%" justify="space-between">
                                                            <HStack>
                                                                <Avatar size="md" name={result.username} src={result.profilePicture} />
                                                                <VStack align="start" spacing={0}>
                                                                    <Text fontWeight="bold">{result.username}</Text>
                                                                    <Text fontSize="sm" color="gray.500">{result.email}</Text>
                                                                </VStack>
                                                            </HStack>
                                                            {friends.some(friend => friend.friendId === result.uid) ? (
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
                                                    </VStack>
                                                </Box>
                                            </MotionBox>
                                        ))}
                                    </SimpleGrid>
                                ) : (
                                    <Text textAlign="center">No search results. Try searching for a username!</Text>
                                )}
                            </AnimatePresence>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </VStack>
        </Container>
    );
};

export default React.memo(Friends);