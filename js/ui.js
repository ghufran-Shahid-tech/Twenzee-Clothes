// ========================================
// TWENZEE - UI Animations & Effects
// Premium 3D Interactions
// ========================================

class UIController {
  constructor() {
    this.navbar = document.querySelector('.navbar');
    this.heroSlider = null;
    this.currentSlide = 0;
    this.slideInterval = null;
    this.init();
  }

  init() {
    this.initNavbar();
    this.initHeroSlider();
    this.initScrollAnimations();
    this.init3DCards();
    this.initBackToTop();
    this.initMobileMenu();
    this.initSmoothScroll();
    this.initParallax();
  }

  // Navbar scroll effect
  initNavbar() {
    if (!this.navbar) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        this.navbar.classList.add('scrolled');
      } else {
        this.navbar.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // Hero Slider
  initHeroSlider() {
    const slider = document.querySelector('.hero-slider');
    if (!slider) return;

    this.heroSlider = slider;
    this.slides = slider.querySelectorAll('.hero-slide');
    this.dots = document.querySelectorAll('.hero-dot');
    this.prevBtn = document.querySelector('.hero-arrow.prev');
    this.nextBtn = document.querySelector('.hero-arrow.next');

    if (this.slides.length === 0) return;

    // Show first slide
    this.showSlide(0);

    // Auto slide every 5 seconds
    this.startAutoSlide();

    // Event listeners
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => {
        this.prevSlide();
        this.resetAutoSlide();
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => {
        this.nextSlide();
        this.resetAutoSlide();
      });
    }

    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        this.showSlide(index);
        this.resetAutoSlide();
      });
    });
  }

  showSlide(index) {
    // Hide all slides
    this.slides.forEach((slide, i) => {
      slide.classList.remove('active');
      if (this.dots[i]) this.dots[i].classList.remove('active');
    });

    // Show current slide
    this.currentSlide = index;
    if (this.currentSlide >= this.slides.length) this.currentSlide = 0;
    if (this.currentSlide < 0) this.currentSlide = this.slides.length - 1;

    this.slides[this.currentSlide].classList.add('active');
    if (this.dots[this.currentSlide]) this.dots[this.currentSlide].classList.add('active');

    // Animate text
    this.animateHeroText();
  }

  nextSlide() {
    this.showSlide(this.currentSlide + 1);
  }

  prevSlide() {
    this.showSlide(this.currentSlide - 1);
  }

  startAutoSlide() {
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  resetAutoSlide() {
    clearInterval(this.slideInterval);
    this.startAutoSlide();
  }

  animateHeroText() {
    const heroText = document.querySelectorAll('.hero-text h1, .hero-text p, .hero-buttons');
    heroText.forEach((el, i) => {
      el.style.animation = 'none';
      el.offsetHeight; // Trigger reflow
      el.style.animation = `slideUpFade 0.8s ease forwards ${0.3 + i * 0.2}s`;
    });
  }

  // Scroll Animations
  initScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe elements
    document.querySelectorAll('.fade-in, .slide-left, .slide-right').forEach(el => {
      observer.observe(el);
    });

    // Stagger animations for grids
    this.initStaggerAnimations();
  }

  initStaggerAnimations() {
    const staggerContainers = document.querySelectorAll('.products-grid, .categories-grid');
    
    staggerContainers.forEach(container => {
      const items = container.children;
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            Array.from(items).forEach((item, i) => {
              item.style.opacity = '0';
              item.style.transform = 'translateY(30px)';
              setTimeout(() => {
                item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
              }, i * 100);
            });
            observer.unobserve(container);
          }
        });
      }, { threshold: 0.1 });

      observer.observe(container);
    });
  }

  // 3D Card Effects
  init3DCards() {
    const cards = document.querySelectorAll('.product-card, .category-card');
    
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
      });
    });
  }

  // Back to Top Button
  initBackToTop() {
    const backToTop = document.querySelector('.back-to-top');
    if (!backToTop) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 500) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }, { passive: true });

    backToTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // Mobile Menu
  initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (!menuToggle || !navLinks) return;

    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
      document.body.classList.toggle('menu-open');
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.classList.remove('menu-open');
      });
    });
  }

  // Smooth Scroll
  initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  // Parallax Effect
  initParallax() {
    const parallaxElements = document.querySelectorAll('.parallax');
    
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      
      parallaxElements.forEach(el => {
        const speed = el.dataset.speed || 0.5;
        el.style.transform = `translateY(${scrollY * speed}px)`;
      });
    }, { passive: true });
  }

  // Glow Effect on Buttons
  initGlowEffect() {
    const buttons = document.querySelectorAll('.btn-primary');
    
    buttons.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        btn.style.background = `radial-gradient(circle at ${x}px ${y}px, #ff4d4d, #ff2e2e)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.background = '';
      });
    });
  }

  // Ripple Effect
  createRipple(e, element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s ease-out;
      pointer-events: none;
    `;
    
    element.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  }

  // Lazy Loading Images
  initLazyLoading() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });

    lazyImages.forEach(img => imageObserver.observe(img));
  }

  // Counter Animation
  animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const updateCounter = () => {
      current += increment;
      if (current < target) {
        element.textContent = Math.floor(current);
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target;
      }
    };

    updateCounter();
  }

  // Form Validation
  validateForm(form) {
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    let isValid = true;

    inputs.forEach(input => {
      if (!input.value.trim()) {
        isValid = false;
        this.showInputError(input, 'This field is required');
      } else {
        this.clearInputError(input);
      }

      // Email validation
      if (input.type === 'email' && input.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.value)) {
          isValid = false;
          this.showInputError(input, 'Please enter a valid email');
        }
      }
    });

    return isValid;
  }

  showInputError(input, message) {
    const formGroup = input.closest('.form-group') || input.parentElement;
    formGroup.classList.add('error');
    
    let errorEl = formGroup.querySelector('.error-message');
    if (!errorEl) {
      errorEl = document.createElement('span');
      errorEl.className = 'error-message';
      formGroup.appendChild(errorEl);
    }
    errorEl.textContent = message;
  }

  clearInputError(input) {
    const formGroup = input.closest('.form-group') || input.parentElement;
    formGroup.classList.remove('error');
    const errorEl = formGroup.querySelector('.error-message');
    if (errorEl) errorEl.remove();
  }

  // Modal
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // Loading State
  setLoading(element, isLoading) {
    if (isLoading) {
      element.classList.add('loading');
      element.disabled = true;
    } else {
      element.classList.remove('loading');
      element.disabled = false;
    }
  }
}

// Add ripple animation keyframes
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple {
    to {
      transform: scale(2);
      opacity: 0;
    }
  }
  
  .menu-open {
    overflow: hidden;
  }
  
  .form-group.error input,
  .form-group.error textarea,
  .form-group.error select {
    border-color: #ff2e2e;
  }
  
  .error-message {
    color: #ff2e2e;
    font-size: 0.85rem;
    margin-top: 5px;
    display: block;
  }
  
  .loading {
    position: relative;
    pointer-events: none;
  }
  
  .loading::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 20px;
    height: 20px;
    margin: -10px 0 0 -10px;
    border: 2px solid transparent;
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

// Initialize UI Controller
const ui = new UIController();

// Export to window for global access
window.ui = ui;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { UIController, ui };
}

document.querySelectorAll('.product-card').forEach(card => {
  card.style.transition = 'transform 0.3s ease'; // smooth reset

  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * 5; // max tilt 5deg
    const rotateY = ((x - centerX) / centerX) * 5;
    card.style.transform = `rotateX(${-rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'rotateX(0) rotateY(0) scale(1)';
  });
});


