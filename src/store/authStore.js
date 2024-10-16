import { create } from 'zustand'
import api from '../services/api'

const useAuthStore = create((set) => ({
    user: null,
    isLoading: true,
    isAuthenticated: false,

    login: async (username, password) => {
        try {
            const user = await api.login(username, password);
            set({ user, isAuthenticated: true, isLoading: false });
            await api.getCurrentUser();  // Immediately check authentication
            return user;
        } catch (error) {
            set({ isLoading: false, error: error.message });
            console.error('Login failed:', error);
            throw error;
        }
    },

    register: async (username, password, email) => {
        try {
            const user = await api.register(username, password, email)
            set({ user, isAuthenticated: true, isLoading: false })
            return user
        } catch (error) {
            set({ isLoading: false, error: error.message })
            console.error('Registration failed:', error)
            throw error
        }
    },

    logout: async () => {
        try {
            await api.logout()
            set({ user: null, isAuthenticated: false })
        } catch (error) {
            set({ error: error.message })
            console.error('Logout failed:', error)
            throw error
        }
    },

    checkAuth: async () => {
        set({ isLoading: true })
        try {
            const user = await api.getCurrentUser()
            set({ user, isAuthenticated: true, isLoading: false })
            console.log('Check auth Success:', user)
            return user
        } catch (error) {
            set({ user: null, isAuthenticated: false, isLoading: false, error: error.message })
            console.error('Authentication check failed:', error)
            throw error
        }
    }
}))

export default useAuthStore
