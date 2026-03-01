// ========================================
// TWENZEE - Checkout System
// Full Checkout Flow Handler
// ========================================

class Checkout {
  constructor() {
    this.form = document.getElementById('checkout-form');
    this.shippingMethod = 'standard';
    this.paymentMethod = 'cod';
    this.init();
  }

  init() {
    if (!this.form) return;

    this.loadCartSummary();
    this.attachEventListeners();
    this.populateSavedInfo();
  }

  // Load cart summary
  loadCartSummary() {
    const summaryContainer = document.getElementById('checkout-summary');
    if (!summaryContainer || typeof cart === 'undefined') return;

    const summary = cart.getSummary(this.shippingMethod);

    // Render order items
    const itemsContainer = document.getElementById('order-items');
    if (itemsContainer) {
      itemsContainer.innerHTML = summary.items.map(item => `
        <div class="order-item">
          <div class="order-item-image">
            <img src="${item.image}" alt="${item.name}">
            <span class="item-qty">${item.quantity}</span>
          </div>
          <div class="order-item-info">
            <h4>${item.name}</h4>
            <p>Size: ${item.size}</p>
          </div>
          <div class="order-item-price">
            ${this.formatPrice(item.price * item.quantity)}
          </div>
        </div>
      `).join('');
    }

    // Render summary totals
    summaryContainer.innerHTML = `
      <div class="summary-row">
        <span>Subtotal (${summary.count} items)</span>
        <span>${this.formatPrice(summary.subtotal)}</span>
      </div>
      <div class="summary-row">
        <span>Tax (16%)</span>
        <span>${this.formatPrice(summary.tax)}</span>
      </div>
      <div class="summary-row">
        <span>Shipping (${summary.shipping === 0 ? 'Free' : this.shippingMethod})</span>
        <span>${summary.shipping === 0 ? 'FREE' : this.formatPrice(summary.shipping)}</span>
      </div>
      ${summary.subtotal >= 10000 ? '<div class="free-shipping-note"><i class="fas fa-check"></i> You qualified for free shipping!</div>' : ''}
      <div class="summary-row total">
        <span>Total</span>
        <span>${this.formatPrice(summary.total)}</span>
      </div>
    `;
  }

  // Attach event listeners
  attachEventListeners() {
    // Shipping method change
    const shippingInputs = this.form.querySelectorAll('input[name="shipping"]');
    shippingInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        this.shippingMethod = e.target.value;
        this.loadCartSummary();
      });
    });

    // Payment method change
    const paymentInputs = this.form.querySelectorAll('input[name="payment"]');
    paymentInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        this.paymentMethod = e.target.value;
        this.togglePaymentDetails();
      });
    });

    // Form submission
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Input validation on blur
    const requiredInputs = this.form.querySelectorAll('[required]');
    requiredInputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearFieldError(input));
    });
  }

  // Toggle payment method details
  togglePaymentDetails() {
    const codDetails = document.getElementById('cod-details');
    const cardDetails = document.getElementById('card-details');
    const walletDetails = document.getElementById('wallet-details');

    if (codDetails) codDetails.style.display = 'none';
    if (cardDetails) cardDetails.style.display = 'none';
    if (walletDetails) walletDetails.style.display = 'none';

    const activeDetails = document.getElementById(`${this.paymentMethod}-details`);
    if (activeDetails) activeDetails.style.display = 'block';
  }

  // Validate single field
  validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';

    // Required validation
    if (!value) {
      isValid = false;
      errorMessage = 'This field is required';
    }

    // Email validation
    if (fieldName === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address';
      }
    }

    // Phone validation
    if (fieldName === 'phone' && value) {
      const phoneRegex = /^[\d\s\-+()]{11,}$/;
      if (!phoneRegex.test(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid phone number (minimum 11 digits)';
      }
    }

    // Postal code validation
    if (fieldName === 'postal' && value) {
      const postalRegex = /^\d{5,6}$/;
      if (!postalRegex.test(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid postal code';
      }
    }

    // Card number validation
    if (fieldName === 'cardNumber' && value) {
      const cardRegex = /^\d{16}$/;
      if (!cardRegex.test(value.replace(/\s/g, ''))) {
        isValid = false;
        errorMessage = 'Please enter a valid 16-digit card number';
      }
    }

    // CVV validation
    if (fieldName === 'cvv' && value) {
      const cvvRegex = /^\d{3,4}$/;
      if (!cvvRegex.test(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid CVV';
      }
    }

    if (!isValid) {
      this.showFieldError(field, errorMessage);
    }

    return isValid;
  }

  // Show field error
  showFieldError(field, message) {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;

    formGroup.classList.add('error');
    
    let errorEl = formGroup.querySelector('.error-message');
    if (!errorEl) {
      errorEl = document.createElement('span');
      errorEl.className = 'error-message';
      formGroup.appendChild(errorEl);
    }
    errorEl.textContent = message;
  }

  // Clear field error
  clearFieldError(field) {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;

    formGroup.classList.remove('error');
    const errorEl = formGroup.querySelector('.error-message');
    if (errorEl) errorEl.remove();
  }

  // Validate entire form
  validateForm() {
    const requiredFields = this.form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  // Handle form submission
  handleSubmit() {
    if (!this.validateForm()) {
      // Scroll to first error
      const firstError = this.form.querySelector('.form-group.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Collect form data
    const formData = new FormData(this.form);
    const orderData = {
      customer: {
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        phone: formData.get('phone')
      },
      shipping: {
        address: formData.get('address'),
        city: formData.get('city'),
        postal: formData.get('postal'),
        country: formData.get('country')
      },
      shippingMethod: this.shippingMethod,
      paymentMethod: this.paymentMethod,
      order: typeof cart !== 'undefined' ? cart.getSummary(this.shippingMethod) : null
    };

    // Save order to localStorage (for demo)
    this.saveOrder(orderData);

    // Show success modal
    this.showSuccessModal();

    // Clear cart
    if (typeof cart !== 'undefined') {
      cart.clearCart();
    }
  }

  // Save order
  saveOrder(orderData) {
    const orders = JSON.parse(localStorage.getItem('twenzee_orders') || '[]');
    orders.push({
      id: 'ORD-' + Date.now(),
      date: new Date().toISOString(),
      ...orderData
    });
    localStorage.setItem('twenzee_orders', JSON.stringify(orders));
  }

  // Show success modal
  showSuccessModal() {
    const modal = document.getElementById('order-success-modal');
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  // Populate saved info
  populateSavedInfo() {
    const savedInfo = localStorage.getItem('twenzee_customer_info');
    if (savedInfo) {
      const info = JSON.parse(savedInfo);
      const fields = ['fullName', 'email', 'phone', 'address', 'city', 'postal'];
      fields.forEach(field => {
        const input = this.form.querySelector(`[name="${field}"]`);
        if (input && info[field]) {
          input.value = info[field];
        }
      });
    }
  }

  // Save customer info
  saveCustomerInfo() {
    const formData = new FormData(this.form);
    const info = {
      fullName: formData.get('fullName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      city: formData.get('city'),
      postal: formData.get('postal')
    };
    localStorage.setItem('twenzee_customer_info', JSON.stringify(info));
  }

  // Format price
  formatPrice(price) {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(price);
  }
}

// Initialize checkout when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const checkout = new Checkout();
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Checkout };
}
