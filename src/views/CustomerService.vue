<template>
  <section class="py-5 bg-black min-vh-100 d-flex align-items-center justify-content-center">
    <div class="container d-flex justify-content-center align-items-center" style="min-height: 80vh;">
      <div class="card shadow-lg custom-card">
        <div class="card-body px-4 py-4">
          <div class="mb-4 pb-2 border-bottom border-info">
            <h2 class="mb-1 fw-bold text-info" style="font-size: 1.7rem;">Hubungi Kami</h2>
            <p class="desc-info mb-0">Kirim pertanyaan atau pesan lewat formulir ini.</p>
          </div>

          <!-- Tampilkan pesan sukses/error -->
          <div v-if="statusMessage" :class="['alert', isSuccess ? 'alert-success' : 'alert-danger']">
            {{ statusMessage }}
          </div>

          <!-- Gunakan v-if untuk menyembunyikan form setelah sukses -->
          <form @submit.prevent="submitForm" v-if="!isSuccess">
            <div class="mb-3 text-start">
              <label class="form-label text-info fw-semibold" for="name">Nama</label>
              <input v-model="form.name" id="name" type="text" class="form-control" placeholder="Nama Anda" required autocomplete="name">
            </div>
            <div class="mb-3 text-start">
              <label class="form-label text-info fw-semibold" for="email">Email</label>
              <input v-model="form.email" id="email" type="email" class="form-control" placeholder="Email Anda" required autocomplete="email">
            </div>
            <div class="mb-4 text-start">
              <label class="form-label text-info fw-semibold" for="message">Pesan</label>
              <textarea v-model="form.message" id="message" class="form-control" placeholder="Pesan Anda" rows="4" required></textarea>
            </div>
            <button type="submit" class="btn btn-info w-100 fw-bold" :disabled="isLoading">
              {{ isLoading ? 'Mengirim...' : 'Kirim' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
// Impor axios secara langsung di komponen ini
import axios from 'axios';
import '@/assets/cs.css';

export default {
  data() {
    return {
      form: {
        name: '',
        email: '',
        message: ''
      },
      isLoading: false,
      statusMessage: '',
      isSuccess: false,
    };
  },
  methods: {
    async submitForm() {
      this.isLoading = true;
      this.statusMessage = '';
      this.isSuccess = false;

      try {
        // Definisikan URL API lengkap di sini
        const apiUrl = 'http://127.0.0.1:8000/api/customer-service';

        // Kirim data ke API Laravel menggunakan axios
        // `this.form` akan dikirim sebagai { name: '...', email: '...', message: '...' }
        // yang sudah sesuai dengan validasi di Laravel
        const response = await axios.post(apiUrl, this.form);

        // Jika berhasil
        this.isSuccess = true;
        this.statusMessage = response.data.message;

        // Kosongkan form setelah berhasil
        this.form.name = '';
        this.form.email = '';
        this.form.message = '';

      } catch (error) {
        // Jika gagal
        this.isSuccess = false;
        if (error.response && error.response.data && error.response.data.message) {
          this.statusMessage = `Gagal mengirim: ${error.response.data.message}`;
        } else if (error.code === 'ERR_NETWORK') {
          this.statusMessage = 'Tidak dapat terhubung ke server. Pastikan backend berjalan.';
        } else {
          this.statusMessage = 'Terjadi kesalahan. Silakan coba lagi.';
        }
        console.error('Error submitting form:', error);
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>
