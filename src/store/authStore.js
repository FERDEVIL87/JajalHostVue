import { defineStore } from 'pinia';
import apiClient from '@/services/api.js';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
  },
  actions: {
    async handleLogin(credentials) {
      // Panggil API login
      const response = await apiClient.post('/login', credentials);
      // Simpan data ke state dan localStorage
      this.user = response.data.user;
      this.token = response.data.token;
      localStorage.setItem('user', JSON.stringify(this.user));
      localStorage.setItem('token', this.token);
      // Atur header default untuk permintaan selanjutnya
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
    },
    async handleRegister(form) {
      // Panggil API register
      await apiClient.post('/register', form);
    },
    logout() {
      // Panggil API logout jika ada
      if (this.token) {
        apiClient.post('/logout');
      }
      // Hapus data dari state dan localStorage
      this.user = null;
      this.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      delete apiClient.defaults.headers.common['Authorization'];
    },
  },
});