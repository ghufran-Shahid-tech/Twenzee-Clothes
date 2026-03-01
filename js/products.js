// ========================================
// TWENZEE - Shop Filters, Search, Pagination
// ========================================

let currentProducts = [...products];
let filteredProducts = [...products];
let currentPage = 1;
const productsPerPage = 12;

// Initialize filters
function initFilters() {
  renderProducts();
  renderPagination();
  initFilterListeners();
  initSortListener();
  initSearchListener();
}

// Filter event listeners
function initFilterListeners() {
  document.querySelectorAll('input[name="category"]').forEach(cb => cb.addEventListener('change', applyFilters));
  document.querySelectorAll('input[name="size"]').forEach(cb => cb.addEventListener('change', applyFilters));

  const priceRange = document.getElementById('price-range');
  const priceValue = document.getElementById('price-value');
  if(priceRange && priceValue){
    priceRange.addEventListener('input', () => {
      priceValue.textContent = `PKR ${parseInt(priceRange.value).toLocaleString()}`;
      applyFilters();
    });
  }

  const clearBtn = document.getElementById('clear-filters');
  if(clearBtn) clearBtn.addEventListener('click', clearFilters);
}

// Sort listener
function initSortListener(){
  const sortSelect = document.getElementById('sort-select');
  if(sortSelect) sortSelect.addEventListener('change', ()=>{
    applySorting();
    renderProducts();
  });
}

// Search listener
function initSearchListener(){
  const searchInput = document.getElementById('product-search');
  if(searchInput){
    let debounce;
    searchInput.addEventListener('input',()=>{
      clearTimeout(debounce);
      debounce = setTimeout(()=> applyFilters(), 300);
    });
    searchInput.addEventListener('keypress', e => { if(e.key==='Enter'){clearTimeout(debounce); applyFilters();}});
  }
}

// Apply filters
function applyFilters(){
  const selectedCategories = Array.from(document.querySelectorAll('input[name="category"]:checked')).map(cb=>cb.value);
  const selectedSizes = Array.from(document.querySelectorAll('input[name="size"]:checked')).map(cb=>cb.value);
  const maxPrice = parseInt(document.getElementById('price-range')?.value||50000);
  const searchQuery = document.getElementById('product-search')?.value.toLowerCase().trim()||'';

  filteredProducts = currentProducts.filter(p=>{
    if(selectedCategories.length && !selectedCategories.includes(p.category)) return false;
    if(p.price>maxPrice) return false;
    if(selectedSizes.length && !selectedSizes.some(s=>p.sizes.includes(s))) return false;
    if(searchQuery){
      const match = p.name.toLowerCase().includes(searchQuery)||p.description.toLowerCase().includes(searchQuery)||p.category.toLowerCase().includes(searchQuery);
      if(!match) return false;
    }
    return true;
  });

  applySorting();
  currentPage=1;
  renderProducts();
  renderPagination();
  updateResultCount();
}

// Apply sorting
function applySorting(){
  const sortValue = document.getElementById('sort-select')?.value || 'newest';
  switch(sortValue){
    case 'price-low': filteredProducts.sort((a,b)=>a.price-b.price); break;
    case 'price-high': filteredProducts.sort((a,b)=>b.price-a.price); break;
    case 'name-az': filteredProducts.sort((a,b)=>a.name.localeCompare(b.name)); break;
    case 'name-za': filteredProducts.sort((a,b)=>b.name.localeCompare(a.name)); break;
    case 'rating': filteredProducts.sort((a,b)=>b.rating-a.rating); break;
    case 'newest':
    default: filteredProducts.sort((a,b)=>b.id-a.id); break;
  }
}

// Clear filters
function clearFilters(){
  document.querySelectorAll('input[name="category"], input[name="size"]').forEach(cb=>cb.checked=false);
  const priceRange = document.getElementById('price-range');
  if(priceRange) { priceRange.value=50000; document.getElementById('price-value').textContent='PKR 50,000'; }
  const searchInput = document.getElementById('product-search');
  if(searchInput) searchInput.value='';
  filteredProducts=[...currentProducts];
  currentPage=1;
  renderProducts();
  renderPagination();
  updateResultCount();
}

// Render products
function renderProducts(){
  const container = document.getElementById('products-grid');
  if(!container) return;

  const start = (currentPage-1)*productsPerPage;
  const end = start+productsPerPage;
  const productsToShow = filteredProducts.slice(start,end);

  if(!productsToShow.length){
    container.innerHTML=`<div class="no-products"><h3>No products found</h3><button onclick="clearFilters()">Clear Filters</button></div>`;
    return;
  }

  container.innerHTML = productsToShow.map(createProductCard).join('');
  attachProductCardListeners(container);
}

// Product card HTML
function createProductCard(p){
  const discount = p.originalPrice ? Math.round(((p.originalPrice-p.price)/p.originalPrice)*100) : 0;
  const stars = getStarRating(p.rating);
  return `
    <div class="product-card" data-id="${p.id}" onclick="window.location.href='product.html?id=${p.id}'">
      <div class="product-image">
        <img src="${p.images[0]}" alt="${p.name}">
        ${p.isNew?'<span class="product-badge new">NEW</span>':''}
        ${discount>0?`<span class="product-badge discount">-${discount}%</span>`:''}
        <div class="product-actions" onclick="event.stopPropagation()">
          <button class="product-action-btn quick-view" data-id="${p.id}" title="Quick View"><i class="fas fa-eye"></i></button>
          <button class="product-action-btn add-to-cart" data-id="${p.id}" title="Add to Cart"><i class="fas fa-shopping-bag"></i></button>
          <button class="product-action-btn wishlist" data-id="${p.id}" title="Wishlist"><i class="fas fa-heart"></i></button>
        </div>
      </div>
      <div class="product-info">
        <h3>${p.name}</h3>
        <div class="product-price">
          <span>${formatPrice(p.price)}</span>
          ${p.originalPrice?`<span class="original-price">${formatPrice(p.originalPrice)}</span>`:''}
        </div>
        <div class="product-rating">${stars}<span>(${p.reviewCount})</span></div>
      </div>
    </div>
  `;
}

// Star rating HTML
function getStarRating(rating){
  const fullStars = Math.floor(rating);
  const halfStar = rating%1>=0.5;
  let html='';
  for(let i=0;i<fullStars;i++) html+='<i class="fas fa-star"></i>';
  if(halfStar) html+='<i class="fas fa-star-half-alt"></i>';
  for(let i=fullStars+(halfStar?1:0);i<5;i++) html+='<i class="far fa-star"></i>';
  return html;
}

// Attach card listeners
function attachProductCardListeners(container){
  container.querySelectorAll('.quick-view').forEach(btn=>btn.addEventListener('click', e=>{e.stopPropagation(); openQuickView(btn.dataset.id);}));
  container.querySelectorAll('.add-to-cart').forEach(btn=>btn.addEventListener('click', e=>{e.stopPropagation(); alert('Added to cart');}));
  container.querySelectorAll('.wishlist').forEach(btn=>btn.addEventListener('click', e=>{e.stopPropagation(); alert('Added to wishlist');}));
}

// Quick view
function openQuickView(id){window.location.href=`product.html?id=${id}`;}

// Pagination
function renderPagination(){
  const container = document.getElementById('pagination');
  if(!container) return;

  const totalPages = Math.ceil(filteredProducts.length/productsPerPage);
  if(totalPages<=1){ container.innerHTML=''; return; }

  let html=`<button class="page-btn" data-page="${currentPage-1}" ${currentPage===1?'disabled':''}><i class="fas fa-chevron-left"></i></button>`;
  for(let i=1;i<=totalPages;i++) html+=`<button class="page-btn ${i===currentPage?'active':''}" data-page="${i}">${i}</button>`;
  html+=`<button class="page-btn" data-page="${currentPage+1}" ${currentPage===totalPages?'disabled':''}><i class="fas fa-chevron-right"></i></button>`;

  container.innerHTML=html;
  container.querySelectorAll('.page-btn:not([disabled])').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const page=parseInt(btn.dataset.page);
      if(page!==currentPage){currentPage=page; renderProducts(); renderPagination(); window.scrollTo({top:0, behavior:'smooth'});}
    });
  });
}

// Update result count
function updateResultCount(){
  const el = document.getElementById('result-count');
  if(el) el.textContent=`${filteredProducts.length} product${filteredProducts.length!==1?'s':''}`;
}

// Export
window.initFilters=initFilters;
