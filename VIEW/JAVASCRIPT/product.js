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
    { id: "kb-16", name: "Kettlebell 16kg", desc: "Cast iron with powder coat", price: 59.99, icon: "fa-dumbbell", category: "strength" },
    { id: "kb-24", name: "Kettlebell 24kg", desc: "Competition style", price: 79.99, icon: "fa-dumbbell", category: "strength" },
    { id: "bb-20", name: "Barbell 20kg", desc: "Olympic 28mm, needle bearings", price: 199.0, icon: "fa-bars", category: "strength" },
    { id: "pl-plate", name: "Bumper Plates (Pair)", desc: "Training plates, 10–25kg", price: 149.0, icon: "fa-circle", category: "strength" },
    { id: "db-set", name: "Dumbbell Set", desc: "5–30kg rubber hex", price: 429.0, icon: "fa-dumbbell", category: "strength" },
    { id: "yj-mat", name: "Yoga Mat", desc: "Non-slip, 6mm", price: 24.5, icon: "fa-grip-lines", category: "mobility" },
    { id: "sk-rope", name: "Speed Jump Rope", desc: "Adjustable steel cable", price: 14.99, icon: "fa-person-running", category: "conditioning" },
    { id: "rs-bands", name: "Resistance Bands Set", desc: "5 levels, latex", price: 21.99, icon: "fa-wave-square", category: "mobility" },
    { id: "gs-gloves", name: "Gym Gloves", desc: "Breathable, anti-slip", price: 12.99, icon: "fa-hand-fist", category: "accessories" },
    { id: "bt-bottle", name: "Water Bottle 1L", desc: "BPA-free", price: 9.99, icon: "fa-bottle-water", category: "accessories" },
    { id: "gy-bag", name: "Gym Bag", desc: "Duffel, 35L", price: 34.99, icon: "fa-bag-shopping", category: "accessories" },
    { id: "pt-sess", name: "PT Session", desc: "1-on-1 60 minutes", price: 39.0, icon: "fa-user-ninja", category: "services" },
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
        <div class="product-icon"><i class="fa-solid ${p.icon}"></i></div>
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
