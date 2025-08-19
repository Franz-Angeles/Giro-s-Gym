// Products and cart logic
(function () {
  const productsEl = document.getElementById("products");
  const cartBtn = document.getElementById("cartBtn");
  const cartDrawer = document.getElementById("cartDrawer");
  const cartOverlay = document.getElementById("cartOverlay");
  const cartClose = document.getElementById("cartClose");
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  const cartCount = document.getElementById("cartCount");
  const checkoutBtn = document.getElementById("checkoutBtn");

  const prodFilter = document.getElementById("prodFilter");
  const catalog = [
    { id: "yj-mat", name: "Yoga Mat", desc: "Non-slip, 6mm", price: 2450.00, img: "../SRC/IMG/yogamat.jpg", category: "accessories" },
    { id: "sk-rope", name: "Speed Jump Rope", desc: "Adjustable steel cable", price: 1499.00, img: "../SRC/IMG/jumperope.jpg", category: "accessories" },
    { id: "rs-bands", name: "Resistance Bands Set", desc: "5 levels, latex", price: 2199.00, img: "../SRC/IMG/resband.jpg", category: "accessories" },
    { id: "gs-gloves", name: "Gym Gloves", desc: "Breathable, anti-slip", price: 1299.00, img: "../SRC/IMG/gloves.jpg", category: "accessories" },
    { id: "bt-bottle", name: "Water Bottle 1L", desc: "BPA-free", price: 999.00, img: "../SRC/IMG/bottle.jpg", category: "accessories" },
    { id: "gy-bag", name: "Gym Bag", desc: "Duffel, 35L", price: 3499.00, img: "../SRC/IMG/gymbag.jpg", category: "accessories" },
    { id: "belt", name: "Weightlifting Belt", desc: "Padded, adjustable", price: 29.99, img: "../SRC/IMG/weigbelt.jpg", category: "accessories" },
    { id: "lift-strap", name: "Lifting Straps", desc: "Neoprene, padded", price: 19.99, img: "../SRC/IMG/liftstrap.jpg", category: "accessories" },
    { id: "wr-straps", name: "Wrist Straps", desc: "Supportive, adjustable", price: 14.99, img: "../SRC/IMG/wriststrap.jpg", category: "accessories" },
    { id: "beef", name: "Beef", desc: "Lean Beef, Rice, Carrots, Green Beans, Broccoli", price: 499.99, img: "../SRC/IMG/beef.png", category: "foods" },
    { id: "ch-breast", name: "Chicken Breast", desc: "Kamote, Chicken Breast, Broccoli", price: 299.99, img: "../SRC/IMG/chicken breast.jpg", category: "foods" },
    { id: "salmon", name: "Salmon", desc: "Salmon Fillet, Broccoli, Kamote", price: 214.99, img: "../SRC/IMG/salmon.jpg", category: "foods" },
    { id: "tilapia", name: "Tilapia", desc: "Tilapia Fillet, Broccoli, Carrots, Asparagus, Potato", price: 399.99, img: "../SRC/IMG/tilapia.jpg", category: "foods" },
  ];

  function money(n) {
    return n.toFixed(2);
  }

  function readCart() {
    try { return JSON.parse(localStorage.getItem("gg_cart") || "[]"); } catch { return []; }
  }
  function writeCart(list) {
    localStorage.setItem("gg_cart", JSON.stringify(list));
  }

  function renderProducts() {
    const q = (prodFilter && prodFilter.value) || "all";
    const items = catalog.filter(p => q === "all" ? true : p.category === q);
    productsEl.innerHTML = items.map(p => `
      <article class="product-card">
        <div class="product-icon">
          <img src="${p.img}" alt="${p.name}" class="product-img" loading="lazy" style="width:100%;height:100%;object-fit:cover;object-position:center;display:block;" />
        </div>
        <div>
          <h3 class="product-name">${p.name}</h3>
          <p class="product-desc">${p.desc}</p>
          <div class="product-price">${money(p.price)}</div>
        </div>
        <div class="product-actions">
          <button class="btn btn--ghost btn--sm js-minus" data-id="${p.id}"><i class="fa-solid fa-minus"></i></button>
          <button class="btn btn--primary js-add" data-id="${p.id}"><i class="fa-solid fa-cart-plus"></i> Add to Cart</button>
        </div>
      </article>
    `).join("");
  }

  function renderCart() {
    const cart = readCart();
    let total = 0;
    cartItems.innerHTML = cart.map(item => {
      const p = catalog.find(x => x.id === item.id);
      const line = p ? p.price * item.qty : 0;
      total += line;
      return `
        <div class="cart-item" data-id="${item.id}">
          <div class="cart-item__name">${p ? p.name : item.id}</div>
          <div class="cart-item__price">${money(line)}</div>
          <div class="cart-item__qty">
            <button class="qty-btn js-dec" aria-label="Decrease">-</button>
            <span>${item.qty}</span>
            <button class="qty-btn js-inc" aria-label="Increase">+</button>
          </div>
          <div>
            <button class="remove-btn js-remove" aria-label="Remove"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>
      `;
    }).join("");
    cartTotal.textContent = money(total);
    const count = cart.reduce((a, c) => a + c.qty, 0);
    cartCount.textContent = String(count);
  }

  function addToCart(id, delta = 1) {
    const cart = readCart();
    const i = cart.findIndex(x => x.id === id);
    if (i >= 0) cart[i].qty += delta; else cart.push({ id, qty: Math.max(1, delta) });
    writeCart(cart.filter(x => x.qty > 0));
    renderCart();
  }
  function setQty(id, qty) {
    const cart = readCart();
    const i = cart.findIndex(x => x.id === id);
    if (i >= 0) cart[i].qty = qty;
    writeCart(cart.filter(x => x.qty > 0));
    renderCart();
  }
  function removeItem(id) {
    writeCart(readCart().filter(x => x.id !== id));
    renderCart();
  }

  function openCart() { cartDrawer.hidden = false; cartOverlay.hidden = false; }
  function closeCart() { cartDrawer.hidden = true; cartOverlay.hidden = true; }

  // Events
  productsEl.addEventListener("click", (e) => {
    const add = e.target.closest(".js-add");
    const minus = e.target.closest(".js-minus");
    if (add) { addToCart(add.dataset.id, 1); /* no auto open cart */ }
    if (minus) { addToCart(minus.dataset.id, -1); }
  });
  if (prodFilter) {
    prodFilter.addEventListener("change", renderProducts);
  }
  cartItems.addEventListener("click", (e) => {
    const id = e.target.closest(".cart-item")?.dataset.id;
    if (!id) return;
    if (e.target.closest(".js-inc")) setQty(id, (readCart().find(x => x.id === id)?.qty || 0) + 1);
    if (e.target.closest(".js-dec")) setQty(id, (readCart().find(x => x.id === id)?.qty || 0) - 1);
    if (e.target.closest(".js-remove")) removeItem(id);
  });
  cartBtn.addEventListener("click", () => { openCart(); });
  cartClose.addEventListener("click", () => { closeCart(); });
  cartOverlay.addEventListener("click", () => { closeCart(); });
  checkoutBtn.addEventListener("click", () => {
    const cart = readCart();
    if (!cart.length) { alert("Your cart is empty."); return; }
    const total = cart.reduce((sum, item) => {
      const p = catalog.find(x => x.id === item.id); return sum + (p ? p.price * item.qty : 0);
    }, 0);
  alert(`Thanks! Your purchase total is ${money(total)}.`);
    writeCart([]);
    renderCart();
    closeCart();
  });

  // Init
  renderProducts();
  renderCart();
})();
