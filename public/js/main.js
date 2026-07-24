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

    // ==========================================
    // 5. Deal Alerts Button Logic
    // ==========================================
    const dealAlertsBtn = document.getElementById('deal-alerts-btn');
    if (dealAlertsBtn) {
        dealAlertsBtn.addEventListener('click', function() {
            // Change UI to reflect subscribed state
            this.innerHTML = '<i class="fa-solid fa-check"></i> Subscribed!';
            this.style.background = 'var(--success)';
            this.style.color = '#fff';
            this.style.pointerEvents = 'none'; // Prevent multiple clicks
            
            // In a real app, this would hit an endpoint like /api/user/subscribe
            // fetch('/api/user/subscribe', { method: 'POST' });
        });
    }

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
       4. HERO AI SEARCH — natural language → AI endpoint
       -------------------------------------------------- */
    var heroBtn    = document.getElementById('hero-search-btn');
    var heroInput  = document.getElementById('hero-search');

    // AI Results Panel elements
    var aiPanel        = document.getElementById('ai-results-panel');
    var aiExplainText  = document.getElementById('ai-explanation-text');
    var aiResultsTitle = document.getElementById('ai-results-title');
    var aiProductGrid  = document.getElementById('ai-product-grid');
    var aiEmptyState   = document.getElementById('ai-empty-state');
    var aiClearBtn     = document.getElementById('ai-clear-search');

    function buildAIProductCard(product) {
        var img   = product.image || '';
        var price = product.price ? '₹' + parseFloat(product.price).toFixed(2) : '';
        var cat   = (product.category && product.category.name) ? product.category.name : 'General';
        var avg   = (product.ratings && product.ratings.average) ? product.ratings.average : 0;
        var cnt   = (product.ratings && product.ratings.count)   ? product.ratings.count   : 0;
        var title = product.title || product.name || 'Product';
        return '<div class="product-card" style="cursor:pointer;" onclick="if(!event.target.closest(\'button\')) window.location.href=\'/product/' + product._id + '\'">' +
            (product.isFeatured ? '<span class="product-badge product-badge-ai">Hot</span>' : '') +
            '<button class="product-wishlist" aria-label="Add to wishlist" data-product-id="' + product._id + '"><i class="fa-regular fa-heart"></i></button>' +
            '<div class="product-card-image">' +
                (img ? '<img src="' + img + '" alt="' + title + '" loading="lazy" decoding="async" onerror="this.style.display=\'none\'">' : '<div style="font-size:32px;display:flex;align-items:center;justify-content:center;height:100%;">' + (product.category && product.category.icon ? product.category.icon : '📦') + '</div>') +
            '</div>' +
            '<div class="product-card-body">' +
                '<span class="product-category-tag">' + cat + '</span>' +
                '<h3 class="product-title">' + title + '</h3>' +
                '<div class="product-meta">' +
                    '<span class="product-price">' + price + '</span>' +
                    '<span class="product-rating"><i class="fa-solid fa-star"></i> ' + avg + ' <span class="product-rating-count">(' + cnt + ')</span></span>' +
                '</div>' +
                '<button class="btn-add-cart" type="button" data-add-to-cart data-product-id="' + product._id + '">' +
                    '<i class="fa-solid fa-cart-plus"></i> Add to Cart' +
                '</button>' +
            '</div>' +
        '</div>';
    }

    function clearAISearch() {
        if (aiPanel) aiPanel.style.display = 'none';
        if (heroInput) { heroInput.value = ''; heroInput.focus(); }
    }

    if (aiClearBtn) aiClearBtn.addEventListener('click', clearAISearch);

    async function doAISearch() {
        if (!heroBtn || !heroInput) return;
        var query = heroInput.value.trim();

        if (!query) {
            showNotice('Please enter what you\'re looking for.', false);
            heroInput.focus();
            return;
        }

        // Loading state
        var originalBtnHtml = heroBtn.innerHTML;
        heroBtn.innerHTML = '<span class="spinner" style="margin-right:8px;border-width:2px;width:16px;height:16px;border-top-color:#fff;"></span><span>Thinking...</span>';
        heroBtn.disabled = true;

        // Show loading in AI panel
        if (aiPanel) {
            aiPanel.style.display = 'block';
            if (aiExplainText) aiExplainText.textContent = 'Searching with AI…';
            if (aiResultsTitle) aiResultsTitle.textContent = '';
            if (aiProductGrid) aiProductGrid.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;padding:60px 0;grid-column:1/-1;"><div class="spinner" style="width:40px;height:40px;border-width:3px;border-top-color:var(--purple);"></div></div>';
            if (aiEmptyState) aiEmptyState.style.display = 'none';
            aiPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        try {
            var resp = await fetch('/api/products/ai-search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ query: query })
            });
            var result = await resp.json();

            if (!resp.ok || !result.success) {
                throw new Error(result.error || 'AI Search failed. Please try again.');
            }

            // ── Render AI Explanation ──
            if (aiExplainText) {
                aiExplainText.textContent = result.aiExplanation || ('Found ' + (result.count || 0) + ' results for "' + query + '".');
            }

            // ── Render Products ──
            var count = (result.data && result.data.length) || 0;

            if (aiResultsTitle) {
                if (count > 0) {
                    aiResultsTitle.innerHTML = '✨ AI Results for <em>"' + query + '"</em> &nbsp;<span style="font-size:14px;font-weight:400;color:var(--text-lo);">(' + count + ' products found)</span>';
                } else {
                    aiResultsTitle.innerHTML = '🔍 Searching our catalog for closest matches to <em>"' + query + '"</em>';
                }
            }

            // Always hide empty state — backend now always returns results via fallback
            if (aiEmptyState) aiEmptyState.style.display = 'none';
            
            if (count > 0) {
                if (aiProductGrid) {
                    aiProductGrid.innerHTML = result.data.map(buildAIProductCard).join('');
                    // Re-bind cart buttons for dynamically rendered cards
                    if (typeof renderReactiveCartButtons === 'function') renderReactiveCartButtons();
                    if (typeof bindWishlists === 'function') bindWishlists();
                    if (typeof bindProductImageFallbacks === 'function') bindProductImageFallbacks(aiProductGrid);
                    if (typeof window.ncReplaceIcons === 'function') window.ncReplaceIcons();
                    // Rewire any inline cart buttons
                    aiProductGrid.querySelectorAll('[data-add-to-cart]').forEach(function(btn) {
                        btn.addEventListener('click', async function(e) {
                            e.preventDefault(); e.stopPropagation();
                            if (btn.disabled) return;
                            var productId = btn.dataset.productId;
                            var orig = btn.innerHTML;
                            btn.disabled = true; btn.textContent = 'Adding…';
                            try {
                                var r = await fetch('/cart/add', { method:'POST', headers:{'Content-Type':'application/json','Accept':'application/json'}, credentials:'same-origin', body:JSON.stringify({productId: productId, quantity:1}) });
                                var d = await r.json();
                                if (!r.ok || !d.success) throw new Error(d.error || 'Could not add.');
                                updateBadge(d.cartCount);
                                showNotice(d.message || 'Added to cart!');
                                btn.innerHTML = '<i class="fa-solid fa-check"></i> Added';
                                btn.style.background = 'rgba(16,185,129,0.15)'; btn.style.borderColor = '#10b981'; btn.style.color = '#10b981';
                                btn.disabled = true;
                            } catch(err) {
                                showNotice(err.message || 'Could not add to cart.', true);
                                btn.disabled = false; btn.innerHTML = orig;
                            }
                        });
                    });
                }
            } else {
                // No results at all (very unlikely now) — show empty state
                if (aiProductGrid) aiProductGrid.innerHTML = '';
                if (aiEmptyState) aiEmptyState.style.display = 'block';
            }


        } catch (err) {
            console.error('[AI Search] Error:', err);
            if (aiExplainText) aiExplainText.textContent = err.message || 'Something went wrong. Please try again.';
            if (aiProductGrid) aiProductGrid.innerHTML = '';
            if (aiEmptyState) aiEmptyState.style.display = 'block';
            showNotice(err.message || 'Search failed. Please try again.', true);
        } finally {
            heroBtn.innerHTML = originalBtnHtml;
            heroBtn.disabled = false;
            if (typeof window.ncReplaceIcons === 'function') window.ncReplaceIcons();
        }
    }

    if (heroBtn && heroInput) {
        heroBtn.addEventListener('click', doAISearch);
        heroInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') doAISearch();
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
                            <div class="product-card" style="cursor:pointer;" onclick="if(!event.target.closest('button')) window.location.href='/product/${product._id}'">
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
                            </div>
                        `).join('');

                        document.getElementById('product-grid').insertAdjacentHTML('beforeend', newCards);
                        if (typeof window.ncReplaceIcons === 'function') window.ncReplaceIcons();
                        
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

    // AI Product Summary
    const btnAiSummary = document.getElementById('btnAiSummary');
    if (btnAiSummary) {
        btnAiSummary.addEventListener('click', async () => {
            const pid = btnAiSummary.getAttribute('data-id');
            const contentBox = document.getElementById('aiSummaryContent');
            
            btnAiSummary.disabled = true;
            btnAiSummary.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing...';
            contentBox.innerHTML = '<div style="display:flex; gap:8px;"><div class="ai-typing-dot" style="background:var(--purple); width:6px; height:6px; border-radius:50%;"></div><div class="ai-typing-dot" style="background:var(--purple); width:6px; height:6px; border-radius:50%;"></div><div class="ai-typing-dot" style="background:var(--purple); width:6px; height:6px; border-radius:50%;"></div></div>';

            try {
                const res = await fetch(`/api/ai/product/${pid}/summary`);
                const data = await res.json();
                if (data.error) throw new Error(data.error);
                
                contentBox.innerHTML = data.summary.replace(/\n/g, '<br>');
                btnAiSummary.innerHTML = '<i class="fa-solid fa-check"></i> Done';
            } catch (e) {
                contentBox.innerHTML = '<span style="color:var(--danger);">Failed to generate summary.</span>';
                btnAiSummary.disabled = false;
                btnAiSummary.innerText = 'Retry';
            }
        });
    }

    // AI Product Q&A
    const aiQaForm = document.getElementById('aiQaForm');
    const aiQaInput = document.getElementById('aiQaInput');
    const aiQaLog = document.getElementById('aiQaLog');

    if (aiQaForm) {
        aiQaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const question = aiQaInput.value.trim();
            if (!question) return;
            const pid = aiQaForm.getAttribute('data-id');

            // Add user message to log
            aiQaLog.style.display = 'flex';
            aiQaLog.innerHTML += `<div style="align-self:flex-end; background:var(--surface-3); padding:8px 12px; border-radius:12px; color:var(--text-hi); max-width:85%; word-break:break-word;">${question}</div>`;
            aiQaInput.value = '';
            
            // Add typing indicator
            const typingId = 'typing-' + Date.now();
            aiQaLog.innerHTML += `<div id="${typingId}" style="align-self:flex-start; background:var(--purple-dark); padding:8px 12px; border-radius:12px; color:var(--text-hi); max-width:85%;"><div style="display:flex; gap:6px;"><div class="ai-typing-dot" style="background:#fff; width:4px; height:4px; border-radius:50%;"></div><div class="ai-typing-dot" style="background:#fff; width:4px; height:4px; border-radius:50%;"></div><div class="ai-typing-dot" style="background:#fff; width:4px; height:4px; border-radius:50%;"></div></div></div>`;
            aiQaLog.scrollTop = aiQaLog.scrollHeight;

            try {
                const res = await fetch(`/api/ai/product/${pid}/qa`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ question })
                });
                const data = await res.json();
                
                // Remove typing indicator
                document.getElementById(typingId).remove();
                
                if (data.error) throw new Error(data.error);
                
                // Add AI response
                aiQaLog.innerHTML += `<div style="align-self:flex-start; background:var(--grad-purple); padding:8px 12px; border-radius:12px; color:#fff; max-width:90%; word-break:break-word; line-height:1.5;">${data.answer.replace(/\n/g, '<br>')}</div>`;
                aiQaLog.scrollTop = aiQaLog.scrollHeight;
            } catch (err) {
                document.getElementById(typingId).remove();
                aiQaLog.innerHTML += `<div style="align-self:flex-start; color:var(--danger); font-size:12px;">Failed to get answer.</div>`;
            }
        });
    }

    // AI Review Sentiment Summary
    const btnGenerateReviewSummary = document.getElementById('btnGenerateReviewSummary');
    if (btnGenerateReviewSummary) {
        btnGenerateReviewSummary.addEventListener('click', async () => {
            const pid = btnGenerateReviewSummary.getAttribute('data-id');
            const contentText = document.getElementById('aiReviewSummaryText');
            
            contentText.innerHTML = '<div style="display:flex; gap:6px; align-items:center;"><div class="ai-typing-dot" style="background:var(--purple); width:6px; height:6px; border-radius:50%;"></div><div class="ai-typing-dot" style="background:var(--purple); width:6px; height:6px; border-radius:50%;"></div><div class="ai-typing-dot" style="background:var(--purple); width:6px; height:6px; border-radius:50%;"></div><span style="font-size:13px; color:var(--text-lo); margin-left:6px;">Reading reviews...</span></div>';

            try {
                const res = await fetch(`/api/products/${pid}/reviews/summary`);
                const data = await res.json();
                if (data.error) throw new Error(data.error);
                
                contentText.innerHTML = `<strong>Sentiment:</strong> ${data.summary}`;
            } catch (e) {
                contentText.innerHTML = '<span style="color:var(--danger);">Failed to generate review summary.</span>';
            }
        });
    }

})();
