import React, { useEffect, useState } from 'react';
import { Box, VStack, Heading, Text, Avatar, Flex, Button, useColorModeValue, Spinner, Badge, IconButton, Tooltip } from '@chakra-ui/react';
import { FaCheck, FaTimes, FaTrash } from 'react-icons/fa';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationsStore';
import { useFriendStore } from '../store/friendStore';

const NotificationItem = ({ notification, onAccept, onReject, onDelete }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box p={4} bg={bgColor} borderRadius="md" borderWidth={1} borderColor={borderColor} width="100%">
      <Flex align="center" justify="space-between">
        <Flex align="center">
          <Avatar size="sm" name={notification.senderName} src={notification.senderAvatar} mr={3} />
          <Box>
            <Text fontWeight="bold">{notification.senderName}</Text>
            <Text fontSize="sm">{notification.message}</Text>
          </Box>
        </Flex>
        <Flex align="center">
          {notification.type === 'friendRequest' && (
            <>
              <Tooltip label="Accept">
                <IconButton
                  icon={<FaCheck />}
                  colorScheme="green"
                  size="sm"
                  mr={2}
                  onClick={() => onAccept(notification.id)}
                />
              </Tooltip>
              <Tooltip label="Reject">
                <IconButton
                  icon={<FaTimes />}
                  colorScheme="red"
                  size="sm"
                  mr={2}
                  onClick={() => onReject(notification.id)}
                />
              </Tooltip>
            </>
          )}
          <Tooltip label="Delete">
            <IconButton
              icon={<FaTrash />}
              colorScheme="gray"
              size="sm"
              onClick={() => onDelete(notification.id)}
            />
          </Tooltip>
        </Flex>
      </Flex>
    </Box>
  );
};

export default function Notifications() {
  const { user } = useAuthStore();
  const { notifications, fetchNotifications, deleteNotification, markAsRead, isLoading } = useNotificationStore();
  const { acceptFriendRequest, rejectFriendRequest } = useFriendStore();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchNotifications(user.uid);
    }
  }, [user, fetchNotifications]);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const handleAccept = async (notificationId) => {
    const notification = notifications.find(n => n.id === notificationId);
    await acceptFriendRequest(user.uid, notification.senderId);
    await deleteNotification(notificationId);
  };

  const handleReject = async (notificationId) => {
    const notification = notifications.find(n => n.id === notificationId);
    await rejectFriendRequest(user.uid, notification.senderId);
    await deleteNotification(notificationId);
  };

  const handleDelete = async (notificationId) => {
    await deleteNotification(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await Promise.all(notifications.map(n => markAsRead(n.id)));
  };

  if (isLoading) return <Spinner size="xl" />;

  return (
    <Box maxW="800px" margin="0 auto" p={4}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading as="h1" size="xl">
          Notifications
          {unreadCount > 0 && (
            <Badge ml={2} colorScheme="red" borderRadius="full" px={2}>
              {unreadCount}
            </Badge>
          )}
        </Heading>
        {unreadCount > 0 && (
          <Button size="sm" onClick={handleMarkAllAsRead}>
            Mark all as read
          </Button>
        )}
      </Flex>
      <VStack spacing={4} align="stretch">
        {notifications.length === 0 ? (
          <Text textAlign="center">No notifications yet.</Text>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onAccept={handleAccept}
              onReject={handleReject}
              onDelete={handleDelete}
            />
          ))
        )}
      </VStack>
    </Box>
  );
}