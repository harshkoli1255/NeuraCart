/**
 * main.js — NeuraCart client-side interactions
 * Served as a static file to avoid CSP violations from inline scripts.
 */
(function () {
    'use strict';

    /* --------------------------------------------------
       1. HAMBURGER MENU TOGGLE
       -------------------------------------------------- */
    const hamburger = document.getElementById('hamburger-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', function (e) {
            e.stopPropagation();
            const isOpen = mobileMenu.classList.toggle('open');
            hamburger.classList.toggle('open', isOpen);
            hamburger.setAttribute('aria-expanded', String(isOpen));
        });

        // Close drawer when clicking outside
        document.addEventListener('click', function (e) {
            if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.remove('open');
                hamburger.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });

        // Close drawer when a link inside it is clicked
        mobileMenu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                mobileMenu.classList.remove('open');
                hamburger.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });

        // Close drawer on Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
                mobileMenu.classList.remove('open');
                hamburger.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
                hamburger.focus();
            }
        });
    }

    /* --------------------------------------------------
       2. NAVBAR SCROLL EFFECT
       -------------------------------------------------- */
    var navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 12) {
                navbar.style.background = 'rgba(255,255,255,0.97)';
                navbar.style.boxShadow = '0 4px 32px rgba(0,0,0,0.10)';
            } else {
                navbar.style.background = '';
                navbar.style.boxShadow = '';
            }
        }, { passive: true });
    }

    /* --------------------------------------------------
       3. WISHLIST TOGGLE
       -------------------------------------------------- */
    document.querySelectorAll('.product-wishlist').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var filled = btn.getAttribute('data-filled') === 'true';
            btn.setAttribute('data-filled', String(!filled));
            btn.textContent = filled ? '♡' : '♥';
            btn.style.color  = filled ? '' : '#e11d48';
            btn.style.background = filled ? 'rgba(255,255,255,.88)' : 'white';
        });
    });

    /* --------------------------------------------------
       4. HERO SEARCH — focus and fetch
       -------------------------------------------------- */
    var heroBtn    = document.getElementById('hero-search-btn');
    var heroInput  = document.getElementById('hero-search');
    var productGrid = document.getElementById('product-grid');
    var originalGridHtml = productGrid ? productGrid.innerHTML : '';

    if (heroBtn && heroInput) {
        heroBtn.addEventListener('click', async function () {
            const query = heroInput.value.trim();
            if (!query) {
                heroInput.focus();
                return;
            }

            // UI Loading State
            const originalBtnHtml = heroBtn.innerHTML;
            heroBtn.innerHTML = `<svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-opacity="0.25"/><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg> Thinking...`;
            heroBtn.disabled = true;

            try {
                const response = await fetch('/api/products/ai-search', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query })
                });

                const result = await response.json();
                
                if (result.success && productGrid) {
                    // Update Section Title
                    const sectionTitle = document.querySelector('.section-title');
                    if (sectionTitle) sectionTitle.innerHTML = `✨ AI Results for: "${query}"`;
                    
                    if (result.count === 0) {
                        const emptyMsg = result.message || "No products found matching your AI search.";
                        productGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: #64748b; font-size: 16px;">${emptyMsg}</p>`;
                    } else {
                        // Re-render product grid
                        productGrid.innerHTML = result.data.map(product => `
                            <a href="/product/${product._id}" class="product-card" style="text-decoration: none; color: inherit; display: block;">
                                ${product.isFeatured ? '<span class="product-badge">Hot</span>' : ''}
                                <button class="product-wishlist" aria-label="Add to wishlist" onclick="event.preventDefault();">♡</button>
                                <div class="product-image" style="overflow: hidden; display: flex; align-items: center; justify-content: center;">
                                    ${product.image ? `<img src="${product.image}" alt="${product.name || product.title}" style="width: 100%; height: 100%; object-fit: cover;">` : (product.category ? product.category.icon : '📁')}
                                </div>
                                <div class="product-info">
                                    <span class="product-category-tag">${product.category ? product.category.name : 'General'}</span>
                                    <h3 class="product-title">${product.name || product.title}</h3>
                                    <div class="product-meta">
                                        <span class="product-price">₹${product.price.toFixed(2)}</span>
                                        <span class="product-rating">★ ${product.ratings.average}</span>
                                    </div>
                                    <button class="btn-add-cart" onclick="event.preventDefault();">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
                                        Add to Cart
                                    </button>
                                </div>
                            </a>
                        `).join('');
                        
                        // Re-bind wishlist buttons
                        bindWishlists();
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

    function bindWishlists() {
        document.querySelectorAll('.product-wishlist').forEach(function (btn) {
            // Remove old listeners to avoid duplicates if re-binding
            const clone = btn.cloneNode(true);
            btn.parentNode.replaceChild(clone, btn);
            
            clone.addEventListener('click', function (e) {
                e.stopPropagation();
                var filled = clone.getAttribute('data-filled') === 'true';
                clone.setAttribute('data-filled', String(!filled));
                clone.textContent = filled ? '♡' : '♥';
                clone.style.color  = filled ? '' : '#e11d48';
                clone.style.background = filled ? 'rgba(255,255,255,.88)' : 'white';
            });
        });
    }

})();
