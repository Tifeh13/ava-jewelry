// main.js - UI interactions and filter integration (requires store.js loaded first)

document.addEventListener("DOMContentLoaded", () => {
  // initial render (all)
  if (window.renderGrid) renderGrid("all");

  // update year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // hook nav filter buttons (desktop & mobile)
  function setupFilterButtons(selector) {
    document.querySelectorAll(selector).forEach(btn => {
      btn.addEventListener("click", (e) => {
        // buttons use data-filter
        const filter = e.currentTarget.dataset.filter || "all";
        // toggle active classes for both navs
        document.querySelectorAll(".nav-desktop .nav-link, .nav-mobile .nav-link").forEach(n => n.classList.remove("active"));
        // set matching active (there may be multiple matching buttons across desktop+mobile)
        document.querySelectorAll(`[data-filter="${filter}"]`).forEach(n => n.classList.add("active"));
        // render
        if (window.renderGrid) renderGrid(filter);
        // close mobile menu if open
        const mobileMenu = document.getElementById("mobileMenu");
        const hamburger = document.getElementById("hamburger");
        if (mobileMenu && mobileMenu.classList.contains("open")) {
          mobileMenu.classList.remove("open");
          if (hamburger) hamburger.classList.remove("active");
        }
      });
    });
  }
  setupFilterButtons(".nav-desktop .nav-link");
  setupFilterButtons(".nav-mobile .nav-link");

  // If the page was opened with a hash (from cart page), respect it as a filter (e.g. index.html#rings)
  const hash = (location.hash || "").replace("#", "").toLowerCase();
  if (hash) {
    // look for corresponding filter button
    const targetBtn = document.querySelector(`[data-filter="${hash}"]`);
    if (targetBtn) targetBtn.click();
    else {
      // if hash equals "all" or unknown, just show all
      renderGrid("all");
    }
  }

  // Hamburger toggle
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");
  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      mobileMenu.classList.toggle("open");
    });
  }

  // search toggles
  const searchToggleDesktop = document.getElementById("searchToggleDesktop");
  const searchInputDesktop = document.getElementById("searchInputDesktop");
  if (searchToggleDesktop && searchInputDesktop) {
    searchToggleDesktop.addEventListener("click", () => {
      searchInputDesktop.style.display = searchInputDesktop.style.display === "block" ? "none" : "block";
      if (searchInputDesktop.style.display === "block") searchInputDesktop.focus();
    });

    searchInputDesktop.addEventListener("input", (e) => {
      const q = e.target.value.trim().toLowerCase();
      if (!q) renderGrid("all");
      else renderGrid("all", window.store.products.filter(p => p.name.toLowerCase().includes(q)));
    });
  }

  const searchToggleMobile = document.getElementById("searchToggleMobile");
  const searchInputMobile = document.getElementById("searchInputMobile");
  if (searchToggleMobile && searchInputMobile) {
    searchToggleMobile.addEventListener("click", () => {
      searchInputMobile.classList.toggle("show");
      if (searchInputMobile.classList.contains("show")) searchInputMobile.focus();
    });
    searchInputMobile.addEventListener("input", (e) => {
      const q = e.target.value.trim().toLowerCase();
      if (!q) renderGrid("all");
      else renderGrid("all", window.store.products.filter(p => p.name.toLowerCase().includes(q)));
    });
  }

  // ensure cart count is updated
  if (window.storeHelpers && window.storeHelpers.updateCartCountUI) window.storeHelpers.updateCartCountUI();
});


document.addEventListener("DOMContentLoaded", () => {
  const cartCount = document.getElementById("cartCount");
  const cartCountMobile = document.getElementById("cartCountMobile");
  let cartTotal = 0;

  // Prevent multiple bindings
  const buttons = document.querySelectorAll(".add-to-cart");
  buttons.forEach(btn => {
    btn.removeEventListener("click", handleAddToCart); // clear old listener
    btn.addEventListener("click", handleAddToCart);    // add fresh one
  });

  function handleAddToCart() {
    cartTotal++;
    if (cartCount) cartCount.textContent = cartTotal;
    if (cartCountMobile) cartCountMobile.textContent = cartTotal;

    // Optional: Save to localStorage so both index.html & cart.html sync
    localStorage.setItem("cartTotal", cartTotal);
  }

  // ✅ Load saved cart on page refresh
  const savedCart = localStorage.getItem("cartTotal");
  if (savedCart) {
    cartTotal = parseInt(savedCart, 10);
    if (cartCount) cartCount.textContent = cartTotal;
    if (cartCountMobile) cartCountMobile.textContent = cartTotal;
  }
});

