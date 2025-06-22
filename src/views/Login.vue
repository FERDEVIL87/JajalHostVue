<template>
  <div class="login-bg">
    <div class="square" style="--clr:#00d9ff;">
      <i></i><i></i><i></i>
      <div class="login">
        <h2>Login</h2>
        <form @submit.prevent="handleLogin">
          <div class="inputBx">
            <input v-model="loginForm.username" placeholder="Username" required />
          </div>
          <div class="inputBx">
            <input v-model="loginForm.password" type="password" placeholder="Password" required />
          </div>
          <div class="inputBx">
            <input type="submit" :value="loading ? 'Loading...' : 'Login'" :disabled="loading" />
          </div>
          <p v-if="error" class="error-message">{{ error }}</p>
        </form>
        <div class="links">
          <a href="#" @click.prevent="showRegisterModal = true">Registrasi</a>
          <a href="#" @click.prevent="showForgotModal = true">Lupa Password</a>
        </div>
      </div>
      <!-- Modal Registrasi -->
      <div v-if="showRegisterModal" class="modal-login">
        <div class="modal-content-login">
          <span class="close" @click="closeRegisterModal">×</span>
          <h3>Registrasi Akun Baru</h3>
          <form @submit.prevent="handleRegister">
            <div class="inputBx"><input v-model="registerForm.username" placeholder="Username" required /></div>
            <div class="inputBx"><input v-model="registerForm.email" type="email" placeholder="Email" required /></div>
            <div class="inputBx"><input v-model="registerForm.password" type="password" placeholder="Password" required /></div>
            <div class="inputBx"><input v-model="registerForm.password_confirmation" type="password" placeholder="Konfirmasi Password" required /></div>
            <div class="inputBx"><input type="submit" :value="loading ? 'Mendaftar...' : 'Daftar'" :disabled="loading" /></div>
            <p v-if="registerError" class="error-message">{{ registerError }}</p>
            <p v-if="registerSuccess" class="success-message">{{ registerSuccess }}</p>
          </form>
        </div>
      </div>
      <!-- Modal Lupa Password -->
      <div v-if="showForgotModal" class="modal-login">
        <div class="modal-content-login">
          <span class="close" @click="closeForgotModal">×</span>
          <h3>Lupa Password</h3>
          <form @submit.prevent="handleForgotPassword">
            <div class="inputBx"><input v-model="forgotEmail" type="email" placeholder="Masukkan email Anda" required /></div>
            <div class="inputBx"><input type="submit" :value="loading ? 'Mengirim...' : 'Kirim Link Reset'" :disabled="loading" /></div>
            <p v-if="forgotError" class="error-message">{{ forgotError }}</p>
            <p v-if="forgotSuccess" class="success-message">{{ forgotSuccess }}</p>
          </form>
        </div>
      </div>
      <!-- Success Modal Registrasi -->
      <div v-if="showRegisterSuccessModal" class="modal-login">
        <div class="modal-content-login">
          <span class="close" @click="closeRegisterSuccessModal">×</span>
          <h3>Berhasil Registrasi Akun</h3>
        </div>
      </div>
      <!-- Success Modal Lupa Password -->
      <div v-if="showForgotSuccessModal" class="modal-login">
        <div class="modal-content-login">
          <span class="close" @click="closeForgotSuccessModal">×</span>
          <h3>Email Reset password berhasil dikirim</h3>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/services/api.js';
import '@/assets/Login.css';

// --- Inisialisasi ---
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// --- State untuk Login ---
const loading = ref(false);
const loginForm = reactive({ username: '', password: '' });
const error = ref('');

// --- State untuk Registrasi ---
const showRegisterModal = ref(false);
const registerForm = reactive({ username: '', email: '', password: '', password_confirmation: '' });
const registerError = ref('');
const registerSuccess = ref('');

// --- State untuk Lupa Password ---
const showForgotModal = ref(false);
const forgotEmail = ref('');
const forgotError = ref('');
const forgotSuccess = ref('');

// --- New success modal state ---
const showRegisterSuccessModal = ref(false);
const showForgotSuccessModal = ref(false);

// --- Metode Login ---
async function handleLogin() {
  loading.value = true;
  error.value = '';
  try {
    await authStore.handleLogin(loginForm);
    // Redirect ke halaman yang diinginkan, atau ke home jika tidak ada
    router.push(route.query.redirect || '/');
  } catch (err) {
    error.value = err.response?.data?.message || 'Terjadi kesalahan saat login.';
  } finally {
    loading.value = false;
  }
}

// --- Metode Registrasi ---
async function handleRegister() {
  loading.value = true;
  registerError.value = '';
  registerSuccess.value = '';

  if (registerForm.password !== registerForm.password_confirmation) {
    registerError.value = 'Password dan konfirmasi password tidak cocok!';
    loading.value = false;
    return;
  }

  try {
    const response = await apiClient.post('/register', registerForm);
    registerSuccess.value = response.data.message;
    // Reset form
    Object.assign(registerForm, { username: '', email: '', password: '', password_confirmation: '' });

    // Auto-close register modal and show success modal
    setTimeout(() => {
      closeRegisterModal();
      showRegisterSuccessModal.value = true;
    }, 1000);
  } catch (err) {
    registerError.value = err.response?.data?.message || 'Terjadi kesalahan saat registrasi.';
  } finally {
    loading.value = false;
  }
}

// --- Metode Lupa Password ---
async function handleForgotPassword() {
    loading.value = true;
    forgotError.value = '';
    forgotSuccess.value = '';
    try {
        const response = await apiClient.post('/forgot-password', { email: forgotEmail.value });
        forgotSuccess.value = response.data.message;

        // Auto-close forgot password modal and show success modal
        setTimeout(() => {
          closeForgotModal();
          showForgotSuccessModal.value = true;
        }, 1000);
    } catch (err) {
        forgotError.value = err.response?.data?.message || 'Terjadi kesalahan.';
    } finally {
        loading.value = false;
    }
}

// --- Metode untuk Modal ---
function closeRegisterModal() {
  showRegisterModal.value = false;
  registerError.value = '';
  registerSuccess.value = '';
}

function closeForgotModal() {
  showForgotModal.value = false;
  forgotError.value = '';
  forgotSuccess.value = '';
}

// --- New method to close success modal ---
function closeRegisterSuccessModal() {
  showRegisterSuccessModal.value = false;
}

function closeForgotSuccessModal() {
  showForgotSuccessModal.value = false;
}
</script>