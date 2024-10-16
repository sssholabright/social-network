import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Box, Button,Textarea, useToast, VStack, Input } from '@chakra-ui/react'
import { usePostStore } from '../../store/postStore'

export default function PostForm() {
    const [image, setImage] = useState(null)
    const { register, handleSubmit, reset } = useForm()
    const { createPost } = usePostStore()
    const toast = useToast()

    const onSubmit = async (data) => {
        try {
            await createPost({ caption: data.caption, image })
            reset()
            toast({
                title: 'Post created',
                description: 'Your post has been created',
                status: 'success',
                duration: 3000,
                isClosable: true,
            })
        } catch (error) {
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
    <Box as="form" onSubmit={handleSubmit(onSubmit)}>
      <VStack spacing={4} align="stretch">
        <Textarea 
            {...register('caption', { required: 'Post caption is required' })}
            placeholder="What's on your mind?"
        />
        <Input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
      <Button type="submit" colorScheme="blue" width="full">Create Post</Button>
      </VStack>
    </Box>
  )
}   