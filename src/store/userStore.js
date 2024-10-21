import { arrayUnion, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import {create} from 'zustand';
import { auth, db } from '../services/firebase';
import { updateProfile } from 'firebase/auth';

export const useProfileStore = create((set) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchProfile: async (userId) => {
    console.log('fetchProfile userId', userId)
    set({ isLoading: true });
    try {
      const docRef = await getDoc(doc(db, 'users', userId));
      set({ profile: docRef.data(), isLoading: false });
    } catch (error) {
      console.error('Profile fetch error:', error);
      set({ error: error.response?.data?.detail || error.message || 'An unknown error occurred', isLoading: false });
    }
  },

  updateProfile: async (userId, data) => {
    set({ isLoading: true });
    try {
      await updateDoc(doc(db, 'users', userId), data);
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
            displayName: data.username,
            photoURL: data.profile_picture,
        });
      }
      set((state) => ({
        profile: state.profile ? { ...state.profile, ...data } : null,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Profile update error:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  createProfile: async (userId, data) => {
    set ({isLoading: true});
    try {
      await setDoc(doc(db, 'users', userId), data);
      set({ profile: {...data}, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  followUser: async (userId) => {
    try {
      await updateDoc(doc(db, 'users', userId), { followers: arrayUnion(auth.currentUser.uid) });
      set((state) => ({
        profile: state.profile
          ? { ...state.profile, followers_count: state.profile.followers_count + 1 }
          : null,
      }));
    } catch (error) {
      set({ error: error.response.data });
    }
  },
}));