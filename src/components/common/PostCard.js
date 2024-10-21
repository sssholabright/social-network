import React, { useState, useEffect } from 'react'
import { Box, HStack, Avatar, VStack, Text, IconButton, Image, Button, Textarea, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Menu, MenuButton, MenuList, MenuItem, useToast, Collapse } from '@chakra-ui/react'
import { usePostStore } from '../../store/postStore'
import { useAuthStore } from '../../store/authStore'
import { format } from 'date-fns'
import { FaHeart, FaRegHeart, FaComment, FaShare, FaEllipsisV, FaEdit, FaTrash } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

export default function PostCard({ post }) {
    const { likePost, unlikePost, commentOnPost, deletePost, updatePost } = usePostStore()
    const { user } = useAuthStore()
    const [comment, setComment] = useState('')
    const [isEditing, setIsEditing] = useState(false)
    const [editedCaption, setEditedCaption] = useState(post.caption)
    const [showAllComments, setShowAllComments] = useState(false)
    const { isOpen, onOpen, onClose } = useDisclosure()
    const toast = useToast()

    const handleLike = () => {
        if (post.is_liked) {
            unlikePost(post.id)
        } else {
            likePost(post.id)
        }
    }

    const handleComment = () => {
        if (comment.trim()) {
            commentOnPost(post.id, {
                content: comment,
                user: user.uid,
                created_at: new Date().toISOString()
            })
            setComment('')
            onClose()
        }
    }

    const handleShare = () => {
        // Implement share functionality
        navigator.clipboard.writeText(`Check out this post: ${window.location.origin}/post/${post.id}`)
        toast({
            title: "Link copied!",
            description: "Post link has been copied to clipboard.",
            status: "success",
            duration: 3000,
            isClosable: true,
        })
    }

    const handleEdit = () => {
        setIsEditing(true)
    }

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            deletePost(post.id)
        }
    }

    const handleUpdate = () => {
        updatePost(post.id, { caption: editedCaption })
        setIsEditing(false)
    }

    const renderContent = (text) => {
        if (!text) return ''; // Return empty string if text is undefined
        const mentionRegex = /@(\w+)/g;
        const hashtagRegex = /#(\w+)/g;
        return text.split(' ').map((word, index) => {
            if (word.match(mentionRegex)) {
                return <Text as="span" color="blue.500" key={index}>{word} </Text>;
            } else if (word.match(hashtagRegex)) {
                return <Text as="span" color="green.500" key={index}>{word} </Text>;
            }
            return word + ' ';
        });
    };

    return (
        <Box borderWidth={1} borderRadius="lg" p={4} boxShadow="md" bg="white">
            <HStack spacing={4} align="start">
                <Avatar name={post.user?.username} src={post.user?.profileimg} size="md" />
                <VStack align="start" spacing={2} flex={1}>
                    <HStack justify="space-between" width="100%">
                        <Text fontWeight="bold">{post.user?.username || 'Unknown User'}</Text>
                        <Text fontSize="sm" color="gray.500">
                            {/* {format(post.created_at, 'PPpp')} */}
                        </Text>
                    </HStack>
                    {isEditing ? (
                        <Textarea
                            value={editedCaption}
                            onChange={(e) => setEditedCaption(e.target.value)}
                            mb={2}
                        />
                    ) : (
                        <Text>{renderContent(post.caption || '')}</Text>
                    )}
                    {post.image && (
                        <Image src={post.image} alt="Post Image" borderRadius="md" maxH="400px" objectFit="cover" />
                    )}
                    <HStack spacing={4} width="100%" justify="space-between">
                        <AnimatePresence>
                            <motion.div
                                key={post.is_liked}
                                initial={{ scale: 1 }}
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.3 }}
                            >
                                <IconButton
                                    icon={post.is_liked ? <FaHeart /> : <FaRegHeart />}
                                    onClick={handleLike}
                                    aria-label="Like"
                                    colorScheme={post.is_liked ? "red" : "gray"}
                                    variant="ghost"
                                />
                            </motion.div>
                        </AnimatePresence>
                        <Text>{post.likes?.length || 0} likes</Text>
                        <IconButton
                            icon={<FaComment />}
                            aria-label="Comment"
                            onClick={onOpen}
                            variant="ghost"
                        />
                        <Text>{post.comments?.length || 0} comments</Text>
                        <IconButton
                            icon={<FaShare />}
                            aria-label="Share"
                            onClick={handleShare}
                            variant="ghost"
                        />
                        {user && user.uid === post.user && (
                            <Menu>
                                <MenuButton as={IconButton} icon={<FaEllipsisV />} variant="ghost" />
                                <MenuList>
                                    <MenuItem icon={<FaEdit />} onClick={handleEdit}>Edit</MenuItem>
                                    <MenuItem icon={<FaTrash />} onClick={handleDelete}>Delete</MenuItem>
                                </MenuList>
                            </Menu>
                        )}
                    </HStack>
                    {isEditing && (
                        <HStack>
                            <Button colorScheme="blue" onClick={handleUpdate}>Save</Button>
                            <Button onClick={() => setIsEditing(false)}>Cancel</Button>
                        </HStack>
                    )}
                    <Collapse in={showAllComments} animateOpacity>
                        <VStack align="start" width="100%" mt={4}>
                            {post.comments?.slice(0, showAllComments ? undefined : 3).map((comment, index) => (
                                <Box key={index} p={2} bg="gray.100" borderRadius="md" width="100%">
                                    <Text fontWeight="bold">{comment.user || 'Unknown User'}</Text>
                                    <Text>{renderContent(comment.content || '')}</Text>
                                </Box>
                            ))}
                        </VStack>
                    </Collapse>
                    {post.comments?.length > 1 && (
                        <Button variant="link" onClick={() => setShowAllComments(!showAllComments)}>
                            {showAllComments ? 'Hide comments' : 'View all comments'}
                        </Button>
                    )}
                </VStack>
            </HStack>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Add a comment</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Write your comment here..."
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={handleComment}>
                            Post Comment
                        </Button>
                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    )
}