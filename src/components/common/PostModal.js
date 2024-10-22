import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Image,
  Text,
  VStack,
  HStack,
  Avatar,
  Button,
  Input,
  useToast,
  Divider,
  Box,
} from '@chakra-ui/react';
import { FaHeart, FaRegHeart, FaComment } from 'react-icons/fa';
import { useAuthStore } from '../../store/authStore';
import { usePostStore } from '../../store/postStore';

const PostModal = ({ isOpen, onClose, post }) => {
  const [comment, setComment] = useState('');
  const { user } = useAuthStore();
  const { likePost, unlikePost, addComment } = usePostStore();
  const toast = useToast();

  if (!post) return null;

  const handleLike = async () => {
    try {
      if (post.likes.includes(user.uid)) {
        await unlikePost(post.id, user.uid);
      } else {
        await likePost(post.id, user.uid);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to like/unlike the post',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    try {
      await addComment(post.id, user.uid, comment);
      setComment('');
      toast({
        title: 'Comment added',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Post by {post.username}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Image src={post.image} alt={post.caption} objectFit="cover" w="100%" maxH="400px" borderRadius="md" />
            <Text fontWeight="bold">{post.caption}</Text>
            <HStack justify="space-between">
              <Button leftIcon={post.likes.includes(user.uid) ? <FaHeart color="red" /> : <FaRegHeart />} onClick={handleLike}>
                {post.likes.length} {post.likes.length === 1 ? 'Like' : 'Likes'}
              </Button>
              <Button leftIcon={<FaComment />}>
                {post.comments.length} {post.comments.length === 1 ? 'Comment' : 'Comments'}
              </Button>
            </HStack>
            <Divider />
            <VStack align="stretch" maxH="200px" overflowY="auto">
              {post.comments.map((comment, index) => (
                <Box key={index} p={2} borderWidth={1} borderRadius="md">
                  <HStack>
                    <Avatar size="sm" name={comment.username} src={comment.userAvatar} />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold">{comment.username}</Text>
                      <Text>{comment.text}</Text>
                    </VStack>
                  </HStack>
                </Box>
              ))}
            </VStack>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack w="100%">
            <Input
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <Button colorScheme="blue" onClick={handleComment}>
              Post
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PostModal;

