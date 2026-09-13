(function () {
  const nav = document.querySelector(".nav");
  const menuBtn = document.querySelector(".menu-btn");
  const panel = document.querySelector(".mobile-panel");

  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle("scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (menuBtn && panel) {
    menuBtn.addEventListener("click", () => {
      panel.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", panel.classList.contains("open"));
    });
  }

  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  function renderGrid(host, list) {
    if (!host) return;
    if (!list.length) {
      host.innerHTML =
        '<p class="empty-search">No products match that. Try another category or search.</p>';
      return;
    }
    host.innerHTML = list.map(USH.productCard).join("");
  }

  const homeGrid = document.querySelector("[data-product-grid]");
  if (homeGrid) renderGrid(homeGrid, USH.products);

  const featured = document.querySelector("[data-featured]");
  if (featured) {
    const p = USH.products.find((x) => x.id === "send") || USH.products[0];
    featured.innerHTML = `
      <div class="featured-shot">
        <img src="${p.image}" alt="${p.title}" />
        ${p.save ? `<span class="badge-save">Save ${p.save}</span>` : ""}
      </div>
      <div class="featured-copy">
        <p class="kicker">Featured · ${p.tag}</p>
        <h2>${p.title}</h2>
        <p class="lede">${p.tagline}</p>
        <p>${p.blurb}</p>
        <div class="buy-box">
          <div class="price">
            ${p.original ? `<span class="price-old">${USH.formatPrice(p.original)}</span>` : ""}
            <strong>${USH.formatPrice(p.price)}</strong>
          </div>
        </div>
        <div class="hero-actions">
          <button class="btn btn-gold" type="button" data-add="${p.id}">Add to cart</button>
          <a class="btn btn-ghost" href="product.html?id=${p.id}">View details</a>
        </div>
        <p class="stock">Digital download · Instant access after Whop checkout</p>
      </div>`;
  }

  const allowedTags = ["Career", "Finance", "Health", "Readiness"];
  const urlTag = new URLSearchParams(location.search).get("tag");
  const shopState = {
    tag: allowedTags.includes(urlTag) ? urlTag : "All",
    q: "",
    sort: "featured",
  };

  function shopList() {
    let list = USH.products.slice();
    if (shopState.tag !== "All") list = list.filter((p) => p.tag === shopState.tag);
    if (shopState.q) {
      const q = shopState.q.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.tag.toLowerCase().includes(q)
      );
    }
    if (shopState.sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (shopState.sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (shopState.sort === "name") list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }

  const shop = document.querySelector("[data-shop-grid]");
  const countEl = document.querySelector("[data-shop-count]");

  function refreshShop() {
    if (!shop) return;
    const list = shopList();
    renderGrid(shop, list);
    if (countEl) countEl.textContent = list.length + " product" + (list.length === 1 ? "" : "s");
  }

  if (shop) {
    document.querySelectorAll("[data-filter-btn]").forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-filter-btn") === shopState.tag);
    });
    refreshShop();
  }

  document.querySelectorAll("[data-filter-btn]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-filter-btn]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      shopState.tag = btn.getAttribute("data-filter-btn");
      refreshShop();
    });
  });

  const search = document.querySelector("[data-search]");
  if (search) {
    search.addEventListener("input", () => {
      shopState.q = search.value.trim();
      refreshShop();
    });
  }

  const sort = document.querySelector("[data-sort]");
  if (sort) {
    sort.addEventListener("change", () => {
      shopState.sort = sort.value;
      refreshShop();
    });
  }

  const mount = document.querySelector("[data-product-page]");
  if (mount) {
    const id = new URLSearchParams(location.search).get("id");
    const p = USH.getProduct(id) || USH.products[0];
    document.title = p.title + " — UpSkill Hub";
    const related = USH.products.filter((x) => x.id !== p.id).slice(0, 3);
    mount.innerHTML = `
      <div class="wrap product-hero">
        <div class="product-shot reveal">
          <img src="${p.image}" alt="${p.title}" />
        </div>
        <div class="product-copy reveal">
          <p class="crumbs"><a href="index.html">Shop</a> / <a href="shop.html">${p.tag}</a> / ${p.title}</p>
          <span class="kicker">${p.tag} · Digital product</span>
          <h1>${p.title}</h1>
          <p class="tagline">${p.tagline}</p>
          <div class="buy-box">
            <div class="price">
              ${p.original ? `<span class="price-old">${USH.formatPrice(p.original)}</span>` : ""}
              <strong>${USH.formatPrice(p.price)}</strong>
            </div>
            ${p.save ? `<span class="chip" style="position:static">Save ${p.save}</span>` : ""}
          </div>
          <p class="stock">In stock · Instant digital access</p>
          <div class="hero-actions">
            <button class="btn btn-gold" type="button" data-add="${p.id}">Add to cart</button>
            <button class="btn btn-teal" type="button" data-buy-now="${p.id}">Buy now</button>
          </div>
          <p class="cart-note" style="margin-top:12px">Checkout is completed securely on Whop. Files land in your hub immediately.</p>
          <p>${p.blurb}</p>
          <div class="specs">
            <div class="spec"><small>The skill</small><p>${p.skill}</p></div>
            <div class="spec"><small>First deliverable</small><p>${p.deliverable}</p></div>
            <div class="spec"><small>Time to that deliverable</small><p>${p.time}</p></div>
            <div class="spec"><small>Who should not buy</small><p>${p.notFor}</p></div>
          </div>
          <h3>What’s included</h3>
          <ul class="includes">${p.includes.map((i) => `<li>${i}</li>`).join("")}</ul>
          ${p.caution ? `<p class="caution">${p.caution}</p>` : ""}
        </div>
      </div>
      <section>
        <div class="wrap">
          <div class="section-head">
            <div>
              <p class="num">You may also like</p>
              <h2>More from the store</h2>
            </div>
            <a class="btn btn-ghost" href="shop.html">Shop all</a>
          </div>
          <div class="product-grid">${related.map(USH.productCard).join("")}</div>
        </div>
      </section>`;
  }

  const cartPage = document.querySelector("[data-cart-page]");
  if (cartPage) {
    const draw = () => {
      const items = USH.cart.items();
      if (!items.length) {
        cartPage.innerHTML = `<div class="cart-empty page-empty">
          <h1>Your cart is empty</h1>
          <p>Browse the store and add a playbook.</p>
          <a class="btn btn-gold" href="shop.html">Shop products</a>
        </div>`;
        return;
      }
      cartPage.innerHTML = `
        <div class="cart-layout">
          <div>
            <h1>Cart</h1>
            <div class="cart-lines cart-lines-page">
              ${items
                .map((i) => {
                  const p = USH.getProduct(i.id);
                  if (!p) return "";
                  return `<div class="cart-line">
                    <a href="product.html?id=${p.id}"><img src="${p.image}" alt=""></a>
                    <div>
                      <a href="product.html?id=${p.id}"><strong>${p.title}</strong></a>
                      <span>${p.tag} · Digital download</span>
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
                .join("")}
            </div>
          </div>
          <aside class="summary-card">
            <h3>Order summary</h3>
            <div class="sum-row"><span>Subtotal</span><strong>${USH.formatPrice(USH.cart.total())}</strong></div>
            <div class="sum-row"><span>Delivery</span><span>Instant (digital)</span></div>
            <div class="sum-row total"><span>Total</span><strong>${USH.formatPrice(USH.cart.total())}</strong></div>
            <a class="btn btn-gold btn-block" href="checkout.html">Proceed to checkout</a>
            <a class="btn btn-ghost btn-block" href="shop.html">Continue shopping</a>
          </aside>
        </div>`;
    };
    draw();
    const orig = USH.cart.render.bind(USH.cart);
    USH.cart.render = function () {
      orig();
      if (document.querySelector("[data-cart-page]")) draw();
    };
  }

  const checkPage = document.querySelector("[data-checkout-page]");
  if (checkPage) {
    const items = USH.cart.items();
    if (!items.length) {
      checkPage.innerHTML = `<div class="cart-empty page-empty">
        <h1>Nothing to check out</h1>
        <a class="btn btn-gold" href="shop.html">Shop products</a>
      </div>`;
    } else {
      checkPage.innerHTML = `
        <div class="cart-layout">
          <div>
            <p class="kicker">Secure checkout</p>
            <h1>Complete payment on Whop</h1>
            <p class="lede" style="margin:12px 0 24px">Each playbook is fulfilled by Whop — card, Apple Pay, and instant file access. Open a product to pay. Digital goods do not ship.</p>
            <div class="checkout-items">
              ${items
                .map((i) => {
                  const p = USH.getProduct(i.id);
                  if (!p) return "";
                  return `<article class="check-item">
                    <img src="${p.image}" alt="">
                    <div>
                      <strong>${p.title}</strong>
                      <p>Qty ${i.qty} · ${USH.formatPrice(p.price * i.qty)}</p>
                    </div>
                    <a class="btn btn-gold btn-sm" href="${p.url}" target="_blank" rel="noopener">Pay on Whop</a>
                  </article>`;
                })
                .join("")}
            </div>
          </div>
          <aside class="summary-card">
            <h3>Summary</h3>
            <div class="sum-row"><span>Items</span><span>${USH.cart.count()}</span></div>
            <div class="sum-row total"><span>Total</span><strong>${USH.formatPrice(USH.cart.total())}</strong></div>
            <p class="cart-note">You will finish each purchase on Whop.com. After payment, files appear in your UpSkill Hub account.</p>
            <a class="btn btn-teal btn-block" href="https://whop.com/upskill-hub/" target="_blank" rel="noopener">Open UpSkill Hub</a>
          </aside>
        </div>`;
    }
  }
})();
