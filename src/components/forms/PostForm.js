import React, { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Box, Button, Textarea, useToast, VStack, Input, Image, IconButton, Flex, Text } from '@chakra-ui/react'
import { usePostStore } from '../../store/postStore'
import { Timestamp } from 'firebase/firestore'
import { FaImage, FaTimes } from 'react-icons/fa'

export default function PostForm() {
    const [image, setImage] = useState(null)
    const [preview, setPreview] = useState(null)
    const { register, handleSubmit, reset, watch } = useForm()
    const { createPost, isLoading } = usePostStore()
    const toast = useToast()
    const fileInputRef = useRef()

    const caption = watch('caption')

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setImage(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const removeImage = () => {
        setImage(null)
        setPreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const onSubmit = async (data) => {
        if (!caption && !image) {
            toast({
                title: 'Empty post',
                description: 'Please add a caption or an image to your post.',
                status: 'warning',
                duration: 3000,
                isClosable: true,
            })
            return
        }

        try {
            await createPost({ caption: data.caption, image, created_at: Timestamp.now() })
            reset()
            setImage(null)
            setPreview(null)
            toast({
                title: 'Post created',
                description: 'Your post has been created successfully!',
                status: 'success',
                duration: 3000,
                isClosable: true,
            })
        } catch (error) {
            console.error(error)
            toast({
                title: 'Failed to create post',
                description: error.message,
                status: 'error',
                duration: 3000,
                isClosable: true,
            })
        }
    }

    return (
        <Box as="form" onSubmit={handleSubmit(onSubmit)} bg="white" borderRadius="lg" p={4} boxShadow="md">
            <VStack spacing={4} align="stretch">
                <Textarea
                    {...register('caption')}
                    placeholder="What's on your mind?"
                    resize="vertical"
                    minH="100px"
                />
                {preview && (
                    <Box position="relative">
                        <Image src={preview} alt="Preview" borderRadius="md" maxH="300px" objectFit="cover" />
                        <IconButton
                            icon={<FaTimes />}
                            position="absolute"
                            top={2}
                            right={2}
                            onClick={removeImage}
                            aria-label="Remove image"
                        />
                    </Box>
                )}
                <Flex justify="space-between" align="center">
                    <Button
                        leftIcon={<FaImage />}
                        onClick={() => fileInputRef.current.click()}
                        variant="outline"
                    >
                        Add Image
                    </Button>
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        hidden
                        ref={fileInputRef}
                    />
                    <Button
                        type="submit"
                        colorScheme="blue"
                        isLoading={isLoading}
                        isDisabled={!caption && !image}
                    >
                        Post
                    </Button>
                </Flex>
                {image && <Text fontSize="sm" color="gray.500">{image.name}</Text>}
            </VStack>
        </Box>
    )
}