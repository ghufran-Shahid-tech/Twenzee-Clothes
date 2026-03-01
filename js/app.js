// ========================================
// TWENZEE - Main Application
// Entry Point for all pages
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  // Initialize UI
  if (typeof ui !== 'undefined') {
    ui.init();
  }

  // Initialize cart
  if (typeof cart !== 'undefined') {
    cart.init();
  }

  // Page-specific initializations
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  switch(currentPage) {
    case 'index.html':
    case '':
      initHomePage();
      break;
    case 'shop.html':
      initShopPage();
      break;
    case 'product.html':
      initProductPage();
      break;
    case 'cart.html':
      initCartPage();
      break;
    case 'checkout.html':
      initCheckoutPage();
      break;
    case 'contact.html':
      initContactPage();
      break;
    case 'wishlist.html':
      initWishlistPage();
      break;
  }
});

// Home Page Initialization
function initHomePage() {
  // Render trending products
  renderTrendingProducts();
  
  // Render new arrivals
  renderNewArrivals();
  
  // Newsletter form
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = newsletterForm.querySelector('input[type="email"]').value;
      if (email) {
        showNotification('Thank you for subscribing!', 'success');
        newsletterForm.reset();
      }
    });
  }
}

// Render Trending Products
function renderTrendingProducts() {
  const container = document.getElementById('trending-products');
  if (!container || typeof products === 'undefined') return;

  const trending = products.filter(p => p.isTrending).slice(0, 4);
  container.innerHTML = trending.map(product => createProductCard(product)).join('');
  
  // Add click handlers
  container.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      window.location.href = `product.html?id=${id}`;
    });
  });
}

// Render New Arrivals
function renderNewArrivals() {
  const container = document.getElementById('new-arrivals');
  if (!container || typeof products === 'undefined') return;

  const newArrivals = products.filter(p => p.isNew).slice(0, 4);
  container.innerHTML = newArrivals.map(product => createProductCard(product)).join('');
  
  // Add click handlers
  container.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      window.location.href = `product.html?id=${id}`;
    });
  });
}

// Create Product Card HTML
function createProductCard(product) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const discount = product.originalPrice ? 
    Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  const isInWishlist = window.isInWishlist ? window.isInWishlist(product.id) : false;

  return `
    <div class="product-card" data-id="${product.id}">
      <div class="product-image">
        <img src="${product.images[0]}" alt="${product.name}" loading="lazy" onerror="this.src='assets/images/logo-icon.png'">
        ${product.isNew ? '<span class="product-badge new">NEW</span>' : ''}
        ${discount > 0 ? `<span class="product-badge discount">-${discount}%</span>` : ''}
        <div class="product-actions">
          <button class="product-action-btn quick-view" data-id="${product.id}" title="Quick View">
            <i class="fas fa-eye"></i>
          </button>
          <button class="product-action-btn add-to-cart" data-id="${product.id}" title="Add to Cart">
            <i class="fas fa-shopping-bag"></i>
          </button>
          <button class="product-action-btn wishlist ${isInWishlist ? 'active' : ''}" data-id="${product.id}" title="${isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}">
            <i class="fas fa-heart"></i>
          </button>
        </div>
      </div>
      <div class="product-info">
        <h3>${product.name}</h3>
        <div class="product-price">
          <span class="current-price">${formatPrice(product.price)}</span>
          ${product.originalPrice ? `<span class="original-price">${formatPrice(product.originalPrice)}</span>` : ''}
        </div>
        <div class="product-rating">
          ${getStarRating(product.rating)}
          <span>(${product.reviewCount})</span>
        </div>
      </div>
    </div>
  `;
}

// Get Star Rating HTML
function getStarRating(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  let html = '';
  
  for (let i = 0; i < fullStars; i++) {
    html += '<i class="fas fa-star"></i>';
  }
  if (hasHalfStar) {
    html += '<i class="fas fa-star-half-alt"></i>';
  }
  for (let i = fullStars + (hasHalfStar ? 1 : 0); i < 5; i++) {
    html += '<i class="far fa-star"></i>';
  }
  
  return html;
}

// Shop Page Initialization
function initShopPage() {
  if (typeof window.initFilters !== 'undefined') {
    window.initFilters();
  } else if (typeof initFilters !== 'undefined') {
    initFilters();
  }
}

// Product Page Initialization
function initProductPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  
  if (!productId || typeof products === 'undefined') {
    showProductNotFound();
    return;
  }

  const product = products.find(p => p.id === parseInt(productId));
  if (!product) {
    showProductNotFound();
    return;
  }

  // Update breadcrumb
  const breadcrumbCategory = document.getElementById('breadcrumb-category');
  const breadcrumbName = document.getElementById('breadcrumb-name');
  if (breadcrumbCategory) {
    breadcrumbCategory.textContent = product.category.charAt(0).toUpperCase() + product.category.slice(1);
    breadcrumbCategory.href = `shop.html?category=${product.category}`;
  }
  if (breadcrumbName) {
    breadcrumbName.textContent = product.name;
  }

  renderProductDetails(product);
  renderRelatedProducts(product);
}

// Render Product Details
function renderProductDetails(product) {
  const container = document.getElementById('product-details');
  if (!container) return;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const discount = product.originalPrice ? 
    Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  const isInWishlist = window.isInWishlist ? window.isInWishlist(product.id) : false;

  container.innerHTML = `
    <div class="product-gallery">
      <div class="main-image">
        <img src="${product.images[0]}" alt="${product.name}" id="main-product-image" onerror="this.src='assets/images/logo-icon.png'">
        <div class="product-badges">
          ${product.isNew ? '<span class="product-badge new">NEW</span>' : ''}
          ${discount > 0 ? `<span class="product-badge discount">-${discount}%</span>` : ''}
        </div>
      </div>
    </div>
    <div class="product-info-detailed">
      <h1>${product.name}</h1>
      <div class="product-meta">
        <div class="product-rating-large">
          <div class="stars">${getStarRating(product.rating)}</div>
          <a href="#reviews">${product.rating} (${product.reviewCount} reviews)</a>
        </div>
        <div class="product-price-large">
          <span class="current-price">${formatPrice(product.price)}</span>
          ${product.originalPrice ? `<span class="original-price">${formatPrice(product.originalPrice)}</span>` : ''}
          ${discount > 0 ? `<span class="discount-badge">-${discount}% OFF</span>` : ''}
        </div>
        <div class="stock-status">
          <i class="fas fa-check-circle"></i>
          <span>${product.inStock ? 'In Stock' : 'Out of Stock'}</span>
        </div>
      </div>
      <p class="product-description">${product.description}</p>
      
      <div class="product-features">
        <h4>Features</h4>
        <ul>
          ${product.features ? product.features.map(f => `<li><i class="fas fa-check"></i> ${f}</li>`).join('') : '<li><i class="fas fa-check"></i> Premium Quality</li><li><i class="fas fa-check"></i> Comfortable Fit</li>'}
        </ul>
      </div>

      <div class="product-options">
        <div class="size-selector">
          <label>Select Size <span class="required">*</span> <a href="#" class="size-guide-link">Size Guide</a></label>
          <div class="size-options">
            ${product.sizes.map(size => `
              <button class="size-btn" data-size="${size}">${size}</button>
            `).join('')}
          </div>
          <span class="size-error">Please select a size</span>
        </div>

        <div class="quantity-selector">
          <label>Quantity</label>
          <div class="qty-control">
            <button class="qty-btn" id="qty-minus"><i class="fas fa-minus"></i></button>
            <input type="number" value="1" min="1" max="10" id="product-qty" readonly>
            <button class="qty-btn" id="qty-plus"><i class="fas fa-plus"></i></button>
          </div>
        </div>
      </div>

      <div class="product-actions-detailed">
        <button class="btn-add-cart" id="add-to-cart-btn">
          <i class="fas fa-shopping-bag"></i>
          Add to Cart
        </button>
        <button class="btn-wishlist ${isInWishlist ? 'active' : ''}" id="wishlist-btn" data-product-id="${product.id}">
          <i class="fas fa-heart"></i>
        </button>
      </div>

      <div class="product-meta-info">
        <div class="meta-item">
          <i class="fas fa-truck"></i>
          <span>Free shipping on orders over PKR 10,000</span>
        </div>
        <div class="meta-item">
          <i class="fas fa-undo"></i>
          <span>30-day easy returns</span>
        </div>
        <div class="meta-item">
          <i class="fas fa-shield-alt"></i>
          <span>Secure checkout</span>
        </div>
      </div>

      <div class="social-share">
        <span>Share:</span>
        <a href="#" title="Facebook"><i class="fab fa-facebook-f"></i></a>
        <a href="#" title="Twitter"><i class="fab fa-twitter"></i></a>
        <a href="#" title="Pinterest"><i class="fab fa-pinterest"></i></a>
        <a href="#" title="WhatsApp"><i class="fab fa-whatsapp"></i></a>
      </div>
    </div>
  `;

  // Initialize product page interactions
  initProductInteractions(product);
}

// Initialize Product Interactions
function initProductInteractions(product) {
  let selectedSize = null;
  let quantity = 1;

  // Size selection
  const sizeBtns = document.querySelectorAll('.size-btn');
  sizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sizeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedSize = btn.dataset.size;
      document.querySelector('.size-error').style.display = 'none';
    });
  });

  // Quantity controls
  const qtyInput = document.getElementById('product-qty');
  if (qtyInput) {
    document.getElementById('qty-minus').addEventListener('click', () => {
      if (quantity > 1) {
        quantity--;
        qtyInput.value = quantity;
      }
    });

    document.getElementById('qty-plus').addEventListener('click', () => {
      if (quantity < 10) {
        quantity++;
        qtyInput.value = quantity;
      }
    });
  }

  // Add to cart
  const addToCartBtn = document.getElementById('add-to-cart-btn');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      if (!selectedSize) {
        document.querySelector('.size-error').style.display = 'block';
        return;
      }
      
      if (typeof cart !== 'undefined') {
        cart.addItem(product, selectedSize, quantity);
        showNotification('Added to cart!', 'success');
      }
    });
  }

  // Wishlist
  const wishlistBtn = document.getElementById('wishlist-btn');
  if (wishlistBtn) {
    wishlistBtn.addEventListener('click', () => {
      const productId = parseInt(wishlistBtn.dataset.productId);
      
      if (window.isInWishlist && window.isInWishlist(productId)) {
        if (window.removeFromWishlist) {
          window.removeFromWishlist(productId);
        }
        wishlistBtn.classList.remove('active');
        showNotification('Removed from wishlist', 'info');
      } else {
        if (window.addToWishlist) {
          window.addToWishlist(productId);
        }
        wishlistBtn.classList.add('active');
        showNotification('Added to wishlist!', 'success');
      }
    });
  }
}

// Render Related Products
function renderRelatedProducts(product) {
  const container = document.getElementById('related-products');
  if (!container || typeof products === 'undefined') return;

  const related = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  if (related.length === 0) {
    container.innerHTML = '<p class="no-related">No related products found</p>';
    return;
  }

  container.innerHTML = related.map(p => createProductCard(p)).join('');
  
  // Add click handlers
  container.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      window.location.href = `product.html?id=${id}`;
    });
  });
}

// Show Product Not Found
function showProductNotFound() {
  const container = document.getElementById('product-details');
  if (container) {
    container.innerHTML = `
      <div class="product-not-found">
        <i class="fas fa-exclamation-circle"></i>
        <h2>Product Not Found</h2>
        <p>Sorry, the product you're looking for doesn't exist or has been removed.</p>
        <a href="shop.html" class="btn btn-primary">Browse Products</a>
      </div>
    `;
  }
}

// Cart Page Initialization
function initCartPage() {
  if (typeof cart !== 'undefined') {
    cart.renderCartItems();
    cart.renderCartSummary();
  }

  // Clear cart button
  const clearBtn = document.getElementById('clear-cart');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear your cart?')) {
        cart.clearCart();
        cart.renderCartItems();
        cart.renderCartSummary();
      }
    });
  }

  // Checkout button
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.isEmpty()) {
        showNotification('Your cart is empty!', 'error');
        return;
      }
      window.location.href = 'checkout.html';
    });
  }
}

// Wishlist Page Initialization
function initWishlistPage() {
  if (typeof window.renderWishlist === 'function') {
    window.renderWishlist();
  }
}

// Checkout Page Initialization
function initCheckoutPage() {
  if (typeof cart !== 'undefined') {
    if (cart.isEmpty()) {
      window.location.href = 'cart.html';
      return;
    }
    cart.renderCartSummary('checkout-summary');
  }

  // Shipping method change
  const shippingMethods = document.querySelectorAll('input[name="shipping"]');
  shippingMethods.forEach(method => {
    method.addEventListener('change', () => {
      if (typeof cart !== 'undefined') {
        cart.renderCartSummary('checkout-summary', method.value);
      }
    });
  });

  // Payment method toggle
  const paymentMethods = document.querySelectorAll('input[name="payment"]');
  paymentMethods.forEach(method => {
    method.addEventListener('change', () => {
      document.querySelectorAll('.payment-details').forEach(el => el.style.display = 'none');
      const details = document.getElementById(`${method.value}-details`);
      if (details) details.style.display = 'block';
    });
  });

  // Form submission
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      if (validateCheckoutForm(checkoutForm)) {
        // Show success modal
        const modal = document.getElementById('order-success-modal');
        if (modal) {
          modal.classList.add('active');
        }
        
        // Clear cart
        if (typeof cart !== 'undefined') {
          cart.clearCart();
        }
      }
    });
  }

  // Continue shopping button
  const continueBtn = document.getElementById('continue-shopping');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }
}

// Validate Checkout Form
function validateCheckoutForm(form) {
  let isValid = true;
  const requiredFields = form.querySelectorAll('[required]');

  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      isValid = false;
      field.classList.add('error');
    } else {
      field.classList.remove('error');
    }
  });

  // Email validation
  const emailField = form.querySelector('input[type="email"]');
  if (emailField && emailField.value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailField.value)) {
      isValid = false;
      emailField.classList.add('error');
    }
  }

  // Phone validation
  const phoneField = form.querySelector('input[name="phone"]');
  if (phoneField && phoneField.value) {
    const phoneRegex = /^[\d\s\-+()]{10,}$/;
    if (!phoneRegex.test(phoneField.value)) {
      isValid = false;
      phoneField.classList.add('error');
    }
  }

  return isValid;
}

// Contact Page Initialization
function initContactPage() {
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = contactForm.querySelector('input[name="name"]').value;
      const email = contactForm.querySelector('input[name="email"]').value;
      const message = contactForm.querySelector('textarea[name="message"]').value;

      if (name && email && message) {
        showNotification('Message sent successfully!', 'success');
        contactForm.reset();
      } else {
        showNotification('Please fill in all fields', 'error');
      }
    });
  }
}

// Show Notification
function showNotification(message, type = 'info') {
  // Remove existing notification
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();

  // Create notification
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
    <span>${message}</span>
  `;

  // Add styles
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 30px;
    background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 9999;
    transform: translateX(150%);
    transition: transform 0.3s ease;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  `;

  document.body.appendChild(notification);

  // Show
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 10);

  // Hide after 3 seconds
  setTimeout(() => {
    notification.style.transform = 'translateX(150%)';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Export functions for global use
window.createProductCard = createProductCard;
window.getStarRating = getStarRating;
window.showNotification = showNotification;
