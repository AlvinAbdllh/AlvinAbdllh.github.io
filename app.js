/* ============================================
   AQUA SEJAHTERA — APP LOGIC
   ============================================ */

// === KONFIGURASI ===
// Ganti dengan nomor WhatsApp agen Anda (format internasional tanpa +)
const NOMOR_WA_AGEN = "6281234567890";

// State keranjang
let cart = {};

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 20) {
        navbar.style.boxShadow = '0 4px 24px rgba(0,0,0,0.10)';
    } else {
        navbar.style.boxShadow = 'none';
    }
});

// Format ke Rupiah
function formatRupiah(num) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(num);
}

// Tambah produk ke keranjang
function addToCart(id, name, price) {
    if (cart[id]) {
        cart[id].qty += 1;
    } else {
        cart[id] = { name, price, qty: 1 };
    }
    updateCartUI();
    showAddedFeedback(id);
}

// Animasi feedback tombol tambah
function showAddedFeedback(productId) {
    // Map product id ke button
    const buttons = document.querySelectorAll('.btn-add-cart');
    const index = parseInt(productId) - 1;
    if (buttons[index]) {
        const btn = buttons[index];
        const originalText = btn.innerHTML;
        btn.style.background = '#00875A';
        btn.style.borderColor = '#00875A';
        btn.style.color = 'white';
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Ditambahkan!`;
        setTimeout(() => {
            btn.style.background = '';
            btn.style.borderColor = '';
            btn.style.color = '';
            btn.innerHTML = originalText;
        }, 1200);
    }
}

// Ubah jumlah item
function changeQty(id, delta) {
    if (!cart[id]) return;
    cart[id].qty += delta;
    if (cart[id].qty <= 0) {
        delete cart[id];
    }
    updateCartUI();
}

// Update tampilan keranjang
function updateCartUI() {
    const container = document.getElementById('cartItemsContainer');
    const totalValueSpan = document.getElementById('cartTotalValue');
    const badge = document.getElementById('cartCountBadge');
    const stickyBar = document.getElementById('stickyCart');
    const stickyTotal = document.getElementById('stickyCartTotal');

    container.innerHTML = '';
    let total = 0;
    let totalItems = 0;
    const items = Object.keys(cart);

    if (items.length === 0) {
        container.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
                </div>
                <p>Keranjang masih kosong</p>
                <a href="#katalog" class="btn-browse">Lihat Produk →</a>
            </div>
        `;
        totalValueSpan.textContent = 'Rp 0';
        badge.textContent = '0 item';
        stickyBar.classList.remove('active');
        return;
    }

    items.forEach(id => {
        const item = cart[id];
        const itemTotal = item.price * item.qty;
        total += itemTotal;
        totalItems += item.qty;

        const el = document.createElement('div');
        el.className = 'cart-item';
        el.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <span class="cart-item-price">${formatRupiah(itemTotal)}</span>
            </div>
            <div class="cart-qty-control">
                <button class="btn-qty" onclick="changeQty(${id}, -1)" aria-label="Kurangi">−</button>
                <span class="qty-num">${item.qty}</span>
                <button class="btn-qty" onclick="changeQty(${id}, 1)" aria-label="Tambah">+</button>
            </div>
        `;
        container.appendChild(el);
    });

    totalValueSpan.textContent = formatRupiah(total);
    badge.textContent = `${totalItems} item`;
    stickyTotal.textContent = formatRupiah(total);

    // Tampilkan sticky bar di mobile
    if (window.innerWidth < 992) {
        stickyBar.classList.add('active');
    }
}

// Kirim ke WhatsApp
function sendToWhatsApp(event) {
    event.preventDefault();

    if (Object.keys(cart).length === 0) {
        alert('Keranjang belanja masih kosong. Silakan pilih produk terlebih dahulu!');
        document.getElementById('katalog').scrollIntoView({ behavior: 'smooth' });
        return;
    }

    const nama    = document.getElementById('nama').value.trim();
    const phone   = document.getElementById('phone').value.trim();
    const alamat  = document.getElementById('alamat').value.trim();
    const catatan = document.getElementById('catatan').value.trim() || '-';
    const waktu   = document.querySelector('input[name="waktu"]:checked').value;

    let rincian = '';
    let grandTotal = 0;
    let no = 1;

    Object.keys(cart).forEach(id => {
        const item = cart[id];
        const subtotal = item.price * item.qty;
        grandTotal += subtotal;
        rincian += `${no}. *${item.name}* x ${item.qty} = ${formatRupiah(subtotal)}\n`;
        no++;
    });

    const pesan =
`*🛒 PESANAN BARU — AGEN AQUA SEJAHTERA*

*👤 Data Pelanggan:*
• Nama     : ${nama}
• No. HP   : ${phone}
• Jam Kirim: ${waktu}

*📍 Alamat Pengiriman:*
${alamat}

*📦 Rincian Pesanan:*
${rincian}
*💰 Total Bayar: ${formatRupiah(grandTotal)}*

*📝 Catatan:*
_${catatan}_

Terima kasih! Mohon segera dikonfirmasi ya kak 🙏`;

    const url = `https://wa.me/${NOMOR_WA_AGEN}?text=${encodeURIComponent(pesan)}`;
    window.open(url, '_blank');
}

// Sembunyikan sticky bar di desktop saat resize
window.addEventListener('resize', () => {
    const stickyBar = document.getElementById('stickyCart');
    if (window.innerWidth >= 992) {
        stickyBar.classList.remove('active');
    } else if (Object.keys(cart).length > 0) {
        stickyBar.classList.add('active');
    }
});
