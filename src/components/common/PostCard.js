import { Box, HStack, Avatar, VStack, Text, IconButton, Image } from '@chakra-ui/react'
import { usePostStore } from '../../store/postStore'
import { format } from 'date-fns'
import { FaHeart, FaRegHeart, FaComment } from 'react-icons/fa'

export default function PostCard({ post }) {
    const { likePost, unlikePost } = usePostStore()

    const handleLike = () => {
        if (post.isLiked) {
            unlikePost(post.id)
        } else {
            likePost(post.id)
        }
    }

    const username = post.user?.username || 'Unknown User'
    const avatarSrc = post.user?.profileimg || 'https://via.placeholder.com/150'
    const likesCount = post.likes_count || 0
    const commentsCount = post.comments_count || 0
    const isLiked = post.is_liked || false
    const createdAt = post.created_at || new Date()
    const content = post.caption || ''
    const imageSrc = post.image || ''

    return (
        <Box borderWidth={1} borderRadius="lg" p={4}>
            <HStack spacing={4} align="start">
                <Avatar name={username} src={avatarSrc} />
                <VStack align="start" spacing={2} flex={1}>
                    <Text fontWeight="bold">{username}</Text>
                    <Text>{content}</Text>
                    <Text fontSize="sm" color="gray.500">
                        {format(new Date(createdAt), 'PPpp')}
                    </Text>
                    <HStack spacing={4}>
                        <IconButton
                            icon={isLiked ? <FaHeart /> : <FaRegHeart />}
                            onClick={handleLike}
                            aria-label="Like"
                            colorScheme={isLiked ? "red" : "gray"}
                        />
                        <Text>{likesCount} likes</Text>
                        <IconButton
                            icon={<FaComment />}
                            aria-label="Comment"
                        />
                        <Text>{commentsCount} comments</Text>
                    </HStack>
                </VStack>
            </HStack>
            {imageSrc && (
                <Image src={imageSrc} alt="Post Image" />
            )}
        </Box>
    )
}