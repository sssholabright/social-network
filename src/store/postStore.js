import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import api from '../services/api'

export const usePostStore = create(persist((set, get) => ({
    posts: [],
    hasMore: true,
    page: 1,
    isLoading: false,
    error: null,


    fetchPosts: async () => {
        const { page, isLoading } = get()
        if (isLoading) return
        set({ isLoading: true, error: null })

        try {
            const newPosts = await api.getPosts(page)
            console.log('Fetched posts:', newPosts); 
            set((state) => ({
                posts: [...state.posts, ...newPosts],
                page: state.page + 1,
                hasMore: newPosts.length > 0,
                isLoading: false,
            }));
        } catch (error) {
            console.error('Error fetching posts:', error)
            set({ error: error.message, isLoading: false })
        }
    },
    
    createPost: async (postData) => {
        set({ isLoading: true, error: null })

        try {
            const newPost = await api.createPost(postData)
            set((state) => ({
                posts: [newPost, ...state.posts],
                isLoading: false,
            }))
            return newPost
        } catch (error) {
            console.error('Error creating post:', error)
            set({ error: error.message, isLoading: false })
            throw error
        }
    },

    likePost: async (postId) => {
        set((state) => ({
            posts: state.posts.map((post) => 
                post.id === postId ? { ...post, likes: post.likes + 1, isLiked: true } : post
            ),
        }))
    
        try {
            await api.likePost(postId)
        } catch (error) {
            console.error('Error liking post:', error)
            set((state) => ({
                posts: state.posts.map((post) => 
                    post.id === postId ? { ...post, likes: post.likes - 1, isLiked: false } : post
                ),
                error: error.message,
            }))
        }
    },

    unlikePost: async (postId) => {
        // Optimistically update the UI
        set((state) => ({
            posts: state.posts.map((post) => 
                post.id === postId ? { ...post, likes: post.likes - 1, isLiked: false } : post
            ),
        }))
    
        try {
            await api.unlikePost(postId)
        } catch (error) {
            console.error('Error unliking post:', error)
            // Revert the optimistic update
            set((state) => ({
                posts: state.posts.map((post) => 
                    post.id === postId ? { ...post, likes: post.likes + 1, isLiked: true } : post
                ),
                error: error.message,
            }))
        }
    },

    commentPost: async (postId, commentData) => {
        try {
            const newComment = await api.commentPost(postId, commentData)
            set((state) => ({
                posts: state.posts.map((post) => 
                    post.id === postId 
                        ? { ...post, comments: [...post.comments, newComment] } 
                        : post
                ),
            }))
            return newComment
        } catch (error) {
            console.error('Error commenting on post:', error)
            set({ error: error.message, isLoading: false })
            throw error
        }
    },

    resetPosts: () => set({ posts: [], page: 1, hasMore: true, isLoading: false, error: null }),

    // Add a method to fetch a single post if needed
    fetchPost: async (postId) => {
        set({ isLoading: true, error: null })

        try {
            const post = await api.getPost(postId)
            set((state) => ({
                posts: state.posts.some(p => p.id === postId) ? state.posts.map(p => p.id === postId ? post : p) : [post, ...state.posts],
                isLoading: false,
            }))
            return post
        } catch (error) {
            console.error('Error fetching post:', error)
            set({ error: error.message, isLoading: false })
            throw error
        }
    }
}), { name: 'posts', storage: createJSONStorage(() => localStorage) }))