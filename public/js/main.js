/**
 * main.js — NeuraCart v2 client-side interactions
 * Updated for the new design system
 */
(function () {
    'use strict';

    /* --------------------------------------------------
       1. HAMBURGER MENU TOGGLE
       -------------------------------------------------- */
    const hamburger = document.querySelector('.nc-hamburger');
    const mobileDrawer = document.querySelector('.nc-drawer');

    if (hamburger && mobileDrawer) {
        hamburger.addEventListener('click', function (e) {
            e.stopPropagation();
            const isOpen = mobileDrawer.classList.toggle('open');
            hamburger.classList.toggle('open', isOpen);
            hamburger.setAttribute('aria-expanded', String(isOpen));
        });

        // Close drawer when clicking outside
        document.addEventListener('click', function (e) {
            if (!hamburger.contains(e.target) && !mobileDrawer.contains(e.target)) {
                mobileDrawer.classList.remove('open');
                hamburger.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });

        // Close drawer when a link inside it is clicked
        mobileDrawer.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                mobileDrawer.classList.remove('open');
                hamburger.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });

        // Close drawer on Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && mobileDrawer.classList.contains('open')) {
                mobileDrawer.classList.remove('open');
                hamburger.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
                hamburger.focus();
            }
        });
    }

    /* --------------------------------------------------
       2. NAVBAR SCROLL EFFECT
       -------------------------------------------------- */
    const navbar = document.querySelector('.nc-nav');
    if (navbar) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 12) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }, { passive: true });
    }

    /* --------------------------------------------------
       2b. CTA BUTTON RIPPLE
       -------------------------------------------------- */
    document.querySelectorAll('.nc-cta').forEach(function(ctaBtn) {
        ctaBtn.addEventListener('click', function (e) {
            var ripple = document.createElement('span');
            ripple.className = 'ripple';
            var rect = ctaBtn.getBoundingClientRect();
            var size = Math.max(rect.width, rect.height);
            ripple.style.cssText = [
                'width:' + size + 'px',
                'height:' + size + 'px',
                'left:' + (e.clientX - rect.left - size / 2) + 'px',
                'top:' + (e.clientY - rect.top  - size / 2) + 'px'
            ].join(';');
            ctaBtn.appendChild(ripple);
            setTimeout(function () { ripple.remove(); }, 600);
        });
    });

    /* --------------------------------------------------
       3. WISHLIST TOGGLE
       -------------------------------------------------- */
    function bindWishlists() {
        document.querySelectorAll('.product-wishlist').forEach(function (btn) {
            // Remove old listeners by cloning
            const clone = btn.cloneNode(true);
            if (btn.parentNode) {
                btn.parentNode.replaceChild(clone, btn);
            }
            
            clone.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var filled = clone.getAttribute('data-filled') === 'true';
                clone.setAttribute('data-filled', String(!filled));
                
                // Using bootstrap icons instead of unicode if available
                if (clone.querySelector('i')) {
                    const icon = clone.querySelector('i');
                    if (filled) {
                        icon.classList.remove('fa-solid');
                        icon.classList.add('fa-regular');
                    } else {
                        icon.classList.remove('fa-regular');
                        icon.classList.add('fa-solid');
                    }
                } else {
                    clone.textContent = filled ? '♡' : '♥';
                }
            });
        });
    }
    
    // Initial bind
    bindWishlists();

    /* --------------------------------------------------
       3b. PRODUCT IMAGE FALLBACKS
       -------------------------------------------------- */
    function bindProductImageFallbacks(root) {
        (root || document).querySelectorAll('img[data-product-image]').forEach(function (image) {
            if (image.dataset.fallbackBound) return;
            image.dataset.fallbackBound = 'true';

            function showFallback() {
                var container = image.parentElement;
                if (!container) return;
                image.alt = '';
                image.setAttribute('aria-hidden', 'true');
                container.classList.add('image-load-failed');
            }

            image.addEventListener('error', showFallback, { once: true });
            if (image.complete && image.naturalWidth === 0) showFallback();
        });
    }

    bindProductImageFallbacks();

    /* --------------------------------------------------
       3c. PERSISTENT CART
       -------------------------------------------------- */
    function updateCartCount(count) {
        document.querySelectorAll('.nc-cart-badge').forEach(function (badge) {
            badge.textContent = count;
        });
    }

    function showCartNotice(message, isError) {
        var notice = document.createElement('div');
        notice.className = 'cart-notice' + (isError ? ' cart-notice-error' : '');
        notice.setAttribute('role', 'status');
        notice.textContent = message;
        document.body.appendChild(notice);
        window.setTimeout(function () { notice.remove(); }, 3200);
    }

    document.addEventListener('click', async function (event) {
        var button = event.target.closest('[data-add-to-cart]');
        if (!button) return;

        event.preventDefault();
        event.stopPropagation();
        if (button.disabled) return;

        var productId = button.dataset.productId;
        if (!productId) return;

        var originalContent = button.innerHTML;
        button.disabled = true;
        button.textContent = 'Adding…';

        try {
            var response = await fetch('/cart/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ productId: productId, quantity: 1 })
            });
            var result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.error || 'Unable to add this item to your cart.');

            // Update global cart state
            let existingItem = window.CART_ITEMS.find(item => item.productId === productId);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                window.CART_ITEMS.push({ productId: productId, quantity: 1 });
            }
            
            updateCartCount(result.cartCount);
            showCartNotice(result.message || 'Added to your cart.');
            renderReactiveCartButtons(); // Reactively update UI
        } catch (error) {
            showCartNotice(error.message || 'Unable to add this item to your cart.', true);
        } finally {
            button.disabled = false;
            button.innerHTML = originalContent;
            if (window.ncReplaceIcons) window.ncReplaceIcons();
        }
    });

    document.addEventListener('click', async function (event) {
        var qtyBtn = event.target.closest('[data-cart-qty-btn]');
        if (!qtyBtn) return;

        event.preventDefault();
        event.stopPropagation();
        
        var productId = qtyBtn.dataset.productId;
        var action = qtyBtn.dataset.action; // 'increment' or 'decrement'
        if (!productId) return;
        
        // Find current quantity in state
        let cartItem = window.CART_ITEMS.find(item => item.productId === productId);
        if (!cartItem) return;
        
        let newQty = action === 'increment' ? cartItem.quantity + 1 : cartItem.quantity - 1;
        
        try {
            if (newQty <= 0) {
                // Remove item completely
                var response = await fetch(`/cart/${productId}/remove`, { method: 'POST' });
                if (response.ok) {
                    window.CART_ITEMS = window.CART_ITEMS.filter(item => item.productId !== productId);
                    renderReactiveCartButtons();
                    // Optional: update cart count by subtracting
                }
            } else {
                // Update item quantity
                var response = await fetch(`/cart/${productId}/update`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ quantity: newQty })
                });
                if (response.ok) {
                    cartItem.quantity = newQty;
                    renderReactiveCartButtons();
                }
            }
        } catch (e) {
            console.error("Failed to update quantity", e);
        }
    });

    // Function to visually morph "Add to Cart" buttons into quantity controllers if item is in cart
    function renderReactiveCartButtons() {
        if (!window.CART_ITEMS) return;
        
        document.querySelectorAll('.product-card-footer, .pdp-action-card').forEach(container => {
            const addBtn = container.querySelector('[data-add-to-cart]');
            // Some layouts have the button directly inside, some might have it wrapped. Let's find the product ID.
            if (!addBtn) return;
            
            const productId = addBtn.dataset.productId;
            const inCartItem = window.CART_ITEMS.find(item => item.productId === productId);
            
            // If we have a +/- control wrapper already but item was removed, revert to Add To Cart
            const existingQtyWrap = container.querySelector('.reactive-qty-wrap');
            
            if (inCartItem) {
                // Morph to +/-
                if (existingQtyWrap) {
                    existingQtyWrap.querySelector('.reactive-qty-val').textContent = inCartItem.quantity;
                } else {
                    addBtn.style.display = 'none'; // Hide "Add to cart"
                    
                    const qtyWrap = document.createElement('div');
                    qtyWrap.className = 'reactive-qty-wrap';
                    qtyWrap.style = "display: flex; align-items: center; justify-content: space-between; background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--r-full); padding: 4px; width: 100%;";
                    
                    qtyWrap.innerHTML = `
                        <button class="nc-btn-icon" data-cart-qty-btn data-action="decrement" data-product-id="${productId}" style="width: 32px; height: 32px; border-radius: 50%; border: none; background: var(--surface); color: var(--text-hi); cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                            <i class="fa-solid fa-minus"></i>
                        </button>
                        <span class="reactive-qty-val" style="font-weight: 600; color: var(--text-hi); font-size: 14px;">${inCartItem.quantity}</span>
                        <button class="nc-btn-icon" data-cart-qty-btn data-action="increment" data-product-id="${productId}" style="width: 32px; height: 32px; border-radius: 50%; border: none; background: var(--surface); color: var(--text-hi); cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    `;
                    // Insert before the hidden add button
                    addBtn.parentNode.insertBefore(qtyWrap, addBtn);
                    if (window.ncReplaceIcons) window.ncReplaceIcons();
                }
            } else {
                // Revert to Add to Cart
                if (existingQtyWrap) {
                    existingQtyWrap.remove();
                }
                addBtn.style.display = '';
            }
        });
    }
    
    // Initial render
    document.addEventListener('DOMContentLoaded', renderReactiveCartButtons);

    /* --------------------------------------------------
       4. HERO SEARCH — focus and fetch
       -------------------------------------------------- */
    var heroBtn    = document.querySelector('.hero-search-btn');
    var heroInput  = document.querySelector('.hero-search-input');
    var productGrid = document.querySelector('.product-grid');
    var sectionTitle = document.querySelector('.section-title');

    if (heroBtn && heroInput) {
        heroBtn.addEventListener('click', async function () {
            const query = heroInput.value.trim();
            if (!query) {
                heroInput.focus();
                return;
            }

            // UI Loading State
            const originalBtnHtml = heroBtn.innerHTML;
            heroBtn.innerHTML = `<span class="spinner" style="margin-right:8px; border-width: 2px;"></span> <span>Thinking...</span>`;
            heroBtn.disabled = true;

            try {
                const response = await axios.post('/api/products/ai-search', { query });
                const result = response.data;
                
                if (result.success && productGrid) {
                    if (sectionTitle) {
                        sectionTitle.innerHTML = `✨ AI Results for: "${query}"`;
                    }
                    
                    if (result.count === 0) {
                        const emptyMsg = result.message || "No products found matching your AI search.";
                        productGrid.innerHTML = `
                            <div class="shop-empty">
                                <div class="shop-empty-icon">🔍</div>
                                <h2>No Results Found</h2>
                                <p>${emptyMsg}</p>
                            </div>
                        `;
                        // Change grid layout temporarily for empty state
                        productGrid.style.display = 'block';
                    } else {
                        productGrid.style.display = 'grid'; // Restore grid
                        // Re-render product grid using the new DOM classes
                        productGrid.innerHTML = result.data.map(product => `
                            <a href="/product/${product._id}" class="product-card">
                                ${product.isFeatured ? '<span class="product-badge">Hot</span>' : ''}
                                <button class="product-wishlist" aria-label="Add to wishlist">♡</button>
                                <div class="product-card-image">
                                    ${product.image ? `<img src="${product.image}" alt="${product.name || product.title}" data-product-image>` : (product.category ? product.category.icon : '📁')}
                                </div>
                                <div class="product-card-body">
                                    <span class="product-category-tag">${product.category ? product.category.name : 'General'}</span>
                                    <h3 class="product-title">${product.name || product.title}</h3>
                                    <div class="product-meta">
                                        <span class="product-price">₹${product.price.toFixed(2)}</span>
                                        <span class="product-rating">
                                            <i class="fa-solid fa-star"></i> ${product.ratings.average} 
                                            <span class="product-rating-count">(${product.ratings.count})</span>
                                        </span>
                                    </div>
                                    <button class="btn-add-cart" type="button" data-add-to-cart data-product-id="${product._id}">
                                        <i class="fa-solid fa-cart-plus"></i> Add to Cart
                                    </button>
                                </div>
                            </a>
                        `).join('');
                        
                        // Re-bind wishlist buttons
                        bindWishlists();
                        bindProductImageFallbacks(productGrid);
                    }
                    
                    // Scroll down to results
                    if (sectionTitle) {
                        sectionTitle.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } else {
                        productGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            } catch (err) {
                console.error("Search error:", err);
                alert("Failed to perform AI search. Please try again.");
            } finally {
                // Restore UI
                heroBtn.innerHTML = originalBtnHtml;
                heroBtn.disabled = false;
            }
        });

        // Allow Enter key
        heroInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') heroBtn.click();
        });
    }

    /* --------------------------------------------------
       5. INFINITE SCROLL (Shop Page)
       -------------------------------------------------- */
    const infiniteScrollTrigger = document.getElementById('infinite-scroll-trigger');
    const productGridEl = document.getElementById('product-grid');
    
    if (infiniteScrollTrigger && productGridEl) {
        let isLoading = false;

        const observer = new IntersectionObserver(async (entries) => {
            const entry = entries[0];
            if (entry.isIntersecting && !isLoading) {
                const hasNext = infiniteScrollTrigger.dataset.hasNext === 'true';
                if (!hasNext) return;

                isLoading = true;
                const currentPage = parseInt(infiniteScrollTrigger.dataset.currentPage, 10);
                const nextPage = currentPage + 1;
                const category = infiniteScrollTrigger.dataset.category || '';
                const sort = infiniteScrollTrigger.dataset.sort || '';
                const query = infiniteScrollTrigger.dataset.query || '';

                try {
                    const url = new URL(window.location.origin + '/shop');
                    if (category) url.searchParams.set('category', category);
                    if (sort) url.searchParams.set('sort', sort);
                    if (query) url.searchParams.set('q', query);
                    url.searchParams.set('page', nextPage);

                    const response = await fetch(url.toString(), {
                        headers: { 'Accept': 'application/json' }
                    });

                    const data = await response.json();
                    
                    if (data.products && data.products.length > 0) {
                        const newCards = data.products.map(product => `
                            <a href="/product/${product._id}" class="product-card">
                                ${product.isFeatured ? '<span class="product-badge product-badge-ai">Hot</span>' : ''}
                                <button class="product-wishlist" aria-label="Add to wishlist"><i class="fa-regular fa-heart"></i></button>
                                <div class="product-card-image">
                                    ${product.image ? `<img src="${product.image}" alt="${product.title}" loading="lazy" decoding="async" data-product-image>` : (product.category?.icon || '📁')}
                                </div>
                                <div class="product-card-body">
                                    <span class="product-category-tag">${product.brand || 'NeuraCart'}</span>
                                    <h3 class="product-title">${product.title}</h3>
                                    <div class="product-meta">
                                        <span class="product-price">₹${product.price.toFixed(2)}</span>
                                        <span class="product-rating">
                                            <i class="fa-solid fa-star"></i> ${product.ratings ? product.ratings.average : 0}
                                            <span class="product-rating-count">(${product.ratings ? product.ratings.count : 0})</span>
                                        </span>
                                    </div>
                                    ${product.stock < 10 ? `<div class="product-stock-low">Only ${product.stock} left!</div>` : ''}
                                    <button class="btn-add-cart" type="button" data-add-to-cart data-product-id="${product._id}">
                                        <i class="fa-solid fa-cart-plus"></i> Add to Cart
                                    </button>
                                </div>
                            </a>
                        `).join('');

                        productGridEl.insertAdjacentHTML('beforeend', newCards);
                        
                        // Rebind listeners on the newly added elements
                        bindWishlists();
                        bindProductImageFallbacks(productGridEl);

                        // Update dataset
                        infiniteScrollTrigger.dataset.currentPage = data.currentPage;
                        infiniteScrollTrigger.dataset.hasNext = data.hasNextPage;

                        if (!data.hasNextPage) {
                            infiniteScrollTrigger.style.display = 'none';
                            observer.disconnect();
                        }
                    }
                } catch (error) {
                    console.error("Error loading more products:", error);
                } finally {
                    isLoading = false;
                }
            }
        }, {
            rootMargin: '100px', // Trigger slightly before it comes into view
            threshold: 0.1
        });

        observer.observe(infiniteScrollTrigger);
    }

    // Theme toggling has been moved to theme.js

})();
