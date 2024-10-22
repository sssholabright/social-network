import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import {
  Box, VStack, HStack, Text, Input, Avatar, Divider, useColorModeValue, Menu, MenuButton, MenuList, MenuItem,
  IconButton, Tooltip, useToast, Spinner, Badge, useBreakpointValue, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton
} from '@chakra-ui/react';
import { FaPlus, FaFacebookMessenger, FaArrowLeft } from 'react-icons/fa';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs, updateDoc, doc, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuthStore } from '../store/authStore';
import { useFriendStore } from '../store/friendStore';
import { useProfileStore } from '../store/userStore';

const MessageInput = memo(({ onSendMessage, isDisabled }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  const handleInputChange = useCallback((e) => {
    setInputValue(e.target.value);
  }, []);

  const handleSendMessage = useCallback(() => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
      inputRef.current?.focus();
    }
  }, [inputValue, onSendMessage]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  return (
    <HStack w="100%">
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
        placeholder="Type a message..."
        isDisabled={isDisabled}
      />
      <Tooltip label="Send message">
        <IconButton 
          icon={<FaFacebookMessenger />} 
          onClick={handleSendMessage} 
          colorScheme="blue" 
          isDisabled={isDisabled || !inputValue.trim()}
        />
      </Tooltip>
    </HStack>
  );
});

export default function Messages() {
    const { user } = useAuthStore();
    const { friends, fetchFriends, fetchFriendsProfile } = useFriendStore();
    const { profile } = useProfileStore();
    const [friendProfiles, setFriendProfiles] = useState({});
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const toast = useToast();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);

    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    const isMobile = useBreakpointValue({ base: true, md: false });


    useEffect(() => {
        const fetchProfiles = async () => {
            const profiles = {};
            for (const friend of friends) {
                const profile = await fetchFriendsProfile(friend.friendId);
                profiles[friend.friendId] = profile;
            }
            setFriendProfiles(profiles);
        };
        if (friends.length > 0) {
            fetchProfiles();
        }
    }, [friends, fetchFriendsProfile]);

    const fetchConversations = useCallback(() => {
        setIsLoading(true);
        const conversationsRef = collection(db, 'conversations');
        const q = query(
            conversationsRef,
            where('participants', 'array-contains', user.uid),
            orderBy('lastMessageTime', 'desc'),
            limit(20)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const conversationsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setConversations(conversationsData);
            setIsLoading(false);
        });

        return unsubscribe;
    }, [user.uid])

    useEffect(() => {
        if (user) {
            fetchFriends(user.uid);
            fetchConversations();
        }
    }, [user, fetchFriends, fetchConversations]);


    useEffect(() => {
        if (selectedConversation) {
            setIsLoadingMessages(true);
            const messagesRef = collection(db, 'messages');
            const q = query(
                messagesRef,
                where('conversationId', '==', selectedConversation.id),
                orderBy('timestamp', 'asc'),
                limit(50)
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const messagesData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setMessages(messagesData);
                setIsLoadingMessages(false);
                scrollToBottom();
            });

            return () => unsubscribe();
        }       
    }, [selectedConversation]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = useCallback(async (message) => {
        if (message.trim() && selectedConversation) {
            try {
                await addDoc(collection(db, 'messages'), {
                    conversationId: selectedConversation.id,
                    senderId: user.uid,
                    text: message,
                    timestamp: serverTimestamp()
                });
                
                await updateDoc(doc(db, 'conversations', selectedConversation.id), {
                    lastMessageTime: serverTimestamp(),
                    lastMessage: message
                });
            } catch (error) {
                console.error('Error sending message:', error);
                toast({
                    title: "Error sending message",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        }
    }, [selectedConversation, user.uid, toast]);

    const startNewConversation = async (friend) => {
        try {
            if (!user || !user.uid || !user.email) {
                console.error('User information is missing');
                return;
            }

            if (!friend.friendId) {
                console.error('Friend information is missing', friend);
                return;
            }

            const participants = [user.uid, friend.friendId].sort();

            const conversationsRef = collection(db, 'conversations');
            const q = query(
                conversationsRef,
                where('participants', '==', participants)
            );
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                const newConversationData = {
                    participants: participants,
                    participantNames: [profile.username, friendProfiles[friend.friendId].username].filter(Boolean),
                    lastMessageTime: serverTimestamp(),
                    lastMessage: ''
                };

                const newConversationRef = await addDoc(conversationsRef, newConversationData);
                setSelectedConversation({ id: newConversationRef.id, ...newConversationData });
            } else {
                const existingConversation = querySnapshot.docs[0];
                setSelectedConversation({ id: existingConversation.id, ...existingConversation.data() });
            }
        } catch (error) {
            console.error('Error starting new conversation:', error);
            toast({
                title: "Error starting conversation",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const getOtherParticipantName = (conv) => {
        if (!conv || !conv.participants) return 'Unknown';
        const otherParticipantId = conv.participants.find(id => id !== user.uid);
        if (!otherParticipantId) return 'Unknown';
        
        // Check if it's a friend's profile
        const friendProfile = friendProfiles[otherParticipantId];
        if (friendProfile) {
            return friendProfile.username || 'Unknown Friend';
        }
        
        // If not a friend, it might be a user profile
        const userProfile = profile && profile.uid === otherParticipantId ? profile : null;
        if (userProfile) {
            return userProfile.username || 'You';
        }
        
        return 'Unknown User';
    };

    const handleConversationSelect = (conv) => {
        setSelectedConversation(conv);
        if (isMobile) {
            setIsDrawerOpen(true);
        }
    };

    const ConversationsList = () => (
        <Box w={isMobile ? "100%" : "300px"} h="100%" borderRight={isMobile ? "none" : "1px"} borderColor={borderColor} overflowY="auto">
            <HStack justify="space-between" p={4}>
                <Text fontSize="xl" fontWeight="bold">Conversations</Text>
                <Menu>
                    <MenuButton as={IconButton} icon={<FaPlus />} variant="outline" />
                    <MenuList>
                        {friends.map(friend => (
                            <MenuItem key={friend.friendId} onClick={() => startNewConversation(friend)}>
                                {friendProfiles[friend.friendId]?.username || 'Loading...'}
                            </MenuItem>
                        ))}
                    </MenuList>
                </Menu>
            </HStack>
            <Divider />
            {isLoading ? (
                <VStack p={4}>
                    <Spinner />
                    <Text>Loading conversations...</Text>
                </VStack>
            ) : conversations.length === 0 ? (
                <VStack p={4}>
                    <Text>No conversations yet.</Text>
                    <Text>Start a new one with a friend!</Text>
                </VStack>
            ) : (
                conversations.map(conv => (
                    <Box
                        key={conv.id}
                        p={3}
                        cursor="pointer"
                        bg={selectedConversation?.id === conv.id ? 'gray.100' : 'transparent'}
                        _hover={{ bg: 'gray.50' }}
                        onClick={() => handleConversationSelect(conv)}
                    >
                        <HStack>
                            <Avatar name={getOtherParticipantName(conv)} size="sm" />
                            <VStack align="start" spacing={0} flex={1}>
                                <Text fontWeight="bold">{getOtherParticipantName(conv)}</Text>
                                <Text fontSize="sm" color="gray.500" isTruncated>{conv.lastMessage || 'No messages yet'}</Text>
                            </VStack>
                            {conv.unreadCount && <Badge colorScheme="red">{conv.unreadCount}</Badge>}
                        </HStack>
                    </Box>
                ))
            )}
        </Box>
    );

    const ChatArea = () => (
        <VStack flex={1} h="100%" p={4} spacing={4}>
            {selectedConversation ? (
                <>
                    <HStack w="100%" justify="space-between">
                        {isMobile && (
                            <IconButton 
                                icon={<FaArrowLeft />} 
                                onClick={() => setIsDrawerOpen(false)} 
                                aria-label="Back to conversations"
                            />
                        )}
                        <Text fontSize="xl" fontWeight="bold">{getOtherParticipantName(selectedConversation)}</Text>
                        <IconButton icon={<FaFacebookMessenger />} aria-label="Chat options" />
                    </HStack>
                    <Box flex={1} w="100%" overflowY="auto" p={2}>
                        {isLoadingMessages ? (
                            <VStack justify="center" h="100%">
                                <Spinner />
                                <Text>Loading messages...</Text>
                            </VStack>
                        ) : messages.length === 0 ? (
                            <VStack justify="center" h="100%">
                                <Text>No messages yet. Start the conversation!</Text>
                            </VStack>
                        ) : (
                            messages.map(msg => (
                                <HStack key={msg.id} justify={msg.senderId === user.uid ? 'flex-end' : 'flex-start'} mb={2}>
                                    {msg.senderId !== user.uid && <Avatar size="xs" name={getOtherParticipantName(selectedConversation)} />}
                                    <Box
                                        maxW="70%"
                                        p={2}
                                        borderRadius="md"
                                        bg={msg.senderId === user.uid ? 'blue.500' : 'gray.100'}
                                        color={msg.senderId === user.uid ? 'white' : 'black'}
                                    >
                                        <Text>{msg.text}</Text>
                                    </Box>
                                </HStack>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </Box>
                    <MessageInput 
                        onSendMessage={handleSendMessage} 
                        isDisabled={isLoadingMessages} 
                    />
                </>
            ) : (
                <VStack justify="center" h="100%">
                    <Text fontSize="xl">Select a conversation or start a new one to begin chatting</Text>
                </VStack>
            )}
        </VStack>
    );

    const handleSendMessage = useCallback((message) => {
        if (message.trim() && selectedConversation) {
            sendMessage(message);
        }
    }, [selectedConversation, sendMessage]);

    return (
        <Box h="calc(100vh - 60px)" bg={bgColor}>
            {isMobile ? (
                <>
                    {!isDrawerOpen && <ConversationsList />}
                    <Drawer isOpen={isDrawerOpen} placement="right" onClose={() => setIsDrawerOpen(false)} size="full">
                        <DrawerOverlay />
                        <DrawerContent>
                            <DrawerCloseButton />
                            <DrawerHeader>Chat</DrawerHeader>
                            <DrawerBody p={0}>
                                <ChatArea />
                            </DrawerBody>
                        </DrawerContent>
                    </Drawer>
                </>
            ) : (
                <HStack spacing={0} h="100%">
                    <ConversationsList />
                    <ChatArea />
                </HStack>
            )}
        </Box>
    );
};
