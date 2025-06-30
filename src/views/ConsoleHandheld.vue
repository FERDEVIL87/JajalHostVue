<template>
  <section class="container py-4">
    <h1 class="text-center fw-bold mb-4" style="font-family:'Orbitron',sans-serif;color:#fff;min-height:2.5em;will-change: transform;">
      ULTIMATE GAME CONSOLES HUB
    </h1>

    <div class="text-center my-4 py-3 border-top border-bottom border-secondary">
        <h2 class="mb-3" style="font-family:'Orbitron',sans-serif;color:#fff;">Keranjang Belanja Global</h2>
        <p v-if="cartStore.items.length > 0" class="mb-2" style="color:#1aff6b;">
          Total Item: {{ cartStore.items.reduce((acc, item) => acc + item.qty, 0) }} | Total Harga: <span style="color:#1aff6b;font-weight:bold;">{{ formatPrice(cartStore.totalPrice) }}</span>
        </p>
        <p v-else class="mb-2" style="color:#b0b0b0;">Keranjang belanja utama masih kosong.</p>
        <button class="btn btn-success btn-lg px-5" @click="goToCheckout" style="font-family:'Orbitron',sans-serif;">
           <i class="bi bi-cart-check-fill me-2"></i> Lihat Keranjang & Checkout
        </button>
      </div>

    <div class="d-flex flex-wrap justify-content-center gap-2 mb-4">
      <button
        v-for="(card, index) in cards"
        :key="index"
        class="btn btn-outline-info px-3 py-1 fw-bold"
        :class="{ active: selectedCategory && selectedCategory.title === card.title }"
        @click="selectCategory(card)"
      >
        {{ card.title }}
      </button>
    </div>

    <div v-if="selectedCategory" class="bg-dark bg-opacity-85 rounded-3 p-3 mb-4" style="background:#181c22 !important;min-height:350px;">
      <h2 class="text-center fw-bold mb-3" style="font-family:'Orbitron',sans-serif;color:#fff;">
        {{ selectedCategory.title }}
      </h2>
      <!-- ... sisa template filter ... -->
      <div class="row g-2 align-items-center mb-2">
        <div class="col-12 col-md-6">
          <input type="text" v-model="searchQuery" placeholder="Search console..." class="form-control bg-secondary bg-opacity-25 text-light border-info" autocomplete="off"/>
        </div>
        <div class="col-12 col-md-6">
          <select v-model="selectedBrand" class="form-select bg-secondary bg-opacity-25 text-light border-info">
            <option value="">All Brands</option>
            <option v-for="brand in brands" :key="brand" :value="brand">{{ brand }}</option>
          </select>
        </div>
      </div>
      <div class="mb-3">
        <label class="form-label text-light fw-bold d-block mb-1">Rentang Harga</label>
        <div class="d-flex align-items-center mb-1">
          <span class="me-2 text-light" style="min-width:100px;">{{ formatPrice(minPrice) }}</span>
          <input type="range" v-model.number="minPrice" :min="minSliderBound" :max="maxSliderBound" :step="priceStep" class="form-range" @input="maxPrice = Math.max(minPrice, maxPrice)"/>
        </div>
        <div class="d-flex align-items-center mb-1">
          <span class="me-2 text-light" style="min-width:100px;">{{ formatPrice(maxPrice) }}</span>
          <input type="range" v-model.number="maxPrice" :min="minSliderBound" :max="maxSliderBound" :step="priceStep" class="form-range" @input="minPrice = Math.min(minPrice, maxPrice)"/>
        </div>
      </div>


      <div v-if="loading" class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3 mt-2" style="min-height:320px;">
        <div v-for="n in 8" :key="n" class="col"><div class="card placeholder-card h-100"><div class="placeholder-img"></div></div></div>
      </div>
      <div v-else-if="filteredConsoles.length > 0" class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3 mt-2" style="min-height:320px;">
        <div v-for="consoleItem in paginatedConsoles" :key="consoleItem.id" class="col">
          <div class="card h-100 border-info text-light d-flex flex-column" role="button" @click="showDetails(consoleItem)">
            <img :src="getImageUrl(consoleItem.image)" :alt="consoleItem.name" class="card-img-top" style="height:120px;object-fit:cover;background:#101829;" loading="lazy"/>
            <div class="card-body py-2 d-flex flex-column flex-grow-1">
              <h4 class="card-title fw-bold mb-1" style="font-family:'Orbitron',sans-serif;color:#fff;">{{ consoleItem.name }}</h4>
              <p class="mb-1"><span class="fw-semibold">Brand:</span> {{ consoleItem.brand }}</p>
              <p class="mb-1"><span class="fw-semibold">Stock:</span> <span :class="getStockClass(consoleItem.stock)">{{ consoleItem.stock }}</span></p>
              <p class="fw-bold mb-2">{{ formatPrice(consoleItem.price) }}</p>
              <button class="btn btn-sm btn-info fw-bold mt-auto" @click.stop="addItemToCartFromCard(consoleItem)" :disabled="consoleItem.stock === 'Kosong' || consoleItem.stock === 0 || consoleItem.stock === '0'">
                <i class="bi bi-cart-plus-fill"></i> Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center text-info py-4"><p>No consoles match your current filters.</p></div>

      <!-- Pagination controls -->
      <div v-if="filteredConsoles.length > itemsPerPage" class="d-flex justify-content-center my-3">
        <nav>
          <ul class="pagination pagination-sm mb-0">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="changePage(currentPage - 1)" :disabled="currentPage === 1">Prev</button>
            </li>
            <li
              v-for="page in totalPages"
              :key="page"
              class="page-item"
              :class="{ active: currentPage === page }"
            >
              <button class="page-link" @click="changePage(page)">{{ page }}</button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link" @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">Next</button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
    <div v-else class="text-center text-info py-4"><p>✨ Please select a category above to explore our awesome consoles! ✨</p></div>

    <div class="modal fade" id="consoleDetailModal" tabindex="-1" ref="consoleModalRef">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-dark text-light">
          <div class="modal-header border-0 pb-0">
            <h3 class="modal-title w-100 text-center fw-bold" style="font-family:'Orbitron',sans-serif;color:#fff;">{{ selectedProduct?.name }}</h3>
            <button type="button" class="btn-close btn-close-white" @click="closeDetails"></button>
          </div>
          <div class="modal-body">
            <img v-if="selectedProduct" :src="getImageUrl(selectedProduct.image)" :alt="selectedProduct.name" class="d-block mx-auto mb-3 rounded" style="max-width:220px;max-height:120px;object-fit:contain;background:#101829;" loading="lazy"/>
            <div v-if="selectedProduct" class="mb-2">
              <p class="mb-1"><strong>Price:</strong> <span>{{ formatPrice(selectedProduct.price) }}</span></p>
              <p class="mb-1"><strong>Brand:</strong> <span>{{ selectedProduct.brand }}</span></p>
              <p class="mb-1"><strong>Stock:</strong> <span :class="getStockClass(selectedProduct.stock)">{{ selectedProduct.stock }}</span></p>
            </div>
            <div v-if="selectedProduct?.specs && selectedProduct.specs.length > 0">
              <p class="fw-bold text-info mb-1">Features:</p>
              <ul class="ps-3 mb-0">
                <li v-for="(feature, index) in selectedProduct.specs" :key="index">{{ feature }}</li>
              </ul>
            </div>
            <div v-else-if="selectedProduct"><p class="text-muted">No additional features listed.</p></div>
            <div v-if="selectedProduct && (selectedProduct.stock !== 'Kosong' && Number(selectedProduct.stock) > 0)" class="mt-3 pt-3 border-top border-secondary">
                <div class="d-flex align-items-center justify-content-center gap-2 mb-2">
                    <label class="form-label mb-0">Qty:</label>
                    <input type="number" v-model.number="modalQuantity" min="1" :max="selectedProduct.stock === 'Ready' ? 99 : selectedProduct.stock" class="form-control form-control-sm bg-secondary bg-opacity-25 text-light border-info" style="width: 70px;"/>
                </div>
                <button class="btn btn-info w-100 fw-bold" @click="addItemToCartFromModal(selectedProduct)">Add to Cart</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { Modal } from 'bootstrap';
import { cartStore } from '@/store/cartStore';
import { useRouter } from 'vue-router';
import apiClient from '@/services/api.js'; // Impor apiClient
import '@/assets/console.css';

export default {
  name: "GameConsolesHub",
  setup() {
    const router = useRouter();
    return { router, cartStore };
  },
  data() {
    return {
      cards: [
        { title: "PlayStation Powerhouse" },
        { title: "Xbox Universe" },
        { title: "Nintendo Magic" },
        { title: "Handheld PC Heroes" },
        { title: "Explore More Consoles" },
      ],
      selectedCategory: null,
      searchQuery: "",
      selectedBrand: "",
      minPrice: 0,
      maxPrice: 12000000,
      priceStep: 100000,
      selectedProduct: null,
      bootstrapModalInstance: null,
      consoles: [], // Data akan diisi dari API
      loading: true,
      modalQuantity: 1,
      currentPage: 1,
      itemsPerPage: 50,
    };
  },
  async mounted() {
    // Panggil metode untuk mengambil data dari Laravel API
    await this.fetchConsoleData();

    // Inisialisasi modal Bootstrap
    const modalElement = this.$refs.consoleModalRef;
    if (modalElement) {
      this.bootstrapModalInstance = new Modal(modalElement);
    }
  },
  computed: {
    brands() {
      if (!this.selectedCategory) return [];
      const consolesInCategory = this.consoles.filter(c => c.category === this.selectedCategory.title);
      return [...new Set(consolesInCategory.map(c => c.brand))].sort();
    },
    minSliderBound() { return 0; },
    maxSliderBound() {
      if (!this.consoles.length) return 12000000;
      const maxPrice = Math.max(...this.consoles.map(c => Number(c.price) || 0), 0);
      return Math.ceil(maxPrice / this.priceStep) * this.priceStep || 12000000;
    },
    filteredConsoles() {
      if (!this.selectedCategory) return [];
      let filtered = this.consoles.filter(c => c.category === this.selectedCategory.title);
      if (this.searchQuery) {
        filtered = filtered.filter(c => c.name.toLowerCase().includes(this.searchQuery.toLowerCase()));
      }
      if (this.selectedBrand) {
        filtered = filtered.filter(c => c.brand === this.selectedBrand);
      }
      filtered = filtered.filter(c => {
        const price = Number(c.price) || 0;
        return price >= this.minPrice && price <= this.maxPrice;
      });
      return filtered;
    },
    paginatedConsoles() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredConsoles.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredConsoles.length / this.itemsPerPage) || 1;
    },
  },
  methods: {
    async fetchConsoleData() {
      this.loading = true;
      try {
        // Gunakan apiClient untuk memanggil endpoint Laravel
        const response = await apiClient.get('/console-and-handhelds'); // Sesuaikan dengan nama rute API Anda
        this.consoles = response.data.map(console => ({
            ...console,
            // Konversi tipe data jika perlu, Laravel seharusnya sudah memberikan yang benar
            price: Number(console.price),
            // Pastikan stock adalah angka atau string yang bisa diinterpretasikan
            stock: console.stock === "Ready" ? 100 : (console.stock === "Kosong" ? 0 : Number(console.stock) || 0),
        }));
        this.updatePriceSliderBounds();
        if (this.cards.length > 0 && !this.selectedCategory) {
            this.selectCategory(this.cards[0]);
        }
      } catch (error) {
        console.error("Gagal memuat data konsol dari Laravel:", error);
        alert("Gagal memuat data. Pastikan server backend berjalan.");
      } finally {
        this.loading = false;
      }
    },
    updatePriceSliderBounds() {
        this.$nextTick(() => {
          this.maxPrice = this.maxSliderBound;
          this.minPrice = this.minSliderBound;
        });
    },
    selectCategory(category) {
      this.selectedCategory = category;
      this.searchQuery = "";
      this.selectedBrand = "";
      this.currentPage = 1; // Reset to first page on category change
      this.updatePriceSliderBounds();
    },
    formatPrice(price) {
      return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price || 0);
    },
    showDetails(consoleItem) {
      this.selectedProduct = consoleItem;
      this.modalQuantity = 1;
      if (this.bootstrapModalInstance) this.bootstrapModalInstance.show();
    },
    closeDetails() {
      if (this.bootstrapModalInstance) this.bootstrapModalInstance.hide();
    },
    getStockClass(stock) {
      return Number(stock) > 0 ? 'text-success fw-bold' : 'text-danger fw-bold';
    },
    addItemToCart(consoleItem, quantity) {
        if (!consoleItem || quantity < 1) return;
        const stockNumber = Number(consoleItem.stock);
        if (isNaN(stockNumber) || stockNumber < quantity) {
            alert(`Stok tidak mencukupi.`);
            return;
        }
        const itemToAdd = {
            id: String(consoleItem.id),
            source: 'console',
            name: consoleItem.name,
            price: Number(consoleItem.price), // Harga sudah dalam IDR
            qty: quantity,
            category: consoleItem.category,
            brand: consoleItem.brand,
            image: consoleItem.image,
            specification: Array.isArray(consoleItem.specs) ? consoleItem.specs.join(', ') : 'N/A'
        };
        cartStore.addItem(itemToAdd);
        alert(`${consoleItem.name} (x${quantity}) ditambahkan ke keranjang!`);
    },
    addItemToCartFromCard(consoleItem) {
        this.addItemToCart(consoleItem, 1);
    },
    addItemToCartFromModal(consoleItem) {
        this.addItemToCart(consoleItem, this.modalQuantity);
        this.closeDetails();
    },
    goToCheckout() {
      if (cartStore.items.length === 0) {
        alert("Keranjang belanja Anda kosong.");
        return;
      }
      this.router.push('/checkout');
    },
    getImageUrl(imagePath) {
      if (!imagePath || imagePath.startsWith('http')) {
        return imagePath || 'https://placehold.co/400x300?text=No+Image';
      }
      const backendUrl = 'http://127.0.0.1:8000';
      return `${backendUrl}${imagePath}`;
    },
    changePage(page) {
      if (page < 1 || page > this.totalPages) return;
      this.currentPage = page;
      // Optional: scroll to top of product list after page change
      this.$nextTick(() => {
        const productList = this.$el.querySelector('.row.row-cols-1');
        if (productList) productList.scrollIntoView({ behavior: 'smooth' });
      });
    },
  },
  watch: {
    // Reset to first page if filter changes
    searchQuery() { this.currentPage = 1; },
    selectedBrand() { this.currentPage = 1; },
    minPrice() { this.currentPage = 1; },
    maxPrice() { this.currentPage = 1; },
    // ...existing code...
    consoles: 'updatePriceSliderBounds',
  }
};
</script>