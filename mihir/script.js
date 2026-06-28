const WATCH_DATA = [
    { id: 'w1', name: 'Daytona', brand: 'Rolex', category: 'Luxury', price: 1450000, description: 'Iconic chronograph with tachymeter bezel, 4130 movement.', image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=400&q=80', stock: 3, rating: 4.9, reviews: 42 },
    { id: 'w2', name: 'Speedmaster Moonwatch', brand: 'Omega', category: 'Sports', price: 620000, description: 'First watch on the moon. Manual winding, hesalite crystal.', image: 'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=400&q=80', stock: 5, rating: 4.8, reviews: 38 },
    { id: 'w3', name: 'Carrera', brand: 'Tag Heuer', category: 'Sports', price: 340000, description: 'Racing-inspired chronograph, automatic movement.', image: 'https://images.unsplash.com/photo-1585123334904-845d60e6b4b2?w=400&q=80', stock: 7, rating: 4.6, reviews: 29 },
    { id: 'w4', name: 'Nautilus', brand: 'Patek Philippe', category: 'Luxury', price: 3200000, description: 'Iconic luxury sports watch, porthole design, 5711.', image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=400&q=80', stock: 2, rating: 4.9, reviews: 56 },
    { id: 'w5', name: 'Royal Oak', brand: 'Audemars Piguet', category: 'Luxury', price: 2800000, description: 'Octagonal bezel, integrated bracelet, "Jumbo" 39mm.', image: 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=400&q=80', stock: 2, rating: 4.7, reviews: 44 },
    { id: 'w6', name: 'Big Bang', brand: 'Hublot', category: 'Luxury', price: 1100000, description: 'Fusion of ceramic, titanium, and rubber. Bold design.', image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&q=80', stock: 4, rating: 4.5, reviews: 31 },
    { id: 'w7', name: 'Portugieser', brand: 'IWC', category: 'Classic', price: 720000, description: 'Elegant dress watch with 7-day power reserve.', image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=400&q=80', stock: 6, rating: 4.7, reviews: 27 },
    { id: 'w8', name: 'Santos', brand: 'Cartier', category: 'Classic', price: 680000, description: 'Square dial, screw-down bezel, iconic Parisian style.', image: 'https://images.unsplash.com/photo-1598977123118-4e30ba3c4f5b?w=400&q=80', stock: 4, rating: 4.6, reviews: 33 },
    { id: 'w9', name: 'Navitimer', brand: 'Breitling', category: 'Sports', price: 540000, description: 'Aviation chronograph with slide rule bezel.', image: 'https://images.unsplash.com/photo-1565440962783-fafef5cbecb2?w=400&q=80', stock: 5, rating: 4.4, reviews: 22 },
    { id: 'w10', name: 'Reverso', brand: 'Jaeger-LeCoultre', category: 'Classic', price: 820000, description: 'Art Deco design, reversible case, two dials.', image: 'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=400&q=80', stock: 3, rating: 4.8, reviews: 39 },
    { id: 'w11', name: 'Submariner', brand: 'Rolex', category: 'Sports', price: 950000, description: 'Dive watch icon, Cerachrom bezel, 300m water resistance.', image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&q=80', stock: 4, rating: 4.9, reviews: 61 },
    { id: 'w12', name: 'Classic Fusion', brand: 'Hublot', category: 'Luxury', price: 980000, description: 'Slimmer, more elegant Hublot with titanium case.', image: 'https://images.unsplash.com/photo-1585123334904-845d60e6b4b2?w=400&q=80', stock: 3, rating: 4.3, reviews: 18 }
];

const state = {
    products: [...WATCH_DATA],
    cart: [],
    wishlist: [],
    activeTab: 'cart',
    sidebarOpen: false,
    filters: { brand: '', category: '', search: '', sort: 'default', priceMin: '', priceMax: '' }
};

const refs = {};
const $ = id => document.getElementById(id);
const formatPrice = price => '₹' + price.toLocaleString('en-IN');
const getStars = rating => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
};
const getBrands = () => [...new Set(state.products.map(p => p.brand))].sort();

let toastTimer = null;
function showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'error' : ''}`;
    toast.textContent = message;
    refs.toastContainer.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 2800);
}

function saveState() {
    try {
        localStorage.setItem('luxe_cart', JSON.stringify(state.cart));
        localStorage.setItem('luxe_wishlist', JSON.stringify(state.wishlist));
        localStorage.setItem('luxe_theme', document.documentElement.getAttribute('data-theme') || 'dark');
    } catch (error) {
        console.warn('Could not save state', error);
    }
}

function loadState() {
    try {
        const cart = localStorage.getItem('luxe_cart');
        const wishlist = localStorage.getItem('luxe_wishlist');
        const theme = localStorage.getItem('luxe_theme');
        if (cart) state.cart = JSON.parse(cart);
        if (wishlist) state.wishlist = JSON.parse(wishlist);
        if (theme) document.documentElement.setAttribute('data-theme', theme);
    } catch (error) {
        console.warn('Could not load state', error);
    }
}

function getStockLabel(stock) {
    if (stock > 5) return 'In Stock';
    if (stock > 0) return 'Low Stock';
    return 'Out of Stock';
}

function filterProducts() {
    const { brand, category, search, priceMin, priceMax } = state.filters;
    return state.products.filter(product => {
        if (brand && product.brand !== brand) return false;
        if (category && product.category !== category) return false;
        if (search.trim()) {
            const query = search.trim().toLowerCase();
            const matchesName = product.name.toLowerCase().includes(query);
            const matchesBrand = product.brand.toLowerCase().includes(query);
            const matchesDescription = product.description.toLowerCase().includes(query);
            if (!matchesName && !matchesBrand && !matchesDescription) return false;
        }
        if (priceMin && product.price < Number(priceMin)) return false;
        if (priceMax && product.price > Number(priceMax)) return false;
        return true;
    });
}

function renderProducts() {
    const { sort } = state.filters;
    let products = filterProducts();

    if (sort === 'price-asc') products.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') products.sort((a, b) => b.price - a.price);
    else if (sort === 'name') products.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'rating') products.sort((a, b) => b.rating - a.rating);

    if (!products.length) {
        refs.productsGrid.innerHTML = `
            <div class="empty-grid-message">
                <div class="empty-icon">⌚</div>
                <p>No watches match your filters. Try adjusting your search.</p>
            </div>
        `;
        return;
    }

    refs.productsGrid.innerHTML = products.map(product => {
        const inWish = state.wishlist.some(item => item.id === product.id);
        const stockClass = product.stock > 5 ? 'in-stock' : product.stock > 0 ? 'low-stock' : '';
        const inCart = state.cart.some(item => item.id === product.id);

        return `
            <div class="product-card" onclick="openProductModal('${product.id}')">
                <div class="product-img-wrap">
                    <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80'" />
                    <span class="product-badge">${product.category}</span>
                    <button class="product-wishlist ${inWish ? 'active' : ''}" onclick="event.stopPropagation(); toggleWishlist('${product.id}')" aria-label="Toggle wishlist">
                        ${inWish ? '♥' : '♡'}
                    </button>
                </div>
                <div class="product-body">
                    <div class="product-brand">${product.brand}</div>
                    <div class="product-name">${product.name}</div>
                    <div class="product-rating">${getStars(product.rating)} <span>(${product.reviews})</span></div>
                    <div class="product-desc">${product.description}</div>
                    <div class="product-stock ${stockClass}">${getStockLabel(product.stock)} · ${product.stock} available</div>
                    <div class="product-meta">
                        <div class="product-price">${formatPrice(product.price)} <small>incl. tax</small></div>
                        <div class="product-actions">
                            <button class="btn-sm gold" onclick="event.stopPropagation(); addToCart('${product.id}')">${inCart ? '+1' : 'Add'}</button>
                            <button class="btn-sm outline-gold" onclick="event.stopPropagation(); quickEnquiry('${product.id}')">Enquire</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function populateBrandFilter() {
    refs.filterBrand.innerHTML = '<option value="">All Brands</option>' + getBrands().map(brand => `<option value="${brand}">${brand}</option>`).join('');
}

function applyFilters() {
    state.filters.brand = refs.filterBrand.value;
    state.filters.category = refs.filterCategory.value;
    state.filters.search = refs.filterSearch.value;
    state.filters.sort = refs.filterSort.value;
    state.filters.priceMin = refs.filterPriceMin.value;
    state.filters.priceMax = refs.filterPriceMax.value;
    renderProducts();
}

function clearFilters() {
    refs.filterBrand.value = '';
    refs.filterCategory.value = '';
    refs.filterSearch.value = '';
    refs.filterSort.value = 'default';
    refs.filterPriceMin.value = '';
    refs.filterPriceMax.value = '';
    state.filters = { brand: '', category: '', search: '', sort: 'default', priceMin: '', priceMax: '' };
    renderProducts();
}

function addToCart(productId) {
    const product = state.products.find(item => item.id === productId);
    if (!product) return;
    if (product.stock < 1) {
        showToast('⚠️ Out of stock!', true);
        return;
    }

    const cartItem = state.cart.find(item => item.id === productId);
    if (cartItem) {
        if (cartItem.qty >= product.stock) {
            showToast('⚠️ Max stock reached!', true);
            return;
        }
        cartItem.qty += 1;
    } else {
        state.cart.push({ ...product, qty: 1 });
    }

    saveState();
    updateCartUI();
    showToast(`✅ Added ${product.name} to cart`);
}

function removeFromCart(productId) {
    const item = state.cart.find(i => i.id === productId);
    if (!item) return;
    state.cart = state.cart.filter(i => i.id !== productId);
    saveState();
    updateCartUI();
    renderSidebar();
    showToast(`🗑️ Removed ${item.name}`);
}

function updateCartQty(productId, delta) {
    const item = state.cart.find(i => i.id === productId);
    const product = state.products.find(i => i.id === productId);
    if (!item || !product) return;
    const newQty = item.qty + delta;
    if (newQty < 1) {
        removeFromCart(productId);
        return;
    }
    if (newQty > product.stock) {
        showToast('⚠️ Not enough stock!', true);
        return;
    }
    item.qty = newQty;
    saveState();
    updateCartUI();
    renderSidebar();
}

function updateCartUI() {
    refs.cartCount.textContent = state.cart.reduce((sum, item) => sum + item.qty, 0);
    refs.wishlistCount.textContent = state.wishlist.length;
    if (state.sidebarOpen) renderSidebar();
}

function getCartTotal() {
    return state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function toggleWishlist(productId) {
    const product = state.products.find(item => item.id === productId);
    if (!product) return;

    const index = state.wishlist.findIndex(item => item.id === productId);
    if (index > -1) {
        state.wishlist.splice(index, 1);
        showToast('♡ Removed from wishlist');
    } else {
        state.wishlist.push({ ...product });
        showToast('♥ Added to wishlist');
    }

    saveState();
    renderProducts();
    updateCartUI();
    if (state.sidebarOpen && state.activeTab === 'wishlist') renderSidebar();
}

function toggleSidebar(tab) {
    state.activeTab = tab || state.activeTab;
    if (!state.sidebarOpen) {
        state.sidebarOpen = true;
        refs.sidebar.classList.add('open');
        refs.sidebarOverlay.classList.add('open');
        renderSidebar();
        document.querySelectorAll('.sidebar-tabs button').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === state.activeTab));
    } else if (state.activeTab === tab) {
        closeSidebar();
    } else {
        state.activeTab = tab;
        document.querySelectorAll('.sidebar-tabs button').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tab));
        renderSidebar();
    }
}

function closeSidebar() {
    state.sidebarOpen = false;
    refs.sidebar.classList.remove('open');
    refs.sidebarOverlay.classList.remove('open');
}

function switchSidebarTab(tab) {
    state.activeTab = tab;
    document.querySelectorAll('.sidebar-tabs button').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tab));
    renderSidebar();
}

function renderSidebar() {
    const isCart = state.activeTab === 'cart';
    const items = isCart ? state.cart : state.wishlist;

    if (!items.length) {
        refs.sidebarBody.innerHTML = `
            <div class="empty-state">
                <div class="icon">${isCart ? '🛒' : '♡'}</div>
                <p>${isCart ? 'Your cart is empty.' : 'No watches in wishlist yet.'}</p>
                <p style="font-size:0.7rem;margin-top:6px;">${isCart ? 'Browse our collection and add your favorites.' : 'Tap ♡ on any watch to save it here.'}</p>
            </div>
        `;
        refs.sidebarFooter.innerHTML = '';
        return;
    }

    refs.sidebarBody.innerHTML = items.map(item => `
        <div class="sidebar-item">
            <img src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80'" />
            <div class="sidebar-item-info">
                <div class="name">${item.name}</div>
                <div class="brand">${item.brand}</div>
                <div class="price">${formatPrice(item.price)}</div>
            </div>
            ${isCart ? `
                <div class="sidebar-item-qty">
                    <button onclick="updateCartQty('${item.id}', -1)">-</button>
                    <span>${item.qty}</span>
                    <button onclick="updateCartQty('${item.id}', 1)">+</button>
                </div>
                <button class="sidebar-item-remove" onclick="removeFromCart('${item.id}')">✕</button>
            ` : `
                <button class="btn-sm gold" onclick="addToCart('${item.id}'); renderSidebar();">Add</button>
                <button class="sidebar-item-remove" onclick="toggleWishlist('${item.id}'); renderSidebar();">✕</button>
            `}
        </div>
    `).join('');

    if (isCart && state.cart.length > 0) {
        refs.sidebarFooter.innerHTML = `
            <div class="sidebar-total">
                <span>Total</span>
                <span class="amount">${formatPrice(getCartTotal())}</span>
            </div>
            <button class="btn-primary" onclick="checkout()">Proceed to Checkout →</button>
        `;
    } else {
        refs.sidebarFooter.innerHTML = '';
    }
}

function checkout() {
    if (!state.cart.length) {
        showToast('Cart is empty!', true);
        return;
    }

    const total = getCartTotal();
    const itemList = state.cart.map(item => `${item.brand} ${item.name} x${item.qty}`).join('\n');
    const message = `🛍️ *Order Summary*\n${itemList}\n\nTotal: ${formatPrice(total)}\n\nThank you for shopping with Luxury Watch Co.!`;

    window.open(`https://wa.me/918733030195?text=${encodeURIComponent(message)}`, '_blank');
    state.cart = [];
    saveState();
    updateCartUI();
    renderSidebar();
    showToast('✅ Order placed! Check WhatsApp for confirmation.');
}

function quickEnquiry(productId) {
    const product = state.products.find(item => item.id === productId);
    if (!product) return;
    const message = `Hi Luxury Watch Co., I'm interested in *${product.brand} ${product.name}* (${formatPrice(product.price)}). Please share availability & best price.`;
    window.open(`https://wa.me/918733030195?text=${encodeURIComponent(message)}`, '_blank');
}

function handleContactForm(event) {
    event.preventDefault();
    const name = refs.nameInput.value.trim();
    const contact = refs.contactInfo.value.trim();
    const message = refs.msgText.value.trim();

    if (!name || !contact) {
        showToast('Please provide your name and contact info.', true);
        return false;
    }

    const whatsappMessage = `*New Enquiry*\nName: ${name}\nContact: ${contact}\nMessage: ${message}`;
    window.open(`https://wa.me/918733030195?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
    refs.contactForm.reset();
    showToast('📩 Enquiry sent via WhatsApp!');
    return false;
}

function handleNewsletter(event) {
    event.preventDefault();
    const email = refs.newsletterForm.querySelector('input').value.trim();
    if (email) {
        showToast(`📬 Subscribed with ${email}`);
        refs.newsletterForm.querySelector('input').value = '';
    }
    return false;
}

function setupThemeToggle() {
    refs.themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        saveState();
        if (liveMap) setTimeout(() => liveMap.invalidateSize(), 100);
    });
}

function setupScrollTop() {
    window.addEventListener('scroll', () => {
        refs.scrollTopBtn.classList.toggle('visible', window.scrollY > 500);
    });
    refs.scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function setupNavToggle() {
    refs.navToggle.addEventListener('click', () => refs.navLinks.classList.toggle('open'));
    document.querySelectorAll('.nav-links a').forEach(link => link.addEventListener('click', () => refs.navLinks.classList.remove('open')));
}

let liveMap;
function initMap() {
    const mapEl = refs.liveMap;
    if (!mapEl) return;
    liveMap = L.map(mapEl).setView([23.0787, 72.6673], 15);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OSM & CartoDB',
        subdomains: 'abcd',
        maxZoom: 19,
        minZoom: 12
    }).addTo(liveMap);
    L.marker([23.0787, 72.6673]).addTo(liveMap)
        .bindPopup('<b>Luxury Watch Co.</b><br/>Adeshver Nagar, Naroda, Ahmedabad')
        .openPopup();
}

function initCursor() {
    if (window.innerWidth <= 1024) return;
    const cursor = refs.cursor;
    const ring = refs.cursorRing;
    if (!cursor || !ring) return;

    document.addEventListener('mousemove', event => {
        cursor.style.transform = `translate(${event.clientX - 3}px, ${event.clientY - 3}px)`;
        ring.style.transform = `translate(${event.clientX - 20}px, ${event.clientY - 20}px)`;
    });

    document.addEventListener('mouseover', event => {
        if (event.target.closest('a, button, .clickable, .product-card')) {
            ring.style.transform = 'scale(0.7)';
            ring.style.opacity = '0.8';
        }
    });

    document.addEventListener('mouseout', event => {
        if (event.target.closest('a, button, .clickable, .product-card')) {
            ring.style.transform = 'scale(1)';
            ring.style.opacity = '0.4';
        }
    });
}

function initReveal() {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1 });
    reveals.forEach(el => observer.observe(el));
}

function openProductModal(productId) {
    const product = state.products.find(item => item.id === productId);
    if (!product) return;

    refs.modalImage.src = product.image;
    refs.modalImage.alt = product.name;
    refs.modalCategory.textContent = product.category;
    refs.modalTitle.textContent = product.name;
    refs.modalBrand.textContent = product.brand;
    refs.modalRating.textContent = `${getStars(product.rating)} (${product.reviews})`;
    refs.modalDescription.textContent = product.description;
    refs.modalStock.textContent = `${getStockLabel(product.stock)} · ${product.stock} available`;
    refs.modalPrice.textContent = formatPrice(product.price);
    refs.modalAddCart.onclick = event => { event.stopPropagation(); addToCart(productId); };
    refs.modalWishlist.onclick = event => { event.stopPropagation(); toggleWishlist(productId); };

    refs.productModal.classList.add('open');
    refs.productModalOverlay.classList.add('open');
}

function closeProductModal() {
    refs.productModal.classList.remove('open');
    refs.productModalOverlay.classList.remove('open');
}

function init() {
    refs.productsGrid = $('productsGrid');
    refs.cartCount = $('cartCount');
    refs.wishlistCount = $('wishlistCount');
    refs.sidebar = $('sidebar');
    refs.sidebarOverlay = $('sidebarOverlay');
    refs.sidebarBody = $('sidebarBody');
    refs.sidebarFooter = $('sidebarFooter');
    refs.toastContainer = $('toastContainer');
    refs.scrollTopBtn = $('scrollTop');
    refs.themeToggle = $('themeToggle');
    refs.navToggle = $('navToggle');
    refs.navLinks = $('navLinks');
    refs.filterBrand = $('filterBrand');
    refs.filterCategory = $('filterCategory');
    refs.filterSearch = $('filterSearch');
    refs.filterSort = $('filterSort');
    refs.filterPriceMin = $('filterPriceMin');
    refs.filterPriceMax = $('filterPriceMax');
    refs.productModal = $('productModal');
    refs.productModalOverlay = $('productModalOverlay');
    refs.modalImage = $('modalImage');
    refs.modalCategory = $('modalCategory');
    refs.modalTitle = $('modalTitle');
    refs.modalBrand = $('modalBrand');
    refs.modalRating = $('modalRating');
    refs.modalDescription = $('modalDescription');
    refs.modalStock = $('modalStock');
    refs.modalPrice = $('modalPrice');
    refs.modalAddCart = $('modalAddCart');
    refs.modalWishlist = $('modalWishlist');
    refs.cursor = $('cursor');
    refs.cursorRing = $('cursor-ring');
    refs.liveMap = $('liveMap');
    refs.contactForm = $('contactForm');
    refs.nameInput = $('nameInput');
    refs.contactInfo = $('contactInfo');
    refs.msgText = $('msgText');
    refs.newsletterForm = document.querySelector('.newsletter-form');

    loadState();
    populateBrandFilter();
    renderProducts();
    updateCartUI();
    initMap();
    initCursor();
    initReveal();
    setupThemeToggle();
    setupScrollTop();
    setupNavToggle();

    refs.contactForm.addEventListener('submit', handleContactForm);
    refs.newsletterForm.addEventListener('submit', handleNewsletter);
    refs.productModalOverlay.addEventListener('click', closeProductModal);

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            closeSidebar();
            closeProductModal();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) refs.navLinks.classList.remove('open');
        if (window.innerWidth <= 1024) {
            if (refs.cursor) refs.cursor.style.display = 'none';
            if (refs.cursorRing) refs.cursorRing.style.display = 'none';
            document.body.style.cursor = 'default';
        } else {
            if (refs.cursor) refs.cursor.style.display = 'block';
            if (refs.cursorRing) refs.cursorRing.style.display = 'block';
            document.body.style.cursor = 'none';
        }
    });
}

document.addEventListener('DOMContentLoaded', init);
