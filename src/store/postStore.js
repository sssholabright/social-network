import { create } from 'zustand'
import { auth, db, storage } from '../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, 
    onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';

export const usePostStore = create((set, get) => ({
    posts: [],
    isLoading: false,
    error: null,

    fetchPosts: async () => {
        set({isLoading: true});
        try {
            const q = query(collection(db, 'posts'), orderBy('created_at', 'desc'));
            onSnapshot(q, (querySnapshot) => {
                const posts = querySnapshot.docs.map((doc) => ({
                    id: doc.id, 
                    ...doc.data(), 
                    is_liked: doc.data().likes?.includes(auth.currentUser.uid)
                }));
                set({posts, isLoading: false});
            });

        } catch (error) {
            console.error('Error fetching posts:', error);
            set({error: error.message, isLoading: false});
        }
    },

    createPost: async ({caption, image}) => {
        set({isLoading: true});
        try {
            let imageUrl = null;
            if (image) {
                const imageRef = ref(storage, `posts/${new Date().getTime()}`);
                await uploadBytes(imageRef, image);
                imageUrl = await getDownloadURL(imageRef);
            }
            
            const newPost = {
                user: auth.currentUser.uid,
                caption,
                image: imageUrl,
                created_at: new Date(),
                likes: [],
                comments: [],
            }

            const docRef = await addDoc(collection(db, 'posts'), newPost);
            set((state) => ({posts: [...state.posts, {...newPost, id: docRef.id}], isLoading: false}));
        } catch (error) {
            console.error('Error creating post:', error);
            set({error: error.message, isLoading: false});
        }
    },

    updatePost: async (postId, updatedPost) => {
        set({isLoading: true});
        try {
            const postRef = doc(db, 'posts', postId);
            await updateDoc(postRef, updatedPost);
            set((state) => ({
                posts: state.posts.map((post) => post.id === postId ? {...post, ...updatedPost} : post),
                isLoading: false
            }));
        } catch (error) {
            console.error('Error updating post:', error);
            set({error: error.message, isLoading: false});
        }
    },

    deletePost: async (postId) => {
        set({isLoading: true});
        try {
            const postRef = doc(db, 'posts', postId);
            await deleteDoc(postRef);
            set((state) => ({
                posts: state.posts.filter((post) => post.id !== postId),
                isLoading: false
            }));
        } catch (error) {
            console.error('Error deleting post:', error);
            set({error: error.message, isLoading: false});
        }
    },

    commentOnPost: async (postId, comment) => {
        console.log('Commenting on post:', postId, comment)
        try {
            const postRef = doc(db, 'posts', postId);
            await updateDoc(postRef, {comments: arrayUnion(comment)});
            set((state) => ({
                posts: state.posts.map((post) => 
                    post.id === postId ? {...post, comments: [...post.comments, comment]} : post
                ),
                isLoading: false
            }));
        } catch (error) {
            console.error('Error commenting on post:', error);
        }
    },

    likePost: async (postId) => {
        console.log('Liking post:', postId)
        try {
            const postRef = doc(db, 'posts', postId);
            await updateDoc(postRef, {likes: arrayUnion(auth.currentUser.uid)});
            set((state) => ({
                posts: state.posts.map((post) => 
                    post.id === postId ? {...post, is_liked: true} : post
                ),
                isLoading: false
            }));
        } catch (error) {
            console.error('Error liking post:', error);
        }
    },

    unlikePost: async (postId) => {
        console.log('Unliking post:', postId)
        try {
            const postRef = doc(db, 'posts', postId);
            await updateDoc(postRef, {likes: arrayRemove(auth.currentUser.uid)});
            set((state) => ({
                posts: state.posts.map((post) => 
                    post.id === postId ? {...post, is_liked: false} : post
                ),
                isLoading: false
            }));
        } catch (error) {
            console.error('Error unliking post:', error);
        }
    }
}))