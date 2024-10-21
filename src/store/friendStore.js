import { addDoc, collection, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { create } from 'zustand';
import { db } from '../services/firebase';

export const useFriendStore = create((set, get) => ({
    friends: [],
    friendRequests: [],
    isLoading: false,
    error: null,

    fetchFriends: async (userId) => {
        set({isLoading: true});
        try {
            const friendsRef = collection(db, 'friends');
            const q = query(friendsRef, where('userId', '==', userId ));
            const querySnapshot = await getDocs(q);
            const friends = querySnapshot.docs.map((doc) => {
                const friendData = {id: doc.id, ...doc.data()};
                console.log('Friend:', friendData);
                return friendData;
            });
            set({friends, isLoading: false});
        } catch (error) {
            console.error("Error fetching friends", error);
            set({error: error.message, isLoading: false});
        }
    },

    fetchFriendRequests: async (userId) => {
        set({isLoading: true});
        try {
            const requestsRef = collection(db, 'friendRequests');
            const q = query(requestsRef, where('to', '==', userId));
            const querySnapshot = await getDocs(q);
            const friendRequests = querySnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
            set({friendRequests, isLoading: false});
        } catch (error) {
            console.error("Error fetching friend requests", error);
            set({error: error.message, isLoading: false});
        }
    },

    searchUsers: async (searchQuery) => {
        set({isLoading: true});
        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('username', '>=', searchQuery), where('username', '<=', searchQuery + '\uf8ff'));
            const querySnapshot = await getDocs(q);
            const users = querySnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
            set({users, isLoading: false});
            return users;
        } catch (error) {
            set({error: error.message, isLoading: false});
            console.error(error);
            return [];
        }
    },

    sendFriendRequest: async (senderId, recipientId, recipientUsername) => {
        set({isLoading: true});
        try {
            await addDoc(collection(db, 'friendRequests'), {
                from: senderId, 
                to: recipientId, 
                status: 'pending',
                friendUsername: recipientUsername
            });
            set({isLoading: false});
        } catch (error) {
            set({error: error.message, isLoading: false});
        }
    },

    acceptFriendRequest: async (userId, friendId) => {
        set({isLoading: true});
        try {
            // Add friend for current user
            await addDoc(collection(db, 'friends'), { 
                userId: userId,
                friendId: friendId,
            });

            // Add friend for the other user
            await addDoc(collection(db, 'friends'), { 
                userId: friendId,
                friendId: userId,
            });

            const friendRequestsRef = collection(db, 'friendRequests');
            const q = query(friendRequestsRef, where('from', '==', friendId), where('to', '==', userId));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(doc => 
                deleteDoc(doc.ref)
            );
            get().fetchFriends(userId);
            get().fetchFriendRequests(userId);
            set({isLoading: false});
        } catch (error) {
            set({error: error.message, isLoading: false});
            console.error("Error accepting friend request", error);
        }
    },

    rejectFriendRequest: async (userId, friendId) => {
        set({isLoading: true});
        try {
            if (!userId) {
                throw new Error('userId is undefined');
            }
            if (!friendId) {
                throw new Error('friendId is undefined');
            }

            console.log(`Attempting to reject friend request from ${friendId} to ${userId}`);
            
            const friendRequestsRef = collection(db, 'friendRequests');
            const q = query(friendRequestsRef, where('from', '==', friendId), where('to', '==', userId));
            const querySnapshot = await getDocs(q);
            
            console.log(`Found ${querySnapshot.size} matching friend requests`);
            
            if (querySnapshot.empty) {
                console.warn('No matching friend request found to reject');
                set({isLoading: false});
                return;
            }

            const deletePromises = querySnapshot.docs.map(doc => {
                console.log(`Deleting friend request document with ID: ${doc.id}`);
                return deleteDoc(doc.ref);
            });

            await Promise.all(deletePromises);

            console.log('Friend request(s) successfully rejected');
            
            await get().fetchFriendRequests(userId);
            set({isLoading: false});
        } catch (error) {
            console.error("Error rejecting friend request", error);
            set({error: error.message, isLoading: false});
        }
    },

    removeFriend: async (userId, friendId) => {
        set({isLoading: true});
        try {
            console.log('Removing friend. userId:', userId, 'friendId:', friendId);
            
            if (!userId || !friendId) {
                throw new Error('Invalid userId or friendId');
            }
    
            const friendsRef = collection(db, 'friends');
            const q1 = query(friendsRef, where('userId', '==', userId), where('friendId', '==', friendId));
            const q2 = query(friendsRef, where('userId', '==', friendId), where('friendId', '==', userId));
            
            const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);
            
            console.log('Found friend documents:', snapshot1.size + snapshot2.size);
    
            const deletePromises = [
                ...snapshot1.docs.map(doc => deleteDoc(doc.ref)),
                ...snapshot2.docs.map(doc => deleteDoc(doc.ref))
            ];
    
            await Promise.all(deletePromises);
    
            console.log('Friend removed successfully');
    
            get().fetchFriends(userId);
            set({isLoading: false});
        } catch (error) {
            console.error("Error removing friend", error);
            set({error: error.message, isLoading: false});
        }
    },
}))
