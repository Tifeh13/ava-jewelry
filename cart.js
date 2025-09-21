// cart.js - renders cart contents on cart.html (requires store.js loaded first)

document.addEventListener("DOMContentLoaded", () => {
    // Ensure cart variable is synced from localStorage
    if (window.store && window.store.loadCart) {
        const savedCart = window.store.loadCart();
        if (savedCart) {
            window.store.cart = savedCart;
        }
    }

    renderCartPage();

    // Hook mobile hamburger
    const hamburgerCart = document.getElementById("hamburgerCart");
    const mobileMenuCart = document.getElementById("mobileMenuCart");
    if (hamburgerCart && mobileMenuCart) {
        hamburgerCart.addEventListener("click", () => {
            hamburgerCart.classList.toggle("active");
            mobileMenuCart.classList.toggle("open");
        });
    }

    // Set footer year
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Update cart badges immediately
    updateCartBadges();
});

function renderCartPage() {
    const container = document.getElementById("cartItems");
    const subtotalEl = document.getElementById("cartSubtotal");

    const cartData = window.store.getCart ? window.store.getCart() : [];
    container.innerHTML = "";

    if (!cartData || cartData.length === 0) {
        container.innerHTML = `<p style="text-align:center; color:#aaa; margin:40px 0;">Your cart is empty 🛒</p>`;
        if (subtotalEl) subtotalEl.textContent = window.store.fmt.format(0);
        updateCartBadges();
        return;
    }

    let subtotal = 0;

    cartData.forEach(item => {
        const product = window.store.products.find(p => p.id === item.id);
        if (!product) return;

        subtotal += (product.price || 0) * (item.qty || 1);

        const el = document.createElement("div");
        el.className = "cart-item";
        el.innerHTML = `
            <img src="${product.img}" alt="${product.name}">
            <div class="meta">
                <h4>${product.name}</h4>
                <div>${window.store.fmt.format(product.price)}</div>
            </div>
            <div class="actions">
                <button class="qty-btn" data-decrease="${product.id}">−</button>
                <span class="qty">${item.qty}</span>
                <button class="qty-btn" data-increase="${product.id}">+</button>
                <button class="remove-btn" data-remove="${product.id}">Remove</button>
            </div>
        `;
        container.appendChild(el);
    });

    if (subtotalEl) subtotalEl.textContent = window.store.fmt.format(subtotal);
    updateCartBadges();

    // Delegated click for qty and remove
    container.onclick = (e) => {
        const inc = e.target.dataset.increase;
        const dec = e.target.dataset.decrease;
        const rem = e.target.dataset.remove;

        if (inc) {
            window.store.setCartQty(inc, (getQty(inc) || 0) + 1);
            renderCartPage();
        } else if (dec) {
            const q = (getQty(dec) || 0) - 1;
            if (q <= 0) window.store.removeFromCart(dec);
            else window.store.setCartQty(dec, q);
            renderCartPage();
        } else if (rem) {
            window.store.removeFromCart(rem);
            renderCartPage();
        }
    };

    function getQty(id) {
        const c = window.store.getCart().find(x => x.id === id);
        return c ? c.qty : 0;
    }
}

// Updates cart badges on both desktop/mobile and syncs localStorage
function updateCartBadges() {
    const cartCount = document.getElementById("cartCount");
    const cartCountMobile = document.getElementById("cartCountMobile");

    const cartData = window.store.getCart ? window.store.getCart() : [];
    const total = cartData.reduce((sum, i) => sum + (i.qty || 0), 0);

    if (cartCount) cartCount.textContent = total;
    if (cartCountMobile) cartCountMobile.textContent = total;

    // Always sync localStorage
    localStorage.setItem("cartTotal", total);
}

