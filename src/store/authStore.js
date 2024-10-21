import { create } from 'zustand';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../services/firebase';

export const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    login: async (username, password) => {
        set({ isLoading: true, error: null });
        try {
            const userCredential = await signInWithEmailAndPassword(auth, username, password);
            set({ user: userCredential.user, isAuthenticated: true, isLoading: false });
            return true;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            return false;
        }
    },
    register: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            set({ user: userCredential.user, isAuthenticated: true, isLoading: false });
            return true;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            return false;
        }
    },
    logout: async () => {
        set({ isLoading: true, error: null });
        try {
            await signOut(auth);
            set({ user: null, isAuthenticated: false, isLoading: false, error: null });
            return true;
        } catch (error) {
            console.log("Logout error:", error);
            set({ error: error.message, isLoading: false, user: null, isAuthenticated: false });
            return false;
        }
    },
    checkAuth: () => {
        onAuthStateChanged(auth, (user) => {
            set({ user, isAuthenticated: !!user, isLoading: false }); // !!user converts user to boolean
        });
    },
}));