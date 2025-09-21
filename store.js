// store.js - products + cart logic (shared)

// Currency formatter
const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

// Image pools
const rings = [...Array(10)].map((_, i) => `img/Rings/ring-${i + 1}.jpg`);
const necklaces = [...Array(10)].map((_, i) => `img/Necklace/necklace-${i + 1}.jpg`);
const bracelets = [...Array(10)].map((_, i) => `img/Bracelet/bracelet-${i + 1}.jpg`);
const earrings = [...Array(10)].map((_, i) => `img/Earrings/earrings-${i + 1}.jpg`);
const watches = [...Array(10)].map((_, i) => `img/Watch/watch-${i + 1}.jpg`);

// Names
const ringNames = ["Crown of Solara","Eternal Ember Band","Whispering Onyx","Aurora Crest Ring","Seraphic Vow","Velour Eclipse","Golden Mirage","Ivory Halo Ring","Lustrous Midnight","Obsidian Charm"];
const necklaceNames = ["Midnight Heirloom","Lustre Cascade","Aurora Veil Necklace","Eternal Flame Pendant","Golden Horizon Strand","Moonlit Oracle","Starlight Chains","Crimson Bloom Necklace","Royal Mirage","Opaline Whisper"];
const braceletNames = ["Ivory Moon Bangle","Golden Dusk Cuff","Radiant Ivy Bracelet","Elysian Charm Chain","Velvet Crown Bracelet","Aurora Spiral","Celestial Lock Bangle","Obsidian Whisper","Sapphire Flame Bracelet","Twilight Bloom Cuff"];
const earringNames = ["Eternal Horizon Studs","Velvet Opal Drops","Twilight Ember Earrings","Celestial Wing Hoops","Golden Flame Studs","Aurora Teardrops","Crimson Crown Earrings","Obsidian Shimmer","Pearl Veil Drops","Moonlit Ivy Earrings"];
const watchNames = ["Imperial Gold Chrono","Eternal Horizon Timepiece","Celestial Legacy Watch","Twilight Prestige","Royal Ember Watch","Obsidian Crown Chronograph","Velour Epoch Watch","Aurora Eternity","Sapphire Dominion","Crimson Monarch"];

// Price generator
function luxuryPrice(category) {
  const ranges = { rings:[1500,6000], necklaces:[2500,9000], bracelets:[1000,4000], earrings:[900,3000], watches:[6000,30000] };
  const [min,max] = ranges[category] || [100,500];
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Build products array
const products = [];
const categories = [
  {key:"rings", imgs: rings, names: ringNames},
  {key:"necklaces", imgs: necklaces, names: necklaceNames},
  {key:"bracelets", imgs: bracelets, names: braceletNames},
  {key:"earrings", imgs: earrings, names: earringNames},
  {key:"watches", imgs: watches, names: watchNames},
];

categories.forEach(cat => {
  for (let i=0;i<cat.imgs.length;i++){
    products.push({
      id: `${cat.key}-${i+1}`,
      name: cat.names[i % cat.names.length],
      price: luxuryPrice(cat.key),
      category: cat.key,
      img: cat.imgs[i],
    });
  }
});

// CART storage key
const CART_KEY = "ava_cart_v1";

// Load/save cart
function loadCart() {
  return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// STATE
let cart = loadCart();

// Update cart count badges
function updateCartCountUI() {
  const count = cart.reduce((s, c) => s + (c.qty||0), 0);
  const el = document.getElementById("cartCount");
  const elMobile = document.getElementById("cartCountMobile");
  if (el) el.textContent = count;
  if (elMobile) elMobile.textContent = count;
}
updateCartCountUI();

// Add to cart
function addToCart(id, qty = 1) {
  const existing = cart.find(c => c.id === id);
  if (existing) existing.qty += qty;
  else cart.push({ id, qty });
  saveCart(cart);
  updateCartCountUI();
}

// Remove from cart
function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  saveCart(cart);
  updateCartCountUI();
}

// Set quantity
function setCartQty(id, qty) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty = Math.max(0, qty);
  if (item.qty === 0) removeFromCart(id);
  else {
    saveCart(cart);
    updateCartCountUI();
  }
}

// Clear cart completely
function clearCart() {
  cart = [];
  localStorage.removeItem(CART_KEY);
  localStorage.setItem("cartCount", "0");
  updateCartCountUI();
}

// Expose utility on window
window.store = {
  products,
  addToCart,
  removeFromCart,
  setCartQty,
  getCart: () => cart,
  saveCart,
  updateCartCountUI,
  clearCart,
  fmt
};

// Render grid
function renderGrid(filter = "all", list = null) {
  const grid = document.getElementById("grid");
  if (!grid) return;
  const filtered = list || (filter === "all" ? products : products.filter(p => p.category === filter));
  grid.innerHTML = filtered.map(p => `
    <article class="card">
      <div class="card-media"><img src="${p.img}" alt="${p.name}"></div>
      <div class="card-body">
        <h3 class="title">${p.name}</h3>
        <span class="price">${fmt.format(p.price)}</span>
        <button class="add-btn" data-add="${p.id}">Add to cart</button>
      </div>
    </article>
  `).join("");
}

// Delegated click for add-to-cart
document.addEventListener("click", (e) => {
  const id = e.target?.dataset?.add;
  if (id) {
    addToCart(id, 1);
    e.target.textContent = "Added ✓";
    setTimeout(()=> e.target.textContent = "Add to cart", 900);
  }
});

// Expose renderGrid and helpers
window.renderGrid = renderGrid;
window.storeHelpers = { loadCart, saveCart, updateCartCountUI };
