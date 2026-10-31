// ==================== State Management ====================
let state = {
    user: null,
    token: null,
    restaurants: [],
    products: [],
    favorites: [],
    countries: [],
    cuisines: [],
    categories: [],
    certifications: [],
    // Map state
    map: null,
    userMarker: null,
    userLocation: null,
    restaurantMarkers: [],
    searchRadius: 10 // km
};

// ==================== API Helper ====================
const API_BASE = '/api';

async function apiRequest(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (state.token) {
        headers['Authorization'] = `Bearer ${state.token}`;
    }
    
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers
        });
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Something went wrong');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ==================== Authentication ====================
function checkAuth() {
    const token = localStorage.getItem('halal_token');
    const user = localStorage.getItem('halal_user');
    
    if (token && user) {
        state.token = token;
        state.user = JSON.parse(user);
        updateAuthUI();
    }
}

function updateAuthUI() {
    const guestElements = document.querySelectorAll('.guest-only');
    const authElements = document.querySelectorAll('.auth-only');
    
    if (state.user) {
        guestElements.forEach(el => el.style.display = 'none');
        authElements.forEach(el => el.style.display = 'flex');
        document.getElementById('user-name').textContent = state.user.name.split(' ')[0];
    } else {
        guestElements.forEach(el => el.style.display = 'flex');
        authElements.forEach(el => el.style.display = 'none');
    }
}

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    
    try {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        state.token = data.token;
        state.user = data.user;
        
        localStorage.setItem('halal_token', data.token);
        localStorage.setItem('halal_user', JSON.stringify(data.user));
        
        updateAuthUI();
        closeModal('login');
        showToast('Welcome back, ' + data.user.name + '!');
        loadFavorites();
    } catch (error) {
        errorEl.textContent = error.message;
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const country = document.getElementById('register-country').value;
    const errorEl = document.getElementById('register-error');
    
    try {
        const data = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password, country })
        });
        
        state.token = data.token;
        state.user = data.user;
        
        localStorage.setItem('halal_token', data.token);
        localStorage.setItem('halal_user', JSON.stringify(data.user));
        
        updateAuthUI();
        closeModal('register');
        showToast('Welcome to Halal Finder, ' + data.user.name + '!');
    } catch (error) {
        errorEl.textContent = error.message;
    }
}

function logout() {
    state.token = null;
    state.user = null;
    state.favorites = [];
    
    localStorage.removeItem('halal_token');
    localStorage.removeItem('halal_user');
    
    updateAuthUI();
    showSection('home');
    showToast('Logged out successfully');
}

// ==================== Navigation ====================
function showSection(section) {
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === section) {
            link.classList.add('active');
        }
    });
    
    // Show section
    document.querySelectorAll('.section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById(`${section}-section`).classList.add('active');
    
    // Load data if needed
    if (section === 'restaurants') {
        loadRestaurants();
    } else if (section === 'products') {
        loadProducts();
    } else if (section === 'nearme') {
        initializeMap();
    } else if (section === 'favorites') {
        if (!state.user) {
            showModal('login');
            return;
        }
        loadFavorites();
        renderFavorites();
    }
    
    // Close mobile menu
    document.getElementById('nav-menu').classList.remove('active');
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// ==================== Modal Functions ====================
function showModal(modal) {
    document.getElementById(`${modal}-modal`).classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    document.getElementById(`${modal}-modal`).classList.remove('active');
    document.body.style.overflow = '';
    
    // Clear forms
    if (modal === 'login') {
        document.getElementById('login-form').reset();
        document.getElementById('login-error').textContent = '';
    } else if (modal === 'register') {
        document.getElementById('register-form').reset();
        document.getElementById('register-error').textContent = '';
    }
}

function switchModal(to) {
    closeModal(to === 'login' ? 'register' : 'login');
    setTimeout(() => showModal(to), 300);
}

// ==================== Toast Notification ====================
function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    const messageEl = document.getElementById('toast-message');
    
    messageEl.textContent = message;
    toast.classList.toggle('error', isError);
    toast.classList.add('active');
    
    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

// ==================== Data Loading ====================
async function loadInitialData() {
    try {
        // Load countries
        const countriesData = await apiRequest('/locations/countries');
        state.countries = countriesData.countries;
        populateCountrySelects();
        
        // Load cuisines
        const cuisinesData = await apiRequest('/cuisines');
        state.cuisines = cuisinesData.cuisines;
        populateCuisineSelect();
        
        // Load categories
        const categoriesData = await apiRequest('/categories');
        state.categories = categoriesData.categories;
        populateCategorySelect();
        
        // Load certifications
        const certsData = await apiRequest('/certifications');
        state.certifications = certsData.certifications;
        populateCertificationSelects();
        
        // Load popular restaurants for homepage
        await loadPopularRestaurants();
    } catch (error) {
        console.error('Failed to load initial data:', error);
    }
}

async function loadPopularRestaurants() {
    try {
        const data = await apiRequest('/restaurants');
        state.restaurants = data.restaurants;
        
        // Show top 6 on homepage
        const popular = state.restaurants.slice(0, 6);
        renderRestaurants(popular, 'popular-restaurants');
    } catch (error) {
        console.error('Failed to load restaurants:', error);
    }
}

async function loadRestaurants() {
    try {
        const data = await apiRequest('/restaurants');
        state.restaurants = data.restaurants;
        renderRestaurants(state.restaurants, 'restaurants-grid');
        updateRestaurantCount(state.restaurants.length);
    } catch (error) {
        console.error('Failed to load restaurants:', error);
    }
}

async function loadProducts() {
    try {
        const data = await apiRequest('/products');
        state.products = data.products;
        renderProducts(state.products, 'products-grid');
        updateProductCount(state.products.length);
    } catch (error) {
        console.error('Failed to load products:', error);
    }
}

async function loadFavorites() {
    if (!state.user) return;
    
    try {
        const data = await apiRequest('/favorites');
        state.favorites = data.favorites;
    } catch (error) {
        console.error('Failed to load favorites:', error);
    }
}

// ==================== Populate Selects ====================
function populateCountrySelects() {
    const selects = ['hero-country', 'filter-country', 'filter-product-country'];
    selects.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            // Keep first option
            const firstOption = select.options[0];
            select.innerHTML = '';
            select.appendChild(firstOption);
            
            state.countries.forEach(country => {
                const option = document.createElement('option');
                option.value = country;
                option.textContent = country;
                select.appendChild(option);
            });
        }
    });
}

function populateCuisineSelect() {
    const select = document.getElementById('filter-cuisine');
    if (select) {
        const firstOption = select.options[0];
        select.innerHTML = '';
        select.appendChild(firstOption);
        
        state.cuisines.forEach(cuisine => {
            const option = document.createElement('option');
            option.value = cuisine;
            option.textContent = cuisine;
            select.appendChild(option);
        });
    }
}

function populateCategorySelect() {
    const select = document.getElementById('filter-category');
    if (select) {
        const firstOption = select.options[0];
        select.innerHTML = '';
        select.appendChild(firstOption);
        
        state.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            select.appendChild(option);
        });
    }
}

function populateCertificationSelects() {
    const selects = ['filter-certification', 'filter-product-certification'];
    selects.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            const firstOption = select.options[0];
            select.innerHTML = '';
            select.appendChild(firstOption);
            
            state.certifications.forEach(cert => {
                const option = document.createElement('option');
                option.value = cert.name;
                option.textContent = cert.name;
                select.appendChild(option);
            });
        }
    });
}

async function loadCities() {
    const country = document.getElementById('filter-country').value;
    const citySelect = document.getElementById('filter-city');
    
    citySelect.innerHTML = '<option value="">All Cities</option>';
    
    if (country) {
        try {
            const data = await apiRequest(`/locations/cities/${encodeURIComponent(country)}`);
            data.cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                citySelect.appendChild(option);
            });
        } catch (error) {
            console.error('Failed to load cities:', error);
        }
    }
}

async function loadHeroCities() {
    const country = document.getElementById('hero-country').value;
    const citySelect = document.getElementById('hero-city');
    
    citySelect.innerHTML = '<option value="">Select City</option>';
    
    if (country) {
        try {
            const data = await apiRequest(`/locations/cities/${encodeURIComponent(country)}`);
            data.cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                citySelect.appendChild(option);
            });
        } catch (error) {
            console.error('Failed to load cities:', error);
        }
    }
}

// ==================== Rendering ====================
function renderRestaurants(restaurants, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (restaurants.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <i class="fas fa-search"></i>
                <h3>No restaurants found</h3>
                <p>Try adjusting your filters or search terms</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = restaurants.map(restaurant => {
        const isFavorite = state.favorites.some(f => f.restaurant_id === restaurant.id);
        
        return `
            <div class="card" onclick="showRestaurantDetail('${restaurant.id}')">
                <div class="card-image" style="background-image: url('${restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'}')">
                    <span class="card-badge">${restaurant.cuisine || 'Restaurant'}</span>
                    <button class="card-favorite ${isFavorite ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorite('restaurant', '${restaurant.id}')">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${restaurant.name}</h3>
                    <p class="card-subtitle">
                        <i class="fas fa-map-marker-alt"></i>
                        ${restaurant.city}, ${restaurant.country}
                    </p>
                    <div class="card-rating">
                        <i class="fas fa-star"></i>
                        <span>${restaurant.rating}</span>
                        <span class="tag">${restaurant.price_range || '££'}</span>
                    </div>
                    <div class="card-tags">
                        <span class="tag tag-certified">
                            <i class="fas fa-certificate"></i> Halal Certified
                        </span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderProducts(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (products.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <i class="fas fa-search"></i>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search terms</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = products.map(product => {
        const isFavorite = state.favorites.some(f => f.product_id === product.id);
        
        return `
            <div class="card" onclick="showProductDetail('${product.id}')">
                <div class="card-image" style="background-image: url('${product.image_url || 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=400'}')">
                    <span class="card-badge">${product.category || 'Product'}</span>
                    <button class="card-favorite ${isFavorite ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorite('product', '${product.id}')">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${product.name}</h3>
                    <p class="card-subtitle">
                        <i class="fas fa-tag"></i>
                        ${product.brand || 'Unknown Brand'}
                    </p>
                    <div class="card-tags">
                        <span class="tag tag-certified">
                            <i class="fas fa-certificate"></i> Halal Certified
                        </span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderFavorites(type = 'restaurants') {
    const container = document.getElementById('favorites-grid');
    const emptyState = document.getElementById('favorites-empty');
    
    const filtered = state.favorites.filter(f => 
        type === 'restaurants' ? f.restaurant_id : f.product_id
    );
    
    if (filtered.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    if (type === 'restaurants') {
        container.innerHTML = filtered.map(f => `
            <div class="card" onclick="showRestaurantDetail('${f.restaurant_id}')">
                <div class="card-image" style="background-image: url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400')">
                    <button class="card-favorite active" onclick="event.stopPropagation(); removeFavorite('${f.id}')">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${f.restaurant_name || 'Restaurant'}</h3>
                    <p class="card-subtitle">
                        <i class="fas fa-map-marker-alt"></i>
                        ${f.restaurant_city || 'Unknown'} - ${f.restaurant_cuisine || ''}
                    </p>
                </div>
            </div>
        `).join('');
    } else {
        container.innerHTML = filtered.map(f => `
            <div class="card" onclick="showProductDetail('${f.product_id}')">
                <div class="card-image" style="background-image: url('https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=400')">
                    <button class="card-favorite active" onclick="event.stopPropagation(); removeFavorite('${f.id}')">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${f.product_name || 'Product'}</h3>
                    <p class="card-subtitle">
                        <i class="fas fa-tag"></i>
                        ${f.product_brand || 'Unknown Brand'}
                    </p>
                </div>
            </div>
        `).join('');
    }
}

function showFavoritesTab(type) {
    document.querySelectorAll('.favorites-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    renderFavorites(type);
}

// ==================== Filtering ====================
let debounceTimer;

function debounceSearch(callback) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(callback, 300);
}

async function filterRestaurants() {
    const country = document.getElementById('filter-country').value;
    const city = document.getElementById('filter-city').value;
    const cuisine = document.getElementById('filter-cuisine').value;
    const certification = document.getElementById('filter-certification').value;
    const search = document.getElementById('search-restaurants').value;
    
    try {
        const params = new URLSearchParams();
        if (country) params.append('country', country);
        if (city) params.append('city', city);
        if (cuisine) params.append('cuisine', cuisine);
        if (certification) params.append('certification', certification);
        if (search) params.append('search', search);
        
        const data = await apiRequest(`/restaurants?${params.toString()}`);
        renderRestaurants(data.restaurants, 'restaurants-grid');
        updateRestaurantCount(data.restaurants.length);
    } catch (error) {
        console.error('Filter error:', error);
    }
}

async function filterProducts() {
    const category = document.getElementById('filter-category').value;
    const country = document.getElementById('filter-product-country').value;
    const certification = document.getElementById('filter-product-certification').value;
    const search = document.getElementById('search-products').value;
    
    try {
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (country) params.append('country', country);
        if (certification) params.append('certification', certification);
        if (search) params.append('search', search);
        
        const data = await apiRequest(`/products?${params.toString()}`);
        renderProducts(data.products, 'products-grid');
        updateProductCount(data.products.length);
    } catch (error) {
        console.error('Filter error:', error);
    }
}

function updateRestaurantCount(count) {
    document.getElementById('restaurant-count').textContent = 
        `${count} restaurant${count !== 1 ? 's' : ''} found`;
}

function updateProductCount(count) {
    document.getElementById('product-count').textContent = 
        `${count} product${count !== 1 ? 's' : ''} found`;
}

// ==================== Hero Search ====================
function heroSearch() {
    const country = document.getElementById('hero-country').value;
    const city = document.getElementById('hero-city').value;
    
    showSection('restaurants');
    
    if (country) {
        document.getElementById('filter-country').value = country;
        loadCities().then(() => {
            if (city) {
                document.getElementById('filter-city').value = city;
            }
            filterRestaurants();
        });
    }
}

// ==================== Detail Views ====================
async function showRestaurantDetail(id) {
    try {
        const data = await apiRequest(`/restaurants/${id}`);
        const restaurant = data.restaurant;
        const isFavorite = state.favorites.some(f => f.restaurant_id === restaurant.id);
        
        document.getElementById('restaurant-detail').innerHTML = `
            <div class="detail-header">
                <div class="detail-image" style="background-image: url('${restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'}')"></div>
                <div class="detail-info">
                    <h2>${restaurant.name}</h2>
                    <div class="detail-meta">
                        <span><i class="fas fa-map-marker-alt"></i> ${restaurant.city}, ${restaurant.country}</span>
                        <span><i class="fas fa-star" style="color: var(--secondary)"></i> ${restaurant.rating}</span>
                        <span>${restaurant.price_range || '££'}</span>
                    </div>
                    <p class="detail-description">${restaurant.description || 'Delicious halal certified restaurant.'}</p>
                    <div class="detail-tags">
                        <span class="tag">${restaurant.cuisine}</span>
                        <div class="certification-badge">
                            <i class="fas fa-certificate"></i>
                            ${restaurant.certification_body}
                        </div>
                    </div>
                </div>
            </div>
            <div class="detail-actions">
                <button class="btn ${isFavorite ? 'btn-danger' : 'btn-primary'}" onclick="toggleFavorite('restaurant', '${restaurant.id}'); closeModal('restaurant');">
                    <i class="fas fa-heart"></i> ${isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </button>
                ${restaurant.website ? `<a href="${restaurant.website}" target="_blank" class="btn btn-outline"><i class="fas fa-external-link-alt"></i> Visit Website</a>` : ''}
            </div>
            <div style="margin-top: 25px; padding-top: 25px; border-top: 1px solid var(--gray-200);">
                <h4 style="margin-bottom: 15px;">Location</h4>
                <p><i class="fas fa-map-marker-alt"></i> ${restaurant.address || ''}, ${restaurant.city}, ${restaurant.postal_code || ''}, ${restaurant.country}</p>
                ${restaurant.phone ? `<p style="margin-top: 10px;"><i class="fas fa-phone"></i> ${restaurant.phone}</p>` : ''}
            </div>
        `;
        
        showModal('restaurant');
    } catch (error) {
        showToast('Failed to load restaurant details', true);
    }
}

async function showProductDetail(id) {
    try {
        const data = await apiRequest(`/products/${id}`);
        const product = data.product;
        const isFavorite = state.favorites.some(f => f.product_id === product.id);
        
        document.getElementById('product-detail').innerHTML = `
            <div class="detail-header">
                <div class="detail-image" style="background-image: url('${product.image_url || 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=400'}')"></div>
                <div class="detail-info">
                    <h2>${product.name}</h2>
                    <div class="detail-meta">
                        <span><i class="fas fa-tag"></i> ${product.brand}</span>
                        <span><i class="fas fa-folder"></i> ${product.category}</span>
                    </div>
                    <p class="detail-description">${product.description || 'Halal certified food product.'}</p>
                    <div class="detail-tags">
                        <div class="certification-badge">
                            <i class="fas fa-certificate"></i>
                            ${product.certification_body}
                        </div>
                    </div>
                </div>
            </div>
            <div class="detail-actions">
                <button class="btn ${isFavorite ? 'btn-danger' : 'btn-primary'}" onclick="toggleFavorite('product', '${product.id}'); closeModal('product');">
                    <i class="fas fa-heart"></i> ${isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </button>
            </div>
            <div style="margin-top: 25px; padding-top: 25px; border-top: 1px solid var(--gray-200);">
                <h4 style="margin-bottom: 15px;">Available In</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                    ${(product.available_countries || '').split(',').map(c => `<span class="tag">${c.trim()}</span>`).join('')}
                </div>
                ${product.barcode ? `<p style="margin-top: 15px;"><i class="fas fa-barcode"></i> Barcode: ${product.barcode}</p>` : ''}
            </div>
        `;
        
        showModal('product');
    } catch (error) {
        showToast('Failed to load product details', true);
    }
}

// ==================== Favorites ====================
async function toggleFavorite(type, id) {
    if (!state.user) {
        showModal('login');
        return;
    }
    
    const existingFavorite = state.favorites.find(f => 
        type === 'restaurant' ? f.restaurant_id === id : f.product_id === id
    );
    
    if (existingFavorite) {
        await removeFavorite(existingFavorite.id);
    } else {
        await addFavorite(type, id);
    }
}

async function addFavorite(type, id) {
    try {
        const body = type === 'restaurant' 
            ? { restaurant_id: id }
            : { product_id: id };
        
        await apiRequest('/favorites', {
            method: 'POST',
            body: JSON.stringify(body)
        });
        
        await loadFavorites();
        
        // Re-render current view
        if (document.getElementById('restaurants-section').classList.contains('active')) {
            renderRestaurants(state.restaurants, 'restaurants-grid');
        } else if (document.getElementById('products-section').classList.contains('active')) {
            renderProducts(state.products, 'products-grid');
        }
        
        showToast('Added to favorites!');
    } catch (error) {
        showToast('Failed to add to favorites', true);
    }
}

async function removeFavorite(favoriteId) {
    try {
        await apiRequest(`/favorites/${favoriteId}`, {
            method: 'DELETE'
        });
        
        state.favorites = state.favorites.filter(f => f.id !== favoriteId);
        
        // Re-render current view
        if (document.getElementById('restaurants-section').classList.contains('active')) {
            renderRestaurants(state.restaurants, 'restaurants-grid');
        } else if (document.getElementById('products-section').classList.contains('active')) {
            renderProducts(state.products, 'products-grid');
        } else if (document.getElementById('favorites-section').classList.contains('active')) {
            renderFavorites();
        }
        
        showToast('Removed from favorites');
    } catch (error) {
        showToast('Failed to remove from favorites', true);
    }
}

// ==================== Mobile Menu ====================
document.getElementById('nav-toggle').addEventListener('click', () => {
    document.getElementById('nav-menu').classList.toggle('active');
});

// Hero country change listener
document.getElementById('hero-country').addEventListener('change', loadHeroCities);

// ==================== Map Functions ====================
function initializeMap() {
    // Only initialize once
    if (state.map) {
        state.map.invalidateSize();
        return;
    }
    
    // Default to London if no location
    const defaultLat = 51.5074;
    const defaultLng = -0.1278;
    
    state.map = L.map('map').setView([defaultLat, defaultLng], 12);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(state.map);
    
    // Try to get user location automatically
    if (navigator.geolocation) {
        locateUser();
    }
}

function locateUser() {
    const statusEl = document.getElementById('location-status');
    const locateBtn = document.getElementById('locate-btn');
    
    if (!navigator.geolocation) {
        statusEl.textContent = 'Geolocation not supported by your browser';
        statusEl.classList.add('error');
        return;
    }
    
    statusEl.textContent = 'Finding your location...';
    statusEl.classList.remove('error', 'success');
    locateBtn.disabled = true;
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            state.userLocation = { lat, lng };
            
            // Initialize map if not already done
            if (!state.map) {
                initializeMap();
            }
            
            // Center map on user location
            state.map.setView([lat, lng], 14);
            
            // Remove existing user marker
            if (state.userMarker) {
                state.map.removeLayer(state.userMarker);
            }
            
            // Create custom icon for user
            const userIcon = L.divIcon({
                className: 'user-marker',
                html: '<div class="user-marker-inner"><i class="fas fa-user"></i></div>',
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            });
            
            // Add user marker
            state.userMarker = L.marker([lat, lng], { icon: userIcon })
                .addTo(state.map)
                .bindPopup('<strong>You are here</strong>')
                .openPopup();
            
            statusEl.textContent = 'Location found!';
            statusEl.classList.add('success');
            locateBtn.disabled = false;
            
            // Load nearby restaurants
            loadNearbyRestaurants();
        },
        (error) => {
            let errorMessage = 'Unable to get your location';
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = 'Location access denied. Please enable it in your browser settings.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Location information unavailable';
                    break;
                case error.TIMEOUT:
                    errorMessage = 'Location request timed out';
                    break;
            }
            statusEl.textContent = errorMessage;
            statusEl.classList.add('error');
            locateBtn.disabled = false;
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
        }
    );
}

function updateMapRadius() {
    state.searchRadius = parseInt(document.getElementById('map-radius').value);
    if (state.userLocation) {
        loadNearbyRestaurants();
    }
}

async function loadNearbyRestaurants() {
    if (!state.userLocation) return;
    
    try {
        // Load all restaurants if not already loaded
        if (state.restaurants.length === 0) {
            const data = await apiRequest('/restaurants');
            state.restaurants = data.restaurants;
        }
        
        // Clear existing restaurant markers
        state.restaurantMarkers.forEach(marker => state.map.removeLayer(marker));
        state.restaurantMarkers = [];
        
        // Filter restaurants within radius and sort by distance
        const nearbyRestaurants = state.restaurants
            .filter(r => r.latitude && r.longitude)
            .map(r => ({
                ...r,
                distance: calculateDistance(
                    state.userLocation.lat,
                    state.userLocation.lng,
                    r.latitude,
                    r.longitude
                )
            }))
            .filter(r => r.distance <= state.searchRadius)
            .sort((a, b) => a.distance - b.distance);
        
        // Create custom icon for restaurants
        const restaurantIcon = L.divIcon({
            className: 'restaurant-marker',
            html: '<div class="restaurant-marker-inner"><i class="fas fa-utensils"></i></div>',
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });
        
        // Add markers for each nearby restaurant
        nearbyRestaurants.forEach(restaurant => {
            const marker = L.marker([restaurant.latitude, restaurant.longitude], { icon: restaurantIcon })
                .addTo(state.map)
                .bindPopup(`
                    <div class="map-popup">
                        <h4>${restaurant.name}</h4>
                        <p><i class="fas fa-tag"></i> ${restaurant.cuisine}</p>
                        <p><i class="fas fa-map-marker-alt"></i> ${restaurant.distance.toFixed(1)} km away</p>
                        <p><i class="fas fa-star" style="color: #FFC107"></i> ${restaurant.rating}</p>
                        <button onclick="showRestaurantDetail('${restaurant.id}')" class="popup-btn">View Details</button>
                    </div>
                `);
            state.restaurantMarkers.push(marker);
        });
        
        // Render nearby restaurants list
        renderNearbyRestaurants(nearbyRestaurants);
        
    } catch (error) {
        console.error('Failed to load nearby restaurants:', error);
    }
}

function renderNearbyRestaurants(restaurants) {
    const container = document.getElementById('nearby-restaurants-grid');
    
    if (restaurants.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <i class="fas fa-search"></i>
                <h3>No halal restaurants found nearby</h3>
                <p>Try increasing the search radius or explore other areas</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = restaurants.map(restaurant => {
        const isFavorite = state.favorites.some(f => f.restaurant_id === restaurant.id);
        
        return `
            <div class="card" onclick="showRestaurantDetail('${restaurant.id}')">
                <div class="card-image" style="background-image: url('${restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'}')">
                    <span class="card-badge">${restaurant.cuisine || 'Restaurant'}</span>
                    <button class="card-favorite ${isFavorite ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorite('restaurant', '${restaurant.id}')">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${restaurant.name}</h3>
                    <p class="card-subtitle">
                        <i class="fas fa-location-arrow"></i>
                        <strong>${restaurant.distance.toFixed(1)} km</strong> away
                    </p>
                    <p class="card-subtitle">
                        <i class="fas fa-map-marker-alt"></i>
                        ${restaurant.city}, ${restaurant.country}
                    </p>
                    <div class="card-rating">
                        <i class="fas fa-star"></i>
                        <span>${restaurant.rating}</span>
                        <span class="tag">${restaurant.price_range || '££'}</span>
                    </div>
                    <div class="card-tags">
                        <span class="tag tag-certified">
                            <i class="fas fa-certificate"></i> Halal Certified
                        </span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(deg) {
    return deg * (Math.PI / 180);
}

// Fly to restaurant on map
function flyToRestaurant(lat, lng, name) {
    if (state.map) {
        state.map.flyTo([lat, lng], 16);
    }
}

// ==================== Initialize ====================
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadInitialData();
});
