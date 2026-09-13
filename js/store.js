(function () {
  const KEY = "ush-cart-v1";

  function read() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch {
      return [];
    }
  }

  function write(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
    USH.cart.render();
  }

  USH.cart = {
    items: read,
    count() {
      return read().reduce((n, i) => n + i.qty, 0);
    },
    total() {
      return read().reduce((n, i) => {
        const p = USH.getProduct(i.id);
        return n + (p ? p.price * i.qty : 0);
      }, 0);
    },
    add(id, qty) {
      qty = qty || 1;
      const items = read();
      const row = items.find((i) => i.id === id);
      if (row) row.qty += qty;
      else items.push({ id, qty });
      write(items);
      USH.cart.toast("Added to cart");
      USH.cart.open();
    },
    setQty(id, qty) {
      qty = Math.max(1, Math.min(9, Number(qty) || 1));
      write(read().map((i) => (i.id === id ? { ...i, qty } : i)));
    },
    remove(id) {
      write(read().filter((i) => i.id !== id));
    },
    clear() {
      write([]);
    },
    open() {
      document.body.classList.add("cart-open");
    },
    close() {
      document.body.classList.remove("cart-open");
    },
    toast(msg) {
      let t = document.querySelector(".toast");
      if (!t) {
        t = document.createElement("div");
        t.className = "toast";
        document.body.appendChild(t);
      }
      t.textContent = msg;
      t.classList.add("show");
      clearTimeout(t._hide);
      t._hide = setTimeout(() => t.classList.remove("show"), 1800);
    },
    mount() {
      if (document.querySelector(".cart-drawer")) return;
      const wrap = document.createElement("div");
      wrap.innerHTML = `
        <div class="cart-overlay" data-cart-close></div>
        <aside class="cart-drawer" role="dialog" aria-label="Shopping cart">
          <div class="cart-head">
            <h2>Your cart</h2>
            <button class="icon-btn" type="button" data-cart-close aria-label="Close cart">×</button>
          </div>
          <div class="cart-lines" data-cart-lines></div>
          <div class="cart-foot">
            <div class="cart-total">
              <span>Subtotal</span>
              <strong data-cart-total>$0.00</strong>
            </div>
            <p class="cart-note">Digital products. Secure checkout and instant files on Whop.</p>
            <a class="btn btn-gold btn-block" href="checkout.html">Checkout</a>
            <a class="btn btn-ghost btn-block" href="cart.html">View cart</a>
          </div>
        </aside>`;
      document.body.appendChild(wrap);
    },
    render() {
      const items = read();
      document.querySelectorAll("[data-cart-count]").forEach((el) => {
        el.textContent = USH.cart.count();
        el.hidden = USH.cart.count() === 0;
      });
      const lines = document.querySelector("[data-cart-lines]");
      const total = document.querySelector("[data-cart-total]");
      if (total) total.textContent = USH.formatPrice(USH.cart.total());
      if (!lines) return;
      if (!items.length) {
        lines.innerHTML = `<div class="cart-empty">
          <p>Your cart is empty.</p>
          <a class="btn btn-gold" href="shop.html" data-cart-close>Shop playbooks</a>
        </div>`;
        return;
      }
      lines.innerHTML = items
        .map((i) => {
          const p = USH.getProduct(i.id);
          if (!p) return "";
          return `<div class="cart-line">
            <a href="product.html?id=${p.id}"><img src="${p.image}" alt=""></a>
            <div>
              <a href="product.html?id=${p.id}"><strong>${p.title}</strong></a>
              <span>${USH.formatPrice(p.price)} · Digital</span>
              <div class="qty">
                <button type="button" data-qty="${p.id}" data-delta="-1">−</button>
                <em>${i.qty}</em>
                <button type="button" data-qty="${p.id}" data-delta="1">+</button>
                <button type="button" class="linkish" data-remove="${p.id}">Remove</button>
              </div>
            </div>
            <b>${USH.formatPrice(p.price * i.qty)}</b>
          </div>`;
        })
        .join("");
    },
  };

  document.addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    if (add) {
      e.preventDefault();
      USH.cart.add(add.getAttribute("data-add"));
    }
    if (e.target.closest("[data-cart-open]")) {
      e.preventDefault();
      USH.cart.open();
    }
    if (e.target.closest("[data-cart-close]")) {
      if (e.target.closest("a[href]")) return;
      USH.cart.close();
    }
    const rm = e.target.closest("[data-remove]");
    if (rm) USH.cart.remove(rm.getAttribute("data-remove"));
    const q = e.target.closest("[data-qty]");
    if (q) {
      const id = q.getAttribute("data-qty");
      const row = read().find((i) => i.id === id);
      if (row) USH.cart.setQty(id, row.qty + Number(q.getAttribute("data-delta")));
    }
    const buy = e.target.closest("[data-buy-now]");
    if (buy) {
      e.preventDefault();
      const id = buy.getAttribute("data-buy-now");
      const items = read();
      if (!items.find((i) => i.id === id)) items.push({ id, qty: 1 });
      localStorage.setItem(KEY, JSON.stringify(items));
      location.href = "checkout.html";
    }
  });

  USH.cart.mount();
  USH.cart.render();
})();
