// ========================================
// TWENZEE - Cart System
// localStorage-based Shopping Cart
// ========================================

class Cart {
  constructor() {
    this.items = this.loadCart();
    this.taxRate = 0.16; // 16% tax
    this.shippingRates = {
      standard: 299,
      express: 599
    };
  }

  // Load cart from localStorage
  loadCart() {
    try {
      const saved = localStorage.getItem('twenzee_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error loading cart:', e);
      return [];
    }
  }

  // Save cart to localStorage
  saveCart() {
    try {
      localStorage.setItem('twenzee_cart', JSON.stringify(this.items));
      this.updateCartCount();
      return true;
    } catch (e) {
      console.error('Error saving cart:', e);
      return false;
    }
  }

  // Add item to cart
  addItem(product, size, quantity = 1) {
    const existingItem = this.items.find(item => 
      item.id === product.id && item.size === size
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        size: size,
        quantity: quantity,
        addedAt: new Date().toISOString()
      });
    }

    this.saveCart();
    this.showToast(`${product.name} added to cart!`);
    return true;
  }

  // Remove item from cart
  removeItem(productId, size) {
    const index = this.items.findIndex(item => 
      item.id === productId && item.size === size
    );
    
    if (index > -1) {
      const item = this.items[index];
      this.items.splice(index, 1);
      this.saveCart();
      this.showToast(`${item.name} removed from cart`);
      return true;
    }
    return false;
  }

  // Update item quantity
  updateQuantity(productId, size, quantity) {
    if (quantity < 1) {
      return this.removeItem(productId, size);
    }

    const item = this.items.find(item => 
      item.id === productId && item.size === size
    );

    if (item) {
      item.quantity = quantity;
      this.saveCart();
      return true;
    }
    return false;
  }

  // Increase quantity
  increaseQuantity(productId, size) {
    const item = this.items.find(item => 
      item.id === productId && item.size === size
    );
    if (item) {
      item.quantity++;
      this.saveCart();
      return true;
    }
    return false;
  }

  // Decrease quantity
  decreaseQuantity(productId, size) {
    const item = this.items.find(item => 
      item.id === productId && item.size === size
    );
    if (item) {
      if (item.quantity > 1) {
        item.quantity--;
        this.saveCart();
        return true;
      } else {
        return this.removeItem(productId, size);
      }
    }
    return false;
  }

  // Clear entire cart
  clearCart() {
    this.items = [];
    this.saveCart();
    this.showToast('Cart cleared');
    return true;
  }

  // Get cart count
  getCount() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  // Get subtotal
  getSubtotal() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  // Get tax amount
  getTax() {
    return Math.round(this.getSubtotal() * this.taxRate);
  }

  // Get shipping cost
  getShipping(method = 'standard') {
    const subtotal = this.getSubtotal();
    // Free shipping for orders over 10000 PKR
    if (subtotal >= 10000) return 0;
    return this.shippingRates[method] || this.shippingRates.standard;
  }

  // Get total
  getTotal(shippingMethod = 'standard') {
    return this.getSubtotal() + this.getTax() + this.getShipping(shippingMethod);
  }

  // Get cart summary
  getSummary(shippingMethod = 'standard') {
    return {
      items: this.items,
      count: this.getCount(),
      subtotal: this.getSubtotal(),
      tax: this.getTax(),
      shipping: this.getShipping(shippingMethod),
      shippingMethod: shippingMethod,
      total: this.getTotal(shippingMethod)
    };
  }

  // Check if cart is empty
  isEmpty() {
    return this.items.length === 0;
  }

  // Update cart count in navbar
  updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    const count = this.getCount();
    cartCountElements.forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  // Show toast notification
  showToast(message) {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
      existingToast.remove();
    }

    // Create new toast
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);

    // Show toast
    setTimeout(() => toast.classList.add('show'), 10);

    // Hide after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Render cart items (for cart page)
  renderCartItems(containerId = 'cart-items') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (this.isEmpty()) {
      container.innerHTML = `
        <div class="empty-cart">
          <i class="fas fa-shopping-bag"></i>
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <a href="shop.html" class="btn btn-primary">Continue Shopping</a>
        </div>
      `;
      return;
    }

    container.innerHTML = this.items.map(item => `
      <div class="cart-item" data-id="${item.id}" data-size="${item.size}">
        <div class="cart-item-image">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="cart-item-details">
          <h4>${item.name}</h4>
          <p class="cart-item-size">Size: ${item.size}</p>
          <p class="cart-item-price">${this.formatPrice(item.price)}</p>
        </div>
        <div class="cart-item-quantity">
          <button class="qty-btn minus" data-id="${item.id}" data-size="${item.size}">
            <i class="fas fa-minus"></i>
          </button>
          <span class="qty-value">${item.quantity}</span>
          <button class="qty-btn plus" data-id="${item.id}" data-size="${item.size}">
            <i class="fas fa-plus"></i>
          </button>
        </div>
        <div class="cart-item-total">
          ${this.formatPrice(item.price * item.quantity)}
        </div>
        <button class="cart-item-remove" data-id="${item.id}" data-size="${item.size}">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `).join('');

    // Add event listeners
    this.attachCartItemListeners(container);
  }

  // Attach event listeners to cart items
  attachCartItemListeners(container) {
    // Quantity buttons
    container.querySelectorAll('.qty-btn.minus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(btn.dataset.id);
        const size = btn.dataset.size;
        this.decreaseQuantity(id, size);
        this.renderCartItems();
        this.renderCartSummary();
      });
    });

    container.querySelectorAll('.qty-btn.plus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(btn.dataset.id);
        const size = btn.dataset.size;
        this.increaseQuantity(id, size);
        this.renderCartItems();
        this.renderCartSummary();
      });
    });

    // Remove buttons
    container.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(btn.dataset.id);
        const size = btn.dataset.size;
        this.removeItem(id, size);
        this.renderCartItems();
        this.renderCartSummary();
      });
    });
  }

  // Render cart summary (for cart page)
  renderCartSummary(containerId = 'cart-summary', shippingMethod = 'standard') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const summary = this.getSummary(shippingMethod);

    container.innerHTML = `
      <div class="summary-row">
        <span>Subtotal (${summary.count} items)</span>
        <span>${this.formatPrice(summary.subtotal)}</span>
      </div>
      <div class="summary-row">
        <span>Tax (16%)</span>
        <span>${this.formatPrice(summary.tax)}</span>
      </div>
      <div class="summary-row">
        <span>Shipping (${summary.shipping === 0 ? 'Free' : summary.shippingMethod})</span>
        <span>${summary.shipping === 0 ? 'FREE' : this.formatPrice(summary.shipping)}</span>
      </div>
      ${summary.subtotal >= 10000 ? '<div class="free-shipping-note"><i class="fas fa-check"></i> You qualified for free shipping!</div>' : ''}
      <div class="summary-row total">
        <span>Total</span>
        <span>${this.formatPrice(summary.total)}</span>
      </div>
    `;
  }

  // Format price
  formatPrice(price) {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(price);
  }

  // Initialize cart on page load
  init() {
    this.updateCartCount();
    return this;
  }
}

// Create global cart instance
const cart = new Cart();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  cart.init();
});

// Export to window for global access
window.cart = cart;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Cart, cart };
}
