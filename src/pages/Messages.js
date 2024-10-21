import React, { useState, useEffect } from 'react';
import { Box, VStack, HStack, Text, Input, Button, Avatar, Divider, useColorModeValue, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuthStore } from '../store/authStore';
import { useFriendStore } from '../store/friendStore';

const Messages = () => {
    const { user } = useAuthStore();
    const { friends, fetchFriends } = useFriendStore();
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    useEffect(() => {
        if (user) {
            fetchFriends(user.uid);
            fetchConversations();
        }
    }, [user]);

    const fetchConversations = () => {
        const conversationsRef = collection(db, 'conversations');
        const q = query(
            conversationsRef,
            where('participants', 'array-contains', user.uid),
            orderBy('lastMessageTime', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const conversationsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setConversations(conversationsData);
        });

        return unsubscribe;
    };

    useEffect(() => {
        if (selectedConversation) {
            const messagesRef = collection(db, 'messages');
            const q = query(
                messagesRef,
                where('conversationId', '==', selectedConversation.id),
                orderBy('timestamp', 'asc')
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const messagesData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setMessages(messagesData);
            });

            return () => unsubscribe();
        }
    }, [selectedConversation]);

    const sendMessage = async () => {
        if (newMessage.trim() && selectedConversation) {
            await addDoc(collection(db, 'messages'), {
                conversationId: selectedConversation.id,
                senderId: user.uid,
                text: newMessage,
                timestamp: serverTimestamp()
            });
            
            // Update last message time in conversation
            await updateDoc(doc(db, 'conversations', selectedConversation.id), {
                lastMessageTime: serverTimestamp()
            });
            
            setNewMessage('');
        }
    };

    const startNewConversation = async (friend) => {
        try {
            if (!user || !user.userId || !user.displayName) {
                console.error('User information is missing');
                return;
            }

            if (!friend || !friend.friendId || !friend.username) {
                console.error('Friend information is missing', friend);
                return;
            }

            // Check if conversation already exists
            const conversationsRef = collection(db, 'conversations');
            const q = query(
                conversationsRef,
                where('participants', '==', [user.uid, friend.friendId].sort())
            );
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                // Create new conversation
                const newConversationData = {
                    participants: [user.uid, friend.friendId].sort(),
                    participantNames: [user.displayName, friend.username].sort(),
                    lastMessageTime: serverTimestamp()
                };

                console.log('Creating new conversation with data:', newConversationData);

                const newConversationRef = await addDoc(conversationsRef, newConversationData);
                setSelectedConversation({ id: newConversationRef.id, ...newConversationRef.data() });
            } else {
                // Use existing conversation
                const existingConversation = querySnapshot.docs[0];
                setSelectedConversation({ id: existingConversation.id, ...existingConversation.data() });
            }
        } catch (error) {
            console.error('Error starting new conversation:', error);
            // You might want to show a toast or some other UI feedback here
        }
    };

    return (
        <HStack h="calc(100vh - 60px)" spacing={0}>
            <Box w="300px" h="100%" borderRight="1px" borderColor={borderColor} overflowY="auto">
                <Menu>
                    <MenuButton as={Button} /*rightIcon={<ChevronDownIcon />}*/ m={2}>
                        New Conversation
                    </MenuButton>
                    <MenuList>
                        {friends.map(friend => (
                            <MenuItem key={friend.friendId} onClick={() => startNewConversation(friend)}>
                                {friend.userId}
                            </MenuItem>
                        ))}
                    </MenuList>
                </Menu>
                <Divider />
                {conversations.map(conv => (
                    <Box
                        key={conv.id}
                        p={3}
                        cursor="pointer"
                        bg={selectedConversation?.id === conv.id ? 'gray.100' : 'transparent'}
                        _hover={{ bg: 'gray.50' }}
                        onClick={() => setSelectedConversation(conv)}
                    >
                        <HStack>
                            <Avatar name={conv.participantNames.find(name => name !== user.displayName)} size="sm" />
                            <Text fontWeight="bold">{conv.participantNames.find(name => name !== user.displayName)}</Text>
                        </HStack>
                    </Box>
                ))}
            </Box>
            <VStack flex={1} h="100%" p={4} spacing={4}>
                {selectedConversation ? (
                    <>
                        <Box flex={1} w="100%" overflowY="auto">
                            {messages.map(msg => (
                                <HStack key={msg.id} justify={msg.senderId === user.uid ? 'flex-end' : 'flex-start'} mb={2}>
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
                            ))}
                        </Box>
                        <HStack w="100%">
                            <Input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            />
                            <Button onClick={sendMessage}>Send</Button>
                        </HStack>
                    </>
                ) : (
                    <Text>Select a conversation or start a new one to begin chatting</Text>
                )}
            </VStack>
        </HStack>
    );
};

export default Messages;