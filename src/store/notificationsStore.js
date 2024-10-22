import { create } from 'zustand';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  isLoading: false,
  error: null,

  fetchNotifications: async (userId) => {
    set({ isLoading: true });
    try {
      const q = query(collection(db, 'notifications'), where('recipientId', '==', userId));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const notificationsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        set({ notifications: notificationsData, isLoading: false });
      });
      return unsubscribe;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  addNotification: async (notification) => {
    try {
      const docRef = await addDoc(collection(db, 'notifications'), notification);
      set(state => ({
        notifications: [...state.notifications, { id: docRef.id, ...notification }]
      }));
    } catch (error) {
      console.error('Error adding notification:', error);
      set({ error: error.message });
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
      set(state => ({
        notifications: state.notifications.filter(n => n.id !== notificationId)
      }));
    } catch (error) {
      console.error('Error deleting notification:', error);
      set({ error: error.message });
    }
  },

  markAsRead: async (notificationId) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), { read: true });
      set(state => ({
        notifications: state.notifications.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      set({ error: error.message });
    }
  },

  markAllAsRead: async (userId) => {
    try {
      const q = query(collection(db, 'notifications'), where('recipientId', '==', userId), where('read', '==', false));
      const querySnapshot = await getDocs(q);
      const updatePromises = querySnapshot.docs.map(doc => updateDoc(doc.ref, { read: true }));
      await Promise.all(updatePromises);
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      }));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      set({ error: error.message });
    }
  },

  clearError: () => set({ error: null }),
}));